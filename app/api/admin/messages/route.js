import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// GET - Get all conversations (Admin only)
export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: [
        { unreadAdmin: "desc" },
        { updatedAt: "desc" }
      ],
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // Count stats
    const stats = {
      total: conversations.length,
      open: conversations.filter(c => c.status === "open").length,
      closed: conversations.filter(c => c.status === "closed").length,
      unread: conversations.filter(c => c.unreadAdmin).length,
    };

    return NextResponse.json({ conversations, stats });
  } catch (error) {
    console.error("Get admin conversations error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
