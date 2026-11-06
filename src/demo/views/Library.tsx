import { useRef, useState } from "react";
import {
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Divider,
  Drawer,
  Input,
  List,
  Menu,
  Modal,
  Popover,
  SegmentedControl,
  Slider,
  StatusIndicator,
  Surface,
  TabPanel,
  Tabs,
  Toggle,
  useToast,
  type Depth,
  type Material,
} from "../../bio";
import { IconBolt, IconDownload, IconLeaf, IconMore, IconRefresh } from "../icons";
import s from "../demo.module.css";

type Section = "principles" | "foundations" | "materials" | "components";

export function Library() {
  const [section, setSection] = useState<Section>("principles");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--bio-density-gap)" }}>
      <Tabs<Section>
        label="Library sections"
        idBase="lib"
        value={section}
        onChange={setSection}
        items={[
          { value: "principles", label: "Principles" },
          { value: "foundations", label: "Foundations" },
          { value: "materials", label: "Materials" },
          { value: "components", label: "Components" },
        ]}
      />
      <TabPanel idBase="lib" value={section} style={{ outline: "none" }}>
        {section === "principles" && <Principles />}
        {section === "foundations" && <Foundations />}
        {section === "materials" && <Materials />}
        {section === "components" && <Components />}
      </TabPanel>
    </div>
  );
}

const pillars = [
  ["Fluidity", "Segmented controls, tabs and the nav rail move one continuous indicator instead of swapping states. Chart ranges morph rather than redraw."],
  ["Reactivity", "Buttons compress and recover, cards lift on proximity, inputs glow with focus. Every response matches the input's intensity."],
  ["Spatiality", "Five depth levels (D0–D4). Modals grow from the row you opened them from, and the page recedes behind them."],
  ["Organicism", "Organic contours on the hero and brand mark, capsule controls, and monotone curves that never overshoot the data."],
  ["Serenity", "Neutral porcelain foundation, accents only where they carry meaning, and a calm type scale built on system fonts."],
  ["Vitality", "Ambient forms drift on a 24-second cycle, the active status breathes, and readings update every four seconds."],
  ["Continuous Vitality", "Idle is a state, not an absence: static depth and light keep presence, and work pauses when the tab is hidden."],
];

function Principles() {
  return (
    <div className={s.pillars}>
      {pillars.map(([name, body], i) => (
        <Card key={name} eyebrow={<span className={s.pillarIndex}>Pillar {String(i + 1).padStart(2, "0")}</span>} title={name} headingLevel={2} interactive>
          <p className={`${s.p} ${s.muted}`}>{body}</p>
        </Card>
      ))}
      <Card material="carbon" title="Alive by nature. Governed by physics." headingLevel={2} depth={2}>
        <p className={`${s.p} ${s.muted}`}>Nothing is static. Everything has presence. Everything responds.</p>
      </Card>
    </div>
  );
}

const neutral = [
  ["Cloud", "--bio-color-cloud", "#F7F8F5"],
  ["Mist", "--bio-color-mist", "#ECEFEB"],
  ["Stone", "--bio-color-stone", "#D9DFDA"],
  ["Sage", "--bio-color-sage", "#AAB5AE"],
  ["Carbon", "--bio-color-carbon", "#252D2B"],
];
const accents = [
  ["Growth", "--bio-color-growth", "#A7CFBA"],
  ["Air", "--bio-color-air", "#A9BCE2"],
  ["Bloom", "--bio-color-bloom", "#C7B6DF"],
  ["Earth", "--bio-color-earth", "#D9C99C"],
  ["Water", "--bio-color-water", "#A5C7CB"],
];
const functional = [
  ["Success", "--bio-success", "fill"],
  ["Warning", "--bio-warning", "fill"],
  ["Critical", "--bio-critical", "fill"],
  ["Information", "--bio-information", "fill"],
];

function Swatches({ items }: { items: string[][] }) {
  return (
    <div className={s.swatches}>
      {items.map(([name, token, hex]) => (
        <Surface key={token} material="porcelain" depth={1} radius="r3" className={s.swatch}>
          <div className={s.swatchColor} style={{ background: `var(${token})` }} />
          <div className={s.swatchMeta}>
            <strong>{name}</strong>
            <span className={s.code}>{hex === "fill" ? token : hex}</span>
          </div>
        </Surface>
      ))}
    </div>
  );
}

