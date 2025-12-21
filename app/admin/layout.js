"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Home,
  MessageCircle,
  Mail,
  Quote,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.role === "admin" || data.user.role === "moderator")) {
          setUser(data.user);
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "moderator";

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin",
      roles: ["admin", "moderator"],
    },
    {
      name: "Comenzi",
      href: "/admin/orders",
      icon: ShoppingCart,
      current: pathname.startsWith("/admin/orders"),
      roles: ["admin", "moderator"],
    },
    {
      name: "Produse",
      href: "/admin/products",
      icon: Package,
      current: pathname.startsWith("/admin/products"),
      roles: ["admin"],
    },
    {
      name: "Categorii",
      href: "/admin/categories",
      icon: FolderTree,
      current: pathname.startsWith("/admin/categories"),
      roles: ["admin"],
    },
    {
      name: "Utilizatori",
      href: "/admin/users",
      icon: Users,
      current: pathname.startsWith("/admin/users"),
      roles: ["admin"],
    },
    {
      name: "Mesaje",
      href: "/admin/messages",
      icon: MessageCircle,
      current: pathname.startsWith("/admin/messages"),
      roles: ["admin", "moderator"],
    },
    {
      name: "Testimoniale",
      href: "/admin/testimonials",
      icon: Quote,
      current: pathname.startsWith("/admin/testimonials"),
      roles: ["admin"],
    },
    {
      name: "Email Marketing",
      href: "/admin/emails",
      icon: Mail,
      current: pathname.startsWith("/admin/emails"),
      roles: ["admin"], // Only admins can see, but super admin check is done on the page
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-amber-500" />
              <span className="text-xl font-bold text-gray-800">
                Admin Panel
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-500 hover:text-gray-900 hover:rotate-90"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isAdmin ? "bg-green-500" : "bg-blue-500"
                }`}
              ></span>
              {isAdmin ? "Administrator" : "Moderator"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? "bg-amber-100 text-amber-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
                {item.current && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5" />
              Înapoi la site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Deconectare
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white shadow-sm flex items-center px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {filteredNavigation.find((n) => n.current)?.name || "Admin"}
          </h1>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
