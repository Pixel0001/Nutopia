import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// GET - Fetch all products (with optional category filter)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (!includeInactive) where.isActive = true;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}

// POST - Create new product (Admin only)
export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { name, description, price, unit, image, stock, categoryId, isActive } = await request.json();

    if (!name || !price || !image || !categoryId) {
      return NextResponse.json(
        { error: "Numele, prețul, imaginea și categoria sunt obligatorii" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: "Categoria nu există" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        unit: unit || "MDL/kg",
        image,
        stock: parseFloat(stock) || 0,
        categoryId,
        isActive: isActive !== false,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la crearea produsului" },
      { status: 500 }
    );
  }
}
