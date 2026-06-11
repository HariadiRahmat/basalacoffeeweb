export type FeatureIconName =
  | "home"
  | "wallet"
  | "analytics"
  | "menu"
  | "customers"
  | "loyalty"
  | "inventory"
  | "settings"
  | "store"
  | "info"
  | "chevron-right"
  | "ingredients"
  | "recipes"
  | "stock-in"
  | "adjustment"
  | "opname"
  | "movements"
  | "gift"
  | "user-plus"
  | "star"
  | "redeem"
  | "check-circle"
  | "percent"
  | "coins"
  | "edit"
  | "trash"
  | "plus"
  | "download"
  | "file-report";

export function FeatureIcon({
  name,
  className = "h-5 w-5",
}: {
  name: FeatureIconName;
  className?: string;
}) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <rect x="2" y="6" width="20" height="14" rx="2" />
          <path d="M2 10h20M16 14h2" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...props}>
          <path d="M4 20V10M12 20V4M20 20v-7" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    case "customers":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M15 20c.3-2.2 2.2-4 4-4" />
        </svg>
      );
    case "loyalty":
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M12 8V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v3" />
          <path d="M7 13h.01M12 13h.01M17 13h.01" />
        </svg>
      );
    case "inventory":
      return (
        <svg {...props}>
          <path d="M21 8l-9-5-9 5v8l9 5 9-5V8Z" />
          <path d="M3.3 7.7 12 12.5l8.7-4.8M12 22V12.5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      );
    case "store":
      return (
        <svg {...props}>
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
          <path d="M3 9l2-5h14l2 5M9 21V12h6v9" />
        </svg>
      );
    case "info":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6M12 7h.01" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...props}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "ingredients":
      return (
        <svg {...props}>
          <path d="M7 7h10v10H7z" />
          <path d="M4 4h4M16 4h4M4 20h4M16 20h4" />
        </svg>
      );
    case "recipes":
      return (
        <svg {...props}>
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "stock-in":
      return (
        <svg {...props}>
          <path d="M12 3v12M7 10l5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "adjustment":
      return (
        <svg {...props}>
          <path d="M4 7h16M4 12h10M4 17h6" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      );
    case "opname":
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "movements":
      return (
        <svg {...props}>
          <path d="M7 7h10M7 12h7M7 17h10" />
          <path d="M17 7v10" />
        </svg>
      );
    case "gift":
      return (
        <svg {...props}>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M12 8V4M8 4h8a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4Z" />
          <path d="M12 8v12M3 12h18" />
        </svg>
      );
    case "user-plus":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M2 20c0-3.3 3.1-6 7-6" />
          <path d="M16 8v6M13 11h6" />
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <path d="m12 2 2.9 6.5L22 9.5l-5 4.5 1.5 6.5L12 17.5 5.5 20.5 7 14 2 9.5l7.1-1 2.9-6.5Z" />
        </svg>
      );
    case "redeem":
      return (
        <svg {...props}>
          <path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
          <path d="M2 9h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z" />
          <path d="M12 9v12M7 14h10" />
        </svg>
      );
    case "check-circle":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      );
    case "percent":
      return (
        <svg {...props}>
          <circle cx="7" cy="7" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="m5 19 14-14" />
        </svg>
      );
    case "coins":
      return (
        <svg {...props}>
          <ellipse cx="9" cy="7" rx="6" ry="3" />
          <path d="M3 7v4c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
          <path d="M3 11v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" />
        </svg>
      );
    case "edit":
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
        </svg>
      );
    case "trash":
      return (
        <svg {...props}>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "download":
      return (
        <svg {...props}>
          <path d="M12 3v12M7 10l5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "file-report":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6M8 13h8M8 17h6M8 9h2" />
        </svg>
      );
    default:
      return null;
  }
}
