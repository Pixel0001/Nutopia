"use client";
import { useEffect, useState, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Maria Popescu",
    location: "Chișinău",
    avatar: "M",
    rating: 5,
    text: "Cea mai bună miere pe care am gustat-o! Comand de fiecare dată de la Nutopia și nu am fost niciodată dezamăgită. Calitatea este întotdeauna constantă.",
    product: "Miere de salcâm",
    verified: true
  },
  {
    name: "Andrei Ionescu",
    location: "Bălți",
    avatar: "A",
    rating: 5,
    text: "Nucile sunt incredibil de proaspete și gustoase. Livrarea a fost rapidă și ambalajul impecabil. Voi reveni cu siguranță!",
    product: "Nuci de California",
    verified: true
  },
  {
    name: "Elena Dumitrescu",
    location: "Orhei",
    avatar: "E",
    rating: 5,
    text: "Am descoperit Nutopia din întâmplare și acum sunt clientă fidel. Fructele uscate sunt delicioase și prețurile sunt foarte bune!",
    product: "Mix fructe uscate",
    verified: true
  },
  {
    name: "Mihai Constantinescu",
    location: "Chișinău",
    avatar: "M",
    rating: 5,
    text: "Magazinul fizic este foarte frumos amenajat, iar personalul este extraordinar de amabil. Produsele sunt de o calitate excepțională.",
    product: "Migdale crude",
    verified: true
  },
  {
    name: "Ana Rotaru",
    location: "Cahul",
    avatar: "A",
    rating: 5,
    text: "Comand online de mai bine de un an și sunt mereu mulțumită. Mierea cu nuci este preferata mea - perfectă pentru micul dejun!",
    product: "Miere cu nuci",
    verified: true
  },
  {
    name: "Ion Ceban",
    location: "Soroca",
    avatar: "I",
    rating: 5,
    text: "Raport calitate-preț excelent. Caju-ul este crocant și proaspăt, exact cum îmi place. Livrare rapidă în toată Moldova.",
    product: "Caju premium",
    verified: true
  }
];

const stats = [
  { value: "4.9", label: "Rating mediu" },
  { value: "1000+", label: "Clienți fericiți" },
  { value: "98%", label: "Ar recomanda" },
];

export default function Reviews() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);

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

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section 
      ref={sectionRef}
      id="reviews" 
      className="relative py-24 overflow-hidden bg-gradient-to-b from-amber-50/50 to-white dark:from-stone-950 dark:to-stone-900"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-amber-100/30 dark:bg-amber-900/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
            Testimoniale
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Ce Spun <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Clienții</span> Noștri
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-stone-600 dark:text-stone-400">
            Mii de clienți mulțumiți ne-au acordat încrederea lor. Iată ce spun despre experiența cu Nutopia.
          </p>
        </div>

        {/* Stats */}
        <div 
          className={`flex flex-wrap justify-center gap-8 sm:gap-16 mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {index === 0 && <Star className="w-6 h-6 fill-amber-400 text-amber-400" />}
                <span className="text-3xl sm:text-4xl font-bold text-stone-800 dark:text-stone-100">
                  {stat.value}
                </span>
              </div>
              <span className="text-sm text-stone-500 dark:text-stone-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Featured Review - Large */}
        <div 
          className={`mb-12 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Quote icon */}
            <Quote className="absolute -top-4 -left-4 w-16 h-16 text-amber-200 dark:text-amber-900/50 -z-10" />
            
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 sm:p-12 shadow-xl border border-stone-100 dark:border-stone-700">
              {/* Active review content */}
              <div className="transition-all duration-500">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(reviews[activeIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <p className="text-xl sm:text-2xl text-stone-700 dark:text-stone-200 leading-relaxed mb-8 font-medium">
                  "{reviews[activeIndex].text}"
                </p>
                
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {reviews[activeIndex].avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-800 dark:text-stone-100">
                          {reviews[activeIndex].name}
                        </span>
                        {reviews[activeIndex].verified && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                            ✓ Verificat
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-stone-500 dark:text-stone-400">
                        {reviews[activeIndex].location} • {reviews[activeIndex].product}
                      </span>
                    </div>
                  </div>

                  {/* Navigation arrows */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={goToPrev}
                      className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-600 flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 dark:hover:bg-amber-900/20 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={goToNext}
                      className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-600 flex items-center justify-center text-stone-600 dark:text-stone-400 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 dark:hover:bg-amber-900/20 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center gap-2 mt-8">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveIndex(index);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex 
                        ? "w-8 bg-amber-500" 
                        : "w-2 bg-stone-300 dark:bg-stone-600 hover:bg-amber-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mini review cards */}
        <div 
          className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {reviews.slice(0, 3).map((review, index) => (
            <div 
              key={index}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                activeIndex === index
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  : "bg-white dark:bg-stone-800 border-stone-100 dark:border-stone-700 hover:border-amber-200 dark:hover:border-amber-800"
              }`}
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveIndex(index);
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-medium text-stone-800 dark:text-stone-100 text-sm">
                    {review.name}
                  </p>
                  <div className="flex gap-0.5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div 
          className={`mt-16 text-center transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-stone-600 dark:text-stone-400 mb-4">
            Ai încercat produsele noastre?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-amber-500 text-amber-600 dark:text-amber-500 font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300"
          >
            Lasă o recenzie
            <Star className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
