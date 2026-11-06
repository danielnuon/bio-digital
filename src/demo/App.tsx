import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BioProvider,
  Breadcrumbs,
  Button,
  Canvas,
  Drawer,
  Menu,
  NavRail,
  Recede,
  StatusIndicator,
  Surface,
  ToastProvider,
  useBioMotion,
  useToast,
} from "../bio";
import { DensitySwitch, EnvironmentSwitch, MotionSwitch, PreferencesPanel } from "./Preferences";
import { Overview } from "./views/Overview";
import { Zones } from "./views/Zones";
import { PhysicsLab } from "./views/PhysicsLab";
import { Library } from "./views/Library";
import { IconDownload, IconLibrary, IconMore, IconOverview, IconPhysics, IconRefresh, IconSliders, IconZones } from "./icons";
import s from "./demo.module.css";

export type View = "overview" | "zones" | "physics" | "library";

const titles: Record<View, { title: string; lede: string }> = {
  overview: { title: "Overview", lede: "The habitat at a glance." },
  zones: { title: "Living zones", lede: "Expand a zone. Its neighbours make room." },
  physics: { title: "Physics lab", lede: "Mass, damping and momentum, made visible." },
  library: { title: "Design library", lede: "Tokens, materials and the five component families." },
};

export function App() {
  return (
    <BioProvider storageKey="bio-digital-demo">
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </BioProvider>
  );
}

function Shell() {
  const [view, setView] = useState<View>("overview");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const notify = useToast();
  const m = useBioMotion("ambient");

  return (
    <Canvas>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      <div className={s.shell}>
        <aside className={s.sidebar}>
          <div className={s.brand}>
            <span className={s.brandMark} aria-hidden="true" />
            <span>
              <span className={s.brandName}>BIO DIGITAL</span>
              <span className={s.brandSub}>Habitat console</span>
            </span>
          </div>
          <NavRail<View>
            label="Primary"
            value={view}
            onChange={setView}
            className={s.nav}
            items={[
              { value: "overview", label: "Overview", icon: <IconOverview /> },
              { value: "zones", label: "Zones", icon: <IconZones />, badge: 2 },
              { value: "physics", label: "Physics", icon: <IconPhysics /> },
              { value: "library", label: "Library", icon: <IconLibrary /> },
            ]}
          />
          <Surface material="carbon" depth={2} radius="r4" padding="md" className={s.sideCard}>
            <StatusIndicator status="active" label="Habitat alive" />
            <p className={s.sideCardText}>Readings drift every few seconds and pause when this tab is hidden.</p>
          </Surface>
        </aside>

        <Recede className={s.main}>
          <header className={s.topbar}>
            <div className={s.heading}>
              <Breadcrumbs items={[{ label: "Habitat", onClick: () => setView("overview") }, { label: titles[view].title }]} />
              <h1 className={s.h1}>{titles[view].title}</h1>
              <p className={s.lede}>{titles[view].lede}</p>
            </div>
            <div className={s.controls}>
              <div className={s.inlinePrefs}>
                <EnvironmentSwitch compact />
                <DensitySwitch compact />
                <MotionSwitch compact />
              </div>
              <Button variant="secondary" size="compact" icon={<IconSliders />} onClick={() => setPrefsOpen(true)} className={s.prefsButton}>
                Preferences
              </Button>
              <Menu
                label="More actions"
                trigger={(p) => <Button {...p} variant="secondary" size="compact" iconOnly icon={<IconMore />} aria-label="More actions" />}
                items={[
                  { label: "Export report", icon: <IconDownload />, shortcut: "⌘E", onSelect: () => notify({ title: "Report exported", description: "habitat-2026-11-06.csv is ready.", status: "success" }) },
                  { label: "Recalibrate sensors", icon: <IconRefresh />, onSelect: () => notify({ title: "Recalibration started", description: "Sensors settle in about two minutes.", status: "information" }) },
                  { type: "separator" },
                  { label: "All preferences", icon: <IconSliders />, onSelect: () => setPrefsOpen(true) },
                ]}
              />
            </div>
          </header>

          <main id="main" tabIndex={-1} className={s.content}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, y: m.reduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: m.reduced ? 0 : -6 }}
                transition={m.reduced ? { duration: 0.12 } : { type: "spring", stiffness: 260, damping: 30 }}
              >
                {view === "overview" && <Overview onNavigate={setView} />}
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
