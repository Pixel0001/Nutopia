import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    await removeAuthCookie();
    
    return NextResponse.json({
      message: "Deconectare reușită!",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare." },
      { status: 500 }
    );
  }
}
