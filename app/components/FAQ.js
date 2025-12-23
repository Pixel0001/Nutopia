"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Minus, HelpCircle, MessageCircle, CreditCard, Truck, Leaf, RotateCcw, Store, Percent } from "lucide-react";

const faqs = [
  {
    question: "Care sunt metodele de plată acceptate?",
    answer: "Acceptăm plata cu cardul bancar (online sau la livrare, prin curier) și numerar la livrare, în funcție de opțiunea aleasă de client. Toate plățile sunt sigure și conforme legislației în vigoare.",
    icon: CreditCard,
    color: "from-blue-500 to-indigo-600"
  },
  {
    question: "Cât durează livrarea?",
    answer: "Livrarea comenzilor se efectuează, de regulă, în 1–3 zile lucrătoare de la confirmarea comenzii. În perioadele aglomerate, termenul de livrare poate varia ușor.",
    icon: Truck,
    color: "from-emerald-500 to-teal-600"
  },
  {
    question: "Produsele sunt naturale 100%?",
    answer: "Da. Produsele Nutopia sunt realizate din ingrediente naturale, atent selecționate. Nu adăugăm aditivi artificiali inutili. Fiecare produs este pregătit cu grijă pentru a păstra gustul și calitatea.",
    icon: Leaf,
    color: "from-green-500 to-emerald-600"
  },
  {
    question: "Pot returna produsele?",
    answer: "Produsele alimentare nu pot fi returnate, conform legislației în vigoare, din motive de siguranță alimentară. Excepție fac cazurile în care produsul ajunge deteriorat sau greșit, situație în care te rugăm să ne contactezi în cel mai scurt timp.",
    icon: RotateCcw,
    color: "from-orange-500 to-red-500"
  },
  {
    question: "Aveți și magazin fizic?",
    answer: "Da 😊 Nutopia dispune și de magazin fizic, unde ne poți găsi și alege produsele direct. Noi ne aflăm pe strada Columna 42.",
    icon: Store,
    color: "from-amber-500 to-orange-600"
  },
  {
    question: "Oferiți discount pentru comenzi mari?",
    answer: "Da. Pentru comenzi mai mari sau colaborări, oferim discounturi personalizate. Te rugăm să ne contactezi direct pentru a discuta detaliile.",
    icon: Percent,
    color: "from-pink-500 to-rose-600"
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
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

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const scrollToSection = useCallback((e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="faq" 
      className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-stone-50 to-amber-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-amber-200/30 dark:bg-amber-900/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-orange-200/30 dark:bg-orange-900/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div 
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Suport
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 dark:text-stone-100 mb-4">
            Întrebări <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">Frecvente</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-stone-600 dark:text-stone-400">
            Găsește răspunsuri rapide la cele mai comune întrebări despre produsele și serviciile noastre
          </p>
        </div>

        <div 
          className={`space-y-4 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const IconComponent = faq.icon;
            return (
              <div
                key={index}
                className={`group rounded-2xl border transition-all duration-300 ${
                  isOpen 
                    ? "bg-white dark:bg-stone-800 border-amber-200 dark:border-amber-800 shadow-lg shadow-amber-100/50 dark:shadow-none" 
                    : "bg-white/50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-white dark:hover:bg-stone-800"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center gap-4 p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${faq.color} flex items-center justify-center transition-transform duration-300 ${isOpen ? "scale-110" : "group-hover:scale-110"}`}>
                    <IconComponent className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  
                  <span className={`flex-1 font-semibold transition-colors duration-300 ${
                    isOpen 
                      ? "text-amber-700 dark:text-amber-400" 
                      : "text-stone-800 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400"
                  }`}>
                    {faq.question}
                  </span>
                  
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen 
                      ? "bg-amber-500 text-white" 
                      : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-600"
                  }`}>
                    {isOpen ? (
                      <Minus className="w-4 h-4" strokeWidth={2.5} />
                    ) : (
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    )}
                  </span>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pl-20">
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div 
          className={`mt-16 text-center transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex flex-col items-center p-8 rounded-3xl bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-800/50 border border-stone-200 dark:border-stone-700">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
              Nu ai găsit răspunsul?
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-sm">
              Echipa noastră este gata să te ajute cu orice întrebare
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, '#contact')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Contactează-ne
              </a>
              <a
                href="tel:+37360123456"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-semibold hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-500 transition-all duration-300"
              >
                Sună-ne
              </a>
            </div>
          </div>
        </div>

        <div 
          className={`mt-12 flex flex-wrap justify-center gap-8 text-center transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {[
            { label: "Timp mediu răspuns", value: "< 2 ore" },
            { label: "Satisfacție clienți", value: "98%" },
            { label: "Disponibilitate", value: "24/7" },
          ].map((stat, index) => (
            <div key={index} className="px-6">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                {stat.value}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
