"use client";

import { useEffect } from "react";

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

export default function ProviderLocationAutosuggest() {
  useEffect(() => {
    if (window.location.pathname !== "/list-service") return;

    let requestId = 0;
    let cities: string[] = [];
    let currentState = "";

    const findFields = () => {
      const city = document.querySelector<HTMLInputElement>('input[placeholder="City"]');
      const state = Array.from(document.querySelectorAll<HTMLSelectElement>("select")).find(
        (select) => select.querySelector('option[value="AL"]') && select.querySelector('option[value="FL"]')
      );
      return { city, state };
    };

    const getBox = (city: HTMLInputElement) => {
      let box = document.getElementById("youlistify-city-suggestions-box") as HTMLDivElement | null;
      if (!box) {
        box = document.createElement("div");
        box.id = "youlistify-city-suggestions-box";
        Object.assign(box.style, {
          position: "absolute", zIndex: "99999", display: "none", background: "white",
          border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0 10px 25px rgba(0,0,0,.12)",
          maxHeight: "240px", overflowY: "auto"
        });
        document.body.appendChild(box);
      }
      const rect = city.getBoundingClientRect();
      box.style.left = `${rect.left + window.scrollX}px`;
      box.style.top = `${rect.bottom + window.scrollY + 4}px`;
      box.style.width = `${rect.width}px`;
      return box;
    };

    const showMatches = (city: HTMLInputElement) => {
      const box = getBox(city);
      const q = city.value.trim().toLowerCase();
      if (!currentState || !q) { box.style.display = "none"; return; }
      const matches = cities.filter((name) => name.toLowerCase().startsWith(q)).slice(0, 10);
      box.innerHTML = "";
      if (!matches.length) { box.style.display = "none"; return; }
      matches.forEach((name) => {
        const item = document.createElement("button");
        item.type = "button";
        item.textContent = name;
        Object.assign(item.style, {
          display: "block", width: "100%", padding: "11px 13px", border: "0",
          borderBottom: "1px solid #eee", background: "white", textAlign: "left", cursor: "pointer",
          fontSize: "16px", color: "#182033"
        });
        item.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
          setter?.call(city, name);
          city.dispatchEvent(new Event("input", { bubbles: true }));
          city.dispatchEvent(new Event("change", { bubbles: true }));
          box.style.display = "none";
        });
        box.appendChild(item);
      });
      box.style.display = "block";
    };

    const loadCities = async (stateCode: string) => {
      cities = [];
      const fips = STATE_FIPS[stateCode];
      if (!fips) return;
      const thisRequest = ++requestId;
      try {
        const params = new URLSearchParams({ get: "NAME", for: "place:*", in: `state:${fips}` });
        const response = await fetch(`https://api.census.gov/data/2020/dec/pl?${params.toString()}`);
        if (!response.ok) return;
        const rows: string[][] = await response.json();
        if (thisRequest !== requestId) return;
        cities = Array.from(new Set(rows.slice(1).map((row) => cleanPlaceName(row[0])).filter(Boolean)))
          .sort((a, b) => a.localeCompare(b));
        const { city } = findFields();
        if (city && document.activeElement === city && city.value.trim()) showMatches(city);
      } catch { cities = []; }
    };

    const apply = () => {
      const { city, state } = findFields();
      if (!city || !state) return;
      city.setAttribute("autocomplete", "off");
      state.setAttribute("autocomplete", "address-level1");

      if (state.nextElementSibling !== city) state.parentElement?.insertBefore(state, city);

      if (state.value !== currentState) {
        currentState = state.value;
        void loadCities(currentState);
      }

      if (!state.dataset.cityAutosuggestBound) {
        state.dataset.cityAutosuggestBound = "true";
        state.addEventListener("change", () => {
          currentState = state.value;
          void loadCities(currentState);
          const box = document.getElementById("youlistify-city-suggestions-box");
          if (box) box.style.display = "none";
        });
      }

      if (!city.dataset.cityAutosuggestBound) {
        city.dataset.cityAutosuggestBound = "true";
        city.addEventListener("input", () => showMatches(city));
        city.addEventListener("focus", () => showMatches(city));
        city.addEventListener("blur", () => setTimeout(() => {
          const box = document.getElementById("youlistify-city-suggestions-box");
          if (box) box.style.display = "none";
        }, 200));
      }
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", apply);
    return () => { observer.disconnect(); window.removeEventListener("resize", apply); };
  }, []);
  return null;
}
