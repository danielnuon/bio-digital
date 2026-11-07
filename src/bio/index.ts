/**
 * BIO DIGITAL — Technology, naturally alive.
 * Component library organised into the five families of spec §16.
 */

// Intelligence layer
export { BioProvider, useBio, useDensityAtLeast } from "./context/BioProvider";
export type { BioProviderProps, BioContextValue, Density, Environment, EnvironmentPreference, MotionPreference, Fidelity } from "./context/BioProvider";

// Physics
export { physics, springTransition, reducedTransition, dampingRatio, simulateSpring, settleTime, projectRelease, shouldDismiss } from "./physics/physics";
export type { Material, PhysicsKind, SpringParams, MaterialPhysics, SpringSample } from "./physics/physics";
export { useBioMotion } from "./physics/useBioMotion";
export type { MotionMode } from "./physics/useBioMotion";

// 16.1 Foundation
export { Canvas, Recede } from "./foundation/Canvas";
export { Surface, surfaceClass } from "./foundation/Surface";
export type { SurfaceProps, Depth, Radius, Padding, Finish } from "./foundation/Surface";
export { LivingField } from "./foundation/LivingField";
export { useViewAngle, requestTiltPermission } from "./context/useMaterialLight";
export { Container, Stack, Divider, MaterialLayer, OrganicShape, organicPath } from "./foundation/Layout";

// 16.2 Interaction
export { Button } from "./interaction/Button";
export type { ButtonProps, BioButtonContract } from "./interaction/Button";
export { Toggle } from "./interaction/Toggle";
export { Slider } from "./interaction/Slider";
export { Input } from "./interaction/Input";
export { Checkbox } from "./interaction/Checkbox";
export { SegmentedControl } from "./interaction/SegmentedControl";
export type { SegmentOption } from "./interaction/SegmentedControl";

// 16.3 Navigation
export { Tabs, TabPanel } from "./navigation/Tabs";
export { NavRail } from "./navigation/NavRail";
export type { NavItem } from "./navigation/NavRail";
export { Breadcrumbs } from "./navigation/Breadcrumbs";
export type { Crumb } from "./navigation/Breadcrumbs";
export { Menu } from "./navigation/Menu";
export type { MenuEntry } from "./navigation/Menu";

// 16.4 Information
export { Card } from "./information/Card";
export type { CardProps } from "./information/Card";
export { List } from "./information/List";
export type { ListItemData } from "./information/List";
export { Metric } from "./information/Metric";
export { Chart } from "./information/Chart";
export type { ChartSeries } from "./information/Chart";
export { Sparkline } from "./information/Sparkline";
export { StatusIndicator } from "./information/StatusIndicator";
export type { Status } from "./information/StatusIndicator";
export { DataPanel } from "./information/DataPanel";
export type { DataPoint } from "./information/DataPanel";
export { Gauge } from "./information/Gauge";
export { AnimatedNumber } from "./information/AnimatedNumber";

// 16.5 Spatial
export { Modal } from "./spatial/Modal";
export { Drawer } from "./spatial/Drawer";
export { Popover } from "./spatial/Popover";
export { FloatingPanel } from "./spatial/FloatingPanel";
export { ToastProvider, useToast } from "./spatial/Toast";
export type { ToastInput } from "./spatial/Toast";

// Refinement pass: signature components and device-aware geometry
export { Rings } from "./information/Rings";
export type { Ring } from "./information/Rings";
export { CardStack } from "./information/CardStack";
export type { CardStackItem } from "./information/CardStack";
export { ControlTile } from "./interaction/ControlTile";
export { IslandProvider, useIsland } from "./spatial/Island";
export type { IslandMessage } from "./spatial/Island";
export { detectDeviceCorners, continuousRectPath } from "./utils/corners";
export type { DeviceCorners } from "./utils/corners";
export { useContinuousCorners } from "./utils/hooks";
