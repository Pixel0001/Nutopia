import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PATCH - Update cart item quantity
export async function PATCH(request, { params }) {
  try {
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json(
        { error: "Neautorizat" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { quantity } = await request.json();

    if (quantity <= 0) {
      // Delete item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: { id, userId: tokenData.userId },
      });
      return NextResponse.json({ message: "Produs eliminat din coș" });
    }

    // Get the cart item to check if it has a productId
    const cartItem = await prisma.cartItem.findFirst({
      where: { id, userId: tokenData.userId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Articol negăsit în coș" },
        { status: 404 }
      );
    }

    // Check stock if product is from database
    if (cartItem.productId) {
      const product = await prisma.product.findUnique({
        where: { id: cartItem.productId },
      });

      if (product && quantity > product.stock) {
        return NextResponse.json(
          { error: `Stoc insuficient. Disponibil: ${product.stock} ${product.unit}` },
          { status: 400 }
        );
      }
    }

    const item = await prisma.cartItem.update({
      where: { id, userId: tokenData.userId },
      data: { quantity },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Update cart item error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request, { params }) {
  try {
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json(
        { error: "Neautorizat" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.cartItem.delete({
      where: { id, userId: tokenData.userId },
    });

    return NextResponse.json({ message: "Produs eliminat din coș" });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}
