import s from "./orb.module.css";

/**
 * The habitat's pulse: a living form whose light follows the environment's
 * mood (the same --bio-mood-* tokens as the canvas). Transform-only motion
 * on long, unsynchronised periods so it never reads as a loop.
 */
export function Orb({ size = 240 }: { size?: number }) {
  return (
    <div className={s.orb} style={{ width: size, height: size }} aria-hidden="true">
      <span className={`${s.blob} ${s.b1}`} />
      <span className={`${s.blob} ${s.b2}`} />
      <span className={`${s.blob} ${s.b3}`} />
      <span className={s.core} />
      <span className={s.gloss} />
    </div>
  );
}
