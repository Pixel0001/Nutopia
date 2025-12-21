import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// GET - Get single product
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produsul nu a fost găsit" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}

// PATCH - Update product (Admin only)
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
      const baseSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      let slug = baseSlug;
      let counter = 1;
      const existing = await prisma.product.findUnique({ where: { slug } });
      while (existing && existing.id !== id) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      data.slug = slug;
    }

    // Convert numeric fields
    if (data.price) data.price = parseFloat(data.price);
    if (data.stock !== undefined) data.stock = parseFloat(data.stock);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la actualizarea produsului" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product (Admin only)
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produsul a fost șters" });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la ștergerea produsului" },
      { status: 500 }
    );
  }
}
