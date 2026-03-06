// Econt Offices API - Search by city

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOfficesByCityName, searchOffices, getOfficeByCode, getNearestOffices } from "@/lib/econt";

const officesSchema = z.object({
  cityName: z.string().max(100).optional(),
  query: z.string().max(100).optional(),
  code: z.string().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  limit: z.number().int().min(1).max(100).optional().default(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = officesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { cityName, query, code, latitude, longitude, limit } = parsed.data;

    // Get nearest offices by coordinates
    if (typeof latitude === "number" && typeof longitude === "number") {
      const offices = await getNearestOffices(latitude, longitude, limit);
      return NextResponse.json({ offices });
    }

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
