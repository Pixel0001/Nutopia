"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Truck,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get user profile
      const profileRes = await fetch("/api/auth/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData.user);
      }

      // Get orders with stats
      const ordersRes = await fetch("/api/admin/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setStats(ordersData.stats);
        setRecentOrders(ordersData.orders.slice(0, 5));
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-600" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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

  const getStatusBgColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
          Bun venit, {user?.name || "Admin"}!
        </h2>
        <p className="text-amber-100 text-sm sm:text-base">
          {isAdmin
            ? "Ai acces complet la panoul de administrare."
            : "Ai acces la dashboard și gestionarea comenzilor."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm text-gray-500">Total Comenzi</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-0.5 sm:mt-1">
                {stats?.total || 0}
              </p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm text-gray-500">În Așteptare</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-0.5 sm:mt-1">
                {stats?.pending || 0}
              </p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm text-gray-500">În Livrare</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-0.5 sm:mt-1">
                {stats?.shipped || 0}
              </p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="order-2 sm:order-1">
              <p className="text-xs sm:text-sm text-gray-500">Venituri</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 mt-0.5 sm:mt-1 truncate">
                {stats?.revenue?.toFixed(0) || "0"} <span className="text-sm">MDL</span>
              </p>
            </div>
            <div className="order-1 sm:order-2 w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (Admin only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          <Link
            href="/admin/products"
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Produse</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Gestionează produsele</p>
              </div>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <FolderTree className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Categorii</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Gestionează categoriile</p>
              </div>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Utilizatori</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Gestionează echipa</p>
              </div>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
            </div>
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Comenzi Recente</h3>
          <Link
            href="/admin/orders"
            className="text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Vezi toate
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">
              Nu există comenzi momentan
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="font-medium text-gray-800 text-xs sm:text-sm">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusBgColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="hidden xs:inline">{getStatusText(order.status)}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                      {order.user?.name || order.user?.email || "Client"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {order.total.toFixed(0)} <span className="text-xs">MDL</span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
