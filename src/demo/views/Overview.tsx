import { useRef, useState } from "react";
import {
  Button,
  Card,
  CardStack,
  Chart,
  ControlTile,
  DataPanel,
  List,
  Metric,
  Modal,
  Rings,
  Slider,
  StatusIndicator,
  Surface,
  TabPanel,
  Tabs,
  useBio,
  useDensityAtLeast,
  useIsland,
} from "../../bio";
import { energySeries, greeting, initialAlerts, rangeLabels, zones, type Alert, type LiveReadings, type Range, type Zone } from "../data";
import { IconBolt, IconDrop, IconLeaf, IconSpark, IconSun, IconThermo, IconWind, IconZones, IconMoon } from "../icons";
import { Orb } from "../Orb";
import type { View } from "../App";
import s from "../demo.module.css";

const kw = (v: number) => v.toFixed(1);

interface Props {
  onNavigate: (v: View) => void;
  live: LiveReadings;
  alerts: Alert[];
  setAlerts: (a: Alert[] | ((p: Alert[]) => Alert[])) => void;
}

export function Overview({ onNavigate, live, alerts, setAlerts }: Props) {
  const { density } = useBio();
  const immersed = useDensityAtLeast("immersed");
  const island = useIsland();
  const [range, setRange] = useState<Range>("24h");
  const [zone, setZone] = useState<Zone | null>(null);
  const zoneOrigin = useRef<HTMLElement | null>(null);
  const [tiles, setTiles] = useState({ circadian: true, irrigation: true, boost: false, purge: false });
  const [target, setTarget] = useState(21.5);

  const { use, solar } = energySeries(range);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const selfSupplied = Math.round((sum(solar) / sum(use)) * 100);
  const net = sum(use) - sum(solar);
  const attention = alerts.filter((a) => a.status !== "success").length;

  const toggle = (key: keyof typeof tiles, label: string) => (on: boolean) => {
    setTiles((t) => ({ ...t, [key]: on }));
    island({ title: `${label} ${on ? "on" : "off"}`, status: on ? "success" : "idle", duration: 1800 });
  };

  return (
    <div className={s.grid}>
      {/* Hero: the habitat's pulse. Its light follows the environment's mood. */}
      <Surface as="section" aria-labelledby="hero-t" material="porcelain" depth={2} radius="r6" className={`${s.hero} ${s.span8}`} lit>
        <div className={s.heroText}>
          <StatusIndicator
            status={attention ? "warning" : "success"}
            label={attention ? `${attention} signal${attention > 1 ? "s" : ""} need you` : "All systems steady"}
            variant="pill"
          />
          <h2 id="hero-t" className={s.heroTitle}>
            {greeting()}.
            <br />
            <span className={s.heroAccent}>{attention ? "The habitat needs a hand." : "The habitat is calm."}</span>
          </h2>
          <p className={s.heroBody}>
            Solar covers {selfSupplied}% of today's demand.
            {density !== "ambient" && ` Air is ${live.air > 90 ? "excellent" : "good"}, and the cistern is ${Math.round((live.water / 2900) * 100)}% full.`}
          </p>
          <div className={s.heroActions}>
            <Button size="large" icon={<IconZones />} onClick={() => onNavigate("zones")}>
              Review zones
            </Button>
            <Button size="large" variant="secondary" icon={<IconMoon />} onClick={() => island({ title: "Evening scene scheduled", description: "Lights warm to 2700 K at 19:30.", status: "success" })}>
              Evening scene
            </Button>
          </div>
        </div>
        <div className={s.heroOrb}>
          <Orb size={260} />
        </div>
      </Surface>

      <Card className={`${s.span4} ${s.ringsCard}`} material="crystal" depth={2} radius="r6" eyebrow="Today" title="Living balance" headingLevel={2}>
        <Rings
          label="Living balance"
          centerValue={`${selfSupplied}%`}
          centerLabel="solar"
          size={184}
          rings={[
            { id: "solar", label: "Solar coverage", value: selfSupplied / 100, valueText: `${selfSupplied}%`, colors: ["var(--bio-lumen-5)", "var(--bio-lumen-ink-4)"] },
            { id: "air", label: "Air quality", value: live.air / 100, valueText: `${Math.round(live.air)} / 100`, colors: ["var(--bio-lumen-2)", "var(--bio-lumen-ink-3)"] },
            { id: "water", label: "Cistern", value: live.water / 2900, valueText: `${Math.round((live.water / 2900) * 100)}%`, colors: ["var(--bio-lumen-1)", "var(--bio-lumen-ink-2)"] },
          ]}
        />
      </Card>

      {/* Key metrics */}
      <Card className={s.span3} depth={1} interactive radius="r5">
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
      <Card className={s.span3} depth={1} interactive radius="r5">
        <Metric
          label="Solar yield"
          icon={<IconSpark />}
          value={live.solar}
          format={kw}
          unit="kW"
          delta={{ value: "11%", direction: "up", positive: true, label: "versus yesterday" }}
          trend={live.trendSolar}
          trendColor="var(--bio-ink-earth)"
          detail="Clear sky. Panels at 94% efficiency."
          analysis="Battery wall 78% charged; 12.4 kWh stored since noon."
        />
      </Card>
      <Card className={s.span3} depth={1} interactive radius="r5">
        <Metric
          label="Air quality"
          icon={<IconWind />}
          value={live.air}
          unit="/ 100"
          delta={{ value: "1 pt", direction: "flat", label: "versus last hour" }}
          trend={live.trendAir}
          trendColor="var(--bio-ink-air)"
          detail="PM2.5 at 4 µg/m³. CO₂ averages 560 ppm."
          analysis="North studio CO₂ peaked at 790 ppm at 11:45; ventilation responded within 40 s."
        />
      </Card>
      <Card className={s.span3} depth={1} interactive radius="r5">
        <Metric
          label="Rain harvested"
          icon={<IconDrop />}
          value={live.water}
          format={(v) => Math.round(v).toLocaleString("en-US")}
          unit="L"
          delta={{ value: "1,840 L", direction: "up", positive: true, label: "since last night" }}
          trend={live.trendWater}
          trendColor="var(--bio-ink-water)"
          detail="Cistern 64% full."
          analysis="Inflow 6.2 L/min. Overflow diverter engages at 92%."
        />
      </Card>

      {/* Energy chart */}
      <Card className={s.span8} title="Energy flow" eyebrow="Demand and generation" headingLevel={2} depth={1} radius="r5">
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
              { value: "24h", label: "24 h" },
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
            ]}
          />
        </div>
        <TabPanel idBase="energy" value={range} style={{ marginTop: "var(--bio-space-4)", outline: "none" }}>
          <Chart
            title={`Energy flow, ${range === "24h" ? "last 24 hours" : range === "7d" ? "last 7 days" : "last 30 days"}`}
            summary={`Demand ranges ${Math.min(...use)} to ${Math.max(...use)} kW; solar peaks at ${Math.max(...solar)} kW.`}
            labels={rangeLabels[range]}
            format={(v) => `${v.toFixed(0)} kW`}
            min={0}
            height={density === "immersed" ? 280 : 240}
            series={[
              { id: "use", label: "Demand", data: use, color: "var(--bio-lumen-ink-2)", gradient: ["var(--bio-lumen-ink-1)", "var(--bio-lumen-ink-3)"], glow: true },
              { id: "solar", label: "Solar", data: solar, color: "var(--bio-lumen-ink-5)", dashed: true, area: false },
            ]}
          />
        </TabPanel>
      </Card>

      {/* Control centre */}
      <section className={`${s.span4} ${s.controlCentre}`} aria-labelledby="cc-t">
        <h2 id="cc-t" className="bio-visually-hidden">
          Controls
        </h2>
        <div className={s.tileGrid}>
          <ControlTile label="Circadian light" icon={<IconSun />} on={tiles.circadian} onChange={toggle("circadian", "Circadian light")} status={tiles.circadian ? "Following the sun" : "Off"} />
          <ControlTile label="Irrigation" icon={<IconDrop />} on={tiles.irrigation} onChange={toggle("irrigation", "Irrigation")} fill="var(--bio-fill-water)" status={tiles.irrigation ? "On demand" : "Paused"} />
          <ControlTile label="Fresh air" icon={<IconWind />} on={tiles.boost} onChange={toggle("boost", "Fresh air boost")} fill="var(--bio-fill-air)" status={tiles.boost ? "Boosting" : "Balanced"} />
          <ControlTile label="Night purge" icon={<IconMoon />} on={tiles.purge} onChange={toggle("purge", "Night purge")} fill="var(--bio-fill-earth)" status={tiles.purge ? "Tonight" : "Off"} />
        </div>
        <Surface material="membrane" depth={1} radius="r5" padding="md">
          <Slider variant="capsule" icon={<IconThermo />} label="Comfort target" min={18} max={26} step={0.5} value={target} onChange={setTarget} format={(v) => `${v.toFixed(1)} °C`} />
        </Surface>
      </section>

      {/* Zones */}
      <Card className={s.span7} title="Zones" eyebrow={`${zones.length} monitored`} headingLevel={2} radius="r5" actions={<Button variant="tertiary" size="compact" onClick={() => onNavigate("zones")}>View all</Button>}>
        <List
          label="Zones"
          onSelect={(id) => {
            zoneOrigin.current = document.activeElement as HTMLElement;
            setZone(zones.find((z) => z.id === id) ?? null);
          }}
          items={zones.slice(0, density === "ambient" ? 4 : zones.length).map((z) => ({
            id: z.id,
            leading: (
              <span className={s.zoneDot} data-status={z.status}>
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

      <div className={`${s.span5} ${s.sideColumn}`}>
        <section aria-labelledby="alerts-t">
          <div className={s.sectionHead}>
            <h2 id="alerts-t" className={s.h2}>
              Signals
            </h2>
            {alerts.length < initialAlerts.length && (
              <Button variant="tertiary" size="compact" onClick={() => setAlerts(initialAlerts)}>
                Restore
              </Button>
            )}
          </div>
          <CardStack
            label="Signals"
            items={alerts.map((a) => ({
              id: a.id,
              content: (
                <Card
                  depth={2}
                  radius="r5"
                  material="porcelain"
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
              ),
            }))}
            empty={
              <Surface material="membrane" depth={0} radius="r5" className={s.empty}>
                Nothing needs you right now. The habitat is resting.
              </Surface>
            }
          />
        </section>
        {immersed && (
          <DataPanel
            title="Climate detail"
            eyebrow="Atrium"
            headingLevel={2}
            radius="r5"
            footnote="Updated just now"
            items={[
              { label: "Temperature", value: "22.4 °C" },
              { label: "Humidity", value: "58%" },
              { label: "CO₂", value: "512 ppm" },
              { label: "Light", value: "780 lux" },
              { label: "VOC index", value: "41" },
              { label: "Dew point", value: "13.7 °C" },
            ]}
          />
        )}
      </div>

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
                island({ title: `${zone?.name} pinned`, description: "It stays at the top of your overview.", status: "success" });
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
                <Surface key={k} material="porcelain" depth={0} className={`${s.statTile} bio-concentric`}>
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
