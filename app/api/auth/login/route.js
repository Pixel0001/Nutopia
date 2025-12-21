import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth";
import { isSuperAdmin } from "@/config/admins";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email și parola sunt obligatorii" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Find user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email sau parolă incorectă" },
        { status: 401 }
      );
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return NextResponse.json(
        { error: user.blockedReason || "Contul tău a fost blocat. Contactează suportul pentru mai multe detalii." },
        { status: 403 }
      );
    }

    // Check if user registered with Google
    if (user.provider === "google" && !user.password) {
      return NextResponse.json(
        { error: "Acest cont folosește autentificarea Google. Te rugăm să te conectezi cu Google." },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Email sau parolă incorectă" },
        { status: 401 }
      );
    }

    // Promote to admin if super admin and not already admin
    if (isSuperAdmin(normalizedEmail) && user.role !== "admin") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin" },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Set auth cookie
    await setAuthCookie(token);

    return NextResponse.json({
      message: "Autentificare reușită!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare. Încearcă din nou." },
      { status: 500 }
    );
  }
}
