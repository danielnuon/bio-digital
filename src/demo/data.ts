import { useEffect, useState } from "react";
import type { Status } from "../bio";

/** Deterministic noise so the demo looks the same on every load. */
function wave(i: number, seed: number) {
  return Math.sin(i * 0.55 + seed) * 0.6 + Math.sin(i * 0.21 + seed * 2.3) * 0.4;
}

export type Range = "24h" | "7d" | "30d";
const POINTS = 25; // fixed point count lets the chart morph between ranges

export const rangeLabels: Record<Range, string[]> = {
  "24h": Array.from({ length: POINTS }, (_, i) => `${String(i).padStart(2, "0")}:00`),
  "7d": Array.from({ length: POINTS }, (_, i) => {
    const hours = i * 7;
    return `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"][Math.floor(hours / 24)]} ${String(hours % 24).padStart(2, "0")}:00`;
  }),
  "30d": [],
};
rangeLabels["30d"] = Array.from({ length: POINTS }, (_, i) => {
  const day = Math.round((i / (POINTS - 1)) * 30);
  const date = new Date(2026, 9, 7 + day);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
});

export function energySeries(range: Range) {
  const seed = range === "24h" ? 1 : range === "7d" ? 4 : 9;
  const base = range === "24h" ? 42 : range === "7d" ? 48 : 51;
  const use = Array.from({ length: POINTS }, (_, i) => {
    const daylight = range === "24h" ? Math.max(0, Math.sin(((i - 6) / 24) * Math.PI * 2)) : 0.5;
    return Math.round((base + wave(i, seed) * 9 + daylight * 14) * 10) / 10;
  });
  const solar = Array.from({ length: POINTS }, (_, i) => {
    const daylight = range === "24h" ? Math.max(0, Math.sin(((i - 6) / 24) * Math.PI * 2)) : 0.55 + wave(i, seed + 2) * 0.2;
    return Math.round(daylight * (range === "24h" ? 58 : 40) * 10) / 10;
  });
  return { use, solar };
}

export interface Zone {
  id: string;
  name: string;
  kind: string;
  status: Status;
  statusLabel: string;
  temp: number;
  humidity: number;
  co2: number;
  light: number;
  occupancy: number;
  note: string;
}

export const zones: Zone[] = [
  { id: "atrium", name: "Atrium canopy", kind: "Living wall", status: "success", statusLabel: "Thriving", temp: 22.4, humidity: 58, co2: 512, light: 78, occupancy: 34, note: "Photosynthesis peaked at 11:20. Misting cycle completed." },
  { id: "studio", name: "North studio", kind: "Workspace", status: "active", statusLabel: "Occupied", temp: 21.6, humidity: 44, co2: 690, light: 64, occupancy: 18, note: "Ventilation increased to hold CO₂ below 800 ppm." },
  { id: "nursery", name: "Seed nursery", kind: "Greenhouse", status: "warning", statusLabel: "Humidity high", temp: 25.1, humidity: 81, co2: 455, light: 88, occupancy: 2, note: "Humidity 6% above target. Vents opening gradually." },
  { id: "cistern", name: "Rain cistern", kind: "Water", status: "information", statusLabel: "Filling", temp: 14.2, humidity: 0, co2: 0, light: 0, occupancy: 0, note: "Collected 1,840 L since last night's rain." },
  { id: "library", name: "Quiet library", kind: "Reading room", status: "idle", statusLabel: "Resting", temp: 20.8, humidity: 47, co2: 430, light: 22, occupancy: 0, note: "Lighting dimmed to circadian evening profile." },
  { id: "roof", name: "Roof meadow", kind: "Biodiverse roof", status: "critical", statusLabel: "Sensor offline", temp: 0, humidity: 0, co2: 0, light: 0, occupancy: 0, note: "Soil moisture probe 3 stopped reporting at 14:02." },
];

export interface Alert {
  id: string;
  status: Status;
  title: string;
  body: string;
  time: string;
}

export const initialAlerts: Alert[] = [
  { id: "a1", status: "critical", title: "Roof meadow probe offline", body: "Soil moisture probe 3 stopped reporting. Irrigation is holding its last schedule.", time: "14:02" },
  { id: "a2", status: "warning", title: "Nursery humidity above target", body: "81% against a 75% target. Vents are opening gradually.", time: "13:47" },
  { id: "a3", status: "success", title: "Solar surplus stored", body: "12.4 kWh moved into the battery wall this afternoon.", time: "12:15" },
];

export interface LiveReadings {
  power: number;
  solar: number;
  air: number;
  water: number;
  trendPower: number[];
  trendAir: number[];
  trendWater: number[];
  trendSolar: number[];
  tick: number;
}

const start: LiveReadings = {
  power: 46.2,
  solar: 31.8,
  air: 92,
  water: 1840,
  trendPower: Array.from({ length: 16 }, (_, i) => 44 + wave(i, 3) * 4),
  trendAir: Array.from({ length: 16 }, (_, i) => 90 + wave(i, 5) * 3),
  trendWater: Array.from({ length: 16 }, (_, i) => 1700 + i * 9 + wave(i, 2) * 20),
  trendSolar: Array.from({ length: 16 }, (_, i) => 28 + wave(i, 7) * 5),
  tick: 0,
};

/**
 * Behavioural life (§3.7): readings drift every few seconds. Updates are
 * low-frequency and pause while the tab is hidden to preserve battery.
 */
export function useLiveReadings(paused = false, interval = 4000): LiveReadings {
  const [r, setR] = useState(start);
  useEffect(() => {
    if (paused) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const step = () =>
      setR((p) => {
        const t = p.tick + 1;
        const power = Math.max(30, Math.min(64, p.power + wave(t, 11) * 1.6));
        const solar = Math.max(0, Math.min(58, p.solar + wave(t, 13) * 1.4));
        const air = Math.max(80, Math.min(99, p.air + wave(t, 17) * 0.9));
        const water = p.water + 4 + Math.abs(wave(t, 19)) * 6;
        const push = (arr: number[], v: number) => [...arr.slice(1), v];
        return { power, solar, air, water, tick: t, trendPower: push(p.trendPower, power), trendAir: push(p.trendAir, air), trendWater: push(p.trendWater, water), trendSolar: push(p.trendSolar, solar) };
      });
    const startTimer = () => {
      if (!id) id = setInterval(step, interval);
    };
    const stopTimer = () => {
      if (id) clearInterval(id);
      id = undefined;
    };
    const onVis = () => (document.hidden ? stopTimer() : startTimer());
    if (!document.hidden) startTimer();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [paused, interval]);
  return r;
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
