# Design review: v1 → v2

This review covers v1 of the Habitat console (PR #1, first commit). It looks at the build from several angles and checks each one against the BIO DIGITAL v1.0 spec. Each row records what the spec asked for, what v1 actually showed, what was wrong with it, and what v2 changes. Statuses: **Done** (built and verified in screenshots and tests), **Partial** (improved, but a known gap remains), **Open** (not addressed).

The v1 audit came from full-page screenshots at 1440 px (day and night) and on an emulated iPhone 15 Pro. I also read the code against each spec section. The verdict on v1 was that it met the spec's rules but not its intent. Every surface looked like the same white card, so the materials, the hierarchy and the sense of a living system the spec describes never came through.

## Pass 1: Materials and depth

| Spec intent | Observed in v1 | Pain point | v2 change | Status |
|---|---|---|---|---|
| §5: five materials with different physical behaviour (porcelain, membrane, crystal, carbon, liquid). | Membrane and crystal looked the same as porcelain on a light background: about 0.66 alpha, a faint border, and nothing behind them to refract. | Material language was invisible, which was the system's main idea. | Membrane gets a gradient body, a stronger backdrop blur and saturation, and a masked gradient rim (bright top-left edge, dark bottom-right). Crystal gets a refractive highlight. Carbon gets an inner glow. Porcelain gets a soft vertical gradient. | Done |
| §5.5 rule 7 and §14.1: material highlights respond to context. | Static surfaces. | Nothing reacted to the user, so the UI felt printed. | A pointer-driven specular highlight (`.lit`) on membrane, crystal and carbon. One rAF-throttled listener writes `--bio-mx/--bio-my` on the root. It is off at lite fidelity and under reduced motion. | Done |
| §5.4 depth: elevation through light, not borders. | Every card used the same neutral shadow. | No focal point. | Depth shadows are tinted with the canvas hue, and the hero and primary tiles get coloured glow. | Done |

## Pass 2: Hierarchy and composition

| Spec intent | Observed in v1 | Pain point | v2 change | Status |
|---|---|---|---|---|
| §14 calm by default, attention when needed. | Uniform 3-column card grid. Signals were three identical cards at the bottom. | The eye had nowhere to land, and alerts were buried. | Bento layout: a hero with a status summary and a primary action, activity rings beside it, a metric row, then the energy chart beside a control centre. Signals become a swipeable `CardStack`. | Done |
| §14.1 the environment reflects system state. | The canvas never changed. | No sense of the building's state at a glance. | `Canvas mood="attention"` shifts the ambient forms toward warm hues while signals are open. The colours use `@property` transitions so the change is smooth. | Done |
| §8 typography. | Default weights, an 18 px title and a 28 px hero. | Read like an admin template. | A display scale with tight negative tracking, rounded tabular numerals for metrics, and a 3-line hero with a gradient accent line. | Done |

## Pass 3: Navigation and chrome

| Spec intent | Observed in v1 | Pain point | v2 change | Status |
|---|---|---|---|---|
| §11 navigation is quiet and spatial. | A generic sidebar list, plus a header with three segmented controls. | It looked like a settings panel, and the chrome dominated the content. | A floating glass dock (bottom on phones, vertical on desktop) with a sliding active capsule. The density and engagement settings move into a Preferences sheet. The large title collapses on scroll. | Done |
| §13 transient feedback. | A generic bottom-right toast. | It didn't fit the material system. | `Island`: a carbon capsule at the top that springs open with the title, status and description, then collapses back to a live summary ("2 signals · 46.2 kW"). It is a `role="status"` live region. | Done |

## Pass 4: Data and controls

| Spec intent | Observed in v1 | Pain point | v2 change | Status |
|---|---|---|---|---|
| §12 information is legible and alive. | 2.5 px single-colour lines and a flat gauge. | Charts looked like defaults. | Gradient strokes with a soft glow, a gradient area fill, and a pulsing endpoint on live series. A `Rings` component (concentric activity rings with gradient strokes) is exposed as `role="meter"` items. | Done |
| §10 controls feel physical. | Toggles were list rows and the slider was a thin line. | Controls had no weight. | `ControlTile`: a large toggle tile whose fill floods with an element gradient when on. Slider gets a `capsule` variant with an icon and rubber-band overdrag (the same curve iOS uses). | Done |
| §9 colour. | Pale fills only. | Low energy. | Element fills (growth, water, air, earth) are deep gradients by day and light ones with carbon text at night. All contrast checks still pass axe. | Done |

## Pass 5: Device corners

This was the specific complaint about the iPhone.

| Intent | Observed in v1 | Pain point | v2 change | Status |
|---|---|---|---|---|
| Edge chrome should sit concentric with the physical display corner. | Fixed radii (24–32 px) and circular arcs. | The dock and sheets didn't line up with the iPhone's display corners. The arcs also don't match the continuous curve iOS uses. | **Radius:** `detectDeviceCorners()` maps the iPhone's screen size in points to its published display radius (for example 47.33 pt for 390×844 and 55 pt for 393×852). Edge chrome then uses `display radius − gap` (`--bio-device-radius`, `--bio-edge-gap`), so its curve is concentric with the glass. Apps that know the exact value can pass `<BioProvider deviceRadius>`, and Preferences offers an override. **Curve shape:** `corner-shape: superellipse()` where the browser supports it. Otherwise the dock, bottom sheets and drawers get a `clip-path` built from the continuous-corner path that iOS-style squircles use (`continuousRectPath`). | Partial |

Known limits of the corner work. These are facts about the platform, not fixable in this repo:

- **No web API exposes the screen's corner radius.** Detection is a lookup table keyed by screen size. Display Zoom changes the reported size, and some models share a size but differ in radius. Those cases fall back to the nearest match and are labelled "estimate" in Preferences. The 402×874, 440×956 and 420×912 values (iPhone 16 Pro, 17 series and Air) are estimates, because no public measurement exists for them.
- **Safari doesn't support `corner-shape`.** Today only Chromium 139+ does. On iPhone, continuous curves therefore come from `clip-path`, and only on edge chrome. `clip-path` also removes outer shadows, so it isn't used on ordinary cards. Cards keep circular arcs in Safari.
- On Android there is no reliable equivalent table, so the radius is 0 (plain layout) unless the app passes it.

Sources: [squircle.js.org: squircles in CSS](https://squircle.js.org/blog/squircles-in-css), [web-features: corner-shape](https://web-platform-dx.github.io/web-features-explorer/features/corner-shape), [kylebshr/ScreenCorners](https://github.com/kylebshr/ScreenCorners), [continuous corner path constants](https://gist.github.com/ruvasik/18e511724ebf592e417c5bcae2486cc9).

## Pass 6: Colour identity

Feedback on v2: the palette felt "too basic and not unique."

| Spec intent | Observed in v2 | Pain point | v3 change | Status |
|---|---|---|---|---|
| §6: neutrals form the foundation, accents carry meaning, and saturation rises only for emphasis. | A deep forest green (`#2F7351`, not a spec colour) was used for the primary action, the nav, tiles, icons and accent text. The five accents were darkened into separate saturated fills. | It read as a generic wellness or finance green, and the spec's own pastel family was mostly lost. Nothing about it was ownable. | The spec accents are restored as they are written, with Carbon text on top (7.3–8.6:1). The primary action becomes Carbon by day and Cloud by night, so the one thing to press is the one solid, grounded object. Accent text uses per-hue ink tokens (`--bio-ink-*`, 5.2:1 or better). | Done |
| §4.3 the living gradient, and §3.7 material life. | Gradients were decorative mesh blobs. | No signature that belonged to BIO DIGITAL. | **Lumen**, a new signature layer: structural colour taken from nacre, beetle shell and bioluminescence (mint, cyan, violet, orchid, gold). It appears only where something is alive or active: a slowly turning rim on the primary action and the current dock item, the Island while it speaks, live data (rings and the energy flow line), the hero's voice line, and the orb. It covers well under 5% of a screen and stops turning under reduced motion. | Done |
| §17: night keeps the same identity. | Night swapped to different pale greens. | The two environments felt like two products. | The same accent fills and the same Lumen hues carry across both. Night uses Lumen at full brightness (5.5:1 or better on Carbon), and day uses a deep cut for strokes and text. | Done |

**Note on the spec.** Lumen is an addition to §6, not a replacement. The §6.1–6.3 tokens are unchanged. If you adopt it, the spec should gain a §6.5 "Signature light" section with the five Lumen hues and the under-5% usage rule.

## Pass 7: Living gradient and layered finishes

Feedback on v3: the static gradient felt off-putting. Colour should be built the way automotive paint is layered, without looking like a painted car.

| Spec intent | Observed in v3 | Pain point | v4 change | Status |
|---|---|---|---|---|
| §4.3 the living gradient; §3.7 ambient life. | A fixed CSS gradient with three blurred blobs drifting. | It read as wallpaper, not as light. | `LivingField`: a domain-warped noise field rendered with WebGL that folds slowly, like ink in water, with thin satin highlights along its contours. Its colours ease toward the current environment and mood tokens, so a change of state flows through the field. It renders at one-fifth resolution, runs at about 22 fps, and pauses when the tab is hidden. Reduced motion gets a single still frame. Lite fidelity or no WebGL falls back to the CSS forms. | Done |
| §5 materials and §3.7 material life. | Each surface was one colour plus one highlight. | Flat, "basic colour then effect." | **Finish system** (`tokens/finish.css`), modelled on tri-coat paint: base (the material), pearl (Lumen interference colour that shifts hue with viewing angle), flake (fine mica sparkle that drifts against the layers above it), candy tint, and clearcoat (a gloss reflection that slides with the angle). The different rates of movement between layers are what create the sense of depth. There are four finishes: `pearl`, `chroma`, `candy` and `satin`. | Done |
| §3.7 behavioural life. | Highlights only followed a hovering mouse. | Nothing changed on phones. | `useViewAngle` writes `--bio-view-x/y` from device tilt (iOS asks permission once, from Preferences), the pointer, or scroll position on touch screens. The root eases the values over 0.9 s, so the finish moves with some weight. | Done |

Applied: the hero uses pearl, Living balance uses chroma, metric cards use satin, the primary button, active dock item and "on" control tiles use candy, and the dock uses pearl.

**Performance, measured honestly.** This sandbox only has a software renderer. There, the page drops from about 30 to about 19 frames per second with the field running, and lowering the field's resolution made no difference. That suggests the cost is in glass panels re-blurring a moving background, not in the shader itself. I have not measured it on real GPU hardware. If an older phone stutters, Lite rendering turns all of this off.

## Pass 8: Calm and serene

Feedback on v4: too much going on. Danny chose **calm and serene** (spec §3.5 Serenity) over a luxury direction.

| Spec intent | Observed in v4 | Pain point | v5 change | Status |
|---|---|---|---|---|
| §3.5 restrained colour, limited visual noise, controlled motion. | Rainbow Lumen on rims, rings, chart, headline and orb; spinning rims; sparkle flake; a fast background with satin folds. | Every element competed for attention. | Lumen becomes a tonal pearl made only of neighbouring spec hues (Mist, Growth, Water), with no metallics and no rainbow. Flake is off. Rims no longer turn: the primary action keeps a still light hairline, and the dock and Island have none. | Done |
| §4.3 gradients restrained and low contrast. | Background moved visibly, with bright folds. | Restless. | The field runs at about a third of the previous speed with no satin folds. Its aura is near-monochrome sage, water and mist, with daylight from above. | Done |
| §6.2 accents communicate meaning. | Data used five rainbow hues. | Colour stopped meaning anything. | Rings and the energy chart use spec semantics again: Earth for solar, Water for air and cistern flow, Growth for demand. | Done |
| §9 typography, clear hierarchy. | A bold gradient voice line. | Shouting. | The voice line is regular weight in muted tone, and the hero title is semibold. Hierarchy comes from tone, not colour. | Done |

The finish system and the viewing-angle signal remain in the library, but their defaults are now quiet. Pearl strength is 0.10–0.16, there is no flake, and gloss is soft.

## Pass 9: Flat forms and a real tab bar

Feedback from a real iPhone: the forms looked bulbous, and the navigation was poor.

| Observed | Pain point | Change | Status |
|---|---|---|---|
| Buttons had gradient fills, inner highlights, drop glows and a hover lift. Cards had a clearcoat gloss. The orb was a shaded sphere. | Everything looked inflated. | Buttons are flat solid fills (Carbon primary, a 6% tonal secondary) with no shadow, gloss or lift. Finishes keep the tonal pearl but drop the gloss. The hero and rings cards step down to radius R5 and depth 1. The orb becomes flat concentric discs and is hidden on phones. The rings lose their glow. | Done |
| The phone dock was a floating glass capsule over content, with a heavy black active blob. | It covered content, looked heavy, and its corners only approximated the screen's. | Phones get an edge-to-edge tab bar with a translucent canvas tint, a hairline top border and safe-area padding. Because it sits flush with the screen edge, the device's own corners shape it. The active state is a soft tonal pill behind the icon plus ink-coloured text. Wide screens get the same quiet column with no container. | Done |

## Pass 10: Tabs that fit; surfaces that respond to their surroundings

| Observed | Pain point | Change | Status |
|---|---|---|---|
| On a phone, the Library tab track clipped "Components" mid-word, cutting through the container. | It looked broken and gave no hint that more tabs existed. | `Tabs` scrolls when it overflows, with snap points and a fade only on the edge that has more beyond it. The selected tab centres itself. Under 560 px the track dissolves into separate chips, so a clipped edge never cuts through a container. | Done |
| Surfaces ignored what was behind them. Only glass blurred its background. | Materials didn't feel like they were in the same space. | **Reflection**: the living background publishes a small snapshot of itself every few seconds (`--bio-env-image`, `--bio-env-light`). Every Surface and Card draws it at viewport scale, offset by its own position, so its body carries the colour of exactly what's behind it. That changes as it scrolls through the environment or as the mood shifts. **Edge light**: opaque surfaces get a 1 px rim that catches the light above and the environment's colour at that spot, like the edge of glass. Membrane and crystal rims carry the environment too, which reads as refraction. A single rAF pass places the reflection for visible surfaces; it is off at Lite fidelity. | Done |

Limit: the reflection is a low-resolution colour map of the environment, refreshed about every 3 seconds (changed in pass 11). It is not a live mirror, by design, since the background moves slowly. Surfaces reflect the background, not each other.

## Pass 11: A library showcase, and smooth motion

Feedback: no mock data; the demo should focus on the component library and its functionality. Motion felt jumpy and jittery everywhere.

| Observed | Cause | Change | Status |
|---|---|---|---|
| The Habitat dashboard, zones, live readings and alerts were invented data. | The demo was a product mock-up, not a library showcase. | Removed. The app is now Overview, Foundations, Materials, Motion and Components. Components is organised by the five families, and every data component shows real values: spring constants, damping ratios and settle times computed from `physics.ts`. Control tiles, menus and sliders change the page's real environment, density, motion, fidelity and corner radius. | Done |
| The whole app re-rendered every 4 s. | Live readings ticked at the root. | Gone with the mock data. | Done |
| Scrolling stuttered. | Three things wrote styles on every scroll frame: reflection offsets on every card, the view angle on the root (on touch screens), and a scroll-linked header that scaled the title under a blurred sticky bar. | Reflection offsets are computed in page space and only when layout changes, never on scroll. The view angle no longer follows scroll or pointer. The header is static. | Done |
| Moving the mouse repainted every card. | The view angle followed the pointer and transitioned over 0.9 s as an inherited property on the root, which restyled every finished surface on every frame. | The root transition is removed. `useViewAngle` is opt-in (device tilt from Preferences), eases in script, quantises sensor noise and stops once settled. | Done |
| A hitch about every 3 s. | The background republished its environment map, swapping an image on every surface. | Published once at start and once after each environment or mood change. | Done |
| View changes lurched. | Views animated scale and translate with a spring while the page smooth-scrolled to the top. | Opacity-only crossfade (0.16 s) and an instant scroll reset. The island's content swap no longer animates a blur filter. | Done |
| Phone: a 4-option segmented control overflowed its card; a chart's hidden data table widened the page by 7 px. | Segments couldn't shrink; tables can't shrink below their content. | Segments share the available width. The table is hidden by a wrapper. | Done |

Measured in headless Chromium with software rendering, wheel-scrolling the Information family: median frame 16.7 ms (60 fps), 95th percentile 33 ms. Before this pass the page ran at about 19 to 30 fps in the same setup. That is not a measurement on an iPhone. Trade-off: a surface's reflection no longer slides as it scrolls.

## Pass 12: QC and validation

Checked in a real browser (headless Chromium), not only jsdom: every view and component family, day and night, at 320, 375, 393 (iPhone 15 Pro), 768, 1024, 1360 and 1920 px.

**Method**
- Static: `tsc -b`, 12 unit and axe tests, demo and library builds.
- axe-core in the browser on every view and family, both environments, desktop and iPhone.
- Rendered contrast: axe skips text over gradients and images, which is nearly all text here. So each text run was measured against the pixels actually behind it (text hidden, page screenshotted, 10th-percentile worst background pixel), 3,318 samples per run, against WCAG AA (4.5:1, or 3:1 for large text).
- 38 end-to-end checks: keyboard focus on every tab stop, modal/drawer/popover/menu open, Escape and focus return, focus trap, toast and island, tabs arrow keys, breadcrumbs, control tiles, loading state, input validation and `aria-invalid`, slider keys, list selection, card stack, playground code output, mood, OS reduced motion, and style writes while idle and while scrolling.

**Found and fixed**

| Finding | Cause | Fix |
|---|---|---|
| After switching to night, surfaces were washed grey for a moment; text fell to 1.5–2.2:1. | The day environment map stayed on night surfaces until the field republished, which took longer on slow devices. | The old map is dropped the moment the environment or mood changes, and the new one is published 1.7 s later by clock, not frame count. |
| Carbon cards by day were grey, not carbon; muted text 2.4:1. | The light environment reflection was composited over the dark base. | Carbon blends its reflection with `soft-light`, so it tints instead of greying. |
| Muted text over the living field measured 3.9–4.3:1 by day and 3.5–4.3:1 by night. | The field's lightest areas are lighter than the surface the tokens were checked against. | Day `--bio-text-muted` #5e6b65 → #4d5953; night #9ba8a1 → #bcc6c1. |
| Status pills and the active tab label measured 4.2–4.5:1. | Inks sat on tinted fills. | Day growth, success, warning and information inks darkened about one step; night critical lightened. |
| Night candy and chroma finishes put text at 3.6–4.2:1. | Sheen and pearl too strong on dark surfaces. | Night candy sheen 0.28 → 0.1; night chroma pearl 0.2 → 0.11. |
| The physics arena was a light panel at night (hint text 1.75:1). | No night style. | Night style added. |
| At 320 px, cards were clipped on the right; the tab bar's last label was cut. | Fixed grid minimums (320 px) and a fixed 52 px active pill. | Grid minimums cap at 100%; under 360 px tab labels drop to 10 px and the pill to 44 px. |
| Code samples could not be scrolled by keyboard (axe, serious). | Scrollable `pre` was not focusable. | `tabIndex={0}` and a label. |

**Result after fixes:** 0 axe violations in every view, family, environment and device; 0 of 3,318 text samples under AA; no horizontal scroll from 320 to 1920 px; 0 console errors; 0 style writes while idle or scrolling; under OS reduced motion, no animation loop runs.

**Not covered:** real iPhone hardware (frame rate, tilt, corner radius), VoiceOver and TalkBack reading order, Windows High Contrast, and browsers other than Chromium. The contrast method samples pixels, so it is a measurement of this render, not a proof for every frame of the moving field; the margin is small in a few places (4.5–4.7:1).

## Spec compliance, re-checked after v2

- **Accessibility (§18):** axe runs on every view in tests with no violations. Rings use `role="meter"` with value text. The Island is a polite live region. Gestures keep their button alternatives.
- **Reduced motion (§18.2):** the specular highlight, the endpoint pulse and the ambient drift stop under reduced motion. Springs fall back to tweens.
- **Reduced transparency and lite fidelity (§19.3):** `--bio-membrane-filter: none` and opaque fallbacks are kept.
- **Performance (§20):** the new effects animate only transform, opacity and CSS variables. Backdrop blur is still limited to membranes and the dock.
- **Layout:** no horizontal page scroll at 390, 768 or 1440 px (checked by script).

## Open items

- Corner radii for the newest iPhones need confirming against a real device. Ideally a native wrapper would pass the exact value.
- Haptics (the spec's tactile layer) can't be done on iOS Safari. The Vibration API only exists on Android.
