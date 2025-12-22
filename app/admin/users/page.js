"use client";

import { useState, useEffect } from "react";
import { isSuperAdmin } from "@/config/admins";
import {
  Search,
  Plus,
  UserPlus,
  Users,
  Shield,
  ShieldCheck,
  User,
  X,
  Loader2,
  Check,
  Trash2,
  Mail,
  ChevronDown,
  Ban,
  Unlock,
  Crown,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "moderator",
    accountType: "google", // "google" sau "credentials"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "moderator",
      accountType: "google",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Optimistic update - actualizează UI imediat
    const tempId = `temp-${Date.now()}`;
    const optimisticUser = {
      id: tempId,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      createdAt: new Date().toISOString(),
      _count: { orders: 0 },
    };

    const previousUsers = [...users];
    setUsers((prev) => [optimisticUser, ...prev]);
    closeModal();

    // Sincronizează cu baza de date
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.created) {
          // Înlocuiește utilizatorul temporar cu cel real
          setUsers((prev) =>
            prev.map((u) => (u.id === tempId ? data.user : u))
          );
        } else {
          // Utilizator existent actualizat
          setUsers((prev) =>
            prev.filter((u) => u.id !== tempId).map((u) => (u.id === data.user.id ? data.user : u))
          );
        }
      } else {
        // Revert la starea anterioară
        setUsers(previousUsers);
        const error = await res.json();
        alert(error.error || "A apărut o eroare. Modificările au fost anulate.");
      }
    } catch (error) {
      console.error("Save user error:", error);
      setUsers(previousUsers);
      alert("A apărut o eroare. Modificările au fost anulate.");
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    setUpdating(userId);
    
    // Optimistic update - actualizează UI imediat
    const previousUsers = [...users];
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    // Sincronizează cu baza de date
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? data.user : u))
        );
      } else {
        // Revert la starea anterioară
        setUsers(previousUsers);
        const error = await res.json();
        alert(error.error || "A apărut o eroare. Rolul a fost resetat.");
      }
    } catch (error) {
      console.error("Update role error:", error);
      setUsers(previousUsers);
      alert("A apărut o eroare. Rolul a fost resetat.");
    } finally {
      setUpdating(null);
    }
  };

  const revokeRole = async (userId) => {
    const userToRevoke = users.find(u => u.id === userId);
    
    // Prevent revoking admin roles
    if (userToRevoke && (userToRevoke.role === "admin" || isSuperAdmin(userToRevoke.email))) {
      alert("Nu poți revoca rolul administratorilor!");
      return;
    }
    
    if (!confirm("Sigur dorești să revoci rolul acestui utilizator?")) return;

    setUpdating(userId);
    
    // Optimistic update - actualizează UI imediat
    const previousUsers = [...users];
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: "user" } : u))
    );

    // Sincronizează cu baza de date
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? data.user : u))
        );
      } else {
        // Revert la starea anterioară
        setUsers(previousUsers);
        const error = await res.json();
        alert(error.error || "A apărut o eroare. Rolul a fost resetat.");
      }
    } catch (error) {
      console.error("Revoke role error:", error);
      setUsers(previousUsers);
      alert("A apărut o eroare. Rolul a fost resetat.");
    } finally {
      setUpdating(null);
    }
  };

  const toggleBlockUser = async (userId, currentlyBlocked) => {
    const userToBlock = users.find(u => u.id === userId);
    
    // Prevent blocking admins
    if (userToBlock && (userToBlock.role === "admin" || isSuperAdmin(userToBlock.email))) {
      alert("Nu poți bloca administratori!");
      return;
    }
    
    const action = currentlyBlocked ? "debloca" : "bloca";
    let reason = null;
    
    if (!currentlyBlocked) {
      reason = prompt("Motivul blocării (opțional):", "Anulare repetată de comenzi");
      if (reason === null) return; // User cancelled
    } else {
      if (!confirm(`Sigur dorești să deblochezi acest utilizator?`)) return;
    }

    setUpdating(userId);
    
    // Optimistic update
    const previousUsers = [...users];
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: !currentlyBlocked, blockedReason: reason } : u))
    );

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isBlocked: !currentlyBlocked,
          blockedReason: reason 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? data.user : u))
        );
      } else {
        setUsers(previousUsers);
        const error = await res.json();
        alert(error.error || `A apărut o eroare la ${action}re.`);
      }
    } catch (error) {
      console.error("Toggle block error:", error);
      setUsers(previousUsers);
      alert(`A apărut o eroare la ${action}re.`);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleIcon = (role, email) => {
    if (role === "admin" && isSuperAdmin(email)) {
      return <Crown className="w-4 h-4" />;
    }
    switch (role) {
      case "admin":
        return <ShieldCheck className="w-4 h-4" />;
      case "moderator":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role, email) => {
    if (role === "admin" && isSuperAdmin(email)) {
      return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border-amber-300";
    }
    switch (role) {
      case "admin":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleText = (role, email) => {
    if (role === "admin" && isSuperAdmin(email)) {
      return "Super Admin";
    }
    switch (role) {
      case "admin":
        return "Administrator";
      case "moderator":
        return "Moderator";
      default:
        return "Utilizator";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleOptions = [
    { value: "all", label: "Toate rolurile" },
    { value: "admin", label: "Administratori" },
    { value: "moderator", label: "Moderatori" },
    { value: "user", label: "Utilizatori" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Count users by role
  const adminCount = users.filter((u) => u.role === "admin").length;
  const moderatorCount = users.filter((u) => u.role === "moderator").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{adminCount}</p>
              <p className="text-sm text-gray-500">Administratori</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{moderatorCount}</p>
              <p className="text-sm text-gray-500">Moderatori</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{userCount}</p>
              <p className="text-sm text-gray-500">Utilizatori</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gestionare Utilizatori</h2>
          <p className="text-sm text-gray-500">
            Adaugă sau modifică administratori și moderatori
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Adaugă admin/moderator
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Caută după email sau nume..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-4 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer text-gray-900"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilizator
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comenzi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Înregistrat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Nu s-au găsit utilizatori
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img 
                            src={user.image} 
                            alt={user.name || ""} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                            {user.name?.[0]?.toUpperCase() ||
                              user.email?.[0]?.toUpperCase() ||
                              "?"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800">
                              {user.name || "—"}
                            </p>
                            {user.provider === "google" && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600" title="Cont Google">
                                <svg className="w-3 h-3" viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.isBlocked && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs bg-red-100 text-red-700" title={user.blockedReason || "Cont blocat"}>
                              <Ban className="w-3 h-3" />
                              Blocat
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "admin" || isSuperAdmin(user.email) ? (
                        <div className={`inline-flex items-center gap-2 text-sm font-medium rounded-lg px-3 py-1.5 border ${getRoleColor(user.role, user.email)}`}>
                          {getRoleIcon(user.role, user.email)}
                          <span>{getRoleText(user.role, user.email)}</span>
                          {isSuperAdmin(user.email) && (
                            <span className="text-xs opacity-75">(Protejat)</span>
                          )}
                        </div>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={updating === user.id || user.isBlocked}
                          className={`text-sm font-medium rounded-lg px-3 py-1.5 border cursor-pointer ${getRoleColor(
                            user.role, user.email
                          )} ${updating === user.id || user.isBlocked ? "opacity-50" : ""}`}
                        >
                          <option value="user">Utilizator</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-800">
                        {user._count?.orders || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("ro-RO")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Block/Unblock button - Disabled for admins */}
                        <button
                          onClick={() => toggleBlockUser(user.id, user.isBlocked)}
                          disabled={updating === user.id || user.role === "admin" || isSuperAdmin(user.email)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.role === "admin" || isSuperAdmin(user.email)
                              ? "text-gray-300 cursor-not-allowed"
                              : user.isBlocked 
                                ? "text-green-600 hover:bg-green-50" 
                                : "text-orange-600 hover:bg-orange-50"
                          }`}
                          title={
                            user.role === "admin" || isSuperAdmin(user.email)
                              ? "Nu poți bloca administratori"
                              : user.isBlocked 
                                ? "Deblochează utilizatorul" 
                                : "Blochează utilizatorul"
                          }
                        >
                          {updating === user.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : user.isBlocked ? (
                            <Unlock className="w-5 h-5" />
                          ) : (
                            <Ban className="w-5 h-5" />
                          )}
                        </button>
                        
                        {/* Revoke role button - Disabled for admins */}
                        {user.role !== "user" && (
                          <button
                            onClick={() => revokeRole(user.id)}
                            disabled={updating === user.id || user.role === "admin" || isSuperAdmin(user.email)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.role === "admin" || isSuperAdmin(user.email)
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                            title={
                              user.role === "admin" || isSuperAdmin(user.email)
                                ? "Nu poți revoca rolul administratorilor"
                                : "Revocă rolul"
                            }
                          >
                            {updating === user.id ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin/Moderator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Adaugă Admin/Moderator
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900 hover:rotate-90"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                Dacă utilizatorul există deja, rolul va fi actualizat. Dacă nu,
                un cont nou va fi creat.
              </p>

              {/* Account Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip cont
                </label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, accountType: "google" }))}
                    className={`flex-1 py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      formData.accountType === "google"
                        ? "bg-amber-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Cont Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, accountType: "credentials" }))}
                    className={`flex-1 py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      formData.accountType === "credentials"
                        ? "bg-amber-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email & Parolă
                  </button>
                </div>
                {formData.accountType === "google" && (
                  <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                    💡 Utilizatorul va primi automat poza și numele din Google la primul login
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    placeholder="email@exemplu.com"
                  />
                </div>
              </div>

              {/* Name - only for credentials */}
              {formData.accountType === "credentials" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    placeholder="Nume complet"
                  />
                </div>
              )}

              {/* Password - only for credentials */}
              {formData.accountType === "credentials" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parolă *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                    placeholder="Minim 6 caractere"
                  />
                </div>
              )}

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Moderatorii pot vedea doar dashboard-ul și comenzile
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Se salvează...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Salvează
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
