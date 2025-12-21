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
  FolderTree,
  Loader2,
  Check,
  GripVertical,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        image: category.image || "",
        order: category.order || 0,
      });
      setImagePreview(category.image || null);
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        image: "",
        order: categories.length,
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", image: "", order: 0 });
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setImagePreview(base64);
        setFormData((prev) => ({ ...prev, image: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Optimistic update - actualizează UI imediat
    const tempId = `temp-${Date.now()}`;
    const optimisticCategory = {
      ...formData,
      id: editingCategory?.id || tempId,
      _count: editingCategory?._count || { products: 0 },
    };

    const previousCategories = [...categories];
    
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? optimisticCategory : c))
      );
    } else {
      setCategories((prev) => [...prev, optimisticCategory]);
    }
    closeModal();

    // Sincronizează cu baza de date
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingCategory) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? data.category : c))
          );
        } else {
          setCategories((prev) =>
            prev.map((c) => (c.id === tempId ? data.category : c))
          );
        }
      } else {
        // Revert la starea anterioară
        setCategories(previousCategories);
        const error = await res.json();
        alert(error.error || "A apărut o eroare. Modificările au fost anulate.");
      }
    } catch (error) {
      console.error("Save category error:", error);
      setCategories(previousCategories);
      alert("A apărut o eroare. Modificările au fost anulate.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category?._count?.products > 0) {
      alert(
        `Această categorie conține ${category._count.products} produse. Șterge sau mută produsele înainte de a șterge categoria.`
      );
      return;
    }

    if (!confirm("Sigur dorești să ștergi această categorie?")) return;

    setDeleting(categoryId);
    
    // Optimistic update - șterge din UI imediat
    const previousCategories = [...categories];
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));

    // Sincronizează cu baza de date
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        // Revert dacă a eșuat
        setCategories(previousCategories);
        const error = await res.json();
        alert(error.error || "A apărut o eroare. Ștergerea a fost anulată.");
      }
    } catch (error) {
      console.error("Delete category error:", error);
      setCategories(previousCategories);
      alert("A apărut o eroare. Ștergerea a fost anulată.");
    } finally {
      setDeleting(null);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Categorii</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {categories.length} categorii
          </p>
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

      {/* Search */}
      <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Caută..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
          <FolderTree className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">Nu s-au găsit categorii</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Compact horizontal layout */}
              <div className="flex p-2 sm:p-3 gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative bg-gray-100 rounded-lg overflow-hidden">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                      <FolderTree className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base truncate">{category.name}</h3>
                    <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                      {category._count?.products || 0} produse
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    /{category.slug}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                    Ordine: {category.order || 0}
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => openModal(category)}
                    className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deleting === category.id}
                    className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    {deleting === category.id ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {editingCategory ? "Editează categorie" : "Categorie nouă"}
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
                  Imagine categorie
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-[16/9] rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-500 transition-colors cursor-pointer overflow-hidden bg-gray-50"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mb-1 sm:mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">Apasă pentru imagine</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Name & Order - 2 columns */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Nume *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                    placeholder="ex: Miez de nucă"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Ordine
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 text-sm sm:text-base"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="hidden sm:inline">Se salvează...</span>
                      <span className="sm:hidden">Salvare...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      {editingCategory ? "Salvează" : "Adaugă"}
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
