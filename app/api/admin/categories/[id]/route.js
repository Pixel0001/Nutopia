import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// GET - Get single category
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria nu a fost găsită" },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Get category error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}

// PATCH - Update category (Admin only)
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const data = await request.json();

    // If name changed, update slug
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la actualizarea categoriei" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category (Admin only)
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Categoria a fost ștearsă" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la ștergerea categoriei" },
      { status: 500 }
    );
  }
}
