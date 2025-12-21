import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { notifyNewMessage } from "@/lib/telegram";

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

// GET - Get user's conversations
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// POST - Create new conversation with message
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Trebuie să fii autentificat pentru a trimite mesaje" }, { status: 401 });
    }

    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subiectul și mesajul sunt obligatorii" },
        { status: 400 }
      );
    }

    // Create conversation with first message
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        subject,
        unreadAdmin: true,
        unreadUser: false,
        messages: {
          create: {
            senderId: user.id,
            content: message,
            isFromAdmin: false,
          }
        }
      },
      include: {
        messages: true,
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    });

    // Trimite notificare pe Telegram
    notifyNewMessage(user, subject, message).catch(err => {
      console.error("Telegram notification error:", err);
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la trimiterea mesajului" },
      { status: 500 }
    );
  }
}
