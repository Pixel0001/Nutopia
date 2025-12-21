import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Subscribe to newsletter (public endpoint)
export async function POST(request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email-ul este obligatoriu" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalid" }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ error: "Ești deja abonat la newsletter" }, { status: 400 });
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: { isActive: true, name: name || existing.name }
        });
        return NextResponse.json({ message: "Te-ai reabonat cu succes!" });
      }
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        name: name || null
      }
    });

    return NextResponse.json({ message: "Te-ai abonat cu succes la newsletter!" }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
