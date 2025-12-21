"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Send,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Package,
  User,
  LogIn,
  ChevronDown,
} from "lucide-react";

export default function ReviewsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    text: "",
    rating: 5,
    product: "",
    location: "",
  });

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", // Send cookies with request
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        // Extract all products from grouped structure
        const allProducts = [];
        if (data.products && Array.isArray(data.products)) {
          data.products.forEach(group => {
            if (group.items && Array.isArray(group.items)) {
              allProducts.push(...group.items);
            }
          });
        }
        setProducts(allProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
        body: JSON.stringify({
          text: formData.text,
          rating: formData.rating,
          product: formData.product,
          location: formData.location,
          name: user.name || user.email.split("@")[0],
          image: user.image || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({ text: "", rating: 5, product: "", location: "" });
      } else {
        setError(data.error || "Eroare la trimiterea recenziei");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("Eroare la trimiterea recenziei");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-stone-950 dark:to-stone-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-stone-950 dark:to-stone-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-4">
          <Link
            href="/#reviews"
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600 dark:text-stone-400" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-bold text-stone-800 dark:text-stone-100 truncate">
              Lasă o recenzie
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 truncate">
              Spune-ne părerea ta despre produsele noastre
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Not logged in */}
        {!user && (
          <div className="bg-white dark:bg-stone-800 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 sm:mb-3 px-2">
              Conectează-te pentru a lăsa o recenzie
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mb-6 sm:mb-8 max-w-md mx-auto px-2">
              Pentru a putea lăsa o recenzie, trebuie să fii conectat cu contul tău. Durează doar câteva secunde!
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
              <Link
                href="/login?redirect=/reviews"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm sm:text-base font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                Conectează-te
              </Link>
              <Link
                href="/register?redirect=/reviews"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm sm:text-base font-semibold rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-all"
              >
                Creează cont
              </Link>
            </div>
          </div>
        )}

        {/* Success state */}
        {user && success && (
          <div className="bg-white dark:bg-stone-800 rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2 sm:mb-3 px-2">
              Mulțumim pentru recenzie! 🎉
            </h2>
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mb-6 sm:mb-8 max-w-md mx-auto px-2">
              Recenzia ta a fost trimisă cu succes și va fi vizibilă după aprobare. Apreciem foarte mult feedback-ul tău!
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
              <button
                onClick={() => setSuccess(false)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm sm:text-base font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                Lasă altă recenzie
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm sm:text-base font-semibold rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-all"
              >
                Înapoi acasă
              </Link>
            </div>
          </div>
        )}

        {/* Review form */}
        {user && !success && (
          <div className="bg-white dark:bg-stone-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            {/* User preview */}
            <div className="p-4 sm:p-6 border-b border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
              <div className="flex items-center gap-3 sm:gap-4">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={48}
                    height={48}
                    className="rounded-full w-10 h-10 sm:w-14 sm:h-14"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-base sm:text-xl font-bold flex-shrink-0">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-semibold text-stone-800 dark:text-stone-100 truncate">
                    {user.name || user.email.split("@")[0]}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 truncate">
                    Recenzia va fi publicată cu acest profil
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {error && (
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm sm:text-base">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2 sm:mb-3">
                  Rating
                </label>
                <div className="flex gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-0.5 sm:p-1 transition-transform hover:scale-110 touch-manipulation"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${
                          star <= formData.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-200 dark:text-stone-600 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review text */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Recenzia ta *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Spune-ne experiența ta cu produsele noastre..."
                  rows={4}
                  required
                  minLength={20}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-stone-200 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Minim 20 de caractere ({formData.text.length}/20)
                </p>
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Produs recenzat (opțional)
                </label>
                <div className="relative">
                  <Package className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-stone-400 pointer-events-none z-10" />
                  
                  {/* Custom Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                      className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-stone-200 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer text-left flex items-center gap-2"
                    >
                      {formData.product ? (
                        <>
                          {products.find(p => p.name === formData.product) && (
                            <img
                              src={products.find(p => p.name === formData.product).image}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <span className="truncate">{formData.product}</span>
                        </>
                      ) : (
                        <span className="text-stone-400">Selectează un produs</span>
                      )}
                    </button>
                    <ChevronDown className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-stone-400 pointer-events-none transition-transform ${
                      isProductDropdownOpen ? 'rotate-180' : ''
                    }`} />
                    
                    {/* Dropdown Menu */}
                    {isProductDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, product: "" });
                            setIsProductDropdownOpen(false);
                          }}
                          className="w-full px-3 sm:px-4 py-2.5 text-left hover:bg-stone-50 dark:hover:bg-stone-600 text-sm sm:text-base text-stone-400 border-b border-stone-100 dark:border-stone-600"
                        >
                          Selectează un produs
                        </button>
                        {products.map((product, index) => (
                          <button
                            key={product.id || `product-${index}`}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, product: product.name });
                              setIsProductDropdownOpen(false);
                            }}
                            className="w-full px-3 sm:px-4 py-2.5 text-left hover:bg-stone-50 dark:hover:bg-stone-600 flex items-center gap-3 text-sm sm:text-base text-stone-900 dark:text-white border-b border-stone-100 dark:border-stone-600 last:border-b-0"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <span className="truncate">{product.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Localitatea ta (opțional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Chișinău"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-stone-200 dark:border-stone-600 rounded-xl bg-white dark:bg-stone-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || formData.text.length < 20}
                className="w-full py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Se trimite...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Trimite recenzia</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
