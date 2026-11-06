import { useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, type PanInfo } from "motion/react";
import {
  Button,
  Card,
  FloatingPanel,
  Slider,
  StatusIndicator,
  Surface,
  Toggle,
  dampingRatio,
  physics,
  reducedTransition,
  settleTime,
  simulateSpring,
  useBioMotion,
  type Material,
  type SpringParams,
} from "../../bio";
import s from "../demo.module.css";

function regime(z: number) {
  if (z < 0.98) return "under-damped: overshoots, then settles";
  if (z <= 1.02) return "critically damped: fastest settle, no overshoot";
  return "over-damped: slow, no overshoot";
}

function SpringCurve({ params, label }: { params: SpringParams; label: string }) {
  const samples = useMemo(() => simulateSpring(params, { duration: 1.6 }), [params]);
  const W = 300;
  const H = 110;
  const d = samples
    .map((p, i) => `${i ? "L" : "M"}${((p.t / 1.6) * W).toFixed(1)},${(H / 2 - p.x * (H / 2 - 8)).toFixed(1)}`)
    .join(" ");
  return (
    <svg className={s.springCurve} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <line className={s.axis} x1="0" x2={W} y1={H / 2} y2={H / 2} />
      <path className={s.curve} d={d} />
    </svg>
  );
}

/** A puck on a track. Drag it or press Release; the spring returns it to equilibrium. */
function Puck({ params, color, label }: { params: SpringParams; color: string; label: string }) {
  const m = useBioMotion("porcelain");
  const x = useMotionValue(0);
  const track = useRef<HTMLDivElement>(null);
  const release = (velocity = 0) => animate(x, 0, m.reduced ? reducedTransition : { type: "spring", ...params, velocity });
  const pluck = () => {
    const w = (track.current?.offsetWidth ?? 300) / 2 - 24;
    x.jump(-w);
    release();
  };
  return (
    <>
      <div ref={track} className={s.track}>
        <span className={s.trackMid} aria-hidden="true" />
        <motion.span
          className={s.puck}
          style={{ x, background: color, borderRadius: "50%", boxShadow: "var(--bio-depth-2)", cursor: "grab", touchAction: "none" }}
          drag="x"
          dragConstraints={track}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={(_: unknown, info: PanInfo) => release(info.velocity.x)}
          aria-hidden="true"
        />
      </div>
      <Button variant="secondary" size="compact" onClick={pluck} aria-label={`Release ${label} spring`}>
        Release
      </Button>
    </>
  );
}

const materials: Array<{ id: Material; color: string }> = [
  { id: "porcelain", color: "var(--bio-color-stone)" },
  { id: "membrane", color: "var(--bio-color-water)" },
  { id: "crystal", color: "var(--bio-color-air)" },
  { id: "carbon", color: "var(--bio-color-carbon)" },
];

const flickCards = [
  { id: "f1", title: "Fling me", body: "A quick flick dismisses with little travel." },
  { id: "f2", title: "Or drag slowly", body: "A slow drag must travel further before it lets go." },
  { id: "f3", title: "Release early", body: "Not far enough? It springs back to equilibrium." },
  { id: "f4", title: "Keyboard too", body: "The × button does the same thing without a gesture." },
];

