import { getCurrentUser } from "./auth";
import prisma from "./prisma";

export async function getAdminUser() {
  const tokenData = await getCurrentUser();
  
  if (!tokenData) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenData.userId },
    select: { id: true, email: true, name: true, role: true, image: true },
  });

  return user;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  
  if (!user || user.role !== "admin") {
    return { error: "Acces interzis", status: 403 };
  }
  
  return { user };
}

export async function requireModerator() {
  const user = await getAdminUser();
  
  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return { error: "Acces interzis", status: 403 };
  }
  
  return { user };
}

export function isAdmin(role) {
  return role === "admin";
}

export function isModerator(role) {
  return role === "moderator" || role === "admin";
}
