// Econt Cities API - Search/Autocomplete

import { NextRequest, NextResponse } from "next/server";
import { searchCities, getAllCities } from "@/lib/econt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10 } = body;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    const cities = await searchCities(query, limit);
    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Cities search error:", error);
    return NextResponse.json(
      { error: "Failed to search cities" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cities = await getAllCities();
    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Cities fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
