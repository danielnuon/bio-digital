import {
  Button,
  Card,
  SegmentedControl,
  Slider,
  Surface,
  Toggle,
  useBio,
  useIsland,
  type Density,
} from "../../bio";
import type { View } from "../App";
import type { Family } from "./Components";
import { families } from "./Components";
import s from "../demo.module.css";

const pillars = [
  ["Fluidity", "Segmented controls, tabs and the nav rail move one continuous indicator instead of swapping states. Chart ranges morph rather than redraw."],
  ["Reactivity", "Buttons compress and recover, cards lift on proximity, inputs glow with focus. Every response matches the input's intensity."],
  ["Spatiality", "Five depth levels (D0 to D4). Modals grow from the control that opened them, and the page recedes behind them."],
  ["Organicism", "Capsule controls, continuous corners that follow the device's own screen, and monotone curves that never overshoot the data."],
  ["Serenity", "A tonal sage, water and mist palette, accents only where they carry meaning, and a calm type scale built on system fonts."],
  ["Vitality", "The background is a slow living field that eases toward each environment and mood, and the active status breathes."],
  ["Continuous Vitality", "Idle is a state, not an absence: depth and light keep presence, and work pauses when the tab is hidden."],
];

const quickStart = `import { BioProvider, Canvas, Card, Button } from "bio-digital";

<BioProvider>
  <Canvas>
    <Card title="Hello" material="porcelain">
      <Button>Continue</Button>
    </Card>
  </Canvas>
</BioProvider>`;

export function Overview({ onNavigate }: { onNavigate: (v: View, f?: Family) => void }) {
  const { environment, setEnvironment, density, setDensity, deviceCorners, setDeviceRadius } = useBio();
  const island = useIsland();
  const total = families.reduce((n, f) => n + f.components.length, 0);

  return (
    <div className={s.grid}>
      <Surface material="porcelain" depth={2} radius="r6" className={`${s.span12} ${s.hero}`}>
        <div className={s.heroText}>
          <span className={s.date}>Design language v1.0 · {total} components</span>
          <h2 className={s.heroTitle}>
            Technology, naturally alive.
            <br />
            <span className={s.heroAccent}>Governed by physics.</span>
          </h2>
          <p className={s.heroBody}>
            Tokens, materials, spring physics and five component families. Every control on this page is a library component doing its real job.
          </p>
          <div className={s.heroActions}>
            <Button onClick={() => onNavigate("components")}>Browse components</Button>
            <Button variant="secondary" onClick={() => onNavigate("motion")}>
              See the physics
            </Button>
          </div>
        </div>

        {/* A live specimen: these controls drive the whole page. */}
        <Surface material="membrane" depth={3} radius="r5" padding="md" className={s.specimen}>
          <div className={s.specimenHead}>
            <span>Try it</span>
            <span>Changes the whole page</span>
          </div>
          <Toggle spread label="Night environment" checked={environment === "night"} onChange={(on) => setEnvironment(on ? "night" : "day")} />
          <SegmentedControl<Density>
            label="Density"
            value={density}
            onChange={setDensity}
            options={[
              { value: "ambient", label: "Ambient" },
              { value: "engaged", label: "Engaged" },
              { value: "immersed", label: "Immersed" },
            ]}
          />
          <Slider
            label="Screen corner"
            value={Math.round(deviceCorners.radius)}
            min={0}
            max={64}
            onChange={(r) => setDeviceRadius(r)}
            format={(v) => `${v} pt`}
          />
          <Button
            variant="tertiary"
            size="compact"
            onClick={() =>
              island({ title: "The Living Island", description: "One home for feedback. It grows from the top, then settles.", status: "information" })
            }
          >
            Send a message to the island
          </Button>
        </Surface>
      </Surface>

      <section className={s.span12} aria-labelledby="families-h">
        <div className={s.sectionHead}>
          <h2 id="families-h" className={s.h2}>
            Component families
          </h2>
        </div>
        <div className={s.families}>
          {families.map((f) => (
            <Card key={f.id} eyebrow={`${f.components.length} components`} title={f.label} headingLevel={3} interactive>
              <p className={s.familyNames}>{f.components.join(", ")}</p>
              <div>
                <Button variant="secondary" size="compact" onClick={() => onNavigate("components", f.id)} aria-label={`Open ${f.label} components`}>
                  Open
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className={s.span12} aria-labelledby="pillars-h">
        <div className={s.sectionHead}>
          <h2 id="pillars-h" className={s.h2}>
            Principles
          </h2>
        </div>
        <div className={s.pillars}>
          {pillars.map(([name, body], i) => (
            <Card key={name} eyebrow={<span className={s.pillarIndex}>Pillar {String(i + 1).padStart(2, "0")}</span>} title={name} headingLevel={3}>
              <p className={`${s.p} ${s.muted}`}>{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className={s.span12} title="Quick start" eyebrow="React" headingLevel={2}>
        <pre className={s.codeBlock}>
          <code>{quickStart}</code>
        </pre>
      </Card>
    </div>
  );
}
