import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/auth";

// GET - Fetch all users (Admin only)
export async function GET(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const where = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare" },
      { status: 500 }
    );
  }
}

// POST - Create new admin/moderator (Admin only)
export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { email, password, name, role, accountType } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email-ul și rolul sunt obligatorii" },
        { status: 400 }
      );
    }

    if (!["admin", "moderator"].includes(role)) {
      return NextResponse.json(
        { error: "Rol invalid" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) {
      // Update existing user's role
      const user = await prisma.user.update({
        where: { email },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          provider: true,
        },
      });
      return NextResponse.json({ user, message: "Rolul utilizatorului a fost actualizat" });
    }

    // For Google account type - create without password
    if (accountType === "google") {
      const user = await prisma.user.create({
        data: {
          email,
          name: null, // Will be filled when user logs in with Google
          role,
          provider: "google",
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          provider: true,
        },
      });

      return NextResponse.json({ 
        user, 
        created: true,
        message: "Cont Google creat. Datele vor fi preluate la primul login." 
      }, { status: 201 });
    }

    // Create new user with password (credentials)
    if (!password) {
      return NextResponse.json(
        { error: "Parola este obligatorie pentru conturile cu email" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Numele este obligatoriu pentru conturile cu email" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name,
        role,
        provider: "credentials",
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        provider: true,
      },
    });

    return NextResponse.json({ user, created: true }, { status: 201 });
  } catch (error) {
    console.error("Create admin user error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la crearea utilizatorului" },
      { status: 500 }
    );
  }
}
