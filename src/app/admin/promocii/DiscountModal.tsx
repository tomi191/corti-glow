"use client";

import { useState } from "react";
import { X, Save, Loader2, Percent, DollarSign } from "lucide-react";
import type { Discount, DiscountType, DiscountAppliesTo } from "@/lib/supabase/types";

interface DiscountModalProps {
  discount: Discount | null;
  onClose: () => void;
  onSave: () => void;
}

export function DiscountModal({ discount, onClose, onSave }: DiscountModalProps) {
  const isEditing = !!discount;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: discount?.code || "",
    type: (discount?.type || "percentage") as DiscountType,
    value: discount?.value || 10,
    min_order_value: discount?.min_order_value || null,
    max_uses: discount?.max_uses || null,
    start_date: discount?.start_date ? discount.start_date.split("T")[0] : "",
    end_date: discount?.end_date ? discount.end_date.split("T")[0] : "",
    active: discount?.active ?? true,
    applies_to: (discount?.applies_to || "all") as DiscountAppliesTo,
  });

  const handleSave = async () => {
    if (!formData.code.trim()) {
      setError("Моля, въведете код");
      return;
    }
    if (formData.value <= 0) {
      setError("Стойността трябва да е по-голяма от 0");
      return;
    }
    if (formData.type === "percentage" && formData.value > 100) {
      setError("Процентната отстъпка не може да надвишава 100%");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/discounts/${discount.id}`
        : "/api/admin/discounts";

      const body = {
        ...formData,
        code: formData.code.toUpperCase(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save discount");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h2 className="text-xl font-bold text-[#2D4A3E]">
            {isEditing ? `Редактиране: ${discount.code}` : "Нов Промо Код"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Code */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
              Промо Код *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-[#2D4A3E]"
              placeholder="WELCOME10"
            />
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                Тип отстъпка *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "percentage" })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition ${
                    formData.type === "percentage"
                      ? "border-[#2D4A3E] bg-[#2D4A3E]/5 text-[#2D4A3E]"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "fixed" })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 transition ${
                    formData.type === "fixed"
                      ? "border-[#2D4A3E] bg-[#2D4A3E]/5 text-[#2D4A3E]"
                      : "border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  EUR
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                Стойност *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={formData.type === "percentage" ? "1" : "0.01"}
                  min="0"
                  max={formData.type === "percentage" ? "100" : undefined}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                  placeholder={formData.type === "percentage" ? "10" : "5.00"}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                  {formData.type === "percentage" ? "%" : "EUR"}
                </span>
              </div>
            </div>
          </div>

          {/* Min Order Value */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
              Минимална поръчка (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.min_order_value || ""}
              onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) || null })}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
              placeholder="50.00"
            />
            <p className="text-xs text-stone-400 mt-1">Оставете празно за без минимум</p>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
              Максимален брой използвания
            </label>
            <input
              type="number"
              min="0"
              value={formData.max_uses || ""}
              onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || null })}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
              placeholder="100"
            />
            <p className="text-xs text-stone-400 mt-1">Оставете празно за неограничено</p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                Начална дата
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">
                Крайна дата
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div>
              <p className="font-medium text-stone-700">Активен</p>
              <p className="text-xs text-stone-400">Кодът може да се използва от клиенти</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, active: !formData.active })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                formData.active ? "bg-[#2D4A3E]" : "bg-stone-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.active ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-200">
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
