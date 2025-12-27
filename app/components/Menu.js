"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, ChevronRight, Check, Loader2, LayoutGrid, X } from "lucide-react";

// Fallback static products (used when database is empty)
const staticProducts = [
  {
    category: "Nuci",
    description: "Nuci premium selectate cu grijă",
    items: [
      { 
        name: "Nuci de California", 
        price: "89", 
        unit: "MDL/kg",
        description: "Nuci premium, decojite, gust bogat și crocant",
        image: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&q=80",
        badge: "Popular"
      },
      { 
        name: "Migdale crude", 
        price: "110", 
        unit: "MDL/kg",
        description: "Migdale naturale, neprocesate, bogate în vitamine",
        image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2VyZWFsc3xlbnwwfHwwfHx8MA%3D%3D",
        badge: null
      },
      { 
        name: "Caju premium", 
        price: "130", 
        unit: "MDL/kg",
        description: "Caju crocant, prăjit ușor, perfect pentru gustări",
        image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&q=80",
        badge: "Bestseller"
      },
      { 
        name: "Alune de pădure", 
        price: "95", 
        unit: "MDL/kg",
        description: "Alune locale, aromate și crocante",
        image: "https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=400&q=80",
        badge: null
      },
      { 
        name: "Fistic iranian", 
        price: "150", 
        unit: "MDL/kg",
        description: "Fistic de calitate superioară, ușor sărat",
        image: "https://images.unsplash.com/photo-1616684000067-36952fde56ec?w=400&q=80",
        badge: "Premium"
      },
      { 
        name: "Mix de nuci", 
        price: "115", 
        unit: "MDL/kg",
        description: "Combinație perfectă de nuci, migdale și caju",
        image: "https://images.unsplash.com/photo-1536816579748-4ecb3f03d72a?w=400&q=80",
        badge: null
      },
    ]
  },
  {
    category: "Fructe Uscate",
    description: "Fructe uscate natural, fără zahăr adăugat",
    items: [
      { 
        name: "Curmale Medjool", 
        price: "75", 
        unit: "MDL/kg",
        description: "Curmale premium, dulci natural, moi și aromate",
        image: "https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2VyZWFsc3xlbnwwfHwwfHx8MA%3D%3D",
        badge: "Organic"
      },
      { 
        name: "Caise uscate", 
        price: "85", 
        unit: "MDL/kg",
        description: "Caise naturale din Turcia, fără conservanți",
        image: "https://images.unsplash.com/photo-1597714026720-8f74c62310ba?w=400&q=80",
        badge: null
      },
      { 
        name: "Smochine uscate", 
        price: "80", 
        unit: "MDL/kg",
        description: "Smochine grecești, moi și dulci natural",
        image: "https://images.unsplash.com/photo-1504308805006-0f7a5f1f0f71?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        badge: null
      },
      { 
        name: "Stafide aurii", 
        price: "55", 
        unit: "MDL/kg",
        description: "Stafide fără sâmburi, perfecte pentru deserturi",
        image: "https://images.unsplash.com/photo-1614961234274-f204d01c115e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        badge: null
      },
    ]
  },
  {
    category: "Miere Naturală",
    description: "Miere pură de la apicultori locali",
    items: [
      { 
        name: "Miere de salcâm", 
        price: "120", 
        unit: "MDL/borcan",
        description: "Miere pură, 1kg, aromă delicată și cristalizare lentă",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80",
        badge: "Top"
      },
      { 
        name: "Miere de tei", 
        price: "110", 
        unit: "MDL/borcan",
        description: "Miere tradițională, 1kg, gust intens și aromat",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80",
        badge: null
      },
      { 
        name: "Miere polifloră", 
        price: "95", 
        unit: "MDL/borcan",
        description: "Mix floral, 1kg, bogată în antioxidanți",
        image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&q=80",
        badge: null
      },
      { 
        name: "Miere cu nuci", 
        price: "140", 
        unit: "MDL/borcan",
        description: "Miere cu nuci întregi, 500g, cadou perfect",
        image: "https://images.unsplash.com/photo-1574156814151-ed649f815f4c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGNlcmVhbHN8ZW58MHx8MHx8fDA%3D",
        badge: "Cadou"
      },
    ]
  }
];

