"use client";

import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useShippingCalculation } from "@/hooks/useShippingCalculation";
import type { SimpleEcontCity } from "@/lib/econt/types";

export function AddressForm() {
  const { shipping, setShippingAddress } = useCheckoutStore();
  const { debouncedCalculate } = useShippingCalculation();
  const [cityQuery, setCityQuery] = useState(shipping.city || "");
  const [cities, setCities] = useState<SimpleEcontCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Search cities
  useEffect(() => {
    if (cityQuery.length < 2) {
      setCities([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch("/api/econt/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: cityQuery, limit: 10 }),
        });
        const data = await res.json();
        setCities(data.cities || []);
        setShowCityDropdown(true);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      } finally {
        setIsLoadingCities(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [cityQuery]);

  const handleCitySelect = (city: SimpleEcontCity) => {
    setCityQuery(city.name);
    setShippingAddress({
      city: city.name,
      postCode: city.postCode,
    });
    setShowCityDropdown(false);
    // Trigger shipping calculation after city selection
    setTimeout(() => debouncedCalculate(), 50);
  };

  // Only show if shipping method is econt_address
  if (shipping.method !== "econt_address") {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide">
        Адрес за Доставка
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* City Search */}
        <div className="relative col-span-2 sm:col-span-1">
          <label htmlFor="city-input" className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
            Град
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              id="city-input"
              type="text"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                setShippingAddress({ city: e.target.value });
              }}
              onFocus={() => cityQuery.length >= 2 && setShowCityDropdown(true)}
              placeholder="Търси град..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
            />
            {isLoadingCities && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#2D4A3E] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* City Dropdown */}
          {showCityDropdown && cities.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className="w-full px-4 py-2 text-left hover:bg-stone-50 text-sm"
                >
                  <span className="font-medium">{city.name}</span>
                  {city.region && (
                    <span className="text-stone-500 ml-1">({city.region})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Post Code */}
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="postcode-input" className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
            Пощ. код
          </label>
          <input
            id="postcode-input"
            type="text"
            value={shipping.postCode || ""}
            onChange={(e) => setShippingAddress({ postCode: e.target.value })}
            placeholder="1000"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
          />
        </div>

        {/* Street */}
        <div className="col-span-2">
          <label htmlFor="street-input" className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
            Улица / Булевард
          </label>
          <input
            id="street-input"
            type="text"
            value={shipping.street || ""}
            onChange={(e) => {
              setShippingAddress({ street: e.target.value });
              debouncedCalculate();
            }}
            placeholder="ул. Витоша 10"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
          />
        </div>

        {/* Building */}
        <div>
          <label htmlFor="building-input" className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
            Блок / Вход
          </label>
          <input
            id="building-input"
            type="text"
            value={shipping.building || ""}
            onChange={(e) => {
              setShippingAddress({ building: e.target.value });
              debouncedCalculate();
            }}
            placeholder="бл. 5, вх. А"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
          />
        </div>

        {/* Apartment */}
        <div>
          <label htmlFor="apartment-input" className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
            Апартамент
          </label>
          <input
            id="apartment-input"
            type="text"
            value={shipping.apartment || ""}
            onChange={(e) => {
              setShippingAddress({ apartment: e.target.value });
              debouncedCalculate();
            }}
            placeholder="ап. 12"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
          />
        </div>
      </div>

      {/* Address Preview */}
      {shipping.city && shipping.street && (
        <div className="p-4 bg-[#B2D8C6]/20 rounded-xl">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#2D4A3E] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#2D4A3E]">Адрес за доставка</p>
              <p className="text-sm text-stone-600 mt-0.5">
                {[
                  shipping.street,
                  shipping.building,
                  shipping.apartment,
                  shipping.city,
                  shipping.postCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
