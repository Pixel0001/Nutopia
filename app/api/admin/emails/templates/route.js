import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superAdminAuth";

// GET - Get all email templates
export async function GET(request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// POST - Create new email template
export async function POST(request) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { name, subject, content, category } = await request.json();

    if (!name || !subject || !content) {
      return NextResponse.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 });
    }

    // Check if template with same name exists
    const existing = await prisma.emailTemplate.findUnique({
      where: { name }
    });

    if (existing) {
      return NextResponse.json({ error: "Există deja un șablon cu acest nume" }, { status: 400 });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        category: category || "general"
      }
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
