"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Plus, Trash2, GripVertical, Save, Loader2, Package, Star, Check, Sparkles, Eye, EyeOff } from "lucide-react";
import type { Product, ProductVariantDB, ProductIngredientDB, ProductFeatureDB, ProductHowToUseDB } from "@/lib/supabase/types";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

type TabType = "general" | "inventory" | "variants" | "ingredients" | "features" | "seo";

const tabs: { id: TabType; label: string }[] = [
  { id: "general", label: "Основни" },
  { id: "inventory", label: "Инвентар" },
  { id: "variants", label: "Варианти" },
  { id: "ingredients", label: "Съставки" },
  { id: "features", label: "Функции" },
  { id: "seo", label: "SEO" },
];

export function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const isEditing = !!product;
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and handle wheel events
  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Add wheel listener to window that forwards to content
    const handleWheel = (e: WheelEvent) => {
      if (contentRef.current) {
        e.preventDefault();
        contentRef.current.scrollTop += e.deltaY;
      }
    };

    // Use capture phase to intercept events before they reach the window
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    slug: product?.slug || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    name: product?.name || "",
    tagline: product?.tagline || "",
    description: product?.description || "",
    flavor: product?.flavor || "",
    servings: product?.servings ?? 30,
    price: product?.price || 0,
    compare_at_price: product?.compare_at_price || null,
    cost_price: product?.cost_price || null,
    image: product?.image || "",
    images: product?.images || [],
    stock: product?.stock || 100,
    low_stock_threshold: product?.low_stock_threshold || 10,
    track_inventory: product?.track_inventory ?? true,
    status: product?.status || "draft",
    badge: product?.badge || "",
    weight: product?.weight || 0.5,
    published: product?.published ?? false,
    meta_title: product?.meta_title || "",
    meta_description: product?.meta_description || "",
  });

  const [variants, setVariants] = useState<ProductVariantDB[]>(
    (product?.variants as unknown as ProductVariantDB[]) || []
  );
  const [ingredients, setIngredients] = useState<ProductIngredientDB[]>(
    (product?.ingredients as unknown as ProductIngredientDB[]) || []
  );
  const [features, setFeatures] = useState<ProductFeatureDB[]>(
    (product?.features as unknown as ProductFeatureDB[]) || []
  );
  const [howToUse, setHowToUse] = useState<ProductHowToUseDB[]>(
    (product?.how_to_use as unknown as ProductHowToUseDB[]) || []
  );
  const [variantsPreviewMode, setVariantsPreviewMode] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";

      const body = {
        ...formData,
        variants,
        ingredients,
        features,
        how_to_use: howToUse,
      };

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `variant-${Date.now()}`,
        name: "",
        description: "",
        price: formData.price,
        quantity: 1,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariantDB, value: unknown) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        symbol: "",
        name: "",
        dosage: "",
        description: "",
        color: "#B2D8C6",
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof ProductIngredientDB, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addFeature = () => {
    setFeatures([
      ...features,
      {
        icon: "star",
        icon_color: "#2D4A3E",
        title: "",
        description: "",
      },
    ]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, field: keyof ProductFeatureDB, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-xl font-bold text-[#2D4A3E]">
            {isEditing ? `Редактиране: ${product.name}` : "Нов Продукт"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex border-b border-stone-200 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#2D4A3E] text-[#2D4A3E]"
                  : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 min-h-0 p-6"
          style={{
            overflowY: 'scroll',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Име на продукта *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="Corti-Glow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="corti-glow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                  placeholder="Ритуалът за хормонален баланс"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                  Описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] resize-none"
                  placeholder="Описание на продукта..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Вкус
                  </label>
                  <input
                    type="text"
                    value={formData.flavor}
                    onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="Горска Ягода и Лайм"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Саше/Порции
                  </label>
                  <input
                    type="number"
                    value={formData.servings || ""}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Цена (EUR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="99.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Стара цена (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compare_at_price || ""}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: parseFloat(e.target.value) || null })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="119.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Наличност (бр.)
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Основна снимка URL *
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="/images/product.png"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Тегло (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0.5 })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="0.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "draft" | "archived" })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                  >
                    <option value="draft">Чернова</option>
                    <option value="active">Активен</option>
                    <option value="archived">Архивиран</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="Бестселър"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-5 h-5 rounded border-stone-300 text-[#2D4A3E] focus:ring-[#2D4A3E]"
                    />
                    <span className="text-sm font-medium text-stone-700">Публикуван</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* SKU & Barcode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    SKU (Артикулен номер)
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="CG-001"
                  />
                  <p className="text-xs text-stone-400 mt-1">Уникален код за вътрешно проследяване</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                    Баркод (EAN/UPC)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#2D4A3E]"
                    placeholder="5901234123457"
                  />
                  <p className="text-xs text-stone-400 mt-1">За сканиране с баркод четец</p>
                </div>
              </div>

              {/* Cost & Profit */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-4">
                <h3 className="font-medium text-stone-700">Себестойност и Печалба</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                      Себестойност (EUR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price || ""}
                      onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || null })}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] bg-white"
                      placeholder="25.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                      Продажна цена (EUR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      disabled
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-stone-100 text-stone-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                      Печалба
                    </label>
                    <div className="px-4 py-2.5 border border-stone-200 rounded-xl bg-white">
                      {formData.cost_price && formData.price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-600">
                            {(formData.price - formData.cost_price).toFixed(2)} EUR
                          </span>
                          <span className="text-xs text-stone-400">
                            ({((formData.price - formData.cost_price) / formData.price * 100).toFixed(0)}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-stone-400">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-stone-700">Управление на наличност</h3>
                    <p className="text-xs text-stone-400">Следете количествата автоматично</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, track_inventory: !formData.track_inventory })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      formData.track_inventory ? "bg-[#2D4A3E]" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.track_inventory ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {formData.track_inventory && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                        Текуща наличност (бр.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] bg-white"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                        Праг за нисък stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.low_stock_threshold}
                        onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 10 })}
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] bg-white"
                        placeholder="10"
                      />
                      <p className="text-xs text-stone-400 mt-1">Ще получите известие при достигане</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Status Preview */}
              {formData.track_inventory && (
                <div className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${
                    formData.stock <= 0
                      ? "bg-red-500"
                      : formData.stock <= formData.low_stock_threshold
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-stone-700">
                      {formData.stock <= 0
                        ? "Изчерпан"
                        : formData.stock <= formData.low_stock_threshold
                          ? "Ниска наличност"
                          : "На склад"}
                    </p>
                    <p className="text-xs text-stone-400">
                      {formData.stock} бр. налични
                      {formData.stock > 0 && formData.stock <= formData.low_stock_threshold &&
                        ` (под прага от ${formData.low_stock_threshold} бр.)`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Weight & Dimensions for shipping */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-4">
                <h3 className="font-medium text-stone-700">Доставка</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                      Тегло (kg)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0.5 })}
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] bg-white"
                      placeholder="0.5"
                    />
                    <p className="text-xs text-stone-400 mt-1">Използва се за изчисляване на доставка</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                      Вариант
                    </label>
                    <p className="px-4 py-2.5 text-sm text-stone-500">
                      Теглото се умножава по бройката от избрания вариант
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === "variants" && (
            <div className="space-y-4">
              {/* Header with Preview Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-stone-500">
                    Ценови пакети ({variants.length})
                  </p>
                  <button
                    onClick={() => setVariantsPreviewMode(!variantsPreviewMode)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      variantsPreviewMode
                        ? "bg-[#2D4A3E] text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {variantsPreviewMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {variantsPreviewMode ? "Preview" : "Edit"}
                  </button>
                </div>
                <button
                  onClick={addVariant}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#2D4A3E] hover:bg-[#2D4A3E]/5 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  Добави
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
                  <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 font-medium">Няма добавени варианти</p>
                  <p className="text-xs text-stone-400 mt-1 mb-4">Добавете пакети като: 1 кутия, 2 кутии, 3 кутии</p>
                  <button
                    onClick={addVariant}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-lg text-sm font-medium hover:bg-[#1a2e26] transition"
                  >
                    <Plus className="w-4 h-4" />
                    Добави първи вариант
                  </button>
                </div>
              ) : variantsPreviewMode ? (
                /* Preview Mode - Visual Cards */
                <div className="grid grid-cols-3 gap-4">
                  {variants.map((variant, index) => {
                    const savings = variant.compare_at_price
                      ? variant.compare_at_price - variant.price
                      : 0;
                    const savingsPercent = variant.compare_at_price
                      ? Math.round((savings / variant.compare_at_price) * 100)
                      : 0;
                    const totalSachets = (variant.quantity || 1) * 30;
                    const pricePerDay = variant.price / totalSachets;

                    return (
                      <div
                        key={variant.id}
                        className={`relative rounded-2xl border-2 overflow-hidden transition-all ${
                          variant.is_best_seller
                            ? "border-[#2D4A3E] shadow-lg"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        {/* Best Seller Badge */}
                        {variant.is_best_seller && (
                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#2D4A3E] to-[#3d6354] text-white text-xs font-medium py-1.5 px-3 flex items-center justify-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Най-Популярен
                          </div>
                        )}

                        <div className={`p-4 ${variant.is_best_seller ? "pt-10" : ""}`}>
                          {/* Header */}
                          <div className="mb-3">
                            <h4 className="font-bold text-stone-800">{variant.name || `Вариант ${index + 1}`}</h4>
                            <p className="text-xs text-stone-500 mt-0.5">{variant.description}</p>
                          </div>

                          {/* Box Visualization */}
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: variant.quantity || 1 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-8 h-10 rounded-md flex items-center justify-center ${
                                  variant.is_best_seller
                                    ? "bg-[#2D4A3E]/10 border border-[#2D4A3E]/20"
                                    : "bg-stone-100 border border-stone-200"
                                }`}
                              >
                                <Package className={`w-4 h-4 ${
                                  variant.is_best_seller ? "text-[#2D4A3E]" : "text-stone-400"
                                }`} />
                              </div>
                            ))}
                            <span className="text-xs text-stone-400 ml-2">
                              {variant.quantity}x кутия
                            </span>
                          </div>

                          {/* Price */}
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-[#2D4A3E]">
                                {variant.price?.toFixed(2)} лв
                              </span>
                              {variant.compare_at_price && (
                                <span className="text-sm text-stone-400 line-through">
                                  {variant.compare_at_price.toFixed(2)} лв
                                </span>
                              )}
                            </div>
                            {savings > 0 && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <Star className="w-3 h-3" />
                                Спестяваш {savings.toFixed(0)} лв (-{savingsPercent}%)
                              </div>
                            )}
                          </div>

                          {/* Price Per Day */}
                          <div className="mt-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200/50">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-amber-700">На ден:</span>
                              <span className="text-sm font-bold text-amber-800">
                                {pricePerDay.toFixed(2)} лв/саше
                              </span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-stone-600">
                              <Check className="w-3.5 h-3.5 text-green-500" />
                              {(variant.quantity || 1) * 30} саше
                            </div>
                            {(variant.quantity || 1) >= 2 && (
                              <div className="flex items-center gap-2 text-xs text-stone-600">
                                <Check className="w-3.5 h-3.5 text-green-500" />
                                Безплатна доставка
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-stone-600">
                              <Check className="w-3.5 h-3.5 text-green-500" />
                              14-дневна гаранция
                            </div>
                          </div>
                        </div>

                        {/* Edit Button Overlay */}
                        <button
                          onClick={() => setVariantsPreviewMode(false)}
                          className="absolute bottom-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm border border-stone-200 transition"
                        >
                          <GripVertical className="w-4 h-4 text-stone-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Edit Mode - Form Fields */
                <div className="space-y-4">
                  {variants.map((variant, index) => {
                    const savings = variant.compare_at_price
                      ? variant.compare_at_price - variant.price
                      : 0;
                    const totalSachets = (variant.quantity || 1) * 30;
                    const pricePerDay = variant.price / totalSachets;

                    return (
                      <div
                        key={variant.id}
                        className={`rounded-xl border-2 overflow-hidden ${
                          variant.is_best_seller
                            ? "border-[#2D4A3E]/30 bg-[#2D4A3E]/5"
                            : "border-stone-200 bg-white"
                        }`}
                      >
                        {/* Header */}
                        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${
                          variant.is_best_seller
                            ? "bg-[#2D4A3E]/10 border-[#2D4A3E]/20"
                            : "bg-stone-50 border-stone-100"
                        }`}>
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-stone-400 cursor-move" />
                            <div className="flex items-center gap-2">
                              {/* Mini Box Preview */}
                              <div className="flex -space-x-1">
                                {Array.from({ length: Math.min(variant.quantity || 1, 3) }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-5 h-6 rounded border flex items-center justify-center ${
                                      variant.is_best_seller
                                        ? "bg-[#2D4A3E]/20 border-[#2D4A3E]/30"
                                        : "bg-stone-100 border-stone-200"
                                    }`}
                                  >
                                    <Package className="w-2.5 h-2.5 text-stone-500" />
                                  </div>
                                ))}
                              </div>
                              <span className="text-sm font-semibold text-stone-700">
                                {variant.name || `Вариант ${index + 1}`}
                              </span>
                              {variant.is_best_seller && (
                                <span className="px-2 py-0.5 bg-[#2D4A3E] text-white text-xs rounded-full font-medium flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Бестселър
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Price per day badge */}
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                              {pricePerDay.toFixed(2)} лв/ден
                            </span>
                            {savings > 0 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                -{savings.toFixed(0)} лв
                              </span>
                            )}
                            <button
                              onClick={() => removeVariant(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-stone-500 mb-1">Име</label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => updateVariant(index, "name", e.target.value)}
                                placeholder="напр. Glow Пакет"
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-stone-500 mb-1">Описание</label>
                              <input
                                type="text"
                                value={variant.description}
                                onChange={(e) => updateVariant(index, "description", e.target.value)}
                                placeholder="напр. За 2 месеца"
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-stone-500 mb-1">Цена (EUR)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-stone-500 mb-1">Стара цена</label>
                              <input
                                type="number"
                                step="0.01"
                                value={variant.compare_at_price || ""}
                                onChange={(e) => updateVariant(index, "compare_at_price", parseFloat(e.target.value) || undefined)}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-stone-500 mb-1">Бройка кутии</label>
                              <input
                                type="number"
                                min="1"
                                value={variant.quantity}
                                onChange={(e) => updateVariant(index, "quantity", parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-stone-500 mb-1">Тип</label>
                              <button
                                type="button"
                                onClick={() => updateVariant(index, "is_best_seller", !variant.is_best_seller)}
                                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                                  variant.is_best_seller
                                    ? "bg-[#2D4A3E] text-white"
                                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                }`}
                              >
                                <Star className="w-3.5 h-3.5" />
                                {variant.is_best_seller ? "Бестселър" : "Обикновен"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Ingredients Tab */}
          {activeTab === "ingredients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  Добавете съставките на продукта
                </p>
                <button
                  onClick={addIngredient}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#2D4A3E] hover:bg-[#2D4A3E]/5 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  Добави съставка
                </button>
              </div>

              {ingredients.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  Няма добавени съставки
                </div>
              ) : (
                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="p-4 border border-stone-200 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: ingredient.color || "#B2D8C6" }}
                          >
                            {ingredient.symbol || "?"}
                          </div>
                          <span className="text-sm font-medium text-stone-700">
                            {ingredient.name || `Съставка ${index + 1}`}
                          </span>
                        </div>
                        <button
                          onClick={() => removeIngredient(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={ingredient.symbol}
                          onChange={(e) => updateIngredient(index, "symbol", e.target.value)}
                          placeholder="Символ (Mg)"
                          className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                        />
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, "name", e.target.value)}
                          placeholder="Име"
                          className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                        />
                        <input
                          type="text"
                          value={ingredient.dosage}
                          onChange={(e) => updateIngredient(index, "dosage", e.target.value)}
                          placeholder="Дозировка (300mg)"
                          className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                        />
                        <input
                          type="color"
                          value={ingredient.color}
                          onChange={(e) => updateIngredient(index, "color", e.target.value)}
                          className="w-full h-10 border border-stone-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      <textarea
                        value={ingredient.description}
                        onChange={(e) => updateIngredient(index, "description", e.target.value)}
                        placeholder="Описание на съставката..."
                        rows={2}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E] resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  Добавете основните предимства на продукта
                </p>
                <button
                  onClick={addFeature}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#2D4A3E] hover:bg-[#2D4A3E]/5 rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                  Добави функция
                </button>
              </div>

              {features.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  Няма добавени функции
                </div>
              ) : (
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="p-4 border border-stone-200 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-stone-700">
                          Функция {index + 1}
                        </span>
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, "icon", e.target.value)}
                          placeholder="Икона (droplets)"
                          className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                        />
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, "title", e.target.value)}
                          placeholder="Заглавие"
                          className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                        />
                        <input
                          type="color"
                          value={feature.icon_color}
                          onChange={(e) => updateFeature(index, "icon_color", e.target.value)}
                          className="w-full h-10 border border-stone-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      <textarea
                        value={feature.description}
                        onChange={(e) => updateFeature(index, "description", e.target.value)}
                        placeholder="Описание..."
                        rows={2}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E] resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                  placeholder="Corti-Glow | Хормонален Баланс за Жени | LuraLab"
                />
                <p className="text-xs text-stone-400 mt-1">
                  {(formData.meta_title || "").length}/60 символа
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] resize-none"
                  placeholder="Описание за търсачки..."
                />
                <p className="text-xs text-stone-400 mt-1">
                  {(formData.meta_description || "").length}/160 символа
                </p>
              </div>

              {/* SEO Preview */}
              <div className="p-4 bg-stone-50 rounded-xl">
                <p className="text-xs text-stone-400 uppercase font-medium mb-2">Google Preview</p>
                <div className="space-y-1">
                  <p className="text-[#1a0dab] text-lg font-medium truncate">
                    {formData.meta_title || formData.name || "Заглавие на страницата"}
                  </p>
                  <p className="text-[#006621] text-sm truncate">
                    luralab.eu/produkt/{formData.slug || "slug"}
                  </p>
                  <p className="text-[#545454] text-sm line-clamp-2">
                    {formData.meta_description || formData.description || "Описание на страницата..."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition"
          >
            Отказ
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1a2e26] transition disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Запазване...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Запази
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
