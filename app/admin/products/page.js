"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Package,
  ChevronDown,
  AlertCircle,
  Loader2,
  Check,
  ImageIcon,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    unit: "kg",
    categoryId: "",
    image: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock.toString(),
        unit: product.unit || "kg",
        categoryId: product.categoryId || "",
        image: product.image || "",
      });
      setImagePreview(product.image || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        unit: "kg",
        categoryId: "",
        image: "",
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      unit: "kg",
      categoryId: "",
      image: "",
    });
    setImagePreview(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifică tipul fișierului
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Tip de fișier invalid. Sunt permise doar: JPG, PNG, WEBP, GIF");
      return;
    }

    // Verifică mărimea (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Fișierul este prea mare. Mărimea maximă este 5MB");
      return;
    }

    setUploading(true);
    
    // Arată preview local imediat
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    try {
      // Upload în Vercel Blob
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setImagePreview(data.url);
        setFormData((prev) => ({ ...prev, image: data.url }));
      } else {
        alert(data.error || "Eroare la încărcarea imaginii");
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("A apărut o eroare la încărcarea imaginii");
      setImagePreview(null);
    } finally {
      setUploading(false);
      // Curăță URL-ul local
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseFloat(formData.stock),
    };

    // Optimistic update - actualizează UI imediat
    const tempId = `temp-${Date.now()}`;
    const optimisticProduct = {
      ...productData,
      id: editingProduct?.id || tempId,
      category: categories.find(c => c.id === formData.categoryId) || null,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    const previousProducts = [...products];
    
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? optimisticProduct : p))
      );
    } else {
      setProducts((prev) => [optimisticProduct, ...prev]);
    }
    closeModal();

    // Sincronizează cu baza de date
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        const data = await res.json();
        // Actualizează cu datele reale de la server
        if (editingProduct) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProduct.id ? data.product : p))
          );
        } else {
          setProducts((prev) =>
            prev.map((p) => (p.id === tempId ? data.product : p))
          );
        }
      } else {
        // Revert la starea anterioară dacă a eșuat
        setProducts(previousProducts);
        const error = await res.json();
        alert(error.error || "A apărut o eroare. Modificările au fost anulate.");
      }
    } catch (error) {
      console.error("Save product error:", error);
      setProducts(previousProducts);
      alert("A apărut o eroare. Modificările au fost anulate.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Sigur dorești să ștergi acest produs?")) return;

    setDeleting(productId);
    
    // Optimistic update - șterge din UI imediat
    const previousProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    // Sincronizează cu baza de date
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // Revert dacă a eșuat
        setProducts(previousProducts);
        const error = await res.json();
        alert(error.error || "A apărut o eroare. Ștergerea a fost anulată.");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      setProducts(previousProducts);
      alert("A apărut o eroare. Ștergerea a fost anulată.");
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: "Stoc epuizat", color: "text-red-600 bg-red-100" };
    if (stock < 5) return { text: "Stoc redus", color: "text-yellow-600 bg-yellow-100" };
    return { text: "În stoc", color: "text-green-600 bg-green-100" };
  };

  // Funcție pentru a formata afișarea unității (kg -> 100g)
  const formatUnitDisplay = (unit) => {
    const unitLower = (unit || "").toLowerCase();
    if (unitLower.includes("kg")) {
      return "100g";
    }
    return unit;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Produse</h2>
          <p className="text-xs sm:text-sm text-gray-500">{products.length} produse</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Adaugă</span>
          <span className="xs:hidden">+</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-2.5 sm:p-4 shadow-sm border border-gray-100">
        <div className="flex gap-2 sm:gap-4">
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Caută..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-2 sm:pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
            />
          </div>
          <div className="relative flex-shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-2 sm:pl-4 pr-7 sm:pr-8 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none bg-white cursor-pointer text-gray-900 text-sm sm:text-base"
            >
              <option value="all">Toate</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
          <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">Nu s-au găsit produse</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Compact horizontal layout for all screens */}
                <div className="flex p-2 sm:p-3 gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative bg-gray-100 rounded-lg overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">{product.name}</h3>
                      <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium flex-shrink-0 ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {product.category?.name || 'Fără categorie'}
                    </p>
                    <div className="flex items-center justify-between mt-1 sm:mt-2">
                      <span className="text-sm sm:text-base font-bold text-amber-600">
                        {product.price.toFixed(0)} MDL/{formatUnitDisplay(product.unit)}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400">
                        Stoc: {product.stock} {formatUnitDisplay(product.unit)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => openModal(product)}
                      className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      {deleting === product.id ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {editingProduct ? "Editează produs" : "Produs nou"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900 hover:rotate-90"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Imagine produs
                </label>
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`relative aspect-[16/9] sm:aspect-video rounded-lg sm:rounded-xl border-2 border-dashed transition-colors overflow-hidden bg-gray-50 ${
                    uploading 
                      ? "border-amber-400 cursor-wait" 
                      : "border-gray-300 hover:border-amber-500 cursor-pointer"
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className={`object-cover ${uploading ? "opacity-50" : ""}`}
                      />
                      {uploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                          <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                          <p className="text-sm text-white font-medium">Se încarcă...</p>
                        </div>
                      )}
                    </>
                  ) : uploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 animate-spin mb-2" />
                      <p className="text-xs sm:text-sm text-gray-600">Se încarcă imaginea...</p>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-1 sm:mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">Apasă pentru imagine</p>
                      <p className="text-xs text-gray-400 mt-1">Max 5MB • JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploading}
                />
                {formData.image && !uploading && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Imagine încărcată cu succes
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Nume produs *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                  placeholder="ex: Migdale crude"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Descriere
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                  placeholder="Descriere opțională..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Categorie
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                >
                  <option value="">Fără categorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price, Stock & Unit - 3 columns on mobile */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Preț *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    required
                    className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Stoc *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stock: e.target.value }))
                    }
                    required
                    className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Unitate
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, unit: e.target.value }))
                    }
                    className="w-full px-1 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="buc">buc</option>
                    <option value="l">l</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={uploading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base disabled:opacity-50"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="hidden sm:inline">Se salvează...</span>
                      <span className="sm:hidden">Salvare...</span>
                    </>
                  ) : uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Se încarcă...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      {editingProduct ? "Salvează" : "Adaugă"}
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
