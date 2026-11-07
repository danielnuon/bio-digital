# BIO DIGITAL

*Technology, naturally alive.*

A React component library implementing the BIO DIGITAL design language (v1.0, November 2026), plus a showcase app that demonstrates every component working, wired to real state rather than mock data.

```bash
npm install
npm run dev        # showcase at http://localhost:5173
npm test           # physics unit tests + axe accessibility checks on every view
npm run build      # typecheck + production build of the demo
npm run build:lib  # library bundle (dist-lib/) with type declarations
```

## Stack (spec §21.1)

React · CSS Modules · design tokens as CSS custom properties · Motion for React for springs · SVG for charts and organic forms · no custom physics engine.

## Structure

```
src/bio/                 the library
  tokens/                color, typography, spacing, geometry, motion, density (tokens.css)
                         day/night environments, materials, depth (environment.css)
  physics/               spring-damper model, material physics, gesture projection
  context/BioProvider    environment, density, motion and fidelity (the Intelligence layer)
  foundation/            Canvas, Recede, Surface, Container, Stack, Divider, MaterialLayer, OrganicShape
  interaction/           Button, Toggle, Slider, Input, Checkbox, SegmentedControl
  navigation/            Tabs, NavRail, Breadcrumbs, Menu
  information/           Card, List, Metric, Chart, Sparkline, StatusIndicator, DataPanel, Gauge
  spatial/               Modal, Drawer, Popover, FloatingPanel, Toast
src/demo/                showcase: Overview, Foundations, Materials, Motion, Components (by family)
```

## Usage

```tsx
import { BioProvider, Canvas, Card, Metric, Button } from "bio-digital";
import "bio-digital/styles.css";

<BioProvider environment="system" density="engaged" motion="system">
  <Canvas>
    <Card title="Power draw">
      <Metric label="Now" value={46.2} unit="kW" detail="Below the comfort ceiling." />
    </Card>
    <Button variant="primary">Review zones</Button>
  </Canvas>
</BioProvider>
```

## How the spec maps to code

| Spec | Implementation |
| --- | --- |
| §5 Materials | `material="porcelain" \| "membrane" \| "crystal" \| "carbon"` on `Surface`/`Card`. Each material carries its own physics (`physics.ts`), so look and behaviour change together but are defined separately (§21.3). |
| §8 Depth | `depth={0–4}` maps to D0–D4 shadow tokens from one consistent light source. Open modals and drawers make the page behind recede (`Recede`). |
| §11 Physics | Spring constants per material, with damping ratios from 0.62 (membrane) to 1.0 (carbon). `simulateSpring` integrates F = −kx − cv for the Physics lab. `shouldDismiss` projects release velocity so a flick dismisses with less travel (§12.7). |
| §13 Propagation | Card expansion and dismissal use Motion layout, so neighbours inside the same `LayoutGroup` move into place. Unrelated content stays still. |
| §14 Vitality | A slow living background field (WebGL, 30 fps cap, paused while the tab is hidden) that eases toward each environment and mood, and a breathing active status. |
| §15 Density | `data-bio-density` changes spacing and row height; `Metric`, `List` and `DataPanel` reveal more at Engaged and Immersed. `DataPanel` always has an explicit "Show more" control. |
| §17 Environments | Day and night re-define every semantic token separately; night never uses pure black. `carbon` surfaces re-scope tokens to night for legibility. |
| §18 Accessibility | Native inputs underneath every custom control, visible focus rings, 44 px targets (hit areas extended on compact controls), roving focus for tabs and menus, focus trap and restore for modals/drawers, keyboard alternatives for every gesture, and a hidden data table plus arrow-key exploration for charts. |
| §18.2 Reduced motion | `motion="system"` follows `prefers-reduced-motion`; users can also override it. Reduced mode swaps springs for 140 ms tweens, stops ambient drift, and turns off drag gestures (their buttons remain). |
| §19.3 Fidelity | `data-bio-fidelity="lite"` (detected from Save-Data or low memory, or set by the user) drops backdrop blur and ambient forms. `prefers-reduced-transparency` makes membranes opaque. |
| §20 Performance | Animations use transform and opacity. Animated numbers and the slider write to motion values, not React state. Backdrop blur is limited to membrane surfaces. |

## Device-aware corners

Edge chrome (the dock, bottom sheets, drawers) is drawn concentric with the device's physical display corner. `detectDeviceCorners()` estimates the iPhone display radius from the screen size, and hosts that know the exact value can pass `<BioProvider deviceRadius={...}>`. Continuous (squircle) curves use `corner-shape` where it is supported, and a `clip-path` fallback otherwise. See [docs/design-review.md](docs/design-review.md) for the method and its limits.

## Design review

[docs/design-review.md](docs/design-review.md) audits v1 against the spec, angle by angle: what the spec intended, what v1 showed, the pain point, and the v2 change.

## Documented exceptions (§22.6)

- **Functional colours as text.** The §6.3 hues measure 2.9–4.3:1 on Cloud, below the WCAG AA 4.5:1 text threshold. They're kept for fills and indicators. Text uses `--bio-*-ink` variants with the same hue and meaning at 4.5:1 or better in each environment (for example `#A8423F` for Critical on day).
- **Control boundaries.** Sage (`#AAB5AE`) is 2.0:1 on Cloud, too faint for an input border under WCAG 1.4.11. Control boundaries use `--bio-boundary` (`#7D8A83`, 3.4:1). Sage remains for decorative use.
- **Primary action colour.** The spec doesn't name one. Day uses a deep Growth green (`#2F7351`, 5.3:1 with Cloud text); night uses Growth itself with Carbon text (8.3:1).
