/* Minimal stroke icon set for the demo. Decorative: always paired with text. */
import type { SVGProps } from "react";

const base = (d: React.ReactNode) =>
  function Icon(p: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
        {d}
      </svg>
    );
  };

export const IconOverview = base(<><path d="M4 13a8 8 0 0 1 16 0" /><path d="M12 13l4-4" /><circle cx="12" cy="13" r="1.4" /><path d="M4 19h16" /></>);
export const IconZones = base(<><path d="M12 3c4 3 6 6 6 9a6 6 0 0 1-12 0c0-3 2-6 6-9Z" /><path d="M12 21v-8" /><path d="M12 15l-3-2.5M12 17l3-2.5" /></>);
export const IconPhysics = base(<><path d="M3 12c2.5 0 2.5-6 5-6s2.5 12 5 12 2.5-9 5-9 1.5 3 3 3" /></>);
export const IconLibrary = base(<><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="3.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="3.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>);
export const IconSun = base(<><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>);
export const IconMoon = base(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />);
export const IconAuto = base(<><circle cx="12" cy="12" r="8" /><path d="M12 4v16" /><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" /></>);
export const IconBolt = base(<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />);
export const IconLeaf = base(<><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" /><path d="M5 19l7-7" /></>);
export const IconDrop = base(<path d="M12 3.5c3.5 4 6 7.2 6 10.3a6 6 0 0 1-12 0c0-3.1 2.5-6.3 6-10.3Z" />);
export const IconWind = base(<><path d="M3 9h11a3 3 0 1 0-3-3" /><path d="M3 15h15a3 3 0 1 1-3 3" /></>);
export const IconThermo = base(<><path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0Z" /><path d="M12 9v7" /></>);
export const IconSliders = base(<><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>);
export const IconMore = base(<><circle cx="5.5" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="18.5" cy="12" r="1.2" fill="currentColor" /></>);
export const IconBell = base(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>);
export const IconDownload = base(<><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M5 19.5h14" /></>);
export const IconRefresh = base(<><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.5v4h-4" /></>);
export const IconSearch = base(<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>);
export const IconPause = base(<><path d="M9 6v12M15 6v12" /></>);
export const IconSpark = base(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></>);
export const IconHome = base(<><path d="M4 11.5 12 5l8 6.5" /><path d="M6.5 10v8.5h11V10" /></>);
export const IconSwatch = base(<><circle cx="8" cy="9" r="4" /><circle cx="16" cy="9" r="4" /><circle cx="12" cy="15.5" r="4" /></>);
export const IconLayers = base(<><path d="M12 4 3.5 8.5 12 13l8.5-4.5L12 4Z" /><path d="m3.5 12.5 8.5 4.5 8.5-4.5" /><path d="m3.5 16.5 8.5 4.5 8.5-4.5" /></>);
