"use client";

import { useEffect } from "react";

export default function ProviderLocationAutosuggest() {
  useEffect(() => {
    if (window.location.pathname !== "/list-service") return;
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
        Object.assign(box.style, { position:"absolute", zIndex:"99999", display:"none", background:"white", border:"1px solid #ddd", borderRadius:"10px", boxShadow:"0 10px 25px rgba(0,0,0,.12)", maxHeight:"240px", overflowY:"auto" });
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
      const matches = q ? cities.filter((name) => name.toLowerCase().startsWith(q)).slice(0, 10) : [];
      box.innerHTML = "";
      if (!matches.length) { box.style.display = "none"; return; }
      matches.forEach((name) => {
        const item = document.createElement("button");
        item.type = "button";
        item.textContent = name;
        Object.assign(item.style, { display:"block", width:"100%", padding:"12px 14px", border:"0", borderBottom:"1px solid #eee", background:"white", textAlign:"left", cursor:"pointer", fontSize:"16px", color:"#182033" });
        item.onpointerdown = (event) => {
          event.preventDefault();
          const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
          setter?.call(city, name);
          city.dispatchEvent(new Event("input", { bubbles:true }));
          city.dispatchEvent(new Event("change", { bubbles:true }));
          box.style.display = "none";
        };
        box.appendChild(item);
      });
      box.style.display = "block";
    };

    const loadCities = async (stateCode: string) => {
      cities = [];
      if (!stateCode) return;
      try {
        const response = await fetch(`/api/cities?state=${encodeURIComponent(stateCode)}`, { cache:"force-cache" });
        const data = await response.json();
        cities = Array.isArray(data.cities) ? data.cities : [];
        const { city } = findFields();
        if (city && city.value.trim()) showMatches(city);
      } catch { cities = []; }
    };

    const apply = () => {
      const { city, state } = findFields();
      if (!city || !state) return;
      city.autocomplete = "off";
      if (state.nextElementSibling !== city) state.parentElement?.insertBefore(state, city);
      if (state.value !== currentState) { currentState = state.value; void loadCities(currentState); }

      if (!state.dataset.cityAutosuggestBound) {
        state.dataset.cityAutosuggestBound = "true";
        state.addEventListener("change", () => { currentState = state.value; void loadCities(currentState); });
      }
      if (!city.dataset.cityAutosuggestBound) {
        city.dataset.cityAutosuggestBound = "true";
        city.addEventListener("input", () => showMatches(city));
        city.addEventListener("focus", () => showMatches(city));
        city.addEventListener("blur", () => setTimeout(() => { const box=document.getElementById("youlistify-city-suggestions-box"); if(box) box.style.display="none"; }, 250));
      }
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList:true, subtree:true });
    return () => observer.disconnect();
  }, []);
  return null;
}
