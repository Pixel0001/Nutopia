import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET active testimonials (public)
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Eroare la încărcarea testimonialelor" }, { status: 500 });
  }
}

// POST create testimonial (requires login)
export async function POST(request) {
  try {
    // Check authentication
    const tokenData = await getCurrentUser();

    if (!tokenData) {
      return NextResponse.json({ error: "Trebuie să fii autentificat" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilizator negăsit" }, { status: 404 });
    }

    const body = await request.json();
    const { text, rating, product, location, name, image } = body;

    if (!text || text.length < 20) {
      return NextResponse.json({ error: "Recenzia trebuie să aibă minim 20 de caractere" }, { status: 400 });
    }

    // Create testimonial (inactive by default - needs admin approval)
    const testimonial = await prisma.testimonial.create({
      data: {
        name: name || user.name || user.email.split("@")[0],
        location: location || null,
        image: image || user.image || null,
        rating: rating || 5,
        text,
        product: product || null,
        isActive: false, // Needs admin approval
        order: 999 // Will be at the end by default
      }
    });

    return NextResponse.json({ 
      testimonial,
      message: "Recenzia a fost trimisă și așteaptă aprobare"
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Eroare la crearea recenziei" }, { status: 500 });
  }
}
