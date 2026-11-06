import { useMemo, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import {
  AnimatedNumber,
  BioProvider,
  Button,
  Canvas,
  Drawer,
  IslandProvider,
  Menu,
  NavRail,
  Recede,
  SegmentedControl,
  StatusIndicator,
  ToastProvider,
  useBio,
  useBioMotion,
  useIsland,
  type Density,
  type EnvironmentPreference,
} from "../bio";
import { PreferencesPanel } from "./Preferences";
import { Overview } from "./views/Overview";
import { Zones } from "./views/Zones";
import { PhysicsLab } from "./views/PhysicsLab";
import { Library } from "./views/Library";
import { initialAlerts, useLiveReadings, type Alert, type LiveReadings } from "./data";
import { IconAuto, IconDownload, IconLibrary, IconMoon, IconMore, IconOverview, IconPhysics, IconRefresh, IconSliders, IconSun, IconZones } from "./icons";
import s from "./demo.module.css";

export type View = "overview" | "zones" | "physics" | "library";

const titles: Record<View, { title: string; lede: string }> = {
  overview: { title: "Habitat", lede: "Everything alive in the building, at a glance." },
  zones: { title: "Zones", lede: "Expand a zone. Its neighbours make room." },
  physics: { title: "Physics", lede: "Mass, damping and momentum, made visible." },
  library: { title: "Library", lede: "Tokens, materials and the five component families." },
};

export function App() {
  return (
    <BioProvider storageKey="bio-digital-demo">
      <Root />
    </BioProvider>
  );
}

/** Live data and alerts live at the top so the island, canvas mood and views agree. */
function Root() {
  const live = useLiveReadings();
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  return (
    <IslandProvider idle={<IslandIdle live={live} attention={alerts.filter((a) => a.status !== "success").length} />}>
      <ToastProvider>
        <Shell live={live} alerts={alerts} setAlerts={setAlerts} />
      </ToastProvider>
    </IslandProvider>
  );
}

function IslandIdle({ live, attention }: { live: LiveReadings; attention: number }) {
  return (
    <span className={s.islandIdle}>
      <StatusIndicator status={attention ? "warning" : "active"} label={<span className="bio-visually-hidden">{attention ? "Needs attention" : "Calm"}</span>} />
      <span className={s.islandText}>{attention ? `${attention} signal${attention > 1 ? "s" : ""}` : "Habitat calm"}</span>
      <span className={s.islandSep} aria-hidden="true" />
      <span className={s.islandFigure}>
        <AnimatedNumber value={live.power} format={(v) => v.toFixed(1)} /> kW
      </span>
    </span>
  );
}

function Shell({ live, alerts, setAlerts }: { live: LiveReadings; alerts: Alert[]; setAlerts: (a: Alert[] | ((p: Alert[]) => Alert[])) => void }) {
  const [view, setView] = useState<View>("overview");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { environmentPreference, setEnvironment, density, setDensity } = useBio();
  const island = useIsland();
  const m = useBioMotion("ambient");
  const mood = alerts.some((a) => a.status === "critical" || a.status === "warning") ? "attention" : "calm";

  // Large title collapses into a compact glass bar as the page scrolls (§12.3: context stays recognisable).
  const { scrollY } = useScroll();
  const titleScale = useTransform(scrollY, [0, 90], [1, 0.58]);
  const ledeOpacity = useTransform(scrollY, [0, 50], [1, 0]);
  const barOpacity = useTransform(scrollY, [30, 90], [0, 1]);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    [],
  );

  return (
    <Canvas mood={mood}>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      <div className={s.shell}>
        <div className={s.dockWrap}>
          <NavRail<View>
            variant="dock"
            label="Primary"
            value={view}
            onChange={(v) => {
              setView(v);
              window.scrollTo({ top: 0, behavior: m.reduced ? "auto" : "smooth" });
            }}
            items={[
              { value: "overview", label: "Habitat", icon: <IconOverview /> },
              { value: "zones", label: "Zones", icon: <IconZones />, badge: alerts.filter((a) => a.status !== "success").length || undefined },
              { value: "physics", label: "Physics", icon: <IconPhysics /> },
              { value: "library", label: "Library", icon: <IconLibrary /> },
            ]}
          />
        </div>

        <Recede className={s.main}>
          <header className={s.header}>
            <motion.div className={s.headerBar} style={{ opacity: barOpacity }} aria-hidden="true" />
            <div className={s.headerInner}>
              <div className={s.heading}>
                <motion.p className={s.date} style={{ opacity: ledeOpacity }}>
                  {today}
                </motion.p>
                <motion.h1 className={s.h1} style={{ scale: titleScale, transformOrigin: "0% 100%" }}>
                  {titles[view].title}
                </motion.h1>
              </div>
              <div className={s.controls}>
                <SegmentedControl<EnvironmentPreference>
                  label="Environment"
                  size="compact"
                  value={environmentPreference}
                  onChange={setEnvironment}
                  className={s.envSwitch}
                  options={[
                    { value: "day", label: <span className="bio-visually-hidden">Day</span>, icon: <IconSun /> },
                    { value: "night", label: <span className="bio-visually-hidden">Night</span>, icon: <IconMoon /> },
                    { value: "system", label: <span className="bio-visually-hidden">Automatic</span>, icon: <IconAuto /> },
                  ]}
                />
                <SegmentedControl<Density>
                  label="Information density"
                  size="compact"
                  value={density}
                  onChange={(d) => {
                    setDensity(d);
                    island({
                      title: `${d[0].toUpperCase()}${d.slice(1)} density`,
                      description: d === "ambient" ? "Essentials only." : d === "engaged" ? "Supporting detail revealed." : "Analysis and advanced controls revealed.",
                      status: "information",
                      duration: 2200,
                    });
                  }}
                  className={s.densitySwitch}
                  options={[
                    { value: "ambient", label: "Ambient" },
                    { value: "engaged", label: "Engaged" },
                    { value: "immersed", label: "Immersed" },
                  ]}
                />
                <Button variant="secondary" size="compact" iconOnly icon={<IconSliders />} aria-label="Preferences" onClick={() => setPrefsOpen(true)} />
                <Menu
                  label="More actions"
                  trigger={(p) => <Button {...p} variant="secondary" size="compact" iconOnly icon={<IconMore />} aria-label="More actions" />}
                  items={[
                    { label: "Export report", icon: <IconDownload />, shortcut: "⌘E", onSelect: () => island({ title: "Report exported", description: "habitat-2026-11-06.csv is ready.", status: "success" }) },
                    { label: "Recalibrate sensors", icon: <IconRefresh />, onSelect: () => island({ title: "Recalibrating sensors", description: "They settle in about two minutes.", status: "information" }) },
                    { type: "separator" },
                    { label: "All preferences", icon: <IconSliders />, onSelect: () => setPrefsOpen(true) },
                  ]}
                />
              </div>
            </div>
            <motion.p className={s.lede} style={{ opacity: ledeOpacity }}>
              {titles[view].lede}
            </motion.p>
          </header>

          <main id="main" tabIndex={-1} className={s.content}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, y: m.reduced ? 0 : 16, scale: m.reduced ? 1 : 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: m.reduced ? 0 : -8, scale: m.reduced ? 1 : 0.99 }}
                transition={m.reduced ? { duration: 0.12 } : { type: "spring", stiffness: 240, damping: 28 }}
              >
                {view === "overview" && <Overview onNavigate={setView} live={live} alerts={alerts} setAlerts={setAlerts} />}
                {view === "zones" && <Zones />}
                {view === "physics" && <PhysicsLab />}
                {view === "library" && <Library />}
              </motion.div>
            </AnimatePresence>
          </main>
        </Recede>
      </div>

      <Drawer open={prefsOpen} onClose={() => setPrefsOpen(false)} title="Preferences">
        <PreferencesPanel />
      </Drawer>
    </Canvas>
  );
}
