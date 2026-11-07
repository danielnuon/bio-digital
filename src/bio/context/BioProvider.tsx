import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import { useMaterialLight, useReflectionPlacement } from "./useMaterialLight";
import { detectDeviceCorners, type DeviceCorners } from "../utils/corners";
import "../tokens/base.css";

/**
 * Layer 4 — Intelligence (spec §20.4): environment, density, motion and
 * fidelity preferences live here, separate from rendering and interaction.
 */

export type Environment = "day" | "night";
export type EnvironmentPreference = Environment | "system";
export type Density = "ambient" | "engaged" | "immersed";
export type MotionPreference = "organic" | "reduced" | "system";
export type Fidelity = "full" | "lite";

export interface BioContextValue {
  /** Resolved environment. */
  environment: Environment;
  environmentPreference: EnvironmentPreference;
  setEnvironment: (e: EnvironmentPreference) => void;
  density: Density;
  setDensity: (d: Density) => void;
  /** Resolved motion mode. */
  motion: "organic" | "reduced";
  motionPreference: MotionPreference;
  setMotion: (m: MotionPreference) => void;
  /** Visual fidelity adapts to device capability (§19.3). */
  fidelity: Fidelity;
  setFidelity: (f: Fidelity | "auto") => void;
  /** Number of open focus-level spatial layers (modals, drawers). */
  spatialDepth: number;
  pushSpatialLayer: () => () => void;
  portalRoot: HTMLElement | null;
  /** The screen's corner radius, so edge-hugging surfaces can be concentric. */
  deviceCorners: DeviceCorners;
  setDeviceRadius: (r: number | "auto") => void;
}

const BioContext = createContext<BioContextValue | null>(null);

function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : fallback),
    () => fallback,
  );
}

/** Conservative capability heuristic; users can always override. */
function detectFidelity(): Fidelity {
  if (typeof navigator === "undefined") return "full";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "lite";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return "lite";
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 2) return "lite";
  return "full";
}

export interface BioProviderProps {
  children: ReactNode;
  environment?: EnvironmentPreference;
  density?: Density;
  motion?: MotionPreference;
  /** Persist preferences under this localStorage key. */
  storageKey?: string;
  /** Exact display corner radius in CSS px, when the host knows it (e.g. a native shell). */
  deviceRadius?: number;
  className?: string;
}

type Stored = Partial<{ environment: EnvironmentPreference; density: Density; motion: MotionPreference; fidelity: Fidelity | "auto" }>;

function readStored(key?: string): Stored {
  if (!key || typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as Stored;
  } catch {
    return {};
  }
}

export function BioProvider({
  children,
  environment: initialEnv = "system",
  density: initialDensity = "engaged",
  motion: initialMotion = "system",
  storageKey,
  deviceRadius,
  className,
}: BioProviderProps) {
  const [stored] = useState(() => readStored(storageKey));
  const [environmentPreference, setEnvironment] = useState<EnvironmentPreference>(stored.environment ?? initialEnv);
  const [density, setDensity] = useState<Density>(stored.density ?? initialDensity);
  const [motionPreference, setMotion] = useState<MotionPreference>(stored.motion ?? initialMotion);
  const [fidelityPref, setFidelity] = useState<Fidelity | "auto">(stored.fidelity ?? "auto");
  const [spatialDepth, setSpatialDepth] = useState(0);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);
  const [detected, setDetected] = useState<DeviceCorners>({ radius: 0, source: "none", label: "Detecting" });
  const [radiusOverride, setDeviceRadius] = useState<number | "auto">(deviceRadius ?? "auto");
  useEffect(() => setDetected(detectDeviceCorners()), []);
  const deviceCorners = useMemo<DeviceCorners>(
    () =>
      radiusOverride === "auto"
        ? detected
        : { radius: radiusOverride, source: "model", label: deviceRadius !== undefined ? "Provided by host" : "Set manually" },
    [radiusOverride, detected, deviceRadius],
  );

  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");
  const systemReduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const environment: Environment =
    environmentPreference === "system" ? (systemDark ? "night" : "day") : environmentPreference;
  const motion = motionPreference === "system" ? (systemReduced ? "reduced" : "organic") : motionPreference;
  const fidelity: Fidelity = fidelityPref === "auto" ? detectFidelity() : fidelityPref;
  useMaterialLight(rootEl, fidelity === "full" && motion === "organic");
  useReflectionPlacement(rootEl, fidelity === "full");

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ environment: environmentPreference, density, motion: motionPreference, fidelity: fidelityPref }),
      );
    } catch {
      /* storage unavailable: preferences simply don't persist */
    }
  }, [storageKey, environmentPreference, density, motionPreference, fidelityPref]);

  const pushSpatialLayer = useCallback(() => {
    setSpatialDepth((d) => d + 1);
    return () => setSpatialDepth((d) => Math.max(0, d - 1));
  }, []);

  const value = useMemo<BioContextValue>(
    () => ({
      environment,
      environmentPreference,
      setEnvironment,
      density,
      setDensity,
      motion,
      motionPreference,
      setMotion,
      fidelity,
      setFidelity,
      spatialDepth,
      pushSpatialLayer,
      portalRoot,
      deviceCorners,
      setDeviceRadius,
    }),
    [environment, environmentPreference, density, motion, motionPreference, fidelity, spatialDepth, pushSpatialLayer, portalRoot, deviceCorners],
  );

  return (
    <BioContext.Provider value={value}>
      {/* MotionConfig makes every Motion component respect the resolved preference. */}
      <MotionConfig reducedMotion={motion === "reduced" ? "always" : "never"}>
        <div
          ref={setRootEl}
          data-bio-root=""
          data-bio-environment={environment}
          data-bio-density={density}
          data-bio-motion={motion}
          data-bio-fidelity={fidelity}
          data-bio-spatial={spatialDepth > 0 ? "focused" : "idle"}
          data-bio-device-corners={deviceCorners.radius > 0 ? "rounded" : "square"}
          style={{ ["--bio-device-radius" as string]: `${deviceCorners.radius}px` }}
          className={className}
        >
          {children}
          <div data-bio-portal="" ref={setPortalRoot} />
        </div>
      </MotionConfig>
    </BioContext.Provider>
  );
}

export function useBio(): BioContextValue {
  const ctx = useContext(BioContext);
  if (!ctx) throw new Error("BIO DIGITAL components must be rendered inside <BioProvider>.");
  return ctx;
}

/** Whether detail for a given density level should be visible. */
export function useDensityAtLeast(level: Density): boolean {
  const { density } = useBio();
  const order: Density[] = ["ambient", "engaged", "immersed"];
  return order.indexOf(density) >= order.indexOf(level);
}
