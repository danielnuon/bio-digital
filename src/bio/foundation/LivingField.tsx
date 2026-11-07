import { useEffect, useRef } from "react";

/**
 * The living gradient (§4.3) as a slow, flowing field rendered on the GPU.
 *
 * Colours are not hard-coded: each frame eases toward the environment's
 * current tokens (--bio-canvas and the three --bio-mood-* lights), so a
 * change of environment or mood flows through the field instead of
 * snapping. Cost is kept flat: the field renders at a fraction of screen
 * resolution (it is all low frequency), caps at 30 fps (the motion is slow), and stops when the
 * tab is hidden. Under reduced motion it draws a single still frame.
 */
export interface LivingFieldProps {
  /** Draw one still frame and stop. */
  still?: boolean;
  /** Called once if WebGL is unavailable, so the caller can fall back to CSS. */
  onUnsupported?: () => void;
  className?: string;
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Domain-warped fractal noise: two passes of warping give the slow, folding
// movement of ink in water rather than the drift of separate blobs.
const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec3 base;
uniform vec4 ca, cb, cc;
uniform vec2 view;
uniform float sheen;
uniform float top;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=uv*vec2(r.x/r.y,1.)*1.35+view*.08;
  float s=t*.008;
  vec2 q=vec2(fbm(p+vec2(0.,s)),fbm(p+vec2(5.2,1.3)-s));
  vec2 w=vec2(fbm(p+2.6*q+vec2(1.7,9.2)+s*1.4),fbm(p+2.6*q+vec2(8.3,2.8)-s*.9));
  float f=fbm(p+2.2*w);
  vec3 c=base;
  c=mix(c,ca.rgb,ca.a*smoothstep(.32,.82,w.x));
  c=mix(c,cb.rgb,cb.a*smoothstep(.38,.88,w.y));
  c=mix(c,cc.rgb,cc.a*smoothstep(.42,.9,f));
  // silk: thin bright folds along the field's contours, like light on satin
  float fold=pow(1.-abs(sin(f*9.4+view.x*1.5+s*3.)),14.);
  c+=sheen*fold;
  // daylight from above
  c=mix(c,vec3(1.),top*smoothstep(.9,0.,length((uv-vec2(.5,1.18))*vec2(.9,1.6))));
  c+=(h(gl_FragCoord.xy+t)-.5)/255.;
  gl_FragColor=vec4(c,1.);
}`;

type RGBA = [number, number, number, number];

/**
 * Environment map for surfaces (see tokens/finish.css, "reflection").
 * --bio-env-image: the field at low strength, for a surface's body.
 * --bio-env-light: the field brightened, for the light caught at its edges.
 */
let snap: HTMLCanvasElement | null = null;
function publishEnvironment(src: HTMLCanvasElement) {
  try {
    snap ??= document.createElement("canvas");
    snap.width = 48;
    snap.height = 32;
    const ctx = snap.getContext("2d");
    if (!ctx) return;
    const root = document.documentElement.style;
    ctx.clearRect(0, 0, 48, 32);
    ctx.globalAlpha = 0.34;
    ctx.filter = "saturate(1.4)";
    ctx.drawImage(src, 0, 0, 48, 32);
    root.setProperty("--bio-env-image", `url(${snap.toDataURL("image/png")})`);
    ctx.clearRect(0, 0, 48, 32);
    ctx.globalAlpha = 1;
    ctx.filter = "brightness(1.5) saturate(1.6)";
    ctx.drawImage(src, 0, 0, 48, 32);
    root.setProperty("--bio-env-light", `url(${snap.toDataURL("image/png")})`);
  } catch {
    /* no environment map; surfaces keep their own light */
  }
}

const probe = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null;
function parseColor(value: string, fallback: RGBA): RGBA {
  if (!probe || !value) return fallback;
  probe.fillStyle = "#000";
  probe.fillStyle = value.trim();
  const v = String(probe.fillStyle);
  if (v.startsWith("#")) {
    const n = parseInt(v.slice(1), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
  }
  const m = v.match(/[\d.]+/g);
  if (!m) return fallback;
  return [+m[0] / 255, +m[1] / 255, +m[2] / 255, m[3] !== undefined ? +m[3] : 1];
}

export function LivingField({ still = false, onUnsupported, className }: LivingFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: false });
    if (!gl) {
      onUnsupported?.();
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      onUnsupported?.();
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const U = { r: u("r"), t: u("t"), base: u("base"), ca: u("ca"), cb: u("cb"), cc: u("cc"), view: u("view"), sheen: u("sheen"), top: u("top") };

    // Low-frequency field: a fifth of CSS resolution is visually identical.
    const SCALE = 0.2;
    const resize = () => {
      const w = Math.max(1, Math.round(window.innerWidth * SCALE));
      const hgt = Math.max(1, Math.round(window.innerHeight * SCALE));
      if (canvas.width !== w || canvas.height !== hgt) {
        canvas.width = w;
        canvas.height = hgt;
        gl.viewport(0, 0, w, hgt);
      }
    };

    // Colours ease toward the current tokens (environment and mood changes flow).
    const host = canvas.closest("[data-bio-mood]") ?? document.documentElement;
    const cur = { base: [0.97, 0.97, 0.96, 1] as RGBA, a: [0, 0, 0, 0] as RGBA, b: [0, 0, 0, 0] as RGBA, c: [0, 0, 0, 0] as RGBA, sheen: 0, top: 0 };
    let target = { ...cur };
    let first = true;
    // When to publish the environment map next (ms timestamp; see below).
    let publishAt = 0;
    let sig = "";
    const read = () => {
      const cs = getComputedStyle(host);
      const night = !!host.closest('[data-bio-environment="night"]');
      target = {
        base: parseColor(cs.getPropertyValue("--bio-canvas"), cur.base),
        a: parseColor(cs.getPropertyValue("--bio-mood-a"), cur.a),
        b: parseColor(cs.getPropertyValue("--bio-mood-b"), cur.b),
        c: parseColor(cs.getPropertyValue("--bio-mood-c"), cur.c),
        sheen: 0,
        top: night ? 0 : 0.6,
      };
      if (first) {
        Object.assign(cur, target);
        first = false;
      }
      // Tokens changed: publish once the colours have eased (~1.5 s).
      const next = JSON.stringify([target.base, target.a, target.b, target.c, target.top]);
      if (next !== sig) {
        if (sig) {
          // The old map belongs to the previous environment: a day map on
          // night surfaces washes them out. Drop it now, republish once the
          // colours have eased (time-based, so slow devices wait as long).
          const root = document.documentElement.style;
          root.removeProperty("--bio-env-image");
          root.removeProperty("--bio-env-light");
          publishAt = performance.now() + 1700;
        }
        sig = next;
      }
    };
    const ease = (from: RGBA, to: RGBA, k: number) => from.map((v, i) => v + (to[i] - v) * k) as RGBA;

    const view = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      view.tx = (e.clientX / window.innerWidth) * 2 - 1;
      view.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    let frames = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      raf = 0;
      if (!still && now - last < 32) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      if (frames++ % 20 === 0) read();
      const k = still ? 1 : 0.06;
      cur.base = ease(cur.base, target.base, k);
      cur.a = ease(cur.a, target.a, k);
      cur.b = ease(cur.b, target.b, k);
      cur.c = ease(cur.c, target.c, k);
      cur.sheen += (target.sheen - cur.sheen) * k;
      cur.top += (target.top - cur.top) * k;
      view.x += (view.tx - view.x) * 0.04;
      view.y += (view.ty - view.y) * 0.04;
      resize();
      gl.uniform2f(U.r, canvas.width, canvas.height);
      gl.uniform1f(U.t, still ? 40 : 40 + (now - t0) / 1000);
      gl.uniform3f(U.base, cur.base[0], cur.base[1], cur.base[2]);
      gl.uniform4fv(U.ca, cur.a);
      gl.uniform4fv(U.cb, cur.b);
      gl.uniform4fv(U.cc, cur.c);
      gl.uniform2f(U.view, view.x, view.y);
      gl.uniform1f(U.sheen, cur.sheen);
      gl.uniform1f(U.top, cur.top);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      // Publish what the environment looks like, so surfaces can reflect it.
      // Only at start and after a change of environment or mood: each
      // publish swaps an image on every surface, which costs a repaint of
      // all of them, so a periodic refresh showed up as a regular hitch.
      if (still || (publishAt >= 0 && now >= publishAt)) {
        publishEnvironment(canvas);
        publishAt = -1;
      }
      if (!still && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const onVisible = () => {
      if (!document.hidden && !raf && !still) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisible);
    // Re-read tokens promptly when the environment or mood attribute changes.
    const mo = new MutationObserver(() => {
      read();
      if (still && !raf) raf = requestAnimationFrame(draw);
    });
    mo.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-bio-environment", "data-bio-mood"] });
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisible);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [still, onUnsupported]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
