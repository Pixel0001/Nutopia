import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notifyNewOrder } from "@/lib/telegram";

// GET - Fetch user orders
export async function GET() {
  try {
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json(
        { error: "Neautorizat" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: tokenData.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request) {
  try {
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat pentru a plasa o comandă" },
        { status: 401 }
      );
    }

    const { fullName, phone, address, city, notes, paymentMethod, paypalOrderId } = await request.json();

    // Validation
    if (!fullName || !phone || !address || !city) {
      return NextResponse.json(
        { error: "Te rugăm să completezi toate câmpurile obligatorii" },
        { status: 400 }
      );
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: tokenData.userId },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Coșul tău este gol" },
        { status: 400 }
      );
    }

    // Check stock for products with productId
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

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Shipping cost: 100 MDL if subtotal < 500 MDL, otherwise free
    const shippingCost = subtotal < 500 ? 100 : 0;
    const total = subtotal + shippingCost;

    // Create order with transaction to ensure stock is updated atomically
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

      // Create the order
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
          subtotal,
          shippingCost,
          total,
          paymentMethod: paymentMethod || "cash",
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

    // Trimite notificare pe Telegram pentru comandă nouă
    notifyNewOrder(order, tokenData).catch(err => {
      console.error("Telegram notification error:", err);
    });

    return NextResponse.json({
      message: "Comanda a fost plasată cu succes!",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la plasarea comenzii" },
      { status: 500 }
    );
  }
}
