import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// Helper to get current user
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  return await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, image: true, role: true }
  });
}

// PATCH - Edit message
export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["admin", "moderator"].includes(user.role)) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id, messageId } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Mesajul nu poate fi gol" }, { status: 400 });
    }

    // Verify message exists and is from admin
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true }
    });

    if (!message) {
      return NextResponse.json({ error: "Mesajul nu există" }, { status: 404 });
    }

    if (!message.isFromAdmin) {
      return NextResponse.json({ error: "Poți edita doar mesajele trimise de admin" }, { status: 403 });
    }

    if (message.conversation.id !== id) {
      return NextResponse.json({ error: "Mesajul nu aparține acestei conversații" }, { status: 400 });
    }

    // Update message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { 
        content: content.trim(),
        editedAt: new Date()
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true, role: true }
        }
      }
    });

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error("Edit message error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// DELETE - Delete message
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["admin", "moderator"].includes(user.role)) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id, messageId } = await params;

    // Verify message exists and is from admin
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true }
    });

    if (!message) {
      return NextResponse.json({ error: "Mesajul nu există" }, { status: 404 });
    }

    if (!message.isFromAdmin) {
      return NextResponse.json({ error: "Poți șterge doar mesajele trimise de admin" }, { status: 403 });
    }

    if (message.conversation.id !== id) {
      return NextResponse.json({ error: "Mesajul nu aparține acestei conversații" }, { status: 400 });
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
