import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// GET single testimonial
export async function GET(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    });

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonialul nu a fost găsit" }, { status: 404 });
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    return NextResponse.json({ error: "Eroare la încărcarea testimonialului" }, { status: 500 });
  }
}

// PUT update testimonial
export async function PUT(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, location, image, rating, text, product, isActive, order } = body;

    if (!name || !text) {
      return NextResponse.json({ error: "Numele și textul sunt obligatorii" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
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
    console.error("Error updating testimonial:", error);
    return NextResponse.json({ error: "Eroare la actualizarea testimonialului" }, { status: 500 });
  }
}

// DELETE testimonial
export async function DELETE(request, { params }) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id } = await params;

    await prisma.testimonial.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Testimonialul a fost șters" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: "Eroare la ștergerea testimonialului" }, { status: 500 });
  }
}
