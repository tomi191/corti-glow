"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Clock, Phone, CheckCircle, ChevronDown } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useShippingCalculation } from "@/hooks/useShippingCalculation";
import type { SimpleEcontCity, SimpleEcontOffice } from "@/lib/econt/types";

export function EcontOfficeSelector() {
  const { shipping, setSelectedOffice } = useCheckoutStore();
  const { debouncedCalculate } = useShippingCalculation();
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<SimpleEcontCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<SimpleEcontCity | null>(null);
  const [offices, setOffices] = useState<SimpleEcontOffice[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

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

  // Load offices when city is selected
  useEffect(() => {
    if (!selectedCity) {
      setOffices([]);
      return;
    }

    const loadOffices = async () => {
      setIsLoadingOffices(true);
      try {
        const res = await fetch("/api/econt/offices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cityName: selectedCity.name }),
        });
        const data = await res.json();
        setOffices(data.offices || []);
      } catch (error) {
        console.error("Failed to fetch offices:", error);
      } finally {
        setIsLoadingOffices(false);
      }
    };

    loadOffices();
  }, [selectedCity]);

  const handleCitySelect = (city: SimpleEcontCity) => {
    setSelectedCity(city);
    setCityQuery(city.name);
    setShowCityDropdown(false);
    setSelectedOffice(undefined);
  };

  const handleOfficeSelect = (office: SimpleEcontOffice) => {
    setSelectedOffice(office);
    // Trigger shipping calculation after state updates
    setTimeout(() => debouncedCalculate(), 50);
  };

  // Only show if shipping method is econt_office
  if (shipping.method !== "econt_office") {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide">
        Избери Офис на Еконт
      </h3>

      {/* City Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            ref={cityInputRef}
            type="text"
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              setSelectedCity(null);
            }}
            onFocus={() => cityQuery.length >= 2 && setShowCityDropdown(true)}
            placeholder="Търси град..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
          />
          {isLoadingCities && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[#2D4A3E] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* City Dropdown */}
        {showCityDropdown && cities.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleCitySelect(city)}
                className="w-full px-4 py-3 text-left hover:bg-stone-50 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium text-stone-800">{city.name}</span>
                  {city.region && (
                    <span className="text-xs text-stone-500 ml-2">{city.region}</span>
                  )}
                </div>
                {city.postCode && (
                  <span className="text-xs text-stone-400">{city.postCode}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected City Badge */}
      {selectedCity && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#2D4A3E]/5 rounded-lg text-sm">
          <MapPin className="w-4 h-4 text-[#2D4A3E]" />
          <span className="text-[#2D4A3E] font-medium">{selectedCity.name}</span>
          {selectedCity.region && (
            <span className="text-stone-500">({selectedCity.region})</span>
          )}
        </div>
      )}

      {/* Offices List */}
      {selectedCity && (
        <div className="space-y-2">
          {isLoadingOffices ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#2D4A3E] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : offices.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">
              Няма намерени офиси в този град
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {offices.map((office) => {
                const isSelected = shipping.selectedOffice?.id === office.id;

                return (
                  <button
                    key={office.id}
                    type="button"
                    onClick={() => handleOfficeSelect(office)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected
                        ? "border-[#2D4A3E] bg-[#2D4A3E]/5"
                        : "border-stone-200 hover:border-stone-300"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${isSelected ? "text-[#2D4A3E]" : "text-stone-800"}`}>
                            {office.name}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-[#2D4A3E] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-1 truncate">
                          {office.address}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                          {office.workTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {office.workTime}
                            </span>
                          )}
                          {office.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {office.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Office Summary */}
      {shipping.selectedOffice && (
        <div className="p-4 bg-[#B2D8C6]/20 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#2D4A3E] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-[#2D4A3E]">
                {shipping.selectedOffice.name}
              </p>
              <p className="text-sm text-stone-600 mt-0.5">
                {shipping.selectedOffice.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