const typeScale: Array<[string, string, number]> = [
  ["Display", "--bio-type-display", 600],
  ["H1", "--bio-type-h1", 600],
  ["H2", "--bio-type-h2", 600],
  ["H3", "--bio-type-h3", 600],
  ["Title", "--bio-type-title", 600],
  ["Body", "--bio-type-body", 400],
  ["Supporting", "--bio-type-supporting", 400],
  ["Caption", "--bio-type-caption", 400],
];

function Foundations() {
  return (
    <div className={s.grid}>
      <Card className={s.span12} title="Colour" eyebrow="Neutral foundation · organic accents · functional" headingLevel={2}>
        <Swatches items={neutral} />
        <Divider />
        <Swatches items={accents} />
        <Divider />
        <Swatches items={functional} />
        <p className={`${s.p} ${s.muted} ${s.small}`}>
          Functional hues are used for fills and indicators. Text uses matching <code>*-ink</code> tokens, which keep the same meaning at 4.5:1 or
          better in each environment. That is a documented exception to the base palette.
        </p>
      </Card>
      <Card className={s.span7} title="Typography" eyebrow="System font stack, rem-based" headingLevel={2}>
        <div>
          {typeScale.map(([role, token, weight]) => (
            <div key={role} className={s.typeRow}>
              <span className={s.code}>{role}</span>
              <span style={{ fontSize: `var(${token})`, fontWeight: weight, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Naturally alive
              </span>
            </div>
          ))}
        </div>
      </Card>
      <Card className={s.span5} title="Geometry" eyebrow="Radius follows scale" headingLevel={2}>
        <div className={s.radii}>
          {(["r1", "r2", "r3", "r4", "r5", "r6", "pill", "organic"] as const).map((r) => (
            <div key={r} className={s.radiusTile}>
              <Surface material="porcelain" depth={1} radius={r} className={s.radiusBox} style={{ background: "var(--bio-accent-soft)" }} />
              <span className={s.code}>{r.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className={s.span12} title="Depth" eyebrow="D0 environment → D4 focused" headingLevel={2}>
        <div className={s.depths}>
          {(["Environment", "Surface", "Elevated", "Floating", "Focused"] as const).map((name, i) => (
            <Surface key={name} material="porcelain" depth={i as Depth} radius="r4" className={s.depthTile} style={i === 0 ? { background: "transparent" } : undefined}>
              <span>
                <strong>D{i}</strong>
                <br />
                <span className={s.muted}>{name}</span>
              </span>
            </Surface>
          ))}
        </div>
      </Card>
    </div>
  );
}

const materialInfo: Array<[Material, string, string]> = [
  ["porcelain", "Porcelain", "Matte, neutral, stable. The default for content and cards."],
  ["membrane", "Membrane", "Translucent and diffused. For floating panels and navigation layers. Turns opaque when transparency is reduced."],
  ["crystal", "Crystal", "Clear and reflective. An accent for meaningful emphasis. Hover to see the controlled highlight."],
  ["carbon", "Carbon", "Deep and grounding. A contrast anchor that re-scopes text tokens for legibility."],
];

function Materials() {
  return (
    <div className={s.materialStage}>
      <div className={s.materials}>
        {materialInfo.map(([m, name, body]) => (
          <Surface key={m} material={m} depth={m === "crystal" ? 3 : 2} radius="r4" padding="md" className={s.materialTile}>
            <span className={s.code}>material=&quot;{m}&quot;</span>
            <h4>{name}</h4>
            <p className={`${s.p} ${s.small}`} style={{ color: "var(--bio-text-muted)" }}>
              {body}
            </p>
          </Surface>
        ))}
      </div>
    </div>
  );
}

function Components() {
  const notify = useToast();
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const origin = useRef<HTMLButtonElement>(null);
  const [on, setOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [seg, setSeg] = useState<"leaf" | "root" | "bloom">("root");
  const [val, setVal] = useState(40);
  const [email, setEmail] = useState("not-an-email");

  return (
    <div className={s.gallery}>
      <Card title="Button" eyebrow="Interaction" headingLevel={2}>
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
          <Button loading loadingLabel="Saving">
            Save
          </Button>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" motion="reduced">
            Reduced motion
          </Button>
          <Button variant="secondary" iconOnly icon={<IconBolt />} aria-label="Boost" />
        </div>
      </Card>

      <Card title="Selection" eyebrow="Interaction" headingLevel={2}>
        <Toggle spread label="Toggle" description="Spring thumb with a state glyph." checked={on} onChange={setOn} />
        <Checkbox label="Checkbox" description="The mark draws in." checked={checked} onChange={setChecked} />
        <SegmentedControl
          label="Layer"
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

      <Card title="Input" eyebrow="Interaction" headingLevel={2}>
        <Input label="Zone name" placeholder="e.g. Fern gully" description="Shown on every dashboard." />
        <Input
          label="Alert email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={/^\S+@\S+\.\S+$/.test(email) ? undefined : "Enter an address like name@example.com"}
        />
      </Card>

      <Card title="Navigation" eyebrow="Navigation" headingLevel={2}>
        <Breadcrumbs items={[{ label: "Habitat", onClick: () => {} }, { label: "Zones", onClick: () => {} }, { label: "Seed nursery" }]} />
        <div className={s.row}>
          <Menu
            label="Zone actions"
            align="start"
            trigger={(p) => (
              <Button {...p} variant="secondary" icon={<IconMore />}>
                Contextual menu
              </Button>
            )}
            items={[
              { label: "Export data", icon: <IconDownload />, onSelect: () => notify({ title: "Exported", status: "success" }) },
              { label: "Recalibrate", icon: <IconRefresh />, onSelect: () => notify({ title: "Recalibrating", status: "information" }) },
              { type: "separator" },
              { label: "Remove zone", destructive: true, onSelect: () => notify({ title: "Removal needs confirmation", status: "warning" }) },
            ]}
          />
        </div>
      </Card>

      <Card title="Spatial" eyebrow="Spatial" headingLevel={2}>
        <div className={s.row}>
          <Button ref={origin} onClick={() => setModal(true)}>
            Open modal
          </Button>
          <Button variant="secondary" onClick={() => setDrawer(true)}>
            Open drawer
          </Button>
          <Popover
            title="Popover"
            align="start"
            trigger={(p) => (
              <Button {...p} variant="secondary">
                Popover
              </Button>
            )}
          >
            <p className={`${s.p} ${s.small}`} style={{ maxWidth: "32ch" }}>
              A D3 membrane that grows from its trigger. Escape or an outside click returns you to where you were.
            </p>
          </Popover>
          <Button variant="tertiary" onClick={() => notify({ title: "Contextual overlay", description: "Swipe right to dismiss, or wait.", status: "information" })}>
            Toast
          </Button>
        </div>
      </Card>

      <Card title="Status" eyebrow="Information" headingLevel={2}>
        <div className={s.row}>
          <StatusIndicator status="success" label="Success" variant="pill" />
          <StatusIndicator status="warning" label="Warning" variant="pill" />
          <StatusIndicator status="critical" label="Critical" variant="pill" />
          <StatusIndicator status="information" label="Information" variant="pill" />
          <StatusIndicator status="idle" label="Idle" variant="pill" />
          <StatusIndicator status="active" label="Active" variant="pill" />
        </div>
        <p className={`${s.p} ${s.muted} ${s.small}`}>Each state has its own glyph and label, so colour is never the only signal.</p>
      </Card>

      <Card title="List" eyebrow="Information" headingLevel={2}>
        <List
          items={[
            { id: "1", leading: <span className={s.zoneDot}><IconLeaf /></span>, title: "Moss wall", supporting: "Engaged density adds this line", meta: "Immersed adds this", trailing: <StatusIndicator status="success" label="OK" /> },
            { id: "2", leading: <span className={s.zoneDot}><IconLeaf /></span>, title: "Fern gully", supporting: "Rows grow taller at Ambient", meta: "48 px at Immersed", trailing: <StatusIndicator status="warning" label="Dry" /> },
          ]}
        />
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        originRef={origin}
        title="Spatial expansion"
        description="This surface grew from the button that opened it and will recede back into it."
        footer={<Button onClick={() => setModal(false)}>Got it</Button>}
      >
        <p className={`${s.p} ${s.muted}`}>Focus is trapped here until you close it, and then returns to the button.</p>
      </Modal>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Drawer">
        <p className={`${s.p} ${s.muted}`}>Drag the header toward the edge. A quick flick needs less distance than a slow drag.</p>
        <Toggle spread label="Example setting" checked={on} onChange={setOn} />
      </Drawer>
    </div>
  );
}
