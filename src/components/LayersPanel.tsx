import { useState, type ComponentType } from "react";

export type LayerKey = "dots" | "noise" | "shape" | "grid" | "gradient";

export type LayerVisibility = Record<LayerKey, boolean>;

type Props = {
  visibility: LayerVisibility;
  onToggle: (key: LayerKey) => void;
};

const STROKE = "currentColor";

function PatternIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="6.25" cy="6.25" r="2.5" stroke={STROKE} strokeWidth="1.25" />
      <circle cx="13.75" cy="6.25" r="2.5" stroke={STROKE} strokeWidth="1.25" />
      <circle cx="6.25" cy="13.75" r="2.5" stroke={STROKE} strokeWidth="1.25" />
      <circle
        cx="13.75"
        cy="13.75"
        r="2.5"
        stroke={STROKE}
        strokeWidth="1.25"
      />
    </svg>
  );
}

function NoiseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M16.875 3.75H3.125C2.77982 3.75 2.5 4.02982 2.5 4.375V15.625C2.5 15.9702 2.77982 16.25 3.125 16.25H16.875C17.2202 16.25 17.5 15.9702 17.5 15.625V4.375C17.5 4.02982 17.2202 3.75 16.875 3.75Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12.1875" cy="7.8125" r="0.9375" fill={STROKE} />
      <path
        d="M11.5086 12.8126L13.5156 10.8079C13.6328 10.6908 13.7917 10.625 13.9574 10.625C14.1231 10.625 14.282 10.6908 14.3992 10.8079L17.5 13.911"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 13.1784L6.74531 8.93233C6.80336 8.87422 6.87229 8.82812 6.94816 8.79667C7.02404 8.76521 7.10537 8.74902 7.1875 8.74902C7.26963 8.74902 7.35096 8.76521 7.42684 8.79667C7.50271 8.82812 7.57164 8.87422 7.62969 8.93233L14.9461 16.2495"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShapeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10.0009 1.87492L6.87579 5L10.0009 8.12508L13.126 5L10.0009 1.87492Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0009 11.8749L6.87579 15L10.0009 18.1251L13.126 15L10.0009 11.8749Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0009 6.87492L11.8758 10L15.0009 13.1251L18.126 10L15.0009 6.87492Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.00087 6.87492L1.87579 10L5.00087 13.1251L8.12595 10L5.00087 6.87492Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M15.625 3.75H4.375C4.02982 3.75 3.75 4.02982 3.75 4.375V15.625C3.75 15.9702 4.02982 16.25 4.375 16.25H15.625C15.9702 16.25 16.25 15.9702 16.25 15.625V4.375C16.25 4.02982 15.9702 3.75 15.625 3.75Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 3.75V16.25"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 10H16.25"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GradientIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke={STROKE} strokeWidth="1.25" />
      <path
        d="M10 2.5V17.5"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M15 4.41016V15.5898"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M12.5 2.92773V17.073"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HideToggleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.875 3.75V16.25"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.875 3.75H3.125C2.77982 3.75 2.5 4.02982 2.5 4.375V15.625C2.5 15.9702 2.77982 16.25 3.125 16.25H16.875C17.2202 16.25 17.5 15.9702 17.5 15.625V4.375C17.5 4.02982 17.2202 3.75 16.875 3.75Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HiddenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M2.5 8.125C3.81328 9.75078 6.22109 11.875 10 11.875C13.7789 11.875 16.1867 9.75078 17.5 8.125"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 13.1248L15.6734 9.92871"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 15L11.9461 11.6758"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 15L8.05391 11.6758"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 13.1248L4.32656 9.92871"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VisibleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 4.375C3.75 4.375 1.25 10 1.25 10C1.25 10 3.75 15.625 10 15.625C16.25 15.625 18.75 10 18.75 10C18.75 10 16.25 4.375 10 4.375Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 13.125C11.7259 13.125 13.125 11.7259 13.125 10C13.125 8.27411 11.7259 6.875 10 6.875C8.27411 6.875 6.875 8.27411 6.875 10C6.875 11.7259 8.27411 13.125 10 13.125Z"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const LAYERS: { key: LayerKey; label: string; Icon: ComponentType }[] = [
  { key: "dots", label: "Pattern", Icon: PatternIcon },
  { key: "noise", label: "Noise", Icon: NoiseIcon },
  { key: "shape", label: "Shape", Icon: ShapeIcon },
  { key: "grid", label: "Grid", Icon: GridIcon },
  { key: "gradient", label: "Gradient", Icon: GradientIcon },
];

export function LayersPanel({ visibility, onToggle }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="fixed top-4 left-4 z-10 w-[220px] rounded-2xl border border-white/20 bg-white/20 text-white shadow-lg backdrop-blur-xl"
      style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[13px] font-medium tracking-[0.18em] text-white/80">
          LAYERS
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
          aria-expanded={!collapsed}
          className="grid h-6 w-6 place-items-center rounded text-white/80 hover:text-white"
        >
          <HideToggleIcon />
        </button>
      </div>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
        }`}
        aria-hidden={collapsed}
      >
        <div className="overflow-hidden">
          <div className="h-px bg-white/15" />
          <ul className="flex flex-col p-2">
        {LAYERS.map(({ key, label, Icon }) => {
          const visible = visibility[key];
          return (
            <li key={key} className="group">
              <button
                type="button"
                onClick={() => onToggle(key)}
                aria-label={`${visible ? "Hide" : "Show"} ${label}`}
                aria-pressed={visible}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10"
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`grid h-5 w-5 place-items-center transition-colors ${
                      visible
                        ? "text-white/80 group-hover:text-white"
                        : "text-white/40"
                    }`}
                  >
                    <Icon />
                  </span>
                  <span
                    className={`text-[14px] tracking-tight ${
                      visible ? "text-white" : "text-white/40"
                    }`}
                  >
                    {label}
                  </span>
                </span>
                <span
                  className={`grid h-5 w-5 place-items-center text-white/80 transition-opacity ${
                    visible
                      ? "opacity-0 group-hover:opacity-100"
                      : "opacity-100"
                  }`}
                  aria-hidden
                >
                  {visible ? <VisibleIcon /> : <HiddenIcon />}
                </span>
              </button>
            </li>
          );
        })}
          </ul>
        </div>
      </div>
    </div>
  );
}
