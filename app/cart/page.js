"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Loader2, 
  CreditCard, Banknote, Truck, Shield, Gift, ChevronRight,
  MapPin, Phone, User, FileText, CheckCircle2, Sparkles
} from "lucide-react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [step, setStep] = useState(1); // 1: cart, 2: shipping, 3: payment
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  useEffect(() => {
    fetchCart();
  }, []);

  // Load PayPal SDK when payment step is reached
  useEffect(() => {
    if (step === 3 && paymentMethod === "paypal" && !paypalLoaded && process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    }
  }, [step, paymentMethod, paypalLoaded]);

  // Render PayPal buttons
  useEffect(() => {
    if (paypalLoaded && paymentMethod === "paypal" && window.paypal && cartItems.length > 0) {
      const container = document.getElementById("paypal-button-container");
      // Calculate total inside useEffect to avoid reference before initialization
      const subtotal = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );
      const shipping = subtotal < 400 ? 100 : 0;
      const orderTotal = subtotal + shipping;
      
      if (container) {
        container.innerHTML = "";
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          },
          createOrder: async () => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: orderTotal }),
            });
            const data = await res.json();
            if (data.error) {
              setError(data.error);
              throw new Error(data.error);
            }
            return data.id;
          },
          onApprove: async (data) => {
            try {
              const res = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID }), // PayPal SDK provides orderID in callback
              });
              const result = await res.json();
              if (result.status === "COMPLETED") {
                handlePlaceOrder(null, "paypal", data.orderID);
              } else {
                setError("Plata nu a fost finalizată");
              }
            } catch (err) {
              setError("Eroare la procesarea plății");
            }
          },
          onError: (err) => {
            console.error("PayPal error:", err);
            setError("Eroare la procesarea plății PayPal");
          },
        }).render("#paypal-button-container");
      }
    }
  }, [paypalLoaded, paymentMethod, step, cartItems]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru a determina incrementul și min bazat pe unitatea produsului
  const getQuantityConfig = (unit) => {
    const unitLower = (unit || "").toLowerCase();
    if (unitLower.includes("buc")) {
      return { increment: 1, min: 1, display: (q) => q.toFixed(0) };
    }
    // Pentru kg și g - increment 0.5
    return { increment: 0.5, min: 0.5, display: (q) => q % 1 === 0 ? q.toFixed(0) : q.toFixed(1) };
  };

  const updateQuantity = async (itemId, newQuantity, minQuantity) => {
    if (newQuantity < minQuantity) return;
    
    // Optimistic update - update UI immediately
    const previousItems = [...cartItems];
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Then sync with database in background
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!res.ok) {
        // Rollback on error
        setCartItems(previousItems);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      // Rollback on error
      console.error("Error updating quantity:", error);
      setCartItems(previousItems);
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const removeItem = async (itemId) => {
    // Optimistic update - remove from UI immediately
    const previousItems = [...cartItems];
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Then sync with database in background
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // Rollback on error
        setCartItems(previousItems);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      // Rollback on error
      console.error("Error removing item:", error);
      setCartItems(previousItems);
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handlePlaceOrder = async (e, method = paymentMethod, paypalOrderId = null) => {
    if (e) e.preventDefault();
    setError("");
    setOrderLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentMethod: method,
          paypalOrderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "A apărut o eroare");
        return;
      }

      setOrderSuccess(true);
      setCartItems([]);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      setError("A apărut o eroare. Încearcă din nou.");
    } finally {
      setOrderLoading(false);
    }
  };

  const validateShipping = () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      setError("Te rugăm să completezi toate câmpurile obligatorii");
      return false;
    }
    return true;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  
  const shippingCost = subtotal < 500 ? 100 : 0;
  const total = subtotal + shippingCost;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-amber-200 dark:border-amber-900 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-amber-600 animate-bounce" />
            </div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 font-medium">Se încarcă coșul...</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-200 dark:bg-green-900/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-emerald-200 dark:bg-emerald-900/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
            </div>
            
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/30 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
                  Succes!
                </h1>
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-lg">
                Comanda ta a fost plasată cu succes! Te vom contacta în curând pentru confirmare.
              </p>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 mb-8 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-center gap-3 text-amber-700 dark:text-amber-400">
                  <Gift className="w-6 h-6" />
                  <span className="font-semibold">Livrare gratuită pentru această comandă!</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/orders"
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 group"
                >
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Vezi comenzile
                </Link>
                <Link
                  href="/"
                  className="flex-1 px-6 py-4 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Înapoi acasă
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              {step === 1 ? "🛒 Coșul tău" : step === 2 ? "📦 Detalii livrare" : "💳 Metoda de plată"}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              {cartItems.length} {cartItems.length === 1 ? "produs" : "produse"} • {total.toFixed(2)} MDL
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        {cartItems.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-center">
              <div className="flex items-center bg-white dark:bg-zinc-800 rounded-full p-2 shadow-lg">
                {[
                  { num: 1, label: "Coș", icon: ShoppingCart },
                  { num: 2, label: "Livrare", icon: Truck },
                  { num: 3, label: "Plată", icon: CreditCard },
                ].map((s, i) => (
                  <div key={s.num} className="flex items-center">
                    <button
                      onClick={() => s.num < step && setStep(s.num)}
                      disabled={s.num > step}
                      className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${
                        step === s.num
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                          : step > s.num
                          ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                          : "text-zinc-400 cursor-not-allowed"
                      }`}
                    >
                      {step > s.num ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <s.icon className="w-5 h-5" />
                      )}
                      <span className="font-semibold hidden sm:inline">{s.label}</span>
                    </button>
                    {i < 2 && (
                      <div className={`w-8 sm:w-12 h-1 mx-1 rounded-full ${
                        step > s.num ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-12 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingCart className="w-16 h-16 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center justify-center gap-2">
              Coșul tău este gol
              <ShoppingCart className="w-6 h-6 text-zinc-400" />
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
              Descoperă produsele noastre naturale și adaugă-le în coș pentru a începe comanda
            </p>
            <Link
              href="/#menu"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/30 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Explorează produsele
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Cart Items */}
              {step === 1 && (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-zinc-800 rounded-3xl shadow-lg p-5 sm:p-6 flex gap-4 sm:gap-6 hover:shadow-xl transition-all hover:-translate-y-1"
                      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                    >
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 dark:from-zinc-700 dark:to-zinc-600 flex-shrink-0 group">
                        {item.productImage && (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg sm:text-xl text-zinc-900 dark:text-white">
                            {item.productName}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating[item.id]}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:rotate-12"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-amber-600 font-semibold text-lg mb-auto">
                          {item.price} {item.unit}
                        </p>
                        
                        <div className="flex items-center justify-between mt-4">
                          {(() => {
                            const config = getQuantityConfig(item.unit);
                            return (
                              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 rounded-full p-1.5">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - config.increment, config.min)}
                                  disabled={updating[item.id] || item.quantity <= config.min}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-600 rounded-full transition-all disabled:opacity-50 hover:shadow-md"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-14 text-center font-bold text-lg text-zinc-900 dark:text-white">
                                  {config.display(item.quantity)}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + config.increment, config.min)}
                                  disabled={updating[item.id]}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-600 rounded-full transition-all disabled:opacity-50 hover:shadow-md"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })()}
                          <div className="text-right">
                            <span className="font-bold text-2xl text-zinc-900 dark:text-white">
                              {(parseFloat(item.price) * item.quantity).toFixed(0)}
                            </span>
                            <span className="text-zinc-500 ml-1">MDL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2: Shipping Form */}
              {step === 2 && (
                <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    Unde livrăm?
                  </h2>
                  
                  {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">⚠️</span>
                      </div>
                      {error}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Nume complet *"
                        required
                        value={formData.fullName}
                        onChange={handleFormChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-700 dark:text-white transition-all text-lg"
                      />
                    </div>
                    
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Număr de telefon *"
                        required
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="w-full pl-12 pr-4 py-4 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-700 dark:text-white transition-all text-lg"
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                        <input
                          type="text"
                          name="city"
                          placeholder="Oraș *"
                          required
                          value={formData.city}
                          onChange={handleFormChange}
                          className="w-full pl-12 pr-4 py-4 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-700 dark:text-white transition-all text-lg"
                        />
                      </div>
                      <input
                        type="text"
                        name="address"
                        placeholder="Adresa completă *"
                        required
                        value={formData.address}
                        onChange={handleFormChange}
                        className="w-full px-4 py-4 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-700 dark:text-white transition-all text-lg"
                      />
                    </div>
                    
                    <div className="relative group">
                      <FileText className="absolute left-4 top-4 w-5 h-5 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                      <textarea
                        name="notes"
                        placeholder="Note pentru curier (opțional) - ex: Etaj 3, Apt 12..."
                        value={formData.notes}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full pl-12 pr-4 py-4 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 dark:bg-zinc-700 dark:text-white transition-all resize-none text-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    Cum dorești să plătești?
                  </h2>

                  {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-center gap-4 p-5 rounded-2xl border-3 cursor-pointer transition-all ${
                        paymentMethod === "cash"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20"
                          : "border-zinc-200 dark:border-zinc-600 hover:border-green-300 hover:bg-green-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        paymentMethod === "cash" 
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg" 
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
                      }`}>
                        <Banknote className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">💵 Numerar la livrare</h3>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          Plătești curierului când primești comanda
                        </p>
                      </div>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        paymentMethod === "cash"
                          ? "border-green-500 bg-green-500 scale-110"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}>
                        {paymentMethod === "cash" && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </label>

                    {/* Card on Delivery */}
                    <label
                      className={`flex items-center gap-4 p-5 rounded-2xl border-3 cursor-pointer transition-all ${
                        paymentMethod === "card"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20"
                          : "border-zinc-200 dark:border-zinc-600 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        paymentMethod === "card" 
                          ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-lg" 
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
                      }`}>
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">💳 Card la livrare</h3>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          Plătești cu cardul la primirea coletului
                        </p>
                      </div>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        paymentMethod === "card"
                          ? "border-blue-500 bg-blue-500 scale-110"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}>
                        {paymentMethod === "card" && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </label>

                    {/* Pay Now Online */}
                    <label
                      className={`flex items-center gap-4 p-5 rounded-2xl border-3 cursor-pointer transition-all ${
                        paymentMethod === "paypal"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20"
                          : "border-zinc-200 dark:border-zinc-600 hover:border-purple-300 hover:bg-purple-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        paymentMethod === "paypal" 
                          ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg" 
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
                      }`}>
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">✨ Plătește acum online</h3>
                        <p className="text-zinc-500 dark:text-zinc-400">
                          Plată securizată instantă cu PayPal
                        </p>
                      </div>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        paymentMethod === "paypal"
                          ? "border-purple-500 bg-purple-500 scale-110"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}>
                        {paymentMethod === "paypal" && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </label>

                    {/* PayPal Button Container */}
                    {paymentMethod === "paypal" && (
                      <div className="mt-6 p-6 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-purple-200 dark:border-purple-800 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Plată 100% securizată prin PayPal</span>
                        </div>
                        <div id="paypal-button-container" className="min-h-[50px] bg-white rounded-xl p-2">
                          {!paypalLoaded && (
                            <div className="flex flex-col items-center justify-center py-6">
                              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
                              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Se încarcă opțiunile de plată...</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 text-center">
                          Prin continuare, accepți termenii și condițiile PayPal
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                  📋 Sumar comandă
                </h2>
                
                {/* Mini cart items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 dark:from-zinc-700 dark:to-zinc-600 flex-shrink-0 relative">
                        {item.productImage && (
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-white truncate">
                          {item.productName}
                        </p>
                        <p className="text-sm text-zinc-500">{item.quantity} x {item.price} MDL</p>
                      </div>
                      <span className="font-bold text-amber-600">
                        {(parseFloat(item.price) * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-zinc-200 dark:border-zinc-700 pt-4 space-y-3">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-semibold">{subtotal.toFixed(2)} MDL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Truck className="w-4 h-4" />
                      Livrare
                    </span>
                    {shippingCost === 0 ? (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-bold">
                        GRATUIT
                      </span>
                    ) : (
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">{shippingCost} MDL</span>
                    )}
                  </div>
                  
                  {/* Free shipping progress */}
                  {shippingCost > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mt-2">
                      <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 mb-2">
                        <Gift className="w-4 h-4" />
                        <span>Mai adaugă <strong>{(500 - subtotal).toFixed(0)} MDL</strong> pentru livrare gratuită!</span>
                      </div>
                      <div className="h-2 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t-2 border-zinc-200 dark:border-zinc-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-zinc-900 dark:text-white">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        {total.toFixed(2)} MDL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-zinc-600 dark:text-zinc-400">Plată 100% securizată</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-zinc-600 dark:text-zinc-400">Livrare rapidă 24-48h</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <Gift className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-zinc-600 dark:text-zinc-400">Produse naturale premium</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  {step === 1 && (
                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 group"
                    >
                      Continuă
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  
                  {step === 2 && (
                    <>
                      <button
                        onClick={() => {
                          if (validateShipping()) {
                            setStep(3);
                          }
                        }}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 group"
                      >
                        Continuă la plată
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => setStep(1)}
                        className="w-full py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-medium"
                      >
                        ← Înapoi la coș
                      </button>
                    </>
                  )}
                  
                  {step === 3 && paymentMethod !== "paypal" && (
                    <>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={orderLoading}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all shadow-xl shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50 group"
                      >
                        {orderLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Se procesează...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Finalizează comanda
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        className="w-full py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-medium"
                      >
                        ← Înapoi la livrare
                      </button>
                    </>
                  )}
                  
                  {step === 3 && paymentMethod === "paypal" && (
                    <button
                      onClick={() => setStep(2)}
                      className="w-full py-3 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-medium"
                    >
                      ← Înapoi la livrare
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
