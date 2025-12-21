import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, getAdminUser } from "@/lib/adminAuth";

// PATCH - Update user role or block status (Admin only)
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, isBlocked, blockedReason } = body;

    // Prevent self-modification
    if (id === auth.user.id) {
      return NextResponse.json(
        { error: "Nu îți poți modifica propriul cont" },
        { status: 400 }
      );
    }

    const updateData = {};

    // Handle role update
    if (role !== undefined) {
      if (!["user", "moderator", "admin"].includes(role)) {
        return NextResponse.json(
          { error: "Rol invalid" },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    // Handle block/unblock
    if (isBlocked !== undefined) {
      updateData.isBlocked = isBlocked;
      updateData.blockedReason = isBlocked ? (blockedReason || "Cont blocat de administrator") : null;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        provider: true,
        isBlocked: true,
        blockedReason: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la actualizarea utilizatorului" },
      { status: 500 }
    );
  }
}

// DELETE - Remove admin/moderator role (set to user) (Admin only)
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === auth.user.id) {
      return NextResponse.json(
        { error: "Nu îți poți șterge propriul rol" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: "user" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({ user, message: "Rolul a fost revocat" });
  } catch (error) {
    console.error("Remove user role error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}
