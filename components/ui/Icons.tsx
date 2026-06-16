// components/ui/Icons.tsx
// Ícones SVG inline (sem dependências externas). Stroke currentColor.

import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...props,
});

export const IconHome = (p: P) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
);
export const IconUser = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
);
export const IconCompass = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>
);
export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg>
);
export const IconInbox = (p: P) => (
  <svg {...base(p)}><path d="M3 13h4l2 3h6l2-3h4" /><path d="M5 5h14l2 8v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5z" /></svg>
);
export const IconLeaf = (p: P) => (
  <svg {...base(p)}><path d="M5 19c0-9 7-13 14-13 0 9-5 14-14 13Z" /><path d="M5 19c3-4 6-6 9-7" /></svg>
);
export const IconBook = (p: P) => (
  <svg {...base(p)}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 1 2-2h12" /></svg>
);
export const IconBell = (p: P) => (
  <svg {...base(p)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
);
export const IconUsers = (p: P) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.5 3-5 6-5s6 1.5 6 5" /><path d="M16 6.5a3 3 0 0 1 0 5.5M18 20c0-2.5-1-3.8-2.5-4.6" /></svg>
);
export const IconMegaphone = (p: P) => (
  <svg {...base(p)}><path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1Z" /><path d="M18 8a4 4 0 0 1 0 8" /></svg>
);
export const IconFile = (p: P) => (
  <svg {...base(p)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>
);
export const IconClipboard = (p: P) => (
  <svg {...base(p)}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="m9 13 2 2 4-4" /></svg>
);
export const IconStar = (p: P) => (
  <svg {...base({ ...p, fill: 'currentColor', stroke: 'none' })}><path d="m12 3 2.5 5.5 6 .6-4.5 4 1.3 5.9L12 16.8 6.7 19l1.3-5.9-4.5-4 6-.6z" /></svg>
);
export const IconPlus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconEdit = (p: P) => (
  <svg {...base(p)}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>
);
export const IconTrash = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
);
export const IconX = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="m5 12 5 5L19 6" /></svg>
);
export const IconChevron = (p: P) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconEye = (p: P) => (
  <svg {...base(p)}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconExternal = (p: P) => (
  <svg {...base(p)}><path d="M14 4h6v6M20 4 10 14" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
);
export const IconLogout = (p: P) => (
  <svg {...base(p)}><path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" /><path d="M10 12H3m0 0 3-3m-3 3 3 3" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconMapPin = (p: P) => (
  <svg {...base(p)}><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
);
export const IconPhone = (p: P) => (
  <svg {...base(p)}><path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" /></svg>
);
export const IconGlobe = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" /></svg>
);
export const IconDownload = (p: P) => (
  <svg {...base(p)}><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" /></svg>
);
export const IconSend = (p: P) => (
  <svg {...base(p)}><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" /></svg>
);
export const IconShield = (p: P) => (
  <svg {...base(p)}><path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const IconChart = (p: P) => (
  <svg {...base(p)}><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" /></svg>
);
export const IconSparkle = (p: P) => (
  <svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>
);
export const IconGrid = (p: P) => (
  <svg {...base(p)}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconTag = (p: P) => (
  <svg {...base(p)}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="7.5" cy="7.5" r="1.4" /></svg>
);
export const IconWheelchair = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="6" r="2" /><path d="M11 8v6h5l2 5" /><path d="M11 14a5 5 0 1 0 4 8" /></svg>
);
