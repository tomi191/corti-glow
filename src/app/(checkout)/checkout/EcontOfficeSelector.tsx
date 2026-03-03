"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Clock, Phone, CheckCircle, ChevronDown, Package, Navigation } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useShippingCalculation } from "@/hooks/useShippingCalculation";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { SimpleEcontCity, SimpleEcontOffice } from "@/lib/econt/types";

export function EcontOfficeSelector() {
  const { shipping, setSelectedOffice } = useCheckoutStore();
  const { debouncedCalculate } = useShippingCalculation();
  const geo = useGeolocation();
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<SimpleEcontCity[]>([]);
  const [selectedCity, setSelectedCity] = useState<SimpleEcontCity | null>(null);
  const [offices, setOffices] = useState<SimpleEcontOffice[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingOffices, setIsLoadingOffices] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const nearbyAbortRef = useRef<AbortController | null>(null);

  // Fetch nearest offices when geolocation completes
  useEffect(() => {
    if (!geo.latitude || !geo.longitude) return;

    // Cancel any in-flight nearby fetch before starting a new one
    nearbyAbortRef.current?.abort();
    nearbyAbortRef.current = new AbortController();
    const signal = nearbyAbortRef.current.signal;

    const fetchNearby = async () => {
      setIsLoadingOffices(true);
      setNearbyMode(true);
      try {
        const res = await fetch("/api/econt/offices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: geo.latitude, longitude: geo.longitude, limit: 10 }),
          signal,
        });
        const data = await res.json();
        const nearbyOffices = data.offices || [];
        setOffices(nearbyOffices);
        // Auto-select city from the nearest office
        if (nearbyOffices.length > 0) {
          const nearest = nearbyOffices[0];
          setCityQuery(nearest.cityName);
          setSelectedCity({ id: nearest.cityId, name: nearest.cityName, region: "", postCode: "" });
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return; // User typed — silently cancel
        console.error("Failed to fetch nearby offices:", error);
        setNearbyMode(false);
      } finally {
        if (!signal.aborted) setIsLoadingOffices(false);
      }
    };

    fetchNearby();
  }, [geo.latitude, geo.longitude]);

  const handleFindNearest = useCallback(() => {
    setSelectedOffice(undefined);
    geo.requestLocation();
  }, [geo, setSelectedOffice]);

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

  // Load offices when city is selected (skip if nearby mode already loaded them)
  useEffect(() => {
    if (!selectedCity || nearbyMode) {
      if (!selectedCity) setOffices([]);
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
  }, [selectedCity, nearbyMode]);

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
        Избери Офис или Еконтомат
      </h3>

      {/* City Search + Nearby Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            ref={cityInputRef}
            type="text"
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              setSelectedCity(null);
              setNearbyMode(false);
              setOffices([]); // Clear stale nearby results
              nearbyAbortRef.current?.abort(); // Cancel in-flight nearby fetch
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

        {/* Geolocation Button */}
        <button
          type="button"
          onClick={handleFindNearest}
          disabled={geo.isLoading}
          className="flex-shrink-0 px-3 py-3 border border-[#2D4A3E] text-[#2D4A3E] rounded-xl text-sm font-medium hover:bg-[#2D4A3E]/5 transition-colors disabled:opacity-50"
          title="Намери най-близкия офис"
        >
          {geo.isLoading ? (
            <div className="w-5 h-5 border-2 border-[#2D4A3E] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Geolocation Error */}
      {geo.error && (
        <p className="text-xs text-red-500">{geo.error}</p>
      )}

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
                          {office.isAPS && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded">
                              <Package className="w-2.5 h-2.5" />
                              24/7
                            </span>
                          )}
                          {nearbyMode && office.distance != null && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-semibold rounded">
                              <Navigation className="w-2.5 h-2.5" />
                              ~{office.distance} км
                            </span>
                          )}
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
              {shipping.selectedOffice.workTime && (
                <p className="flex items-center gap-1 text-xs text-stone-500 mt-1.5">
                  <Clock className="w-3 h-3" />
                  {shipping.selectedOffice.workTime}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
