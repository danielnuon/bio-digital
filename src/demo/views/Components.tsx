import { useMemo, useRef, useState } from "react";
import {
  Breadcrumbs,
  Button,
  Card,
  CardStack,
  Chart,
  Checkbox,
  ControlTile,
  DataPanel,
  Divider,
  Drawer,
  Gauge,
  Input,
  List,
  Menu,
  Metric,
  Modal,
  NavRail,
  OrganicShape,
  Popover,
  Rings,
  SegmentedControl,
  Slider,
  Sparkline,
  StatusIndicator,
  Surface,
  TabPanel,
  Tabs,
  Toggle,
  dampingRatio,
  physics,
  settleTime,
  simulateSpring,
  useBio,
  useIsland,
  useToast,
  type Depth,
  type Finish,
  type Material,
  type Radius,
} from "../../bio";
import { IconBolt, IconHome, IconLayers, IconLibrary, IconMoon, IconPause, IconPhysics, IconSliders, IconSpark, IconSwatch } from "../icons";
import s from "../demo.module.css";

export type Family = "foundation" | "interaction" | "navigation" | "information" | "spatial";

/** The library's public components by family (mirrors src/bio/index.ts). */
export const families: Array<{ id: Family; label: string; components: string[] }> = [
  { id: "foundation", label: "Foundation", components: ["Canvas", "Surface", "Container", "Stack", "Divider", "MaterialLayer", "OrganicShape"] },
  { id: "interaction", label: "Interaction", components: ["Button", "Toggle", "Checkbox", "SegmentedControl", "Slider", "Input", "ControlTile"] },
  { id: "navigation", label: "Navigation", components: ["NavRail", "Tabs", "Breadcrumbs", "Menu"] },
  {
    id: "information",
    label: "Information",
    components: ["Card", "List", "Metric", "Chart", "Sparkline", "Gauge", "Rings", "DataPanel", "CardStack", "StatusIndicator", "AnimatedNumber"],
  },
  { id: "spatial", label: "Spatial", components: ["Modal", "Drawer", "Popover", "Toast", "FloatingPanel", "Island"] },
];

export function Components({ family, onFamily }: { family: Family; onFamily: (f: Family) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--bio-density-gap)" }}>
      <Tabs<Family> label="Component families" idBase="fam" value={family} onChange={onFamily} items={families.map((f) => ({ value: f.id, label: f.label }))} />
      <TabPanel idBase="fam" value={family} style={{ outline: "none" }}>
        {family === "foundation" && <FoundationFamily />}
        {family === "interaction" && <InteractionFamily />}
        {family === "navigation" && <NavigationFamily onFamily={onFamily} />}
        {family === "information" && <InformationFamily />}
        {family === "spatial" && <SpatialFamily />}
      </TabPanel>
    </div>
  );
}

/* ── Foundation ─────────────────────────────────────────────── */

function FoundationFamily() {
  const [material, setMaterial] = useState<Material>("porcelain");
  const [depth, setDepth] = useState<Depth>(2);
  const [radius, setRadius] = useState<Radius>("r4");
  const [finish, setFinish] = useState<Finish | "none">("none");
  const [seed, setSeed] = useState(3);
  const code = `<Surface material="${material}" depth={${depth}} radius="${radius}"${finish === "none" ? "" : ` finish="${finish}"`}>`;
  return (
    <div className={s.specGrid}>
      <Card title="Surface" eyebrow="Playground" headingLevel={2}>
        <SegmentedControl<Material>
          label="Material"
          value={material}
          onChange={setMaterial}
          options={(["porcelain", "membrane", "crystal", "carbon"] as const).map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) }))}
        />
        <Slider label="Depth" value={depth} min={0} max={4} step={1} onChange={(v) => setDepth(v as Depth)} format={(v) => `D${v}`} />
        <SegmentedControl<Radius>
          label="Radius"
          value={radius}
          onChange={setRadius}
          options={(["r2", "r4", "r6", "pill", "organic"] as const).map((r) => ({ value: r, label: r.toUpperCase() }))}
        />
        <SegmentedControl<Finish | "none">
          label="Finish"
          value={finish}
          onChange={setFinish}
          options={(["none", "satin", "pearl", "chroma"] as const).map((f) => ({ value: f, label: f[0].toUpperCase() + f.slice(1) }))}
        />
      </Card>
      <Card title="Preview" eyebrow="Live" headingLevel={2}>
        <Surface
          material={material}
          depth={depth}
          radius={radius}
          finish={finish === "none" ? undefined : finish}
          padding="lg"
          style={{ minHeight: 160, display: "grid", placeItems: "center", textAlign: "center" }}
        >
          <span>
            <strong>{material[0].toUpperCase() + material.slice(1)}</strong>
            <br />
            <span style={{ color: "var(--bio-text-muted)" }}>
              D{depth} · {radius.toUpperCase()}
              {finish !== "none" && ` · ${finish}`}
            </span>
          </span>
        </Surface>
        <pre className={s.codeBlock}>
          <code>{code}</code>
        </pre>
      </Card>
      <Card title="OrganicShape" eyebrow="Seeded contour" headingLevel={2}>
        <div style={{ display: "grid", placeItems: "center" }}>
          <OrganicShape seed={seed} size={160} />
        </div>
        <Slider label="Seed" value={seed} min={1} max={24} step={1} onChange={setSeed} />
        <Divider />
        <p className={`${s.p} ${s.muted} ${s.small}`}>
          Canvas is the living background behind this page. Container, Stack and Divider are the layout primitives used throughout.
        </p>
      </Card>
    </div>
  );
}

