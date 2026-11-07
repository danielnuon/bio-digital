import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BioProvider,
  Button,
  Canvas,
  Drawer,
  IslandProvider,
  NavRail,
  Recede,
  SegmentedControl,
  ToastProvider,
  useBio,
  useBioMotion,
  useViewAngle,
  type Density,
  type EnvironmentPreference,
} from "../bio";
import { PreferencesPanel, type TiltState } from "./Preferences";
import { Overview } from "./views/Overview";
import { Foundations } from "./views/Foundations";
import { Materials } from "./views/Materials";
import { PhysicsLab } from "./views/PhysicsLab";
import { Components, type Family } from "./views/Components";
import { IconAuto, IconHome, IconLayers, IconLibrary, IconMoon, IconPhysics, IconSliders, IconSun, IconSwatch } from "./icons";
import s from "./demo.module.css";

export type View = "overview" | "foundations" | "materials" | "motion" | "components";
export type Mood = "calm" | "attention";

const titles: Record<View, { title: string; lede: string }> = {
  overview: { title: "BIO DIGITAL", lede: "A design language and component library. Everything here is working code." },
  foundations: { title: "Foundations", lede: "Colour, type, geometry and depth: the tokens every component is built from." },
  materials: { title: "Materials", lede: "Four materials and their finishes, and how they respond to the environment." },
  motion: { title: "Motion", lede: "Mass, damping and momentum. Every animation is a spring you can inspect." },
  components: { title: "Components", lede: "Five families, each shown working and wired to real state." },
};

export function App() {
  return (
    <BioProvider storageKey="bio-digital-demo">
      <IslandProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </IslandProvider>
    </BioProvider>
  );
}

function Shell() {
  const [view, setView] = useState<View>("overview");
  const [family, setFamily] = useState<Family>("interaction");
  const [mood, setMood] = useState<Mood>("calm");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const { environmentPreference, setEnvironment, density, setDensity } = useBio();
  const m = useBioMotion("ambient");
  const [tilt, setTilt] = useState<TiltState>("idle");
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setRoot(document.querySelector<HTMLElement>("[data-bio-root]")), []);
  useViewAngle(root, tilt === "on" && !m.reduced);

  const go = (v: View, f?: Family) => {
    if (f) setFamily(f);
    setView(v);
    // Instant: a smooth scroll racing the view fade reads as a jump.
    window.scrollTo({ top: 0, behavior: "auto" });
  };

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
            onChange={(v) => go(v)}
            items={[
              { value: "overview", label: "Overview", icon: <IconHome /> },
              { value: "foundations", label: "Foundations", icon: <IconSwatch /> },
              { value: "materials", label: "Materials", icon: <IconLayers /> },
              { value: "motion", label: "Motion", icon: <IconPhysics /> },
              { value: "components", label: "Components", icon: <IconLibrary /> },
            ]}
          />
        </div>

        <Recede className={s.main}>
          <header className={s.header}>
            <div className={s.headerInner}>
              <div className={s.heading}>
                <h1 className={s.h1}>{titles[view].title}</h1>
              </div>
              <div className={s.controls}>
                <SegmentedControl<EnvironmentPreference>
                  label="Environment"
                  size="compact"
                  value={environmentPreference}
                  onChange={setEnvironment}
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
                  onChange={setDensity}
                  className={s.densitySwitch}
                  options={[
                    { value: "ambient", label: "Ambient" },
                    { value: "engaged", label: "Engaged" },
                    { value: "immersed", label: "Immersed" },
                  ]}
                />
                <Button variant="secondary" size="compact" iconOnly icon={<IconSliders />} aria-label="Preferences" onClick={() => setPrefsOpen(true)} />
              </div>
            </div>
            <p className={s.lede}>{titles[view].lede}</p>
          </header>

          <main id="main" tabIndex={-1} className={s.content}>
            {/* Opacity only: no scale or translate, so nothing reflows or
                shifts while the next view settles. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: m.reduced ? 0.1 : 0.16, ease: "easeOut" }}
              >
                {view === "overview" && <Overview onNavigate={go} />}
                {view === "foundations" && <Foundations />}
                {view === "materials" && <Materials mood={mood} onMood={setMood} />}
                {view === "motion" && <PhysicsLab />}
                {view === "components" && <Components family={family} onFamily={setFamily} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </Recede>
      </div>

      <Drawer open={prefsOpen} onClose={() => setPrefsOpen(false)} title="Preferences">
        <PreferencesPanel tilt={tilt} onTilt={setTilt} />
      </Drawer>
    </Canvas>
  );
}
