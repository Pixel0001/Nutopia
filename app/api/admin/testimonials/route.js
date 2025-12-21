import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// GET all testimonials
export async function GET(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const testimonials = await prisma.testimonial.findMany({
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

// POST create new testimonial
export async function POST(request) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { name, location, image, rating, text, product, isActive, order } = body;

    if (!name || !text) {
      return NextResponse.json({ error: "Numele și textul sunt obligatorii" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        location: location || null,
        image: image || null,
        rating: rating || 5,
        text,
        product: product || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0
      }
    });

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Eroare la crearea testimonialului" }, { status: 500 });
  }
}