/* ── Interaction ────────────────────────────────────────────── */

function InteractionFamily() {
  const { environment, setEnvironment, motion, setMotion, density, setDensity, fidelity, setFidelity, deviceCorners, setDeviceRadius } = useBio();
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [seg, setSeg] = useState<"leaf" | "root" | "bloom">("root");
  const [val, setVal] = useState(40);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const emailOk = /^\S+@\S+\.\S+$/.test(email);

  return (
    <div className={s.gallery}>
      <Card title="Button" eyebrow="Variants, sizes, states" headingLevel={2}>
        <div className={s.row}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className={s.row}>
          <Button size="compact">Compact</Button>
          <Button size="regular">Regular</Button>
          <Button size="large">Large</Button>
        </div>
        <div className={s.row}>
          <Button
            loading={saving}
            loadingLabel="Saving"
            onClick={() => {
              setSaving(true);
              window.setTimeout(() => setSaving(false), 1600);
            }}
          >
            Save
          </Button>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" iconOnly icon={<IconBolt />} aria-label="Icon only" />
        </div>
      </Card>

      <Card title="Control tiles" eyebrow="These change this page" headingLevel={2}>
        <div className={s.tileGrid}>
          <ControlTile label="Night" icon={<IconMoon />} on={environment === "night"} onChange={(v) => setEnvironment(v ? "night" : "day")} />
          <ControlTile label="Reduced motion" icon={<IconPause />} on={motion === "reduced"} onChange={(v) => setMotion(v ? "reduced" : "organic")} />
          <ControlTile label="Immersed" icon={<IconLayers />} on={density === "immersed"} onChange={(v) => setDensity(v ? "immersed" : "engaged")} />
          <ControlTile
            label="Full fidelity"
            icon={<IconSpark />}
            on={fidelity === "full"}
            status={fidelity === "full" ? "On" : "Lite"}
            onChange={(v) => setFidelity(v ? "full" : "lite")}
          />
        </div>
        <Slider
          variant="capsule"
          label="Screen corner"
          icon={<IconSliders />}
          value={Math.round(deviceCorners.radius)}
          min={0}
          max={64}
          onChange={(r) => setDeviceRadius(r)}
          format={(v) => `${v} pt`}
        />
      </Card>

      <Card title="Selection" eyebrow="Toggle, checkbox, segmented, slider" headingLevel={2}>
        <Toggle spread label="Toggle" description="Spring thumb with a state glyph." checked={on} onChange={setOn} />
        <Checkbox label="Checkbox" description="The mark draws in." checked={checked} onChange={setChecked} />
        <SegmentedControl
          label="Segmented control"
          value={seg}
          onChange={setSeg}
          options={[
            { value: "leaf", label: "Leaf" },
            { value: "root", label: "Root" },
            { value: "bloom", label: "Bloom" },
          ]}
        />
        <Slider label="Slider" value={val} onChange={setVal} format={(v) => `${v}%`} />
      </Card>

      <Card title="Input" eyebrow="Labels, hints, validation" headingLevel={2}>
        <Input label="Name" placeholder="Your name" description="Shown on your profile." value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={email && !emailOk ? "Enter an address like name@example.com" : undefined}
          description={emailOk ? "Looks good." : undefined}
        />
      </Card>
    </div>
  );
}

