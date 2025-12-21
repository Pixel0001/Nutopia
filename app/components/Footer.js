"use client";
import Image from "next/image";
import { useCallback, useState } from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, ArrowUp, Heart, Send, Loader2, CheckCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState(null);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || newsletterLoading) return;

    setNewsletterLoading(true);
    setNewsletterMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail })
      });

      const data = await res.json();

      if (res.ok) {
        setNewsletterMessage({ success: true, text: data.message });
        setNewsletterEmail("");
      } else {
        setNewsletterMessage({ success: false, text: data.error });
      }
    } catch (error) {
      setNewsletterMessage({ success: false, text: "A apărut o eroare" });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

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

  const quickLinks = [
    { name: "Acasă", href: "#hero" },
    { name: "Produse", href: "#menu" },
    { name: "Despre Noi", href: "#about" },
    { name: "Recenzii", href: "#reviews" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  const categories = [
    { name: "Nuci Premium", href: "#menu" },
    { name: "Fructe Uscate", href: "#menu" },
    { name: "Miere Naturală", href: "#menu" },
    { name: "Mixuri & Pachete", href: "#menu" },
  ];

  const contactInfo = [
    { icon: MapPin, text: "Str. Columna 42, Chișinău" },
    { icon: Phone, text: "+373 60 123 456" },
    { icon: Mail, text: "contact@nutopia.md" },
    { icon: Clock, text: "Luni - Sâmbătă: 9:00 - 19:00" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ];

  return (
    <footer className="relative bg-stone-900 text-white overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-stone-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold mb-2">Abonează-te la Newsletter</h3>
              <p className="text-stone-400">Primește oferte exclusive și noutăți direct în inbox</p>
            </div>
            <div className="w-full max-w-md">
              <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Adresa ta de email"
                    className="w-full px-5 py-3.5 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:border-amber-500 focus:ring-0 outline-none transition-colors duration-300"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 flex items-center gap-2 group disabled:opacity-50"
                >
                  {newsletterLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Abonează-te</span>
                      <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
              {newsletterMessage && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${
                  newsletterMessage.success ? "text-green-400" : "text-red-400"
                }`}>
                  {newsletterMessage.success && <CheckCircle className="w-4 h-4" />}
                  {newsletterMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <a href="#hero" onClick={(e) => scrollToSection(e, '#hero')} className="inline-block mb-6">
              <Image
                src="/Nutopia4.png"
                alt="Nutopia Logo"
                width={150}
                height={60}
                className="h-14 w-auto  opacity-90 hover:opacity-100 transition-opacity"
              />
            </a>
            <p className="text-stone-400 leading-relaxed mb-6">
              Descoperă gustul autentic al naturii cu selecția noastră premium de nuci, fructe uscate și miere naturală.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-amber-500 hover:text-white transition-all duration-300"
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-amber-500 rounded-full" />
              Navigare
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-stone-400 hover:text-amber-500 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-500 rounded-full transition-all duration-300" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-amber-500 rounded-full" />
              Categorii
            </h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    onClick={(e) => scrollToSection(e, category.href)}
                    className="text-stone-400 hover:text-amber-500 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-500 rounded-full transition-all duration-300" />
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-amber-500 rounded-full" />
              Contact
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-stone-400 text-sm pt-1">{info.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-stone-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-stone-500 flex items-center gap-1">
              © {currentYear} Nutopia. Creat cu 
              <Heart className="w-4 h-4 text-red-500 fill-red-500 inline" />
              în Moldova
            </p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-stone-500 hover:text-amber-500 transition-colors duration-300">
                Termeni și Condiții
              </a>
              <a href="#" className="text-sm text-stone-500 hover:text-amber-500 transition-colors duration-300">
                Politica de Confidențialitate
              </a>
            </div>

            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-stone-400 hover:bg-amber-500 hover:text-white transition-all duration-300 group"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
