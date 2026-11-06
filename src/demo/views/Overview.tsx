import { useRef, useState } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
import {
  Button,
  Card,
  Chart,
  DataPanel,
  Gauge,
  List,
  Metric,
  Modal,
  OrganicShape,
  SegmentedControl,
  Slider,
  StatusIndicator,
  Surface,
  TabPanel,
  Tabs,
  Toggle,
  useBio,
  useDensityAtLeast,
  useToast,
} from "../../bio";
import { energySeries, greeting, initialAlerts, rangeLabels, useLiveReadings, zones, type Range, type Zone } from "../data";
import { IconBolt, IconDrop, IconLeaf, IconSpark, IconWind, IconZones } from "../icons";
import type { View } from "../App";
import s from "../demo.module.css";

const kw = (v: number) => v.toFixed(1);

export function Overview({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { density } = useBio();
  const immersed = useDensityAtLeast("immersed");
  const notify = useToast();
  const live = useLiveReadings();
  const [range, setRange] = useState<Range>("24h");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [zone, setZone] = useState<Zone | null>(null);
  const zoneOrigin = useRef<HTMLElement | null>(null);
  const [circadian, setCircadian] = useState(true);
  const [irrigation, setIrrigation] = useState(true);
  const [purge, setPurge] = useState(false);
  const [target, setTarget] = useState(21.5);
  const [vent, setVent] = useState<"eco" | "balanced" | "boost">("balanced");

  const { use, solar } = energySeries(range);
  const net = use.reduce((a, b) => a + b, 0) - solar.reduce((a, b) => a + b, 0);
  const selfSupplied = Math.round((solar.reduce((a, b) => a + b, 0) / use.reduce((a, b) => a + b, 0)) * 100);

  return (
    <div className={s.grid}>
      <Surface as="section" aria-labelledby="hero-t" material="porcelain" depth={2} radius="organic" className={`${s.hero} ${s.span12}`}>
        <OrganicShape className={s.heroShape} seed={3} size={320} fill="var(--bio-accent-soft)" />
        <OrganicShape className={s.heroShape2} seed={8} size={220} fill="color-mix(in srgb, var(--bio-color-air) 28%, transparent)" />
        <div className={s.heroText}>
          <StatusIndicator status="success" label="All essential systems steady" variant="pill" />
          <h2 id="hero-t" className={s.heroTitle}>
            {greeting()}. The habitat is calm.
          </h2>
          <p className={s.heroBody}>
            Solar is covering {selfSupplied}% of demand. Two zones would like your attention.
            {density !== "ambient" && " Change the density in the top bar to see how much the dashboard reveals."}
          </p>
        </div>
        <div className={s.heroActions}>
          <Button icon={<IconZones />} onClick={() => onNavigate("zones")}>
            Review zones
          </Button>
          <Button variant="secondary" onClick={() => notify({ title: "Evening scene scheduled", description: "Lights warm to 2700 K at 19:30.", status: "success" })}>
            Schedule evening scene
          </Button>
        </div>
      </Surface>

      {/* Key metrics */}
      <Card className={s.span3} depth={1} interactive>
        <Metric
          label="Power draw"
          icon={<IconBolt />}
          value={live.power}
          format={kw}
          unit="kW"
          delta={{ value: "4.2%", direction: "down", positive: true, label: "versus yesterday" }}
          trend={live.trendPower}
          detail="Below the 52 kW comfort ceiling."
          analysis="Peak 58.3 kW at 13:10. HVAC 46%, lighting 18%, plug loads 36%."
        />
      </Card>
      <Card className={s.span3} depth={1} interactive>
        <Metric
          label="Solar yield"
          icon={<IconSpark />}
          value={live.solar}
          format={kw}
          unit="kW"
          delta={{ value: "11%", direction: "up", positive: true, label: "versus yesterday" }}
          trend={live.trendSolar}
          trendColor="var(--bio-warning-ink)"
          detail="Clear sky. Panels at 94% efficiency."
          analysis="Battery wall 78% charged; 12.4 kWh stored since noon."
        />
      </Card>
      <Card className={s.span3} depth={1} interactive>
        <Metric
          label="Air quality"
          icon={<IconWind />}
          value={live.air}
          unit="/ 100"
          delta={{ value: "1 pt", direction: "flat", label: "versus last hour" }}
          trend={live.trendAir}
          trendColor="var(--bio-information-ink)"
          detail="PM2.5 at 4 µg/m³. CO₂ averages 560 ppm."
          analysis="North studio CO₂ peaked at 790 ppm at 11:45; ventilation responded within 40 s."
        />
      </Card>
      <Card className={s.span3} depth={1} interactive>
        <Metric
          label="Rain harvested"
          icon={<IconDrop />}
          value={live.water}
          format={(v) => Math.round(v).toLocaleString("en-US")}
          unit="L"
          delta={{ value: "1,840 L", direction: "up", positive: true, label: "since last night" }}
          trend={live.trendWater}
          trendColor="var(--bio-color-water)"
          detail="Cistern 64% full."
          analysis="Inflow 6.2 L/min. Overflow diverter engages at 92%."
        />
      </Card>

      {/* Energy chart */}
      <Card className={s.span8} title="Energy flow" eyebrow="Demand and generation" headingLevel={2} depth={1}>
        <div className={s.chartHead}>
          <div className={s.chartStats}>
            <span>
              <strong>{selfSupplied}%</strong>
              self-supplied
            </span>
            {density !== "ambient" && (
              <span>
                <strong>{Math.round(net).toLocaleString("en-US")} kWh</strong>
                net from grid
              </span>
            )}
          </div>
          <Tabs<Range>
            label="Time range"
            idBase="energy"
            value={range}
            onChange={setRange}
            items={[
              { value: "24h", label: "24 hours" },
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
            ]}
          />
        </div>
        <TabPanel idBase="energy" value={range} style={{ marginTop: "var(--bio-space-4)" }}>
          <Chart
            title={`Energy flow, ${range === "24h" ? "last 24 hours" : range === "7d" ? "last 7 days" : "last 30 days"}`}
            summary={`Demand ranges ${Math.min(...use)} to ${Math.max(...use)} kW; solar peaks at ${Math.max(...solar)} kW.`}
            labels={rangeLabels[range]}
            format={(v) => `${v.toFixed(0)} kW`}
            min={0}
            height={density === "immersed" ? 260 : 220}
            series={[
              { id: "use", label: "Demand", data: use, color: "var(--bio-accent-ink)" },
              { id: "solar", label: "Solar", data: solar, color: "var(--bio-warning-ink)", dashed: true },
            ]}
          />
        </TabPanel>
      </Card>

      {/* Air & climate */}
      <div className={s.span4} style={{ display: "flex", flexDirection: "column", gap: "var(--bio-density-gap)" }}>
        <Card title="Breathing room" eyebrow="Indoor air" headingLevel={2} material="crystal" depth={2}>
          <div className={s.airRow}>
            <Gauge value={live.air} label="AQI score" valueText={`${Math.round(live.air)}`} />
            <div className={s.airFacts}>
              <StatusIndicator status="success" label="Excellent" />
              <span className={s.muted}>Crystal marks the one surface that deserves emphasis here.</span>
            </div>
          </div>
        </Card>
        <DataPanel
          title="Climate detail"
          eyebrow="Atrium"
          headingLevel={2}
          footnote="Updated just now"
          items={[
            { label: "Temperature", value: "22.4 °C" },
            { label: "Humidity", value: "58%" },
            { label: "CO₂", value: "512 ppm", level: "engaged" },
            { label: "Light", value: "780 lux", level: "engaged" },
            { label: "VOC index", value: "41", level: "immersed" },
            { label: "Dew point", value: "13.7 °C", level: "immersed" },
            { label: "Air changes", value: "4.2 / h", level: "immersed" },
          ]}
        />
      </div>

      {/* Zones */}
      <Card className={s.span6} title="Zones" eyebrow={`${zones.length} monitored`} headingLevel={2} actions={<Button variant="tertiary" size="compact" onClick={() => onNavigate("zones")}>View all</Button>}>
        <List
          label="Zones"
          onSelect={(id) => {
            zoneOrigin.current = document.activeElement as HTMLElement;
            setZone(zones.find((z) => z.id === id) ?? null);
          }}
          items={zones.slice(0, density === "ambient" ? 4 : zones.length).map((z) => ({
            id: z.id,
            leading: (
              <span className={s.zoneDot}>
                <IconLeaf />
              </span>
            ),
            title: z.name,
            supporting: z.kind,
            meta: z.temp ? `${z.temp.toFixed(1)} °C · ${z.humidity}%` : "—",
            trailing: <StatusIndicator status={z.status} label={z.statusLabel} variant="pill" />,
          }))}
        />
      </Card>

      {/* Controls */}
      <Card className={s.span6} title="Systems" eyebrow="Direct control" headingLevel={2}>
        <div className={s.controlsStack}>
          <Toggle spread label="Circadian lighting" description="Follows the sun's colour temperature." checked={circadian} onChange={setCircadian} />
          <Toggle spread label="Smart irrigation" description="Waters only when soil asks for it." checked={irrigation} onChange={setIrrigation} />
          {immersed && (
            <Toggle spread label="Night purge ventilation" description="Pre-cools the building with outside air overnight." checked={purge} onChange={setPurge} />
          )}
          <div className={s.prefGroup} style={{ paddingBlock: "var(--bio-space-2)" }}>
            <span aria-hidden="true" style={{ fontSize: "var(--bio-type-supporting)", fontWeight: 500 }}>
              Ventilation mode
            </span>
            <SegmentedControl
              label="Ventilation mode"
              value={vent}
              onChange={setVent}
              options={[
                { value: "eco", label: "Eco" },
                { value: "balanced", label: "Balanced" },
                { value: "boost", label: "Boost" },
              ]}
            />
          </div>
          <Slider label="Comfort target" min={18} max={26} step={0.5} value={target} onChange={setTarget} format={(v) => `${v.toFixed(1)} °C`} />
        </div>
      </Card>

      {/* Alerts: drag to dismiss, neighbours resolve into the gap */}
      <section className={s.span12} aria-labelledby="alerts-t">
        <div className={s.sectionHead}>
          <div>
            <h2 id="alerts-t" className={s.h2}>
              Signals
            </h2>
            <p className={`${s.p} ${s.muted} ${s.small}`}>Swipe a signal away, or press its × button. A fast flick needs less distance.</p>
          </div>
          {alerts.length < initialAlerts.length && (
            <Button variant="tertiary" size="compact" onClick={() => setAlerts(initialAlerts)}>
              Restore signals
            </Button>
          )}
        </div>
        <LayoutGroup>
          <div className={s.alerts}>
            <AnimatePresence mode="popLayout">
              {alerts.map((a) => (
                <Card
                  key={a.id}
                  layout
                  depth={2}
                  title={a.title}
                  headingLevel={3}
                  onDismiss={() => setAlerts((l) => l.filter((x) => x.id !== a.id))}
                  dismissLabel={`Dismiss: ${a.title}`}
                >
                  <p className={s.alertBody}>{a.body}</p>
                  <div className={s.alertMeta}>
                    <StatusIndicator status={a.status} label={a.status === "critical" ? "Critical" : a.status === "warning" ? "Attention" : "Resolved"} />
                    <span>{a.time}</span>
                  </div>
                </Card>
              ))}
              {alerts.length === 0 && (
                <Surface key="empty" material="porcelain" depth={0} radius="r4" className={s.empty}>
                  Nothing needs you right now. The habitat is resting.
                </Surface>
              )}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </section>

      <Modal
        open={!!zone}
        onClose={() => setZone(null)}
        originRef={zoneOrigin}
        title={zone?.name ?? ""}
        description={zone ? `${zone.kind}. ${zone.note}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setZone(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                notify({ title: `${zone?.name} pinned`, description: "It will stay at the top of your overview.", status: "success" });
                setZone(null);
              }}
            >
              Pin to overview
            </Button>
          </>
        }
      >
        {zone && (
          <>
            <StatusIndicator status={zone.status} label={zone.statusLabel} variant="pill" />
            <div className={s.modalStats}>
              {[
                ["Temperature", zone.temp ? `${zone.temp.toFixed(1)} °C` : "—"],
                ["Humidity", zone.humidity ? `${zone.humidity}%` : "—"],
                ["CO₂", zone.co2 ? `${zone.co2} ppm` : "—"],
                ["Occupancy", `${zone.occupancy}`],
              ].map(([k, v]) => (
                <Surface key={k} material="porcelain" depth={0} radius="r3" className={s.statTile}>
                  <span className={`${s.muted} ${s.small}`}>{k}</span>
                  <strong>{v}</strong>
                </Surface>
              ))}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
