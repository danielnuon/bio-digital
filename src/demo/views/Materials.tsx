import { Card, SegmentedControl, StatusIndicator, Surface, useBio, type Finish, type Material } from "../../bio";
import type { Mood } from "../App";
import s from "../demo.module.css";

const materialInfo: Array<[Material, string, string]> = [
  ["porcelain", "Porcelain", "Matte, neutral, stable. The default for content and cards."],
  ["membrane", "Membrane", "Translucent and diffused. For floating panels and navigation layers. Turns opaque when transparency is reduced."],
  ["crystal", "Crystal", "Clear and reflective. An accent for meaningful emphasis. Hover to see the controlled highlight."],
  ["carbon", "Carbon", "Deep and grounding. A contrast anchor that re-scopes text tokens for legibility."],
];

const finishInfo: Array<[Finish, string]> = [
  ["satin", "Low sheen for supporting surfaces."],
  ["pearl", "A tonal tri-coat: colour appears only at an angle."],
  ["chroma", "Colour-shift: the hue travels across the surface."],
  ["candy", "A deep, wet tint over the base."],
];

export function Materials({ mood, onMood }: { mood: Mood; onMood: (m: Mood) => void }) {
  const { fidelity, environment } = useBio();
  return (
    <div className={s.grid}>
      <div className={`${s.span12} ${s.materials}`}>
        {materialInfo.map(([m, name, body]) => (
          <Surface key={m} material={m} depth={m === "crystal" ? 3 : 2} radius="r4" padding="md" className={s.materialTile}>
            <span className={s.code}>material=&quot;{m}&quot;</span>
            <h2 className={s.h3}>{name}</h2>
            <p className={`${s.p} ${s.small}`} style={{ color: "var(--bio-text-muted)" }}>
              {body}
            </p>
          </Surface>
        ))}
      </div>

      <Card className={s.span12} title="Finishes" eyebrow="Layered like automotive paint" headingLevel={2}>
        <p className={`${s.p} ${s.muted} ${s.small}`}>
          A finish is a stack: base, tonal pearl, reflection of the environment, and clearcoat. Every surface also carries the colour of the field
          behind it at its edge. With device tilt on (Preferences), pearl and chroma shift with the angle you hold the screen at.
        </p>
        <div className={s.materials}>
          {finishInfo.map(([f, body]) => (
            <Surface key={f} material="porcelain" finish={f} depth={2} radius="r4" padding="md" className={s.materialTile}>
              <span className={s.code}>finish=&quot;{f}&quot;</span>
              <h3 className={s.h3}>{f[0].toUpperCase() + f.slice(1)}</h3>
              <p className={`${s.p} ${s.small}`} style={{ color: "var(--bio-text-muted)" }}>
                {body}
              </p>
            </Surface>
          ))}
        </div>
        {fidelity !== "full" && <StatusIndicator status="information" label="Finishes and reflections appear at full fidelity. This device is using reduced fidelity." />}
      </Card>

      <Card className={s.span12} title="Environment response" eyebrow="Canvas mood" headingLevel={2}>
        <p className={`${s.p} ${s.muted} ${s.small}`}>
          The background is a living field that eases toward the current environment ({environment}) and mood. Change the mood and watch the field
          and every surface's reflection follow, over about a second and a half.
        </p>
        <SegmentedControl<Mood>
          label="Mood"
          value={mood}
          onChange={onMood}
          options={[
            { value: "calm", label: "Calm" },
            { value: "attention", label: "Attention" },
          ]}
        />
      </Card>
    </div>
  );
}
