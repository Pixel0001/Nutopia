import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminAuth";

export async function POST(request) {
  try {
    // Verifică autentificarea - ia rolul din baza de date
    const user = await getAdminUser();
    if (!user || (user.role !== "superadmin" && user.role !== "admin" && user.role !== "moderator")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "products"; // products, categories, etc.

    if (!file) {
      return NextResponse.json(
        { error: "Nu a fost selectat niciun fișier" },
        { status: 400 }
      );
    }

    // Verifică tipul fișierului
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tip de fișier invalid. Sunt permise doar: JPG, PNG, WEBP, GIF" },
        { status: 400 }
      );
    }

    // Verifică mărimea (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Fișierul este prea mare. Mărimea maximă este 5MB" },
        { status: 400 }
      );
    }

    // Generează un nume unic pentru fișier
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Uploadează în Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la încărcare: " + error.message },
      { status: 500 }
    );
  }
}

// Endpoint pentru ștergerea imaginilor (opțional)
export async function DELETE(request) {
  try {
    const user = await getAdminUser();
    if (!user || (user.role !== "superadmin" && user.role !== "admin" && user.role !== "moderator")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL-ul imaginii lipsește" },
        { status: 400 }
      );
    }

    // Șterge din Vercel Blob
    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la ștergere" },
      { status: 500 }
    );
  }
}
