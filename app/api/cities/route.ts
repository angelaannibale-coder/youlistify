import { NextRequest, NextResponse } from "next/server";

const STATE_FIPS: Record<string, string> = {
  AL:"01", AK:"02", AZ:"04", AR:"05", CA:"06", CO:"08", CT:"09", DE:"10", DC:"11",
  FL:"12", GA:"13", HI:"15", ID:"16", IL:"17", IN:"18", IA:"19", KS:"20", KY:"21",
  LA:"22", ME:"23", MD:"24", MA:"25", MI:"26", MN:"27", MS:"28", MO:"29", MT:"30",
  NE:"31", NV:"32", NH:"33", NJ:"34", NM:"35", NY:"36", NC:"37", ND:"38", OH:"39",
  OK:"40", OR:"41", PA:"42", RI:"44", SC:"45", SD:"46", TN:"47", TX:"48", UT:"49",
  VT:"50", VA:"51", WA:"53", WV:"54", WI:"55", WY:"56"
};

function cleanPlaceName(value: string) {
  return value.split(",")[0].trim()
    .replace(/\s+(city|town|village|borough|CDP|municipality)$/i, "")
    .replace(/\s+metropolitan government \(balance\)$/i, "")
    .trim();
}

export async function GET(request: NextRequest) {
  const state = (request.nextUrl.searchParams.get("state") || "").toUpperCase();
  const fips = STATE_FIPS[state];
  if (!fips) return NextResponse.json({ cities: [] });

  try {
    const url = `https://api.census.gov/data/2020/dec/pl?get=NAME&for=place:*&in=state:${fips}`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`Census request failed: ${response.status}`);
    const rows: string[][] = await response.json();
    const cities = Array.from(new Set(rows.slice(1).map((row) => cleanPlaceName(row[0])).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [] }, { status: 200 });
  }
}
