// Econt Cities Service

import { getEcontClient } from "./client";
import type { EcontCity, SimpleEcontCity } from "./types";

interface CitiesResponse {
  cities: EcontCity[];
}

// Transform Econt city to simplified format
function transformCity(city: EcontCity): SimpleEcontCity {
  return {
    id: city.id,
    name: city.name,
    region: city.regionName || "",
    postCode: city.postCode || "",
  };
}

// Get all cities (cached in DB recommended)
export async function getAllCities(): Promise<SimpleEcontCity[]> {
  const client = getEcontClient();
  const response = await client.getNomenclatures<CitiesResponse>("cities", {
    countryCode: "BGR",
  });

  if (response.error || !response.data) {
    console.error("Failed to get cities:", response.error);
    return [];
  }

  return response.data.cities.map(transformCity);
}

// Search cities by name (autocomplete)
export async function searchCities(
  query: string,
  limit = 10
): Promise<SimpleEcontCity[]> {
  const allCities = await getAllCities();
  const normalizedQuery = query.toLowerCase().trim();

  // Prioritize exact matches and starts-with matches
  const exactMatches: SimpleEcontCity[] = [];
  const startsWithMatches: SimpleEcontCity[] = [];
  const containsMatches: SimpleEcontCity[] = [];

  for (const city of allCities) {
    const normalizedName = city.name.toLowerCase();

    if (normalizedName === normalizedQuery) {
      exactMatches.push(city);
    } else if (normalizedName.startsWith(normalizedQuery)) {
      startsWithMatches.push(city);
    } else if (normalizedName.includes(normalizedQuery)) {
      containsMatches.push(city);
    }
  }

  const results = [...exactMatches, ...startsWithMatches, ...containsMatches];
  return results.slice(0, limit);
}

// Get city by ID
export async function getCityById(id: number): Promise<SimpleEcontCity | null> {
  const allCities = await getAllCities();
  return allCities.find((city) => city.id === id) || null;
}

// Get city by name (exact match)
export async function getCityByName(
  name: string
): Promise<SimpleEcontCity | null> {
  const allCities = await getAllCities();
  const normalizedName = name.toLowerCase().trim();
  return (
    allCities.find((city) => city.name.toLowerCase() === normalizedName) || null
  );
}

// Get cities with express delivery (faster delivery options)
export async function getExpressCities(): Promise<SimpleEcontCity[]> {
  const client = getEcontClient();
  const response = await client.getNomenclatures<CitiesResponse>("cities", {
    countryCode: "BGR",
  });

  if (response.error || !response.data) {
    return [];
  }

  return response.data.cities
    .filter((city) => city.expressCityDeliveries)
    .map(transformCity);
}