/* ── Navigation ─────────────────────────────────────────────── */

function NavigationFamily({ onFamily }: { onFamily: (f: Family) => void }) {
  const notify = useToast();
  const { environment, setEnvironment, density, setDensity } = useBio();
  const [tab, setTab] = useState<"one" | "two" | "three">("one");
  const [rail, setRail] = useState<"home" | "swatch" | "layers">("home");
  const nextDensity = density === "ambient" ? "engaged" : density === "engaged" ? "immersed" : "ambient";
  const importLine = `import { Menu } from "bio-digital";`;

  return (
    <div className={s.gallery}>
      <Card title="Tabs" eyebrow="One travelling indicator" headingLevel={2}>
        <Tabs
          label="Example tabs"
          idBase="ex"
          value={tab}
          onChange={setTab}
          items={[
            { value: "one", label: "Overview" },
            { value: "two", label: "Activity" },
            { value: "three", label: "Settings" },
          ]}
        />
        <TabPanel idBase="ex" value={tab}>
          <p className={`${s.p} ${s.muted}`}>
            {tab === "one" && "Arrow keys move between tabs; Home and End jump to the ends."}
            {tab === "two" && "On narrow screens the strip scrolls, with soft edges showing there is more."}
            {tab === "three" && "The selected tab is always scrolled into view."}
          </p>
        </TabPanel>
      </Card>

      <Card title="Breadcrumbs" eyebrow="Where you are" headingLevel={2}>
        <Breadcrumbs items={[{ label: "Components", onClick: () => onFamily("foundation") }, { label: "Navigation" }]} />
        <p className={`${s.p} ${s.muted} ${s.small}`}>“Components” is a real link: it takes you to the first family.</p>
      </Card>

      <Card title="Menu" eyebrow="Contextual actions" headingLevel={2}>
        <div className={s.row}>
          <Menu
            label="Page actions"
            align="start"
            trigger={(p) => (
              <Button {...p} variant="secondary">
                Open menu
              </Button>
            )}
            items={[
              { label: environment === "night" ? "Switch to day" : "Switch to night", icon: <IconMoon />, onSelect: () => setEnvironment(environment === "night" ? "day" : "night") },
              { label: `Density: ${nextDensity}`, icon: <IconLayers />, onSelect: () => setDensity(nextDensity) },
              { type: "separator" },
              {
                label: "Copy import line",
                icon: <IconLibrary />,
                onSelect: async () => {
                  try {
                    await navigator.clipboard.writeText(importLine);
                    notify({ title: "Copied", description: importLine, status: "success" });
                  } catch {
                    notify({ title: "Couldn't copy", description: "Clipboard access isn't available here.", status: "warning" });
                  }
                },
              },
            ]}
          />
        </div>
      </Card>

      <Card title="NavRail" eyebrow="Rail variant" headingLevel={2}>
        <NavRail
          label="Example rail"
          responsive={false}
          value={rail}
          onChange={setRail}
          items={[
            { value: "home", label: "Home", icon: <IconHome /> },
            { value: "swatch", label: "Colour", icon: <IconSwatch /> },
            { value: "layers", label: "Layers", icon: <IconLayers /> },
          ]}
        />
        <p className={`${s.p} ${s.muted} ${s.small}`}>The dock that navigates this page is the same component with variant=&quot;dock&quot;.</p>
      </Card>
    </div>
  );
}

/* ── Information ────────────────────────────────────────────── */

const springMaterials: Array<{ id: Material; color: string; dashed?: boolean }> = [
  { id: "porcelain", color: "var(--bio-ink-earth)" },
  { id: "membrane", color: "var(--bio-ink-water)" },
  { id: "crystal", color: "var(--bio-ink-air)", dashed: true },
  { id: "carbon", color: "var(--bio-ink-growth)", dashed: true },
];
const cap = (x: string) => x[0].toUpperCase() + x.slice(1);

/**
 * Every figure here is computed from the library's own spring constants
 * (physics.ts), so the data components show real values, not samples.
 */
