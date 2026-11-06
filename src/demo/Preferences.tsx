import { SegmentedControl, Toggle, useBio, type Density, type EnvironmentPreference, type MotionPreference } from "../bio";
import { IconAuto, IconMoon, IconSun } from "./icons";
import s from "./demo.module.css";

export function EnvironmentSwitch({ compact }: { compact?: boolean }) {
  const { environmentPreference, setEnvironment } = useBio();
  return (
    <SegmentedControl<EnvironmentPreference>
      label="Environment"
      size={compact ? "compact" : "regular"}
      value={environmentPreference}
      onChange={setEnvironment}
      options={[
        { value: "day", label: "Day", icon: <IconSun /> },
        { value: "night", label: "Night", icon: <IconMoon /> },
        { value: "system", label: "Auto", icon: <IconAuto /> },
      ]}
    />
  );
}

export function DensitySwitch({ compact }: { compact?: boolean }) {
  const { density, setDensity } = useBio();
  return (
    <SegmentedControl<Density>
      label="Information density"
      size={compact ? "compact" : "regular"}
      value={density}
      onChange={setDensity}
      options={[
        { value: "ambient", label: "Ambient" },
        { value: "engaged", label: "Engaged" },
        { value: "immersed", label: "Immersed" },
      ]}
    />
  );
}

export function MotionSwitch({ compact }: { compact?: boolean }) {
  const { motionPreference, setMotion } = useBio();
  return (
    <SegmentedControl<MotionPreference>
      label="Motion"
      size={compact ? "compact" : "regular"}
      value={motionPreference}
      onChange={setMotion}
      options={[
        { value: "organic", label: "Organic" },
        { value: "reduced", label: "Reduced" },
        { value: "system", label: "System" },
      ]}
    />
  );
}

/** Full preference set, used inside the Preferences drawer. */
export function PreferencesPanel() {
  const { fidelity, setFidelity, environment, motion } = useBio();
  return (
    <div className={s.prefs}>
      <section className={s.prefGroup} aria-labelledby="pref-env">
        <h3 id="pref-env" className={s.prefTitle}>Environment</h3>
        <p className={s.prefHint}>Day is porcelain under natural light. Night is carbon with atmospheric light. Currently {environment}.</p>
        <EnvironmentSwitch />
      </section>
      <section className={s.prefGroup} aria-labelledby="pref-density">
        <h3 id="pref-density" className={s.prefTitle}>Information density</h3>
        <p className={s.prefHint}>Ambient shows essentials, Engaged adds supporting detail, Immersed reveals analysis and advanced controls.</p>
        <DensitySwitch />
      </section>
      <section className={s.prefGroup} aria-labelledby="pref-motion">
        <h3 id="pref-motion" className={s.prefTitle}>Motion</h3>
        <p className={s.prefHint}>Reduced replaces springs with short fades, stops ambient drift, and keeps every function. Currently {motion}.</p>
        <MotionSwitch />
      </section>
      <section className={s.prefGroup} aria-labelledby="pref-fidelity">
        <h3 id="pref-fidelity" className={s.prefTitle}>Visual fidelity</h3>
        <Toggle
          spread
          label="Lite rendering"
          description="Removes backdrop blur and ambient forms for constrained devices. Detected automatically."
          checked={fidelity === "lite"}
          onChange={(on) => setFidelity(on ? "lite" : "full")}
        />
      </section>
    </div>
  );
}
