"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, User, LogOut, Menu, X, Shield } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { name: "Acasă", href: "#hero" },
    { name: "Produse", href: "#menu" },
    { name: "Despre Noi", href: "#about" },
    { name: "Recenzii", href: "#reviews" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    fetchUser();
    fetchCartCount();
    
    // Listen for cart updates
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
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.items?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setCartCount(0);
      setShowUserMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm dark:bg-zinc-900/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/Nutopia4.png"
                alt="Nutopia Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-amber-600 dark:text-zinc-300 dark:hover:text-amber-500"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth & Cart Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {/* Admin Button */}
            {user && (user.role === "admin" || user.role === "moderator") && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-zinc-700 hover:bg-amber-50 hover:text-amber-600 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {user.name || user.email?.split("@")[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 z-50">
                    {(user.role === "admin" || user.role === "moderator") && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-700 font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-zinc-700"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Comenzile mele
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4" />
                      Deconectare
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login & Register Buttons */
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                >
                  Conectare
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/25"
                >
                  Înregistrare
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-zinc-200 dark:border-zinc-700">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {link.name}
              </a>
            ))}
            
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Conectat ca: {user.name || user.email}
                  </div>
                  {(user.role === "admin" || user.role === "moderator") && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg dark:hover:bg-zinc-800"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Comenzile mele
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20"
                  >
                    Deconectare
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Conectare
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="block mx-4 py-2 text-center rounded-full bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
                  >
                    Înregistrare
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
