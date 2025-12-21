import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

// GET - Get conversation with messages (Admin only)
export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, name: true, email: true, image: true, role: true }
            }
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversația nu există" }, { status: 404 });
    }

    // Mark as read by admin
    if (conversation.unreadAdmin) {
      await prisma.conversation.update({
        where: { id },
        data: { unreadAdmin: false }
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// POST - Reply to conversation (Admin only)
export async function POST(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Mesajul este obligatoriu" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversația nu există" }, { status: 404 });
    }

    // Create admin reply
    const newMessage = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: auth.user.id,
        content: message,
        isFromAdmin: true,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true, role: true }
        }
      }
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        unreadAdmin: false,
        unreadUser: true,
      }
    });

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Admin reply error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// PATCH - Update conversation status (Admin only)
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!["open", "closed"].includes(status)) {
      return NextResponse.json({ error: "Status invalid" }, { status: 400 });
    }

    const conversation = await prisma.conversation.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Update conversation status error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// DELETE - Delete conversation completely (Admin only)
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    // Delete conversation (messages will be deleted automatically due to cascade)
    await prisma.conversation.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Conversația a fost ștearsă" });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
