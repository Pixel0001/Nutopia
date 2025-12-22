"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, Loader2,
  ChevronDown, ChevronUp, MapPin, Phone, User, CreditCard, Banknote,
  Calendar, ShoppingBag, Sparkles, Gift, Info
} from "lucide-react";

const statusConfig = {
  pending: { 
    label: "În așteptare", 
    color: "from-yellow-400 to-amber-500", 
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    textColor: "text-yellow-700 dark:text-yellow-400",
    icon: Clock,
    description: "Comanda ta este în curs de procesare"
  },
  confirmed: { 
    label: "Confirmată", 
    color: "from-blue-400 to-cyan-500", 
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-400",
    icon: CheckCircle,
    description: "Comanda a fost confirmată și se pregătește"
  },
  processing: { 
    label: "Se pregătește", 
    color: "from-purple-400 to-violet-500", 
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-700 dark:text-purple-400",
    icon: Package,
    description: "Produsele sunt în curs de ambalare"
  },
  shipped: { 
    label: "În livrare", 
    color: "from-indigo-400 to-blue-500", 
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    textColor: "text-indigo-700 dark:text-indigo-400",
    icon: Truck,
    description: "Curierul este pe drum spre tine"
  },
  delivered: { 
    label: "Livrată", 
    color: "from-green-400 to-emerald-500", 
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-700 dark:text-green-400",
    icon: CheckCircle,
    description: "Comanda a fost livrată cu succes"
  },
  cancelled: { 
    label: "Anulată", 
    color: "from-red-400 to-rose-500", 
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-400",
    icon: XCircle,
    description: "Comanda a fost anulată"
  },
};

const paymentMethodLabels = {
  cash: { label: "Numerar la livrare", icon: Banknote },
  card: { label: "Card la livrare", icon: CreditCard },
  paypal: { label: "PayPal", icon: CreditCard },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Acum";
    if (diffMins < 60) return `Acum ${diffMins} minute`;
    if (diffHours < 24) return `Acum ${diffHours} ore`;
    if (diffDays < 7) return `Acum ${diffDays} zile`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 border-4 border-amber-200 dark:border-amber-900 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-8 h-8 text-amber-600 animate-bounce" />
            </div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-4 font-medium">Se încarcă comenzile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 group"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-700 dark:text-zinc-300 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-amber-600" /> Comenzile mele
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              {orders.length} {orders.length === 1 ? "comandă" : "comenzi"} în istoric
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-xl p-12 text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center justify-center gap-2">
              Nu ai comenzi încă
              <ShoppingBag className="w-6 h-6 text-zinc-400" />
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
              Explorează produsele noastre naturale și plasează prima ta comandă pentru a beneficia de livrare gratuită!
            </p>
            <Link
              href="/#menu"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/30 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Descoperă produsele
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;
              const PaymentIcon = paymentMethodLabels[order.paymentMethod]?.icon || Banknote;

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-zinc-800 rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                >
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full p-6 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${status.color} flex items-center justify-center shadow-lg`}>
                          <StatusIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-lg text-zinc-900 dark:text-white">
                              #{order.id.slice(-8).toUpperCase()}
                            </p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.textColor}`}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            <Calendar className="w-4 h-4" />
                            <span>{getRelativeTime(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                            {order.total.toFixed(2)} MDL
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1 justify-end">
                            <PaymentIcon className="w-4 h-4" />
                            {paymentMethodLabels[order.paymentMethod]?.label || "Numerar"}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                          <ChevronDown className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                    </div>

                    {/* Status description */}
                    <div className={`mt-4 p-3 rounded-xl ${status.bgColor}`}>
                      <p className={`text-sm font-medium ${status.textColor} flex items-center gap-2`}>
                        <Info className="w-4 h-4 flex-shrink-0" />
                        {status.description}
                      </p>
                    </div>
                  </button>

                  {/* Order Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-zinc-100 dark:border-zinc-700">
                      {/* Progress Timeline */}
                      <div className="mt-6 mb-8 overflow-x-auto">
                        <div className="flex items-center min-w-[400px]">
                          {["pending", "confirmed", "processing", "shipped", "delivered"].map((step, i) => {
                            const stepStatus = statusConfig[step];
                            const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
                            const currentStatusIndex = statusOrder.indexOf(order.status);
                            const isActive = i <= currentStatusIndex;
                            const isCurrent = order.status === step;
                            const StepIcon = stepStatus.icon;
                            
                            return (
                              <div key={step} className="flex-1 flex flex-col items-center relative">
                                {/* Line before */}
                                {i > 0 && (
                                  <div className={`absolute top-4 right-1/2 w-full h-1 -z-10 ${
                                    i <= currentStatusIndex
                                      ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                      : "bg-zinc-200 dark:bg-zinc-700"
                                  }`}></div>
                                )}
                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
                                  isActive 
                                    ? `bg-gradient-to-br ${stepStatus.color} text-white shadow-lg` 
                                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400"
                                } ${isCurrent ? "ring-4 ring-offset-2 ring-amber-300 dark:ring-amber-800 dark:ring-offset-zinc-800" : ""}`}>
                                  <StepIcon className="w-4 h-4" />
                                </div>
                                {/* Label */}
                                <span className={`text-xs text-center mt-2 leading-tight ${
                                  isActive ? "text-zinc-700 dark:text-zinc-300 font-medium" : "text-zinc-400 dark:text-zinc-500"
                                }`}>
                                  {stepStatus.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Products */}
                      <div className="bg-zinc-50 dark:bg-zinc-700/30 rounded-2xl p-4 mb-6">
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-amber-600" />
                          Produse comandate
                        </h4>
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-3 rounded-xl">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 dark:from-zinc-700 dark:to-zinc-600 flex-shrink-0 relative">
                                {item.productImage && (
                                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-zinc-900 dark:text-white truncate">
                                  {item.productName}
                                </p>
                                <p className="text-sm text-zinc-500">
                                  {item.quantity} x {item.price} MDL
                                </p>
                              </div>
                              <span className="font-bold text-amber-600 text-lg">
                                {(item.price * item.quantity).toFixed(0)} MDL
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="bg-zinc-50 dark:bg-zinc-700/30 rounded-2xl p-4">
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-amber-600" />
                          Detalii livrare
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">Nume</p>
                              <p className="font-semibold text-zinc-900 dark:text-white">{order.fullName}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Phone className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">Telefon</p>
                              <p className="font-semibold text-zinc-900 dark:text-white">{order.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 sm:col-span-2">
                            <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400">Adresă</p>
                              <p className="font-semibold text-zinc-900 dark:text-white">{order.address}, {order.city}</p>
                            </div>
                          </div>
                          {order.notes && (
                            <div className="sm:col-span-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
                              <p className="text-sm text-amber-700 dark:text-amber-400">
                                📝 <strong>Note:</strong> {order.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order footer */}
                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-700">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Comandat pe {formatDate(order.createdAt)}
                        </p>
                        {order.status === "delivered" && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                            <Gift className="w-5 h-5" />
                            Mulțumim pentru comandă!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
