"use client";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const navLinks = [
    { name: "Acasă", href: "#hero" },
    { name: "Produse", href: "#menu" },
    { name: "Despre Noi", href: "#about" },
    { name: "Recenzii", href: "#reviews" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = navLinks.map((link) => link.href.slice(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((e, href) => {
    e.preventDefault();
    const targetId = href.slice(1);
    const element = document.getElementById(targetId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-stone-900/5 dark:bg-stone-900/80"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => scrollToSection(e, "#hero")}
              className="relative flex items-center gap-3 group"
            >
              <div className="relative overflow-hidden">
                <Image
                  src="/Nutopia4.PNG"
                  alt="Nutopia Logo"
                  width={300}
                  height={300}
                  className={`w-auto transition-all duration-500 ${
                    scrolled ? "h-12" : "h-16"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-800/0 via-amber-800/10 to-amber-800/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </div>
              <div className="hidden sm:block h-8 w-px bg-amber-700/30" />
              <span
                className={`hidden sm:block text-amber-800/80 dark:text-amber-300/80 font-medium tracking-wider uppercase transition-all duration-500 ${
                  scrolled ? "text-[10px]" : "text-xs"
                }`}
              >
                Alune & Nuci Premium
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="relative px-4 py-2 group"
                  >
                    <span
                      className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
                        isActive
                          ? "text-amber-800 dark:text-amber-400"
                          : "text-stone-600 group-hover:text-stone-900 dark:text-stone-400 dark:group-hover:text-stone-100"
                      }`}
                    >
                      {link.name}
                    </span>
                    <span className="absolute inset-0 rounded-lg bg-stone-100 dark:bg-stone-800 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-amber-700 to-amber-900 rounded-full transition-all duration-300 ${
                        isActive ? "w-6 opacity-100" : "w-0 opacity-0"
                      }`}
                    />
                  </a>
                );
              })}
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "#contact")}
                className="ml-4 relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden rounded-full group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 transition-all duration-300 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-r from-amber-900 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative text-sm font-semibold text-white">
                  Comandă
                </span>
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center">
                <span
                  className={`w-5 h-0.5 bg-stone-700 dark:bg-stone-300 rounded-full transition-all duration-300 origin-center ${
                    isOpen ? "rotate-45 translate-y-[7px]" : ""
                  }`}
                />
                <span
                  className={`w-5 h-0.5 bg-stone-700 dark:bg-stone-300 rounded-full transition-all duration-300 ${
                    isOpen ? "opacity-0 scale-0" : ""
                  }`}
                />
                <span
                  className={`w-5 h-0.5 bg-stone-700 dark:bg-stone-300 rounded-full transition-all duration-300 origin-center ${
                    isOpen ? "-rotate-45 -translate-y-[7px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[280px] bg-white dark:bg-stone-900 shadow-2xl transition-transform duration-500 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full pt-24 pb-8 px-6">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link, index) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className={`relative px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive
                        ? "text-amber-800 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20"
                        : "text-stone-700 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-stone-100 dark:hover:bg-stone-800"
                    }`}
                    style={{
                      transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                      transform: isOpen ? "translateX(0)" : "translateX(20px)",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <span className="flex items-center gap-3">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                      )}
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </div>
            <div
              className="mt-auto"
              style={{
                transitionDelay: isOpen ? "300ms" : "0ms",
                transform: isOpen ? "translateY(0)" : "translateY(20px)",
                opacity: isOpen ? 1 : 0,
                transition: "all 0.5s ease-out",
              }}
            >
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "#contact")}
                className="flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 text-white font-semibold shadow-lg shadow-amber-900/25 hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300"
              >
                Comandă Acum
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className={`transition-all duration-500 ${scrolled ? "h-16" : "h-20"}`} />
    </>
  );
}
