// Econt Offices Service

import { getEcontClient } from "./client";
import type { EcontOffice, SimpleEcontOffice } from "./types";

interface OfficesResponse {
  offices: EcontOffice[];
}

// Transform Econt office to simplified format
function transformOffice(office: EcontOffice): SimpleEcontOffice {
  return {
    id: office.id,
    code: office.code,
    name: office.name,
    cityId: office.address?.city?.id || 0,
    cityName: office.address?.city?.name || "",
    address: office.address?.fullAddress || "",
    phone: office.phone || "",
    workTime: office.workTime || "",
    latitude: office.address?.location?.latitude,
    longitude: office.address?.location?.longitude,
  };
}

// Get all offices (cached in DB recommended)
export async function getAllOffices(): Promise<SimpleEcontOffice[]> {
  const client = getEcontClient();
  const response = await client.getNomenclatures<OfficesResponse>("offices", {
    countryCode: "BGR",
  });

  if (response.error || !response.data) {
    console.error("Failed to get offices:", response.error);
    return [];
  }

  return response.data.offices.map(transformOffice);
}

// Get offices by city ID
export async function getOfficesByCity(
  cityId: number
): Promise<SimpleEcontOffice[]> {
  const allOffices = await getAllOffices();
  return allOffices.filter((office) => office.cityId === cityId);
}

// Get offices by city name (fuzzy match)
export async function getOfficesByCityName(
  cityName: string
): Promise<SimpleEcontOffice[]> {
  const allOffices = await getAllOffices();
  const normalizedSearch = cityName.toLowerCase().trim();

  return allOffices.filter((office) =>
    office.cityName.toLowerCase().includes(normalizedSearch)
  );
}

// Search offices by query (name, address, city)
export async function searchOffices(
  query: string,
  limit = 20
): Promise<SimpleEcontOffice[]> {
  const allOffices = await getAllOffices();
  const normalizedQuery = query.toLowerCase().trim();

  const filtered = allOffices.filter(
    (office) =>
      office.name.toLowerCase().includes(normalizedQuery) ||
      office.address.toLowerCase().includes(normalizedQuery) ||
      office.cityName.toLowerCase().includes(normalizedQuery)
  );

  return filtered.slice(0, limit);
}

// Get single office by code
export async function getOfficeByCode(
  code: string
): Promise<SimpleEcontOffice | null> {
  const allOffices = await getAllOffices();
  return allOffices.find((office) => office.code === code) || null;
}