export default function Menu() {
  const [products, setProducts] = useState(staticProducts);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [isVisible, setIsVisible] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const sectionRef = useRef(null);

  // Fetch products from database
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
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0, rootMargin: "200px 0px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Funcție pentru a determina cantitatea inițială bazată pe unitate
  const getInitialQuantity = (unit) => {
    const unitLower = (unit || "").toLowerCase();
    if (unitLower.includes("buc") || unitLower.includes("borcan")) return 1;
    if (unitLower.includes("kg") || unitLower.includes("g")) return 0.1; // 0.1 kg = 100g
    return 1; // default
  };

  // Funcție pentru a formata afișarea unității (kg -> 100g)
  const formatUnitDisplay = (unit, price) => {
    const unitLower = (unit || "").toLowerCase();
    if (unitLower.includes("kg")) {
      // Prețurile sunt deja pentru 100g
      return { displayPrice: price, displayUnit: "MDL/100g" };
    }
    return { displayPrice: price, displayUnit: unit };
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
        // Trigger navbar cart count update
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

  // Create category objects with images for filters
  const categoryFilters = [
    { name: "Toate", image: null },
    ...products.map(p => ({ name: p.category, image: p.categoryImage }))
  ];
  
  const filteredProducts = activeCategory === "Toate" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <>
    {/* Image Modal */}
    {selectedImage && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={() => setSelectedImage(null)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedImage(null);
          }}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-2xl px-6 py-4 text-center shadow-xl border border-white/10">
          <p className="text-lg font-semibold text-white">{selectedImage.name}</p>
          <p className="text-amber-400 font-bold">{selectedImage.price} {selectedImage.unit}</p>
        </div>
      </div>
    )}
    
    <section 
      ref={sectionRef}
      id="menu" 
      className="py-12 sm:py-24 bg-gradient-to-b from-white to-amber-50/30 dark:from-stone-900 dark:to-stone-950 overflow-x-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          className={`text-center mb-8 sm:mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
            Produse Premium
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Descoperă Selecția Noastră
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-stone-600 dark:text-stone-400">
            Produse naturale de cea mai înaltă calitate, selectate cu grijă de la producători locali și internaționali
          </p>
        </div>

        {/* Category Filter */}
        <div 
          className={`flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
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

        {/* Products Grid */}
        <div className="space-y-12 sm:space-y-20">
          {filteredProducts.map((category, categoryIndex) => (
            <div 
              key={category.category}
              className={`transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + categoryIndex * 150}ms` }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                {/* Category Image */}
                {category.categoryImage && (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 relative rounded-full overflow-hidden shadow-lg ring-2 ring-amber-200 dark:ring-amber-800">
                    <Image
                      src={category.categoryImage}
                      alt={category.category}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 truncate">
                    {category.category}
                  </h3>
                  <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                    {category.description}
                  </p>
                </div>
                <a 
                  href="/menu" 
                  className="hidden sm:flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-medium transition-colors"
                >
                  Vezi toate
                  <ChevronRight className="w-4 h-4" />
                </a>
                <a 
                  href="/menu" 
                  className="flex sm:hidden items-center gap-1 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-medium transition-colors"
                >
                  Toate
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Products - limit to 4 items per category on homepage */}
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.items.slice(0, 4).map((item, itemIndex) => {
                  const isOutOfStock = item.stock !== undefined && item.stock <= 0;
                  return (
                  <div
                    key={item.name}
                    className={`group bg-white dark:bg-stone-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100 dark:border-stone-700 ${isOutOfStock ? 'opacity-75' : ''}`}
                  >
                    {/* Image Container */}
                    <div 
                      className="relative h-36 sm:h-48 overflow-hidden bg-stone-100 dark:bg-stone-700 cursor-pointer"
                      onClick={() => setSelectedImage(item)}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className={`object-cover group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? 'grayscale' : ''}`}
                      />
                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl transform -rotate-12">
                            <span className="text-lg font-bold uppercase tracking-wider">Out of Stock</span>
                          </div>
                        </div>
                      )}
                      {/* Badge */}
                      {item.badge && !isOutOfStock && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-lg">
                          {item.badge}
                        </span>
                      )}
                      {/* Quick Add Button */}
                      {!isOutOfStock && (
                        <button 
                          onClick={() => handleAddToCart(item)}
                          disabled={addingToCart[item.name]}
                          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-amber-500 hover:text-white disabled:opacity-50"
                        >
                          {addingToCart[item.name] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : addedToCart[item.name] ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <ShoppingCart className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-5">
                      {/* Name & Description */}
                      <h4 className="font-semibold text-stone-800 dark:text-stone-100 mb-1 sm:mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors text-sm sm:text-base">
                        {item.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-3 sm:mb-4">
                        {item.description}
                      </p>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          {(() => {
                            const { displayPrice, displayUnit } = formatUnitDisplay(item.unit, item.price);
                            return (
                              <>
                                <span className={`text-lg sm:text-2xl font-bold ${isOutOfStock ? 'text-stone-400' : 'text-amber-600 dark:text-amber-500'}`}>
                                  {displayPrice}
                                </span>
                                <span className="text-xs sm:text-sm text-stone-400 ml-1">
                                  {displayUnit}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        {isOutOfStock ? (
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400 text-xs sm:text-sm font-medium">
                            Indisponibil
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleAddToCart(item)}
                            disabled={addingToCart[item.name]}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-stone-100 dark:bg-stone-700 text-gray-900 dark:text-stone-300 text-xs sm:text-sm font-medium hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 transition-all duration-300 disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                          >
                            {addingToCart[item.name] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : addedToCart[item.name] ? (
                              <>
                                <Check className="w-4 h-4" />
                                Adăugat
                              </>
                            ) : (
                              "Adaugă"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
                
                {/* Show "more products" card if there are more than 4 items */}
                {category.items.length > 4 && (
                  <a
                    href="/menu"
                    className="group bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[320px]"
                  >
                    <div className="text-center p-4 sm:p-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg">
                        +{category.items.length - 4}
                      </div>
                      <p className="text-base sm:text-lg font-semibold text-stone-800 dark:text-stone-100 mb-1 sm:mb-2">
                        Încă {category.items.length - 4} produse
                      </p>
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mb-3 sm:mb-4">
                        în categoria {category.category}
                      </p>
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500 font-medium text-sm sm:text-base group-hover:gap-2 transition-all">
                        Vezi toate
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div 
          className={`mt-8 sm:mt-12 text-center transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <a
            href="/menu"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30"
          >
            <LayoutGrid className="w-5 h-5" />
            Vezi toate produsele
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>

        {/* Bottom CTA */}
        <div 
          className={`mt-8 sm:mt-12 text-center transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/25">
            <div className="text-white text-center sm:text-left">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
                Nu găsești ce cauți?
              </h3>
              <p className="text-amber-100 text-sm sm:text-base">
                Contactează-ne pentru comenzi personalizate
              </p>
            </div>
            <a
              href="#contact"
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-white text-amber-600 font-semibold hover:bg-amber-50 transition-colors shadow-lg text-sm sm:text-base"
            >
              Contactează-ne
            </a>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
