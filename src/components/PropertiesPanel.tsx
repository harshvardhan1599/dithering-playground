import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { DitherControls } from "./DitherCanvas";

type Props = {
  controls: DitherControls;
  onChange: <K extends keyof DitherControls>(
    key: K,
    value: DitherControls[K],
  ) => void;
  backgroundIndex: number;
  onBackgroundChange: (index: number) => void;
};

export type Background = {
  id: string;
  swatch: string;
  page: string;
};

export const BACKGROUNDS: Background[] = [
  {
    id: "blue",
    swatch:
      "radial-gradient(circle at 35% 30%, #4A7DEF 0%, #002A9A 55%, #00021B 100%)",
    page: "linear-gradient(to bottom, #00021B 0%, #002A9A 40%, #0081F3 69%, #F1F8FE 100%)",
  },
  {
    id: "ember",
    swatch:
      "radial-gradient(circle at 35% 30%, #000000 0%, #872F03 33%, #D87518 66%, #FFD99E 100%)",
    page: "linear-gradient(to bottom, #000000 0%, #872F03 33%, #D87518 66%, #FFD99E 100%)",
  },
  {
    id: "orange",
    swatch:
      "radial-gradient(circle at 35% 30%, #E08A4A 0%, #B0501A 55%, #2A1000 100%)",
    page: "linear-gradient(to bottom, #2A1000 0%, #5A2818 40%, #B0501A 70%, #E08A4A 100%)",
  },
  {
    id: "purple",
    swatch:
      "radial-gradient(circle at 35% 30%, #C880E0 0%, #8A40C0 55%, #4A1080 100%)",
    page: "linear-gradient(to bottom, #4A1080 0%, #6A20A0 40%, #8A40C0 70%, #C880E0 100%)",
  },
  {
    id: "sunset",
    swatch:
      "radial-gradient(circle at 50% 20%, #6A2A8A 0%, #2A1820 50%, #E04020 100%)",
    page: "linear-gradient(to bottom, #4A1A50 0%, #2A1A30 40%, #E04020 100%)",
  },
  {
    id: "teal",
    swatch:
      "radial-gradient(circle at 35% 30%, #4AE0C0 0%, #1A8090 55%, #002030 100%)",
    page: "linear-gradient(to bottom, #002030 0%, #1A8090 50%, #4AE0C0 100%)",
  },
];

const STROKE = "currentColor";

const MATRIX_OPTIONS = [
  { value: 0, label: "Bayer 2×2" },
  { value: 1, label: "Bayer 4×4" },
  { value: 2, label: "Bayer 8×8" },
] as const;

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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{
        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
        transition: "transform 200ms ease-out",
      }}
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke={STROKE}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function decimalsFor(step: number) {
  const s = step.toString();
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
};

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const decimals = useMemo(() => decimalsFor(step), [step]);

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = min + t * (max - min);
    const snapped = Math.round(raw / step) * step;
    onChange(clamp(snapped, min, max));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return;
    setFromClientX(e.clientX);
  };

  const pct = ((value - min) / (max - min)) * 100;
  const display = decimals === 0 ? Math.round(value).toString() : value.toFixed(decimals);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-white/70">{label}</span>
        <span className="tabular-nums text-white/80">{display}</span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative h-3 cursor-pointer touch-none select-none"
      >
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
        <div
          className="absolute top-1/2 h-px -translate-y-1/2 bg-white/80"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type SelectOption<T extends number | string> = { value: T; label: string };

type SelectProps<T extends number | string> = {
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (v: T) => void;
};

function SelectField<T extends number | string>({
  label,
  value,
  options,
  onChange,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const current = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <span className="text-[12px] text-white/70">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-[12px] text-white/90 hover:bg-white/15"
        >
          <span>{current}</span>
          <Chevron open={open} />
        </button>
        {open && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-white/20 bg-black/60 backdrop-blur-xl">
            {options.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-2.5 py-1.5 text-[12px] hover:bg-white/10 ${
                  o.value === value ? "text-white" : "text-white/80"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-white/70">{label}</span>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <span
          className="block h-5 w-5 rounded-md border border-white/20"
          style={{ backgroundColor: value }}
        />
        <span className="tabular-nums text-white/80 uppercase">{value}</span>
      </label>
    </div>
  );
}

function Group({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-medium tracking-[0.18em] text-white/80 hover:text-white"
        aria-expanded={open}
      >
        <span>{label.toUpperCase()}</span>
        <Chevron open={open} />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3.5 px-3 pb-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function PropertiesPanel({
  controls,
  onChange,
  backgroundIndex,
  onBackgroundChange,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const num =
    <K extends keyof DitherControls>(key: K) =>
    (v: number) =>
      onChange(key, v as DitherControls[K]);

  return (
    <div
      className="fixed top-4 right-4 z-10 w-[280px] rounded-2xl border border-white/20 bg-white/20 text-white shadow-lg backdrop-blur-xl"
      style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[13px] font-medium tracking-[0.18em] text-white/80">
          PROPERTIES
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
          collapsed
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100"
        }`}
        aria-hidden={collapsed}
      >
        <div className="overflow-hidden">
          <div className="h-px bg-white/15" />
          <div className="max-h-[80vh] overflow-y-auto">
            <Group label="Background">
              <div className="grid grid-cols-5 gap-2 px-1 py-1">
                {BACKGROUNDS.map((bg, i) => {
                  const selected = i === backgroundIndex;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => onBackgroundChange(i)}
                      aria-label={bg.id}
                      aria-pressed={selected}
                      className={`block h-7 w-7 shrink-0 rounded-full transition-shadow ${
                        selected
                          ? "ring-2 ring-white"
                          : "ring-1 ring-white/25 hover:ring-2 hover:ring-white/60"
                      }`}
                      style={{ background: bg.swatch }}
                    />
                  );
                })}
              </div>
            </Group>
            <div className="h-px bg-white/10" />
            <Group label="Noise">
              <Slider
                label="amount"
                value={controls.noiseAmount}
                min={0}
                max={1}
                step={0.01}
                onChange={num("noiseAmount")}
              />
              <Slider
                label="scale"
                value={controls.noiseScale}
                min={0.5}
                max={30}
                step={0.5}
                onChange={num("noiseScale")}
              />
              <Slider
                label="speed"
                value={controls.noiseSpeed}
                min={0}
                max={1}
                step={0.01}
                onChange={num("noiseSpeed")}
              />
            </Group>
            <div className="h-px bg-white/10" />
            <Group label="Halftone">
              <Slider
                label="pixel size"
                value={controls.pixelSize}
                min={1}
                max={12}
                step={1}
                onChange={num("pixelSize")}
              />
              <SelectField
                label="matrix"
                value={controls.matrix}
                options={MATRIX_OPTIONS}
                onChange={(v) => onChange("matrix", v)}
              />
              <Slider
                label="sparsity"
                value={controls.sparsity}
                min={0}
                max={1}
                step={0.01}
                onChange={num("sparsity")}
              />
              <Slider
                label="dot jitter"
                value={controls.dotJitter}
                min={0}
                max={1}
                step={0.01}
                onChange={num("dotJitter")}
              />
            </Group>
            <div className="h-px bg-white/10" />
            <Group label="Render">
              <ColorField
                label="color"
                value={controls.color}
                onChange={(v) => onChange("color", v)}
              />
            </Group>
          </div>
        </div>
      </div>
    </div>
  );
}
