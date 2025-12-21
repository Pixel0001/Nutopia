import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateToken, setAuthCookie } from "@/lib/auth";
import { isSuperAdmin } from "@/config/admins";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_auth_cancelled`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error("Google token error:", tokens);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=token_error`
      );
    }

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const googleUser = await userInfoResponse.json();

    if (!googleUser.email) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_email`
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    const normalizedEmail = googleUser.email.toLowerCase();
    
    if (user) {
      // Check if user is blocked
      if (user.isBlocked) {
        const reason = encodeURIComponent(user.blockedReason || "Contul tău a fost blocat. Contactează suportul pentru mai multe detalii.");
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/login?error=account_blocked&reason=${reason}`
        );
      }
      
      // Update existing user with Google info if needed
      const updateData = {
        image: googleUser.picture || user.image,
        name: user.name || googleUser.name,
      };
      
      // Promote to admin if super admin
      if (isSuperAdmin(normalizedEmail) && user.role !== "admin") {
        updateData.role = "admin";
      }
      
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    } else {
      // Create new user - check if super admin
      const role = isSuperAdmin(normalizedEmail) ? "admin" : "user";
      
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: googleUser.name,
          image: googleUser.picture,
          provider: "google",
          providerId: googleUser.id,
          emailVerified: new Date(),
          role,
        },
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

    // Redirect to home page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=server_error`
    );
  }
}
