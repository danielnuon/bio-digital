import { Card, Divider, Surface, type Depth } from "../../bio";
import s from "../demo.module.css";

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

export function Foundations() {
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

