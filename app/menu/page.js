"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Check, Loader2, LayoutGrid, ArrowLeft, Search, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [searchTerm, setSearchTerm] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Funcție pentru a determina cantitatea inițială bazată pe unitate
  const getInitialQuantity = (unit) => {
    const unitLower = (unit || "").toLowerCase();
    if (unitLower.includes("buc")) return 1;
    return 1; // default pentru kg și g
  };

  const handleAddToCart = async (item) => {
    const itemKey = item.name;
    setAddingToCart((prev) => ({ ...prev, [itemKey]: true }));

    const initialQty = getInitialQuantity(item.unit);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.id || null,
          productName: item.name,
          productImage: item.image,
          price: item.price,
          unit: item.unit,
          quantity: initialQty,
        }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "A apărut o eroare");
        return;
      }

      if (res.ok) {
        setAddedToCart((prev) => ({ ...prev, [itemKey]: true }));
        window.dispatchEvent(new Event("cartUpdated"));
        
        setTimeout(() => {
          setAddedToCart((prev) => ({ ...prev, [itemKey]: false }));
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [itemKey]: false }));
    }
  };

  // Create category filters with images
  const categoryFilters = [
    { name: "Toate", image: null },
    ...products.map(p => ({ name: p.category, image: p.categoryImage }))
  ];

  // Filter products by category and search
  const filteredProducts = products
    .filter(p => activeCategory === "Toate" || p.category === activeCategory)
    .map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.items.length > 0);

  // Get all items for flat view when searching
  const allItems = searchTerm 
    ? filteredProducts.flatMap(cat => cat.items.map(item => ({ ...item, categoryName: cat.category })))
    : null;

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 bg-gradient-to-b from-amber-50 to-white dark:from-stone-900 dark:to-stone-950">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage.image}
              alt={selectedImage.name}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
            <p className="text-lg font-semibold">{selectedImage.name}</p>
            <p className="text-amber-400 font-bold">{selectedImage.price} MDL</p>
          </div>
        </div>
      )}
      
      <Navbar />
      <main className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-amber-50 to-white dark:from-stone-900 dark:to-stone-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="py-8 sm:py-12">
            <Link 
              href="/#menu"
              className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 dark:text-amber-500 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Înapoi acasă
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              Meniul Complet
            </h1>
            <p className="text-stone-600 dark:text-stone-400">
              Descoperă toate produsele noastre naturale
            </p>
          </div>

          {/* Search & Filters */}
          <div className="sticky top-16 sm:top-20 z-30 bg-gradient-to-b from-amber-50 via-amber-50 to-transparent dark:from-stone-900 dark:via-stone-900 dark:to-transparent pb-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Caută produse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-gray-900 dark:text-stone-100 placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat.name
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-600/25"
                      : "bg-white dark:bg-stone-800 text-gray-900 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700"
                  }`}
                >
                  {cat.image ? (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 relative rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  )}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          {searchTerm && allItems ? (
            // Flat view when searching
            <div className="mt-8">
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                {allItems.length} rezultate pentru "{searchTerm}"
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allItems.map((item) => (
                  <ProductCard 
                    key={item.id || item.name} 
                    item={item} 
                    addingToCart={addingToCart}
                    addedToCart={addedToCart}
                    onAddToCart={handleAddToCart}
                    onImageClick={setSelectedImage}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Category view
            <div className="space-y-12 mt-8">
              {filteredProducts.map((category) => (
                <div key={category.category}>
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    {category.categoryImage && (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative rounded-full overflow-hidden shadow-lg ring-2 ring-amber-200 dark:ring-amber-800">
                        <Image
                          src={category.categoryImage}
                          alt={category.category}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-100">
                        {category.category}
                      </h2>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {category.items.length} produse
                      </p>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.items.map((item) => (
                      <ProductCard 
                        key={item.id || item.name} 
                        item={item}
                        addingToCart={addingToCart}
                        addedToCart={addedToCart}
                        onAddToCart={handleAddToCart}
                        onImageClick={setSelectedImage}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <LayoutGrid className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
              <p className="text-stone-500 dark:text-stone-400">
                Nu s-au găsit produse
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

// Product Card Component
function ProductCard({ item, addingToCart, addedToCart, onAddToCart, onImageClick }) {
  const itemKey = item.name;
  const isAdding = addingToCart[itemKey];
  const isAdded = addedToCart[itemKey];
  const isOutOfStock = item.stock !== undefined && item.stock <= 0;

  return (
    <div className={`group bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 dark:border-stone-700 ${isOutOfStock ? 'opacity-75' : ''}`}>
      {/* Image */}
      <div 
        className="relative h-40 sm:h-48 overflow-hidden bg-stone-100 dark:bg-stone-700 cursor-pointer"
        onClick={() => onImageClick && onImageClick(item)}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          className={`object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale' : 'group-hover:scale-105'}`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-red-600 text-white px-5 py-2.5 rounded-lg shadow-xl transform -rotate-12">
              <span className="text-base font-bold uppercase tracking-wider">Out of Stock</span>
            </div>
          </div>
        )}
        {!isOutOfStock && item.badge && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
            {item.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-stone-800 dark:text-stone-100 mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3 line-clamp-2 h-10">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-500">
              {item.price} MDL
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500 ml-1">
              /{item.unit?.replace("MDL/", "")}
            </span>
          </div>
          
          {isOutOfStock ? (
            <span className="px-3 py-2 bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 text-sm rounded-full">
              Indisponibil
            </span>
          ) : (
            <button
              onClick={() => onAddToCart(item)}
              disabled={isAdding || isAdded}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isAdded
                  ? "bg-green-500 text-white"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 hover:bg-amber-500 hover:text-white"
              }`}
            >
              {isAdding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isAdded ? (
                <Check className="w-5 h-5" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
