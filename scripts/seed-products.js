// Script to seed sample categories and products
// Run with: node scripts/seed-products.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  {
    name: "Nuci",
    slug: "nuci",
    description: "Nuci premium selectate cu grijă",
    order: 1,
    products: [
      {
        name: "Nuci de California",
        slug: "nuci-california",
        price: 89,
        stock: 50,
        unit: "kg",
        description: "Nuci premium, decojite, gust bogat și crocant",
        image: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&q=80",
      },
      {
        name: "Migdale crude",
        slug: "migdale-crude",
        price: 110,
        stock: 40,
        unit: "kg",
        description: "Migdale naturale, neprocesate, bogate în vitamine",
        image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&q=80",
      },
      {
        name: "Caju premium",
        slug: "caju-premium",
        price: 130,
        stock: 35,
        unit: "kg",
        description: "Caju crocant, prăjit ușor, perfect pentru gustări",
        image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&q=80",
      },
      {
        name: "Alune de pădure",
        slug: "alune-padure",
        price: 95,
        stock: 45,
        unit: "kg",
        description: "Alune locale, aromate și crocante",
        image: "https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=400&q=80",
      },
      {
        name: "Fistic iranian",
        slug: "fistic-iranian",
        price: 150,
        stock: 25,
        unit: "kg",
        description: "Fistic de calitate superioară, ușor sărat",
        image: "https://images.unsplash.com/photo-1616684000067-36952fde56ec?w=400&q=80",
      },
    ],
  },
  {
    name: "Fructe Uscate",
    slug: "fructe-uscate",
    description: "Fructe uscate natural, fără zahăr adăugat",
    order: 2,
    products: [
      {
        name: "Curmale Medjool",
        slug: "curmale-medjool",
        price: 75,
        stock: 30,
        unit: "kg",
        description: "Curmale premium, dulci natural, moi și aromate",
        image: "https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=400&q=80",
      },
      {
        name: "Caise uscate",
        slug: "caise-uscate",
        price: 85,
        stock: 40,
        unit: "kg",
        description: "Caise naturale din Turcia, fără conservanți",
        image: "https://images.unsplash.com/photo-1597714026720-8f74c62310ba?w=400&q=80",
      },
      {
        name: "Smochine uscate",
        slug: "smochine-uscate",
        price: 80,
        stock: 35,
        unit: "kg",
        description: "Smochine grecești, moi și dulci natural",
        image: "https://images.unsplash.com/photo-1504308805006-0f7a5f1f0f71?w=400&q=80",
      },
      {
        name: "Stafide aurii",
        slug: "stafide-aurii",
        price: 55,
        stock: 50,
        unit: "kg",
        description: "Stafide fără sâmburi, perfecte pentru deserturi",
        image: "https://images.unsplash.com/photo-1614961234274-f204d01c115e?w=400&q=80",
      },
    ],
  },
  {
    name: "Miere Naturală",
    slug: "miere-naturala",
    description: "Miere pură de la apicultori locali",
    order: 3,
    products: [
      {
        name: "Miere de salcâm",
        slug: "miere-salcam",
        price: 120,
        stock: 20,
        unit: "buc",
        description: "Miere pură, 1kg, aromă delicată și cristalizare lentă",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",
      },
      {
        name: "Miere de tei",
        slug: "miere-tei",
        price: 110,
        stock: 25,
        unit: "buc",
        description: "Miere tradițională, 1kg, gust intens și aromat",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80",
      },
      {
        name: "Miere polifloră",
        slug: "miere-poliflora",
        price: 95,
        stock: 30,
        unit: "buc",
        description: "Mix floral, 1kg, bogată în antioxidanți",
        image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&q=80",
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Starting seed...\n");

  try {
    for (const categoryData of categories) {
      const { products, ...catData } = categoryData;

      // Create or update category
      const category = await prisma.category.upsert({
        where: { slug: catData.slug },
        update: catData,
        create: catData,
      });

      console.log(`📁 Category: ${category.name}`);

      // Create products for this category
      for (const productData of products) {
        const product = await prisma.product.upsert({
          where: { slug: productData.slug },
          update: { ...productData, categoryId: category.id },
          create: { ...productData, categoryId: category.id },
        });
        console.log(`   ✅ Product: ${product.name}`);
      }
      console.log("");
    }

    console.log("✨ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
