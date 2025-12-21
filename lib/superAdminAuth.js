import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { SUPER_ADMINS } from "@/config/admins";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function requireSuperAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return { error: "Neautorizat", status: 401 };
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.email || !SUPER_ADMINS.includes(payload.email.toLowerCase())) {
      return { error: "Acces interzis - doar super admin", status: 403 };
    }

    return { user: payload };
  } catch (error) {
    console.error("Super admin auth error:", error);
    return { error: "Token invalid", status: 401 };
  }
}
