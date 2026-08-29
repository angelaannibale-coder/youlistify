import { NextRequest, NextResponse } from "next/server";

const STATE_FIPS: Record<string, string> = {
  AL:"01", AK:"02", AZ:"04", AR:"05", CA:"06", CO:"08", CT:"09", DE:"10", DC:"11",
  FL:"12", GA:"13", HI:"15", ID:"16", IL:"17", IN:"18", IA:"19", KS:"20", KY:"21",
  LA:"22", ME:"23", MD:"24", MA:"25", MI:"26", MN:"27", MS:"28", MO:"29", MT:"30",
  NE:"31", NV:"32", NH:"33", NJ:"34", NM:"35", NY:"36", NC:"37", ND:"38", OH:"39",
  OK:"40", OR:"41", PA:"42", RI:"44", SC:"45", SD:"46", TN:"47", TX:"48", UT:"49",
  VT:"50", VA:"51", WA:"53", WV:"54", WI:"55", WY:"56"
};

const FIPS_STATE = Object.fromEntries(Object.entries(STATE_FIPS).map(([state, fips]) => [fips, state]));

function cleanPlaceName(value: string) {
  return value.split(",")[0].trim()
    .replace(/\s+(city|town|village|borough|CDP|municipality)$/i, "")
    .replace(/\s+metropolitan government \(balance\)$/i, "")
    .trim();
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const state = (request.nextUrl.searchParams.get("state") || "").toUpperCase();

  try {
    if (query) {
      if (query.length < 2) return NextResponse.json({ locations: [] });

      const url = "https://api.census.gov/data/2020/dec/pl?get=NAME&for=place:*&in=state:*";
      const response = await fetch(url, { next: { revalidate: 604800 } });
      if (!response.ok) throw new Error(`Census request failed: ${response.status}`);

      const rows: string[][] = await response.json();
      const seen = new Set<string>();
      const locations: Array<{ city: string; state: string }> = [];

      for (const row of rows.slice(1)) {
        const city = cleanPlaceName(row[0]);
        const stateCode = FIPS_STATE[row[1]] || "";
        if (!city || !stateCode || !city.toLowerCase().includes(query)) continue;

        const key = `${city.toLowerCase()}|${stateCode}`;
        if (seen.has(key)) continue;
        seen.add(key);
        locations.push({ city, state: stateCode });
      }

      locations.sort((a, b) => {
        const aStarts = a.city.toLowerCase().startsWith(query) ? 0 : 1;
        const bStarts = b.city.toLowerCase().startsWith(query) ? 0 : 1;
        return aStarts - bStarts || a.city.localeCompare(b.city) || a.state.localeCompare(b.state);
      });

      return NextResponse.json({ locations: locations.slice(0, 12) });
    }

    const fips = STATE_FIPS[state];
    if (!fips) return NextResponse.json({ cities: [] });

    const url = `https://api.census.gov/data/2020/dec/pl?get=NAME&for=place:*&in=state:${fips}`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`Census request failed: ${response.status}`);
    const rows: string[][] = await response.json();
    const cities = Array.from(new Set(rows.slice(1).map((row) => cleanPlaceName(row[0])).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));
    return NextResponse.json({ cities });
  } catch {
    return query
      ? NextResponse.json({ locations: [] }, { status: 200 })
      : NextResponse.json({ cities: [] }, { status: 200 });
  }
}
