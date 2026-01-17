// Econt Offices API - Search by city

import { NextRequest, NextResponse } from "next/server";
import { getOfficesByCityName, searchOffices, getOfficeByCode } from "@/lib/econt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityName, query, code, limit = 50 } = body;

    // Get specific office by code
    if (code) {
      const office = await getOfficeByCode(code);
      if (!office) {
        return NextResponse.json(
          { error: "Office not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ office });
    }

    // Search by city name
    if (cityName) {
      const offices = await getOfficesByCityName(cityName);
      return NextResponse.json({ offices: offices.slice(0, limit) });
    }

    // General search
    if (query) {
      const offices = await searchOffices(query, limit);
      return NextResponse.json({ offices });
    }

    return NextResponse.json(
      { error: "Provide cityName, query, or code" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Offices search error:", error);
    return NextResponse.json(
      { error: "Failed to search offices" },
      { status: 500 }
    );
  }
}
