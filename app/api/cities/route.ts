import { NextRequest, NextResponse } from "next/server";

const STATE_FIPS: Record<string, string> = {
  AL:"01", AK:"02", AZ:"04", AR:"05", CA:"06", CO:"08", CT:"09", DE:"10", DC:"11",
  FL:"12", GA:"13", HI:"15", ID:"16", IL:"17", IN:"18", IA:"19", KS:"20", KY:"21",
  LA:"22", ME:"23", MD:"24", MA:"25", MI:"26", MN:"27", MS:"28", MO:"29", MT:"30",
  NE:"31", NV:"32", NH:"33", NJ:"34", NM:"35", NY:"36", NC:"37", ND:"38", OH:"39",
  OK:"40", OR:"41", PA:"42", RI:"44", SC:"45", SD:"46", TN:"47", TX:"48", UT:"49",
  VT:"50", VA:"51", WA:"53", WV:"54", WI:"55", WY:"56"
};

const STATE_NAMES: Record<string, string> = {
  Alabama:"AL", Alaska:"AK", Arizona:"AZ", Arkansas:"AR", California:"CA", Colorado:"CO",
  Connecticut:"CT", Delaware:"DE", Florida:"FL", Georgia:"GA", Hawaii:"HI", Idaho:"ID",
  Illinois:"IL", Indiana:"IN", Iowa:"IA", Kansas:"KS", Kentucky:"KY", Louisiana:"LA",
  Maine:"ME", Maryland:"MD", Massachusetts:"MA", Michigan:"MI", Minnesota:"MN",
  Mississippi:"MS", Missouri:"MO", Montana:"MT", Nebraska:"NE", Nevada:"NV",
  "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY",
  "North Carolina":"NC", "North Dakota":"ND", Ohio:"OH", Oklahoma:"OK", Oregon:"OR",
  Pennsylvania:"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD",
  Tennessee:"TN", Texas:"TX", Utah:"UT", Vermont:"VT", Virginia:"VA", Washington:"WA",
  "West Virginia":"WV", Wisconsin:"WI", Wyoming:"WY", "District of Columbia":"DC"
};

function cleanPlaceName(value: string) {
  return value.split(",")[0].trim()
    .replace(/\s+(city|town|village|borough|CDP|municipality)$/i, "")
    .replace(/\s+metropolitan government \(balance\)$/i, "")
    .trim();
}

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim();
  const state = (request.nextUrl.searchParams.get("state") || "").toUpperCase();

  try {
    if (query) {
      if (query.length < 2) return NextResponse.json({ locations: [] });

      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
      url.searchParams.set("name", query);
      url.searchParams.set("count", "25");
      url.searchParams.set("language", "en");
      url.searchParams.set("format", "json");
      url.searchParams.set("countryCode", "US");

      const response = await fetch(url.toString(), { next: { revalidate: 86400 } });
      if (!response.ok) throw new Error(`Geocoding request failed: ${response.status}`);

      const data = await response.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      const seen = new Set<string>();
      const locations: Array<{ city: string; state: string }> = [];

      for (const result of results) {
        if (result?.country_code !== "US") continue;
        const city = typeof result?.name === "string" ? result.name.trim() : "";
        const stateCode = STATE_NAMES[result?.admin1] || "";
        if (!city || !stateCode) continue;

        const key = `${city.toLowerCase()}|${stateCode}`;
        if (seen.has(key)) continue;
        seen.add(key);
        locations.push({ city, state: stateCode });
      }

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
