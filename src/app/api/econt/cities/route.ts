// Econt Cities API - Search/Autocomplete

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchCities, getAllCities } from "@/lib/econt";

const citiesSchema = z.object({
  query: z.string().min(2, "Query must be at least 2 characters").max(100),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = citiesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }
    const { query, limit } = parsed.data;

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
