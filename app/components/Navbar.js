"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingCart, User, LogOut, Menu, X, Shield, Package, ChevronDown, Loader2 } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const userMenuRef = useRef(null);

  const navLinks = [
    { name: "Acasă", href: "#hero" },
    { name: "Produse", href: "#menu" },
    { name: "Despre Noi", href: "#about" },
    { name: "Recenzii", href: "#reviews" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  // Scroll detection for navbar style change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      // Detect active section
      const sections = navLinks.map(link => link.href.replace("#", ""));
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

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUser();
    fetchCartCount();
    
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchCartCount = async () => {
    setCartLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.items?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setCartCount(0);
      setShowUserMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, []);

  const handleSmoothScroll = useCallback((e, href) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsOpen(false);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/[0.03] dark:bg-zinc-900/95" 
            : "bg-white/80 backdrop-blur-md dark:bg-zinc-900/80"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-16" : "h-18 lg:h-20"}`}>
            
            {/* Logo */}
            <Link 
              href="/" 
              className="relative flex items-center gap-3 group"
            >
              <div className="relative">
                <Image
                  src="/Nutopia4.png"
                  alt="Nutopia Logo"
                  width={140}
                  height={46}
                  className={`transition-all duration-300 ${scrolled ? "h-9 w-auto" : "h-10 lg:h-11 w-auto"}`}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center">
              <div className="flex items-center bg-zinc-100/80 dark:bg-zinc-800/80 rounded-full px-1.5 py-1.5">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                        isActive
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-full shadow-sm" />
                      )}
                      <span className="relative z-10">{link.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex lg:items-center lg:gap-2">
              
              {/* Admin Button - Premium Style */}
              {user && (user.role === "admin" || user.role === "moderator") && (
                <Link
                  href="/admin"
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Shield className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Admin</span>
                </Link>
              )}

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative group p-2.5 rounded-full text-zinc-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500 transition-all duration-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                {cartLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                )}
                {!cartLoading && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 animate-in zoom-in duration-200">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                /* User Menu - Enhanced */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full transition-all duration-300 ${
                      showUserMenu 
                        ? "bg-amber-100 dark:bg-zinc-700 ring-2 ring-amber-500/50" 
                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full ring-2 ring-white dark:ring-zinc-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-white dark:ring-zinc-700">
                        {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
                      {user.name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-zinc-200/50 dark:border-zinc-700/50 py-2 z-50 transition-all duration-300 origin-top-right ${
                    showUserMenu 
                      ? "opacity-100 scale-100 translate-y-0" 
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}>
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {user.name || "Utilizator"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <div className="py-1">
                      {(user.role === "admin" || user.role === "moderator") && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                      <Link
                        href="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        <span>Comenzile mele</span>
                      </Link>
                    </div>
                    
                    <div className="border-t border-zinc-100 dark:border-zinc-700 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Deconectare</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Auth Buttons */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                  >
                    Conectare
                  </Link>
                  <Link
                    href="/register"
                    className="group relative px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Înregistrare</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 lg:hidden">
              <Link
                href="/cart"
                className="relative p-2.5 rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                {cartLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                {!cartLoading && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5">
                  <span className={`absolute left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? "top-2.5 rotate-45" : "top-1"}`} />
                  <span className={`absolute left-0 top-2.5 w-5 h-0.5 bg-current transition-all duration-300 ${isOpen ? "opacity-0 scale-0" : "opacity-100"}`} />
                  <span className={`absolute left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? "top-2.5 -rotate-45" : "top-4"}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Slide Down */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-4 space-y-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800">
            {navLinks.map((link, index) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.name}
                </a>
              );
            })}
            
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4 space-y-1">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-amber-500/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-base font-semibold">
                        {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {user.name || "Utilizator"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                    </div>
                  </div>
                  
                  {(user.role === "admin" || user.role === "moderator") && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors"
                    >
                      <Shield className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    Comenzile mele
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Deconectare
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 text-center text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    Conectare
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                  >
                    Înregistrare
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer */}
      <div className={`transition-all duration-300 ${scrolled ? "h-16" : "h-18 lg:h-20"}`} />
    </>
  );
}
