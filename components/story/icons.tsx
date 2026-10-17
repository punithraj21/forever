type IconProps = { size?: number; className?: string };

function Svg({
  size = 18,
  className,
  strokeWidth = 2.2,
  fill = "none",
  children,
}: IconProps & {
  strokeWidth?: number;
  fill?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const ChevronLeft = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const ChevronRight = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M9 18l6-6-6-6" />
  </Svg>
);

export const Close = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </Svg>
);

export const Plus = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export const Pencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
  </Svg>
);

export const Trash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </Svg>
);

export const Dots = (p: IconProps) => (
  <Svg {...p} fill="currentColor" strokeWidth={0}>
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </Svg>
);

export const Heart = (p: IconProps) => (
  <Svg {...p} fill="currentColor" strokeWidth={1.5}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const ArrowLeft = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </Svg>
);

export const ArrowRight = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </Svg>
);

export const Layers = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M12 2 2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </Svg>
);

export const BookOpen = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
    <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
  </Svg>
);

export const ImageIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-4.5-4.5L6 21" />
  </Svg>
);

export const MapPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const SortArrows = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="m3 8 4-4 4 4" />
    <path d="M7 4v16" />
    <path d="m21 16-4 4-4-4" />
    <path d="M17 20V4" />
  </Svg>
);

export const Calendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </Svg>
);
