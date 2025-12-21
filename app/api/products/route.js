import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch all products grouped by category (public)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");

    const whereClause = categorySlug
      ? { category: { slug: categorySlug } }
      : {};

    const products = await prisma.product.findMany({
      where: {
        ...whereClause,
        stock: { gt: 0 }, // Only show products with stock
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            order: true,
          },
        },
      },
      orderBy: [
        { category: { order: "asc" } },
        { createdAt: "desc" },
      ],
    });

    // Group products by category
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {
            stock: { gt: 0 },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    const groupedProducts = categories.map((category) => ({
      category: category.name,
      categorySlug: category.slug,
      categoryImage: category.image,
      description: `Produse din categoria ${category.name}`,
      items: products
        .filter((p) => p.categoryId === category.id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price.toString(),
          unit: `MDL/${p.unit}`,
          description: p.description || "",
          image: p.image || "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&q=80",
          badge: p.stock < 5 ? "Ultim stoc" : null,
          stock: p.stock,
        })),
    }));

    // Filter out empty categories
    const filteredGroups = groupedProducts.filter(
      (group) => group.items.length > 0
    );

    return NextResponse.json({
      products: filteredGroups,
      total: products.length,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}