function InformationFamily() {
  const [mat, setMat] = useState<Material>("membrane");
  const [stack, setStack] = useState(["density", "status", "springs"]);
  const curves = useMemo(
    () => springMaterials.map((m) => ({ ...m, samples: simulateSpring(physics[m.id].spring, { duration: 1.2, sampleEvery: 12 }) })),
    [],
  );
  const labels = curves[0].samples.map((p) => `${Math.round(p.t * 1000)} ms`);
  const settle = Object.fromEntries(springMaterials.map((m) => [m.id, settleTime(physics[m.id].spring)])) as Record<Material, number>;
  const slowest = Math.max(...Object.values(settle));
  const p = physics[mat];
  const z = dampingRatio(p.spring);
  const sel = curves.find((c) => c.id === mat)!;
  const overshoot = Math.max(0, -Math.min(...sel.samples.map((x) => x.x)));

  const tips: Record<string, { title: string; body: string }> = {
    density: { title: "Density reveals detail", body: "Switch to Engaged or Immersed in the header: metrics and panels below reveal more." },
    status: { title: "Never colour alone", body: "Each status has its own glyph and label as well as a hue." },
    springs: { title: "Real numbers", body: "Every figure on this tab comes from the library's spring constants." },
  };

  return (
    <div className={s.grid}>
      <Card className={s.span12} title="Spring inspector" eyebrow="Metric, Gauge, Sparkline" headingLevel={2}>
        <SegmentedControl<Material>
          label="Material"
          value={mat}
          onChange={setMat}
          options={springMaterials.map((m) => ({ value: m.id, label: cap(m.id) }))}
        />
        <div className={s.families}>
          <Metric
            label="Time to rest"
            value={Math.round(settle[mat] * 1000)}
            unit="ms"
            trend={sel.samples.map((x) => 1 - x.x)}
            detail={p.character}
            analysis={`k ${p.spring.stiffness}, c ${p.spring.damping}, m ${p.spring.mass}`}
          />
          <Metric label="Damping ratio" value={z} format={(v) => v.toFixed(2)} detail={z < 0.98 ? "Under-damped: overshoots, then settles." : "Critically damped or above: no overshoot."} />
          <Metric label="Overshoot" value={overshoot * 100} format={(v) => v.toFixed(1)} unit="%" detail="Furthest travel past equilibrium." />
          <div style={{ display: "grid", placeItems: "center" }}>
            <Gauge value={Math.min(z, 1.2)} min={0} max={1.2} label="Damping ratio" valueText={`ζ ${z.toFixed(2)}`} />
          </div>
        </div>
        <Sparkline data={sel.samples.map((x) => x.x)} color={sel.color} />
      </Card>

      <Card className={s.span8} title="Chart" eyebrow="Spring response by material" headingLevel={2}>
        <Chart
          title="Displacement over time"
          summary="Each material released from 1 and settling to 0. Membrane overshoots; carbon does not."
          labels={labels}
          series={curves.map((c) => ({ id: c.id, label: cap(c.id), data: c.samples.map((x) => x.x), color: c.color, dashed: c.dashed }))}
          format={(v) => v.toFixed(2)}
          min={-0.4}
          max={1}
          ticks={5}
        />
      </Card>

      <Card className={s.span4} title="Rings" eyebrow="Settle time vs. slowest" headingLevel={2}>
        <Rings
          label="Time to rest by material"
          rings={springMaterials.map((m) => ({
            id: m.id,
            label: cap(m.id),
            value: settle[m.id] / slowest,
            valueText: `${Math.round(settle[m.id] * 1000)} ms`,
            colors: [m.color, `color-mix(in srgb, ${m.color} 18%, transparent)`],
          }))}
        />
      </Card>

      <DataPanel
        className={s.span6}
        title="DataPanel"
        eyebrow={`${cap(mat)} constants`}
        headingLevel={2}
        items={[
          { label: "Stiffness k", value: p.spring.stiffness },
          { label: "Damping c", value: p.spring.damping },
          { label: "Mass m", value: p.spring.mass, level: "engaged" },
          { label: "Press scale", value: p.pressScale, level: "engaged" },
          { label: "Hover lift", value: `${p.hoverLift} px`, level: "immersed" },
          { label: "Drag elasticity", value: p.dragElastic, level: "immersed" },
        ]}
        footnote="Rows appear as density increases."
      />

      <Card className={s.span6} title="List" eyebrow="Select a row" headingLevel={2}>
        <List
          label="Materials"
          onSelect={(id) => setMat(id as Material)}
          items={springMaterials.map((m) => ({
            id: m.id,
            title: cap(m.id),
            supporting: physics[m.id].character,
            meta: `ζ ${dampingRatio(physics[m.id].spring).toFixed(2)}`,
            trailing: m.id === mat ? <StatusIndicator status="active" label="Selected" /> : undefined,
          }))}
        />
      </Card>

      <Card className={s.span6} title="StatusIndicator" eyebrow="Glyph, label and hue" headingLevel={2}>
        <div className={s.row}>
          <StatusIndicator status="success" label="Success" variant="pill" />
          <StatusIndicator status="warning" label="Warning" variant="pill" />
          <StatusIndicator status="critical" label="Critical" variant="pill" />
          <StatusIndicator status="information" label="Information" variant="pill" />
          <StatusIndicator status="idle" label="Idle" variant="pill" />
          <StatusIndicator status="active" label="Active" variant="pill" />
        </div>
      </Card>

      <Card className={s.span6} title="CardStack" eyebrow="Tap to fan out; dismiss to clear" headingLevel={2}>
        <CardStack
          label="Tips"
          items={stack.map((id) => ({
            id,
            content: (
              <Card title={tips[id].title} headingLevel={3} depth={2} onDismiss={() => setStack((l) => l.filter((x) => x !== id))} dismissLabel={`Dismiss ${tips[id].title}`}>
                <p className={`${s.p} ${s.muted} ${s.small}`}>{tips[id].body}</p>
              </Card>
            ),
          }))}
          empty={
            <div className={s.row}>
              <span className={s.muted}>All clear.</span>
              <Button variant="tertiary" size="compact" onClick={() => setStack(["density", "status", "springs"])}>
                Reset
              </Button>
            </div>
          }
        />
      </Card>
    </div>
  );
}

