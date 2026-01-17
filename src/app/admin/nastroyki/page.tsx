"use client";

import { useState } from "react";
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2D4A3E]">Настройки</h1>
        <p className="text-stone-500 text-sm mt-1">
          Конфигурация на магазина
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-[#2D4A3E] flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Общи Настройки
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                Име на Магазина
              </label>
              <input
                type="text"
                defaultValue="LuraLab"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                Имейл за Контакт
              </label>
              <input
                type="email"
                defaultValue="orders@luralab.eu"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
              />
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-[#2D4A3E]">Доставка</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                  Цена до Офис (EUR)
                </label>
                <input
                  type="number"
                  defaultValue="4.99"
                  step="0.01"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                  Цена до Адрес (EUR)
                </label>
                <input
                  type="number"
                  defaultValue="6.99"
                  step="0.01"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                Безплатна Доставка над (EUR)
              </label>
              <input
                type="number"
                defaultValue="80"
                step="1"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
              />
            </div>
          </div>
        </div>

        {/* Integration Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-[#2D4A3E]">Интеграции</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-purple-600">S</span>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Stripe</p>
                  <p className="text-xs text-stone-500">Плащания с карта</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Конфигуриран
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-blue-600">E</span>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Econt</p>
                  <p className="text-xs text-stone-500">Доставка</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Конфигуриран
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-green-600">S</span>
                </div>
                <div>
                  <p className="font-medium text-stone-800">Supabase</p>
                  <p className="text-xs text-stone-500">База данни</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Конфигуриран
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                Демо Режим
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Настройките са за демо цели. За production, конфигурирайте .env.local файла с реални credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#2D4A3E] text-white rounded-xl font-semibold hover:bg-[#1f352c] transition"
        >
          {saved ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Запазено
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Запази Настройките
            </>
          )}
        </button>
      </div>
    </div>
  );
}
