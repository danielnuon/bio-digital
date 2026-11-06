import { useState } from "react";
import { LayoutGroup } from "motion/react";
import { Button, Card, Checkbox, Input, Slider, StatusIndicator, Toggle, useToast } from "../../bio";
import { zones as allZones } from "../data";
import { IconSearch } from "../icons";
import s from "../demo.module.css";

/**
 * Propagation (§13): expanding a zone widens it to the full row. Its
 * neighbours are connected by layout, so they move to make room instead
 * of jumping. Unrelated content elsewhere stays still.
 */
export function Zones() {
  const [open, setOpen] = useState<string | null>("nursery");
  const [query, setQuery] = useState("");
  const [onlyAttention, setOnlyAttention] = useState(false);
  const notify = useToast();
  const [settings, setSettings] = useState<Record<string, { auto: boolean; target: number }>>(() =>
    Object.fromEntries(allZones.map((z) => [z.id, { auto: true, target: z.humidity || 50 }])),
  );

  const visible = allZones.filter(
    (z) =>
      z.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (!onlyAttention || z.status === "warning" || z.status === "critical"),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--bio-density-gap)" }}>
      <div className={s.row} style={{ gap: "var(--bio-space-4)", alignItems: "flex-end" }}>
        <Input
          label="Find a zone"
          placeholder="Atrium, nursery…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leading={<IconSearch />}
          style={{ minWidth: 240 }}
          type="search"
        />
        <Checkbox checked={onlyAttention} onChange={setOnlyAttention} label="Only zones that need attention" />
      </div>

      <LayoutGroup>
        <div className={s.zoneGrid}>
          {visible.map((z) => {
            const expanded = open === z.id;
            const cfg = settings[z.id];
            return (
              <Card
                key={z.id}
                layout
                data-wide={expanded}
                depth={expanded ? 3 : 1}
                radius={expanded ? "r5" : "r4"}
                eyebrow={z.kind}
                title={z.name}
                headingLevel={2}
                interactive={!expanded}
                expanded={expanded}
                onExpandedChange={(e) => setOpen(e ? z.id : null)}
                expandLabel={expanded ? `Collapse ${z.name}` : `Expand ${z.name}`}
                detail={
                  <div className={s.zoneDetail}>
                    <div>
                      <p className={`${s.p} ${s.muted}`}>{z.note}</p>
                    </div>
                    <div className={s.controlsStack}>
                      <Toggle spread label="Autonomous climate" checked={cfg.auto} onChange={(auto) => setSettings((p) => ({ ...p, [z.id]: { ...cfg, auto } }))} />
                      <Slider
                        label="Humidity target"
                        value={cfg.target}
                        min={30}
                        max={90}
                        onChange={(target) => setSettings((p) => ({ ...p, [z.id]: { ...cfg, target } }))}
                        format={(v) => `${v}%`}
                        disabled={!cfg.auto}
                      />
                    </div>
                    <div className={s.row} style={{ alignItems: "flex-end" }}>
                      <Button variant="secondary" onClick={() => notify({ title: `${z.name} recalibrating`, status: "information" })}>
                        Recalibrate
                      </Button>
                      {z.status === "critical" && (
                        <Button variant="destructive" onClick={() => notify({ title: "Technician requested", description: "Roof meadow, probe 3.", status: "warning" })}>
                          Request technician
                        </Button>
                      )}
                    </div>
                  </div>
                }
              >
                <StatusIndicator status={z.status} label={z.statusLabel} variant="pill" />
                <div className={s.zoneFacts}>
                  <span>
                    <strong>{z.temp ? `${z.temp.toFixed(1)}°` : "—"}</strong>
                    <span className={s.muted}>Temp</span>
                  </span>
                  <span>
                    <strong>{z.humidity ? `${z.humidity}%` : "—"}</strong>
                    <span className={s.muted}>Humidity</span>
                  </span>
                  <span>
                    <strong>{z.co2 || "—"}</strong>
                    <span className={s.muted}>CO₂ ppm</span>
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </LayoutGroup>
      {visible.length === 0 && <p className={s.empty}>No zones match. Clear the search or the filter.</p>}
    </div>
  );
}