/* ── Spatial ────────────────────────────────────────────────── */

function SpatialFamily() {
  const notify = useToast();
  const island = useIsland();
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [setting, setSetting] = useState(true);
  const origin = useRef<HTMLButtonElement>(null);

  return (
    <div className={s.gallery}>
      <Card title="Modal" eyebrow="Grows from its trigger" headingLevel={2}>
        <p className={`${s.p} ${s.muted} ${s.small}`}>The page recedes behind it. Focus is trapped, and returns to the button on close.</p>
        <div>
          <Button ref={origin} onClick={() => setModal(true)}>
            Open modal
          </Button>
        </div>
      </Card>
      <Card title="Drawer" eyebrow="Velocity-aware dismissal" headingLevel={2}>
        <p className={`${s.p} ${s.muted} ${s.small}`}>Drag it toward the edge. A quick flick needs less distance than a slow drag.</p>
        <div>
          <Button variant="secondary" onClick={() => setDrawer(true)}>
            Open drawer
          </Button>
        </div>
      </Card>
      <Card title="Popover" eyebrow="Anchored membrane" headingLevel={2}>
        <Popover
          title="Popover"
          align="start"
          trigger={(p) => (
            <Button {...p} variant="secondary">
              Show popover
            </Button>
          )}
        >
          <p className={`${s.p} ${s.small}`} style={{ maxWidth: "32ch" }}>
            A D3 surface that grows from its trigger. Escape or an outside click returns you to where you were.
          </p>
        </Popover>
      </Card>
      <Card title="Toast and Island" eyebrow="Feedback" headingLevel={2}>
        <div className={s.row}>
          <Button variant="secondary" onClick={() => notify({ title: "Saved", description: "Swipe to dismiss, or wait.", status: "success" })}>
            Show toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => island({ title: "Living Island", description: "Expands with continuous geometry, then settles.", status: "information", duration: 3200 })}
          >
            Message the island
          </Button>
        </div>
        <p className={`${s.p} ${s.muted} ${s.small}`}>
          FloatingPanel, the throwable panel with inertia, is in <IconPhysics width={14} height={14} style={{ verticalAlign: "-2px" }} /> Motion.
        </p>
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        originRef={origin}
        title="Spatial expansion"
        description="This surface grew from the button that opened it and will recede back into it."
        footer={<Button onClick={() => setModal(false)}>Done</Button>}
      >
        <p className={`${s.p} ${s.muted}`}>Press Escape, click outside, or use the button.</p>
      </Modal>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Drawer">
        <p className={`${s.p} ${s.muted}`}>Drag the header toward the edge to dismiss.</p>
        <Toggle spread label="Example setting" checked={setting} onChange={setSetting} />
      </Drawer>
    </div>
  );
}
