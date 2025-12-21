import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireModerator } from "@/lib/adminAuth";

// GET - Fetch all orders (Admin/Moderator)
export async function GET(request) {
  try {
    const auth = await requireModerator();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit")) || 50;

    const where = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { id: true, email: true, name: true, image: true },
        },
      },
    });

    // Get stats
    const stats = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    // Get total orders count
    const totalOrders = await prisma.order.count();

    const totalRevenue = await prisma.order.aggregate({
      where: { status: { in: ["confirmed", "processing", "shipped", "delivered", "pending"] } },
      _sum: { total: true },
    });

    const statsObj = stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.status }), {});
    statsObj.total = totalOrders;
    statsObj.revenue = totalRevenue._sum.total || 0;

    return NextResponse.json({ 
      orders,
      stats: statsObj,
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}
