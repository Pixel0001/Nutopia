import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superAdminAuth";

// GET - Get all subscribers
export async function GET(request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// DELETE - Delete subscriber
export async function DELETE(request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID necesar" }, { status: 400 });
    }

    await prisma.newsletterSubscriber.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Abonat șters" });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
