import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifyNewOrder } from "@/lib/telegram";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.NODE_ENV === "production" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    const { orderId, fullName, phone, address, city, notes } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Validation for shipping info
    if (!fullName || !phone || !address || !city) {
      return NextResponse.json(
        { error: "Te rugăm să completezi toate câmpurile obligatorii" },
        { status: 400 }
      );
    }

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return NextResponse.json(
        { error: "PayPal credentials not configured" },
        { status: 500 }
      );
    }

    // SECURITY: Verify current user
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat" },
        { status: 401 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    // First, get the PayPal order details to verify ownership
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const orderDetails = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error("PayPal order fetch error:", orderDetails);
      return NextResponse.json(
        { error: "Nu s-a putut verifica comanda PayPal" },
        { status: 400 }
      );
    }

    // SECURITY: Verify that this PayPal order belongs to the current user
    let customData;
    try {
      customData = JSON.parse(orderDetails.purchase_units[0].custom_id || "{}");
    } catch (e) {
      console.error("Failed to parse custom_id:", e);
      return NextResponse.json(
        { error: "Date de verificare invalide" },
        { status: 400 }
      );
    }

    if (customData.userId !== tokenData.userId) {
      console.error("User mismatch:", { expected: customData.userId, actual: tokenData.userId });
      return NextResponse.json(
        { error: "Această comandă nu îți aparține" },
        { status: 403 }
      );
    }

    // Capture the payment
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureResponse.json();

    if (!captureResponse.ok) {
      console.error("PayPal capture error:", captureData);
      return NextResponse.json(
        { error: "Plata PayPal a eșuat" },
        { status: 500 }
      );
    }

    // SECURITY: Verify capture status
    if (captureData.status !== "COMPLETED") {
      console.error("PayPal capture not completed:", captureData.status);
      return NextResponse.json(
        { error: "Plata nu a fost finalizată" },
        { status: 400 }
      );
    }

    // SECURITY: Verify captured amount matches expected
    const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) {
      console.error("No capture data found");
      return NextResponse.json(
        { error: "Date de plată lipsă" },
        { status: 400 }
      );
    }

    const capturedAmount = parseFloat(capture.amount.value);
    const expectedUSD = (customData.totalMDL / 18).toFixed(2);
    const expectedAmount = Math.max(parseFloat(expectedUSD), 1.00);

    // Allow small tolerance for rounding
    if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
      console.error("Amount mismatch:", { captured: capturedAmount, expected: expectedAmount });
      return NextResponse.json(
        { error: "Suma plătită nu corespunde" },
        { status: 400 }
      );
    }

    // Get current cart items for creating the order
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: tokenData.userId },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Coșul tău este gol" },
        { status: 400 }
      );
    }

    // Verify cart total still matches
    const currentSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const currentShippingCost = currentSubtotal < 500 ? 100 : 0;
    const currentTotal = currentSubtotal + currentShippingCost;

    if (Math.abs(currentTotal - customData.totalMDL) > 0.01) {
      console.error("Cart total changed:", { current: currentTotal, expected: customData.totalMDL });
      return NextResponse.json(
        { error: "Coșul s-a modificat. Te rugăm să reîncerci." },
        { status: 400 }
      );
    }

    // Check stock before creating order
    for (const item of cartItems) {
      if (item.productId) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return NextResponse.json(
            { error: `Produsul ${item.productName} nu mai este disponibil` },
            { status: 400 }
          );
        }

        if (item.quantity > product.stock) {
          return NextResponse.json(
            { error: `Stoc insuficient pentru ${item.productName}. Disponibil: ${product.stock} ${product.unit}` },
            { status: 400 }
          );
        }
      }
    }

    // Create order in transaction (decrease stock + create order + clear cart)
    const order = await prisma.$transaction(async (tx) => {
      // Decrease stock for products
      for (const item of cartItems) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Create the order with PayPal payment confirmed
      const newOrder = await tx.order.create({
        data: {
          userId: tokenData.userId,
          items: cartItems.map((item) => ({
            productId: item.productId || null,
            name: item.productName,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            unit: item.unit,
            quantity: item.quantity,
          })),
          subtotal: currentSubtotal,
          shippingCost: currentShippingCost,
          total: currentTotal,
          paymentMethod: "paypal",
          paymentStatus: "paid",
          paypalOrderId: orderId,
          paypalCaptureId: capture.id,
          shippingAddress: `${fullName}, ${phone}, ${address}, ${city}`,
          fullName,
          phone,
          address,
          city,
          notes: notes || null,
          status: "pending",
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: tokenData.userId },
      });

      return newOrder;
    });

    // Send Telegram notification
    notifyNewOrder(order, tokenData).catch(err => {
      console.error("Telegram notification error:", err);
    });

    return NextResponse.json({
      message: "Plata a fost procesată cu succes!",
      order,
      paypal: {
        id: captureData.id,
        status: captureData.status,
        captureId: capture.id,
        payer: captureData.payer,
      },
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la procesarea plății" },
      { status: 500 }
    );
  }
}
