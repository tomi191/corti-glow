import { Settings, AlertCircle, Truck, Store } from "lucide-react";
import { SHIPPING_THRESHOLD, COMPANY } from "@/lib/constants";

export default function SettingsPage() {
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
              <Store className="w-5 h-5" />
              Общи Настройки
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-stone-500">Име на Магазина</span>
              <span className="text-sm font-medium text-stone-800">{COMPANY.name}</span>
            </div>
            <div className="border-t border-stone-100" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-stone-500">Имейл за Контакт</span>
              <span className="text-sm font-medium text-stone-800">{COMPANY.email}</span>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-[#2D4A3E] flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Доставка
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-stone-500">Цена до Офис на Еконт</span>
              <span className="text-sm font-medium text-stone-800">4.99 лв</span>
            </div>
            <div className="border-t border-stone-100" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-stone-500">Цена до Адрес</span>
              <span className="text-sm font-medium text-stone-800">6.99 лв</span>
            </div>
            <div className="border-t border-stone-100" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-stone-500">Безплатна доставка над</span>
              <span className="text-sm font-medium text-[#2D4A3E]">{SHIPPING_THRESHOLD} лв</span>
            </div>
          </div>
        </div>

        {/* Integration Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-[#2D4A3E] flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Интеграции
            </h2>
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Промяна на настройки
              </p>
              <p className="text-xs text-blue-700 mt-1">
                За промяна на цени за доставка или други настройки, редактирайте файловете <code className="bg-blue-100 px-1 rounded">src/lib/constants.ts</code> и <code className="bg-blue-100 px-1 rounded">.env.local</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
