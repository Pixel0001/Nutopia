"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Sparkles, ShoppingBag, Users } from "lucide-react";

// Hook pentru animația de numărare
function useCountUp(end, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!startCounting) return;
    
    let startTime = null;
    const endValue = parseInt(end.replace(/\D/g, '')) || 0;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function pentru efect mai natural
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * endValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration, startCounting]);
  
  // Returnează valoarea cu suffix-ul original (%, +, etc.)
  const suffix = end.replace(/[0-9]/g, '');
  return count + suffix;
}

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [statsVisible, setStatsVisible] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / 50,
          y: (e.clientY - rect.top - rect.height / 2) / 50,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Observer pentru stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const floatingItems = [
    { icon: "🥜", size: "text-4xl", top: "15%", left: "10%", delay: "0s" },
    { icon: "🌰", size: "text-3xl", top: "25%", right: "15%", delay: "0.5s" },
    { icon: "🍯", size: "text-4xl", bottom: "30%", left: "8%", delay: "1s" },
    { icon: "🥜", size: "text-2xl", top: "60%", right: "10%", delay: "1.5s" },
    { icon: "🌰", size: "text-3xl", bottom: "20%", right: "20%", delay: "2s" },
    { icon: "🍂", size: "text-2xl", top: "40%", left: "15%", delay: "0.8s" },
  ];

  const stats = [
    { value: "100%", label: "Natural", icon: Sparkles },
    { value: "50+", label: "Produse", icon: ShoppingBag },
    { value: "1000+", label: "Clienți", icon: Users },
  ];

  // Folosim hook-ul pentru fiecare stat
  const count1 = useCountUp("100%", 2000, statsVisible);
  const count2 = useCountUp("50+", 2000, statsVisible);
  const count3 = useCountUp("1000+", 2500, statsVisible);
  const countValues = [count1, count2, count3];

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950"
    >
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(217,119,6,0.4) 0%, transparent 70%)",
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(180,83,9,0.3) 0%, transparent 70%)",
            transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 dark:opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Floating Elements */}
      {floatingItems.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.size} opacity-20 dark:opacity-10 pointer-events-none select-none hidden lg:block`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            animation: `float 6s ease-in-out infinite`,
            animationDelay: item.delay,
          }}
        >
          {item.icon}
        </div>
      ))}

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm mb-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Livrare gratuită la comenzi peste 100 RON
            </span>
          </div>

          {/* Logo */}
          <div
            className={`mb-8 transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 blur-3xl opacity-20 scale-150" />
              <Image
                src="/Nutopia4.PNG"
                alt="Nutopia Logo"
                width={280}
                height={112}
                className="relative mx-auto h-28 w-auto drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Main Heading */}
          <h1
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-stone-800 dark:text-stone-100 mb-4">
              Bun venit în lumea
            </span>
            <span className="relative inline-block">
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                gusturilor naturale
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-amber-500/30"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,5 Q50,0 100,5 T200,5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`mx-auto mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-stone-600 dark:text-stone-400 transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Descoperă selecția noastră{" "}
            <span className="font-semibold text-amber-700 dark:text-amber-500">premium</span> de
            nuci, fructe uscate și miere naturală. Produse de calitate superioară,
            direct de la producători locali.
          </p>

          {/* CTA Buttons */}
          <div
            className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <a
              href="#menu"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                Vezi Produsele
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <a
              href="#about"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-amber-600/50 text-amber-700 dark:text-amber-400 font-semibold hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                Află Mai Multe
                <svg
                  className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </a>
          </div>

          {/* Stats */}
          <div
            ref={statsRef}
            className={`mt-20 transition-all duration-1000 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-wrap justify-center gap-12 sm:gap-20">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="group relative flex flex-col items-center gap-2 cursor-default"
                  >
                    {/* Icon simplu */}
                    <IconComponent 
                      className="w-6 h-6 text-amber-600 dark:text-amber-500 group-hover:scale-110 transition-transform duration-300" 
                      strokeWidth={1.5}
                    />
                    
                    {/* Value cu animație de numărare */}
                    <span className="text-4xl sm:text-5xl font-bold text-stone-800 dark:text-stone-100">
                      {countValues[index]}
                    </span>
                    <span className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {stat.label}
                    </span>

                    {/* Progress bar individual */}
                    <div className="w-16 h-0.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mt-3">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: statsVisible ? "100%" : "0%",
                          transition: `width 1.5s cubic-bezier(0.4, 0, 0.2, 1)`,
                          transitionDelay: `${800 + index * 300}ms`,
                        }}
                      />
                    </div>

                    {/* Separator */}
                    {index < stats.length - 1 && (
                      <div className="hidden sm:block absolute -right-6 sm:-right-10 top-1/2 -translate-y-1/2 w-px h-20 bg-stone-200 dark:bg-stone-700" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div
            className={`mt-16 transition-all duration-1000 delay-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <a
              href="#menu"
              className="inline-flex flex-col items-center gap-2 text-stone-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors duration-300 group"
            >
              <span className="text-xs font-medium tracking-widest uppercase">
                Descoperă
              </span>
              <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1">
                <div className="w-1.5 h-3 rounded-full bg-current animate-bounce" />
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-50 dark:from-stone-950 to-transparent pointer-events-none" />

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </section>
  );
}
