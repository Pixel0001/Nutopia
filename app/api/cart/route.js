import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Fetch cart items
export async function GET() {
  try {
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json({ items: [] });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: tokenData.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json({ items: [] });
  }
}

// POST - Add item to cart
export async function POST(request) {
  try {
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat pentru a adăuga în coș" },
        { status: 401 }
      );
    }

    const { productId, productName, productImage, price, unit, quantity = 1 } = await request.json();

    if (!productName || !price) {
      return NextResponse.json(
        { error: "Date incomplete" },
        { status: 400 }
      );
    }

    // If product has productId, check stock
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: "Produsul nu există" },
          { status: 404 }
        );
      }

      // Get current cart quantity for this product
      const existingCartItem = await prisma.cartItem.findFirst({
        where: {
          userId: tokenData.userId,
          productId: productId,
        },
      });

      const currentCartQty = existingCartItem?.quantity || 0;
      const requestedTotal = currentCartQty + quantity;

      if (requestedTotal > product.stock) {
        return NextResponse.json(
          { error: `Stoc insuficient. Disponibil: ${product.stock} ${product.unit}` },
          { status: 400 }
        );
      }
    }

    // Check if item already exists in cart (by productId or productName)
    let existingItem;
    if (productId) {
      existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: tokenData.userId,
          productId: productId,
        },
      });
    } else {
      existingItem = await prisma.cartItem.findFirst({
        where: {
          userId: tokenData.userId,
          productName: productName,
          productId: null,
        },
      });
    }

    let item;
    if (existingItem) {
      // Update quantity
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Create new cart item - use connect for the user relation
      const createData = {
        user: {
          connect: { id: tokenData.userId }
        },
        productName,
        productImage: productImage || "",
        price: parseFloat(price),
        unit: unit || "MDL",
        quantity,
      };
      
      // Only add productId if it exists
      if (productId) {
        createData.productId = productId;
      }
      
      item = await prisma.cartItem.create({
        data: createData,
      });
    }

    return NextResponse.json({
      message: "Produs adăugat în coș!",
      item,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}

// DELETE - Clear cart
export async function DELETE() {
  try {
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json(
        { error: "Neautorizat" },
        { status: 401 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: { userId: tokenData.userId },
    });

    return NextResponse.json({ message: "Coș golit!" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}
