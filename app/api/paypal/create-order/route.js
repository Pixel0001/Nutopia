import { NextResponse } from "next/server";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
// Always use sandbox for now, switch to production API when ready
const PAYPAL_API = "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error("PayPal credentials not configured");
  }

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
  
  if (!response.ok || !data.access_token) {
    console.error("PayPal auth error:", JSON.stringify(data, null, 2));
    throw new Error(data.error_description || "Failed to get PayPal access token");
  }
  
  return data.access_token;
}

export async function POST(request) {
  try {
    const { amount } = await request.json();

    // Check for credentials
    if (!PAYPAL_CLIENT_ID) {
      console.error("NEXT_PUBLIC_PAYPAL_CLIENT_ID is missing");
      return NextResponse.json(
        { error: "PayPal Client ID not configured" },
        { status: 500 }
      );
    }

    if (!PAYPAL_SECRET) {
      console.error("PAYPAL_SECRET is missing");
      return NextResponse.json(
        { error: "PayPal Secret not configured" },
        { status: 500 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    // Convert MDL to USD (approximate rate ~18 MDL = 1 USD)
    const usdAmount = (amount / 18).toFixed(2);

    // Ensure minimum amount for PayPal
    const finalAmount = Math.max(parseFloat(usdAmount), 1.00).toFixed(2);

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: finalAmount,
          },
          description: "Nutopia - Produse naturale",
        },
      ],
      application_context: {
        brand_name: "Nutopia",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://nutopia-bice.vercel.app"}/cart?paypal=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://nutopia-bice.vercel.app"}/cart?paypal=cancelled`,
      },
    };

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const order = await response.json();

    if (!response.ok) {
      console.error("PayPal order creation failed:", JSON.stringify(order, null, 2));
      return NextResponse.json(
        { error: order.details?.[0]?.description || order.message || "Failed to create PayPal order" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      links: order.links,
    });
  } catch (error) {
    console.error("PayPal create order error:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
