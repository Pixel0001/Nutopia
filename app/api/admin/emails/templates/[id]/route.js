import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superAdminAuth";

// GET - Get single template
export async function GET(request, { params }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json({ error: "Șablonul nu există" }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Get template error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// PATCH - Update template
export async function PATCH(request, { params }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const { name, subject, content, category, isActive } = await request.json();

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(content && { content }),
        ...(category && { category }),
        ...(typeof isActive === "boolean" && { isActive })
      }
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Update template error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}

// DELETE - Delete template
export async function DELETE(request, { params }) {
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    await prisma.emailTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Șablonul a fost șters" });
  } catch (error) {
    console.error("Delete template error:", error);
    return NextResponse.json({ error: "A apărut o eroare" }, { status: 500 });
  }
}
