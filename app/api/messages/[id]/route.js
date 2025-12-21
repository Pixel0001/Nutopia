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

// GET - Get conversation messages
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, name: true, email: true, image: true, role: true }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversația nu există" }, { status: 404 });
    }

    // Check if user has access (owner or admin)
    if (conversation.userId !== user.id && !["admin", "moderator"].includes(user.role)) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    // Mark as read
    if (conversation.userId === user.id && conversation.unreadUser) {
      await prisma.conversation.update({
        where: { id },
        data: { unreadUser: false }
      });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// POST - Add message to conversation
export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
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

    // Check access
    const isAdmin = ["admin", "moderator"].includes(user.role);
    if (conversation.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    // Create message and update conversation
    const newMessage = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content: message,
        isFromAdmin: isAdmin,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true, role: true }
        }
      }
    });

    // Update conversation - mark unread for the other party
    await prisma.conversation.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        unreadAdmin: !isAdmin,
        unreadUser: isAdmin,
      }
    });

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Add message error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// PATCH - Close/reopen conversation (user can close own, admin can do both)
export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversația nu există" }, { status: 404 });
    }

    // Check permissions
    const isAdmin = ["admin", "moderator"].includes(user.role);
    const isOwner = conversation.userId === user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
    }

    // Users can only close, admins can close and reopen
    if (!isAdmin && status === "open") {
      return NextResponse.json({ error: "Nu poți redeschide conversația" }, { status: 403 });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ conversation: updatedConversation });
  } catch (error) {
    console.error("Update conversation error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
