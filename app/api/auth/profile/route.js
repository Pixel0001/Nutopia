import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tokenData = await getCurrentUser();
    
    if (!tokenData) {
      return NextResponse.json(
        { user: null, error: "Neautorizat" },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        provider: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { user: null, error: "Utilizator negăsit" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { user: null, error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}
