"use client";
import { useEffect, useState, useRef } from "react";
import { Leaf, Store, Truck, Award, ArrowRight, CheckCircle } from "lucide-react";

export default function About() {
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

  const features = [
    {
      icon: Leaf,
      title: "100% Natural",
      description: "Produse fără aditivi, conservanți sau zahăr adăugat. Doar natură pură.",
      color: "from-emerald-500 to-green-600"
    },
    {
      icon: Store,
      title: "Magazin Fizic",
      description: "Te așteptăm în magazinul nostru din Chișinău pentru o experiență completă.",
      color: "from-amber-500 to-orange-600"
    },
    {
      icon: Truck,
      title: "Livrare Rapidă",
      description: "Livrare în toată Moldova în 24-48 ore. Gratuit pentru comenzi peste 500 MDL.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Award,
      title: "Calitate Premium",
      description: "Selectăm doar cele mai bune produse de la furnizori verificați.",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const highlights = [
    "1+ ani de experiență",
    "Premii și recunoaștere",
    "Produse atent selectate",
    "Creat cu pasiune și suflet"
  ];

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-stone-50 to-amber-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950"
    >

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 -left-64 w-[500px] h-[500px] rounded-full bg-orange-200/20 dark:bg-orange-900/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
            Despre Noi
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Povestea <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Nutopia</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-stone-600 dark:text-stone-400">
            O poveste care a început ca un vis și a devenit realitate
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div 
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 text-8xl text-amber-200 dark:text-amber-900/30 font-serif leading-none select-none">
                "
              </div>
              
              <div className="relative space-y-6 text-stone-600 dark:text-stone-400">
                <p className="text-lg leading-relaxed">
                  Povestea <span className="font-semibold text-stone-800 dark:text-stone-200">Nutopia</span> a început în anul 2024, în cadrul Centrului de Excelență în Informatică și Tehnologii Informaționale, la disciplina Firma de exercițiu. Acolo a prins contur o idee care, treptat, s-a transformat într-un <span className="font-semibold text-amber-600 dark:text-amber-500">vis real</span>: crearea unei afaceri bazate pe mixuri de nuci și fructe uscate, sănătoase și atent alese.
                </p>
                <p className="text-lg leading-relaxed">
                  Inițial, Nutopia a fost un proiect educațional, însă pasiunea și munca depusă au făcut ca această idee să crească rapid. Pe parcursul unui an, am participat la diverse concursuri, unde Nutopia a fost apreciată și răsplătită cu <span className="font-semibold text-amber-600 dark:text-amber-500">premii, diplome și recunoaștere</span>.
                </p>
                <p className="text-lg leading-relaxed">
                  Activitatea din cadrul firmei de exercițiu s-a desfășurat din septembrie până în martie, iar din acel moment a început drumul adevărat al Nutopia — unul real și fizic. Cu multă dorință, implicare și încredere, visul meu a prins viață, iar în octombrie Nutopia și-a deschis oficial porțile.
                </p>
                <p className="text-lg leading-relaxed">
                  Nutopia nu este doar un magazin, ci <span className="font-semibold text-amber-600 dark:text-amber-500">rezultatul muncii, pasiunii și dorinței</span> de a oferi produse de calitate, create cu suflet.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {highlights.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 text-stone-700 dark:text-stone-300"
                  >
                    <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Contactează-ne
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#menu"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-semibold hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500 transition-all duration-300"
                >
                  Vezi Produsele
                </a>
              </div>
            </div>
          </div>

          <div 
            className={`transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group relative p-6 rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>

                    <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${feature.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/25">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">1+</div>
                  <div className="text-amber-100 text-sm">Ani experiență</div>
                </div>
                <div className="border-x border-white/20">
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-amber-100 text-sm">Produse</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">100+</div>
                  <div className="text-amber-100 text-sm">Clienți</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`mt-20 transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              De ce să alegi Nutopia?
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
            {[
              { label: "Produse Naturale", icon: "🌿" },
              { label: "Calitate Garantată", icon: "✓" },
              { label: "Preturi Corecte", icon: "💰" },
              { label: "Livrare Rapidă", icon: "🚚" },
              { label: "Suport 24/7", icon: "💬" },
            ].map((badge, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-stone-600 dark:text-stone-400"
              >
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
