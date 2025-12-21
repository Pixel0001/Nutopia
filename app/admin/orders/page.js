"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Clock,
  Loader2,
  Truck,
  CheckCircle,
  AlertCircle,
  Package,
  ChevronDown,
  Eye,
  X,
  Calendar,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateStart, setCustomDateStart] = useState("");
  const [customDateEnd, setCustomDateEnd] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    
    // Găsește comanda și statusul vechi
    const order = orders.find((o) => o.id === orderId);
    const oldStatus = order?.status;
    
    // Optimistic update - actualizează UI imediat
    const previousOrders = [...orders];
    const previousSelected = selectedOrder;
    const previousStats = stats ? { ...stats } : null;
    
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }
    
    // Actualizează stats-urile local
    if (stats && oldStatus && oldStatus !== newStatus) {
      setStats((prev) => ({
        ...prev,
        [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
        [newStatus]: (prev[newStatus] || 0) + 1,
      }));
    }

    // Sincronizează cu baza de date
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        // Actualizează cu datele complete de la server
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        // Revert la starea anterioară
        setOrders(previousOrders);
        setSelectedOrder(previousSelected);
        setStats(previousStats);
        const error = await res.json();
        alert(error.error || "A apărut o eroare. Statusul a fost resetat.");
      }
    } catch (error) {
      console.error("Update status error:", error);
      setOrders(previousOrders);
      setSelectedOrder(previousSelected);
      setStats(previousStats);
      alert("A apărut o eroare. Statusul a fost resetat.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "În așteptare";
      case "processing":
        return "În pregătire";
      case "shipped":
        return "În livrare";
      case "delivered":
        return "Livrat";
      case "cancelled":
        return "Anulat";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cash":
        return "Cash la livrare";
      case "card":
        return "Card la livrare";
      case "paypal":
        return "PayPal";
      default:
        return method;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.shippingAddress?.toLowerCase().includes(searchLower);
    
    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case "today":
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          matchesDate = orderDate >= today && orderDate <= todayEnd;
          break;
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayEnd = new Date(yesterday);
          yesterdayEnd.setHours(23, 59, 59, 999);
          matchesDate = orderDate >= yesterday && orderDate <= yesterdayEnd;
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = orderDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = orderDate >= monthAgo;
          break;
        case "custom":
          if (customDateStart) {
            const startDate = new Date(customDateStart);
            startDate.setHours(0, 0, 0, 0);
            if (orderDate < startDate) matchesDate = false;
          }
          if (customDateEnd && matchesDate) {
            const endDate = new Date(customDateEnd);
            endDate.setHours(23, 59, 59, 999);
            if (orderDate > endDate) matchesDate = false;
          }
          break;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const statusOptions = [
    { value: "all", label: "Toate" },
    { value: "pending", label: "În așteptare" },
    { value: "processing", label: "În pregătire" },
    { value: "shipped", label: "În livrare" },
    { value: "delivered", label: "Livrate" },
    { value: "cancelled", label: "Anulate" },
  ];

  const dateOptions = [
    { value: "all", label: "Oricând" },
    { value: "today", label: "Azi" },
    { value: "yesterday", label: "Ieri" },
    { value: "week", label: "Ultima săptămână" },
    { value: "month", label: "Ultima lună" },
    { value: "custom", label: "Perioadă custom" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
        {statusOptions.slice(1).map((status) => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={`p-2 sm:p-4 rounded-lg sm:rounded-xl border transition-all ${
              statusFilter === status.value
                ? "border-amber-500 bg-amber-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-lg sm:text-2xl font-bold text-gray-800">
              {stats?.[status.value] || 0}
            </p>
            <p className="text-[10px] sm:text-sm text-gray-500 truncate">{status.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Caută..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-4">
            <div className="relative">
              <Calendar className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  if (e.target.value !== "custom") {
                    setCustomDateStart("");
                    setCustomDateEnd("");
                  }
                }}
                className="w-full pl-8 sm:pl-10 pr-6 sm:pr-8 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer text-gray-900"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <Filter className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-6 sm:pr-8 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer text-gray-900"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {dateFilter === "custom" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900"
              />
              <span className="text-center text-xs sm:text-sm text-gray-500">până la</span>
              <input
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>
          )}
        </div>
      </div>

      {/* Orders Cards */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredOrders.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Nu s-au găsit comenzi
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs sm:text-sm font-medium text-gray-800">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                {/* Client & Total */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {order.user?.name || order.user?.email || "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getPaymentMethodText(order.paymentMethod)} • {new Date(order.createdAt).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                  <p className="font-bold text-gray-800 ml-2 text-sm sm:text-base">
                    {order.total.toFixed(0)} MDL
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-800">
                Comandă #{selectedOrder.id.slice(-8).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Status */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Status comandă
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    updateOrderStatus(selectedOrder.id, e.target.value)
                  }
                  disabled={updating === selectedOrder.id}
                  className={`w-full text-sm font-medium rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 border cursor-pointer ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  <option value="pending">În așteptare</option>
                  <option value="processing">În pregătire</option>
                  <option value="shipped">În livrare</option>
                  <option value="delivered">Livrat</option>
                  <option value="cancelled">Anulat</option>
                </select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Client
                  </h4>
                  <p className="text-sm text-gray-800">
                    {selectedOrder.user?.name || "—"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {selectedOrder.user?.email}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Telefon
                  </h4>
                  <p className="text-sm text-gray-800">
                    {selectedOrder.phone || "—"}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Adresa de livrare
                </h4>
                <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-2 sm:p-3">
                  {selectedOrder.shippingAddress}
                </p>
              </div>

              {/* Payment */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Metodă de plată
                  </h4>
                  <p className="text-sm text-gray-800">
                    {getPaymentMethodText(selectedOrder.paymentMethod)}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Data comenzii
                  </h4>
                  <p className="text-sm text-gray-800">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("ro-RO")}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Produse comandate
                </h4>
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="p-2 sm:p-3 flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit || "kg"} × {item.price.toFixed(0)} MDL
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800 text-sm flex-shrink-0">
                        {(item.quantity * item.price).toFixed(0)} MDL
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              {(() => {
                // Calculăm subtotal din items dacă nu e salvat în baza de date
                const calculatedSubtotal = selectedOrder.subtotal ?? 
                  selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) ?? 0;
                // Calculăm shipping: gratuit peste 500 MDL
                const calculatedShipping = selectedOrder.shippingCost ?? 
                  (calculatedSubtotal >= 500 ? 0 : 100);
                
                return (
                  <div className="bg-amber-50 rounded-lg p-3 sm:p-4 space-y-1 sm:space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{calculatedSubtotal.toFixed(0)} MDL</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Livrare</span>
                      <span>{calculatedShipping > 0 ? `${calculatedShipping.toFixed(0)} MDL` : "Gratuit"}</span>
                    </div>
                    <div className="flex justify-between text-base sm:text-lg font-bold text-gray-800 pt-2 border-t border-amber-200">
                      <span>Total</span>
                      <span>{selectedOrder.total.toFixed(0)} MDL</span>
                    </div>
                  </div>
                );
              })()}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Note
                  </h4>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-2 sm:p-3">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
