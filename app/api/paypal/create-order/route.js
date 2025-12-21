import { NextResponse } from "next/server";

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
  
  if (!data.access_token) {
    console.error("PayPal auth error:", data);
    throw new Error("Failed to get PayPal access token");
  }
  
  return data.access_token;
}

export async function POST(request) {
  try {
    const { amount } = await request.json();

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error("PayPal credentials missing");
      return NextResponse.json(
        { error: "PayPal credentials not configured" },
        { status: 500 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    // Convert MDL to USD (approximate rate)
    const usdAmount = (amount / 18).toFixed(2);

    // Simplified order payload without items breakdown
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: usdAmount,
          },
          description: "Nutopia - Produse naturale",
        },
      ],
      application_context: {
        brand_name: "Nutopia",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/cart?paypal=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/cart?paypal=cancelled`,
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
      console.error("PayPal order error:", JSON.stringify(order, null, 2));
      return NextResponse.json(
        { error: order.message || "Failed to create PayPal order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      links: order.links,
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