export function PhysicsLab() {
  const { reduced } = useBioMotion();
  const [k, setK] = useState(260);
  const [c, setC] = useState(18);
  const [mass, setMass] = useState(0.8);
  const [stack, setStack] = useState(flickCards);
  const [showPanel, setShowPanel] = useState(true);
  const arena = useRef<HTMLDivElement>(null);
  const tuned = useMemo(() => ({ stiffness: k, damping: c, mass }), [k, c, mass]);
  const z = dampingRatio(tuned);

  return (
    <div className={s.grid}>
      <Card className={s.span12} title="Motion is caused by forces" eyebrow="Spring-damper model" headingLevel={2} material="crystal" depth={2}>
        <div className={s.row} style={{ gap: "var(--bio-space-3)" }}>
          <code className={s.formula}>F = −kx − cv</code>
          <code className={s.formula}>a = F / m</code>
          <span className={s.muted} style={{ fontSize: "var(--bio-type-supporting)", maxWidth: "70ch" }}>
            Stiffness k pulls toward equilibrium, damping c resists velocity, and mass m sets inertia. Each material gets its own constants, so a
            membrane wobbles where crystal stays precise.
          </span>
        </div>
        {reduced && (
          <div style={{ marginTop: "var(--bio-space-3)" }}>
            <StatusIndicator status="information" label="Reduced motion is on: springs become short transitions. The curves still show the physics." />
          </div>
        )}
      </Card>

      {materials.map(({ id, color }) => {
        const p = physics[id];
        return (
          <Card key={id} className={s.span3} eyebrow="Material" title={id[0].toUpperCase() + id.slice(1)} headingLevel={2} material={id === "carbon" ? "carbon" : id === "membrane" ? "membrane" : id === "crystal" ? "crystal" : "porcelain"}>
            <p className={`${s.p} ${s.muted} ${s.small}`}>{p.character}</p>
            <SpringCurve params={p.spring} label={`${id} spring response: ${regime(dampingRatio(p.spring))}`} />
            <div className={s.facts}>
              <span>
                <strong>{p.spring.stiffness}</strong>k
              </span>
              <span>
                <strong>{p.spring.damping}</strong>c
              </span>
              <span>
                <strong>{p.spring.mass}</strong>m
              </span>
              <span>
                <strong>ζ {dampingRatio(p.spring).toFixed(2)}</strong>damping ratio
              </span>
              <span>
                <strong>{Math.round(settleTime(p.spring) * 1000)} ms</strong>to rest
              </span>
            </div>
            <Puck params={p.spring} color={color} label={id} />
          </Card>
        );
      })}

      <Card className={s.span7} title="Tune a spring" eyebrow="Interactive" headingLevel={2}>
        <div className={s.controlsStack}>
          <Slider label="Stiffness (k)" value={k} min={40} max={800} step={10} onChange={setK} />
          <Slider label="Damping (c)" value={c} min={2} max={80} step={1} onChange={setC} />
          <Slider label="Mass (m)" value={mass} min={0.2} max={4} step={0.1} onChange={setMass} format={(v) => v.toFixed(1)} />
        </div>
        <SpringCurve params={tuned} label={`Tuned spring: ${regime(z)}`} />
        <div className={s.facts}>
          <span>
            <strong>ζ {z.toFixed(2)}</strong>
            {regime(z)}
          </span>
          <span>
            <strong>{Math.round(settleTime(tuned) * 1000)} ms</strong>to equilibrium
          </span>
        </div>
        <Puck params={tuned} color="var(--bio-primary)" label="tuned" />
      </Card>

      <Card className={s.span5} title="Velocity decides" eyebrow="Gesture interpretation" headingLevel={2}>
        <p className={`${s.p} ${s.muted} ${s.small}`}>
          Release position is projected forward by velocity, so intent matters more than coordinates.
        </p>
        <div className={s.stack}>
          <AnimatePresence>
            {stack.map((card, i) => {
              const behind = stack.length - 1 - i;
              const top = behind === 0;
              return (
                <motion.div
                  key={card.id}
                  style={{ zIndex: i, alignSelf: "end" }}
                  initial={false}
                  animate={{ y: behind * -10, scale: 1 - behind * 0.04 }}
                  exit={{ opacity: 0 }}
                  transition={reduced ? reducedTransition : { type: "spring", ...physics.porcelain.spring }}
                  aria-hidden={!top || undefined}
                  inert={!top || undefined}
                >
                  <Card
                    depth={top ? 3 : 1}
                    title={card.title}
                    headingLevel={3}
                    onDismiss={() => setStack((l) => l.filter((x) => x.id !== card.id))}
                    dismissLabel={`Dismiss ${card.title}`}
                  >
                    <p className={`${s.p} ${s.muted}`}>{card.body}</p>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {stack.length === 0 && (
            <Surface material="porcelain" depth={0} radius="r4" className={s.empty}>
              All settled.
            </Surface>
          )}
        </div>
        <div>
          <Button variant="tertiary" size="compact" onClick={() => setStack(flickCards)}>
            Reset stack
          </Button>
        </div>
      </Card>

      <Card className={s.span12} title="Inertia and boundaries" eyebrow="Floating panel" headingLevel={2} actions={<Toggle label="Show panel" checked={showPanel} onChange={setShowPanel} />}>
        <div ref={arena} className={s.arena}>
          {showPanel && (
            <FloatingPanel title="Membrane panel" constraintsRef={arena} initial={{ x: 24, y: 24 }}>
              <p className={`${s.p} ${s.small}`}>
                Throw me by my handle. I glide, slow under friction, and meet soft resistance at the edges before settling.
              </p>
            </FloatingPanel>
          )}
          <p className={s.arenaHint}>Arrow keys on the handle move it in 16 px steps (Shift for 48 px).</p>
        </div>
      </Card>
    </div>
  );
}
