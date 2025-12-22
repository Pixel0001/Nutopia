// Script pentru migrarea imaginilor din MongoDB (base64) în Vercel Blob
// Rulează cu: node scripts/migrate-images-to-blob.js

const { put } = require("@vercel/blob");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Verifică dacă o imagine este base64
function isBase64Image(str) {
  if (!str) return false;
  return str.startsWith("data:image/");
}

// Extrage extensia din base64
function getExtensionFromBase64(base64) {
  const match = base64.match(/data:image\/(\w+);base64,/);
  if (match) {
    const ext = match[1];
    // Convertește jpeg în jpg
    return ext === "jpeg" ? "jpg" : ext;
  }
  return "png";
}

// Convertește base64 în Buffer
function base64ToBuffer(base64) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

// Upload imagine în Vercel Blob
async function uploadToBlob(base64, folder, name) {
  const extension = getExtensionFromBase64(base64);
  const buffer = base64ToBuffer(base64);
  const filename = `${folder}/${name}-${Date.now()}.${extension}`;

  const blob = await put(filename, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
  });

  return blob.url;
}

async function migrateImages() {
  console.log("🚀 Începe migrarea imaginilor în Vercel Blob...\n");

  let productsUpdated = 0;
  let categoriesUpdated = 0;
  let errors = [];

  // Migrează produsele
  console.log("📦 Procesez produsele...");
  const products = await prisma.product.findMany();

  for (const product of products) {
    if (isBase64Image(product.image)) {
      try {
        console.log(`  → Migrez: ${product.name}`);
        const newUrl = await uploadToBlob(
          product.image,
          "products",
          product.slug || product.id
        );

        await prisma.product.update({
          where: { id: product.id },
          data: { image: newUrl },
        });

        productsUpdated++;
        console.log(`    ✅ OK: ${newUrl.substring(0, 60)}...`);
      } catch (error) {
        errors.push(`Produs ${product.name}: ${error.message}`);
        console.log(`    ❌ Eroare: ${error.message}`);
      }
    }
  }

  // Migrează categoriile
  console.log("\n📁 Procesez categoriile...");
  const categories = await prisma.category.findMany();

  for (const category of categories) {
    if (isBase64Image(category.image)) {
      try {
        console.log(`  → Migrez: ${category.name}`);
        const newUrl = await uploadToBlob(
          category.image,
          "categories",
          category.slug || category.id
        );

        await prisma.category.update({
          where: { id: category.id },
          data: { image: newUrl },
        });

        categoriesUpdated++;
        console.log(`    ✅ OK: ${newUrl.substring(0, 60)}...`);
      } catch (error) {
        errors.push(`Categorie ${category.name}: ${error.message}`);
        console.log(`    ❌ Eroare: ${error.message}`);
      }
    }
  }

  // Sumar
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMAR MIGRARE:");
  console.log("=".repeat(50));
  console.log(`✅ Produse migrate: ${productsUpdated}`);
  console.log(`✅ Categorii migrate: ${categoriesUpdated}`);

  if (errors.length > 0) {
    console.log(`\n❌ Erori (${errors.length}):`);
    errors.forEach((err) => console.log(`   - ${err}`));
  }

  console.log("\n🎉 Migrare completă!");
}

// Rulează migrarea
migrateImages()
  .catch((error) => {
    console.error("❌ Eroare fatală:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
