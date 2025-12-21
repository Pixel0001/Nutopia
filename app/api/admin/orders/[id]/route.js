import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireModerator } from "@/lib/adminAuth";

// GET - Get single order
export async function GET(request, { params }) {
  try {
    const auth = await requireModerator();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true, image: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Comanda nu a fost găsită" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}

// PATCH - Update order status (Admin/Moderator)
export async function PATCH(request, { params }) {
  try {
    const auth = await requireModerator();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status invalid" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la actualizarea comenzii" },
      { status: 500 }
    );
  }
}
