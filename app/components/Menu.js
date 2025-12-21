"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ShoppingCart, ChevronRight } from "lucide-react";

const products = [
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
  const [activeCategory, setActiveCategory] = useState("Toate");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = ["Toate", ...products.map(p => p.category)];
  
  const filteredProducts = activeCategory === "Toate" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section 
      ref={sectionRef}
      id="menu" 
      className="py-24 bg-gradient-to-b from-white to-amber-50/30 dark:from-stone-900 dark:to-stone-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
            Produse Premium
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Descoperă Selecția Noastră
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-stone-600 dark:text-stone-400">
            Produse naturale de cea mai înaltă calitate, selectate cu grijă de la producători locali și internaționali
          </p>
        </div>

        {/* Category Filter */}
        <div 
          className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/25"
                  : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="space-y-20">
          {filteredProducts.map((category, categoryIndex) => (
            <div 
              key={category.category}
              className={`transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + categoryIndex * 150}ms` }}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100">
                    {category.category}
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 mt-1">
                    {category.description}
                  </p>
                </div>
                <a 
                  href="#" 
                  className="hidden sm:flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 font-medium transition-colors"
                >
                  Vezi toate
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Products */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={item.name}
                    className="group bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100 dark:border-stone-700"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden bg-stone-100 dark:bg-stone-700">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Badge */}
                      {item.badge && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-lg">
                          {item.badge}
                        </span>
                      )}
                      {/* Quick Add Button */}
                      <button className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white dark:bg-stone-800 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-amber-500 hover:text-white">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Name & Description */}
                      <h4 className="font-semibold text-stone-800 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-4">
                        {item.description}
                      </p>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                            {item.price}
                          </span>
                          <span className="text-sm text-stone-400 ml-1">
                            {item.unit}
                          </span>
                        </div>
                        <button className="px-4 py-2 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 transition-all duration-300">
                          Adaugă
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div 
          className={`mt-20 text-center transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-8 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/25">
            <div className="text-white text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-1">
                Nu găsești ce cauți?
              </h3>
              <p className="text-amber-100">
                Contactează-ne pentru comenzi personalizate
              </p>
            </div>
            <a
              href="#contact"
              className="px-8 py-3 rounded-full bg-white text-amber-600 font-semibold hover:bg-amber-50 transition-colors shadow-lg"
            >
              Contactează-ne
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
