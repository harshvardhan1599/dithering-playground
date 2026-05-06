import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { DitherControls } from "./DitherCanvas";
import { SHAPES } from "../shapes";

const SHAPE_OPTIONS = SHAPES.map((s, i) => ({ value: i, label: s.label }));

type Props = {
  controls: DitherControls;
  onChange: <K extends keyof DitherControls>(
    key: K,
    value: DitherControls[K],
  ) => void;
  backgroundIndex: number;
  onBackgroundChange: (index: number) => void;
  shapeIndex: number;
  onShapeChange: (index: number) => void;
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
    id: "dusk",
    swatch:
      "radial-gradient(circle at 35% 30%, #1F123E 0%, #754A78 38%, #C86B75 56%, #FD7A23 78%, #C72B03 88%, #050005 100%)",
    page:
      "linear-gradient(to bottom, #1F123E 0%, #754A78 38%, #C86B75 56%, #FD7A23 78%, #C72B03 88%, #050005 100%)",
  },
  {
    id: "dawn",
    swatch:
      "radial-gradient(circle at 35% 30%, #03030D 15%, #0273C9 35%, #FDD88F 55%, #F6B83D 70%, #FF8F2D 85%, #FE0000 100%)",
    page:
      "linear-gradient(to bottom, #03030D 15%, #0273C9 35%, #FDD88F 55%, #F6B83D 70%, #FF8F2D 85%, #FE0000 100%)",
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
  {
    id: "candy",
    swatch:
      "radial-gradient(circle at 35% 30%, #000000 0%, #293684 33%, #D16AB3 66%, #FBF6FA 100%)",
    page:
      "linear-gradient(to bottom, #000000 0%, #293684 33%, #D16AB3 66%, #FBF6FA 100%)",
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
  labelClassName?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
};

function Slider({
  label,
  labelClassName,
  value,
  min,
  max,
  step,
  onChange,
}: SliderProps) {
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
        <span className={labelClassName ?? "text-white/70"}>{label}</span>
        <span className="tabular-nums text-white/80">{display}</span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative h-6 cursor-pointer touch-none select-none"
      >
        <div
          className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/20"
          style={{
            boxShadow: "none",
          }}
        />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/80"
          style={{
            width: `${pct}%`,
            boxShadow: "none",
          }}
        />
        <div
          className="absolute top-1/2 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-lg"
          style={{
            left: `${pct}%`,
            background:
              "linear-gradient(#DFDFE1, #DFDFE1) padding-box, linear-gradient(to bottom, #FFFFFF, #A7A7A7) border-box",
            border: "2px solid transparent",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.18)",
          }}
        />
      </div>
    </div>
  );
}

type SelectOption<T extends number | string> = { value: T; label: string };

type SelectProps<T extends number | string> = {
  label?: string;
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(t) &&
        menuRef.current &&
        !menuRef.current.contains(t)
      )
        setOpen(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const current = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-[12px] text-white/70">{label}</span>}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-[12px] text-white/90 hover:bg-white/15"
      >
        <span>{current}</span>
        <Chevron open={open} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            className="overflow-hidden rounded-md border border-white/20 bg-black/70 backdrop-blur-xl"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 50,
              fontFamily: "'Geist Mono', ui-monospace, monospace",
            }}
          >
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
          </div>,
          document.body,
        )}
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
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="px-3 py-2 text-[11px] font-medium tracking-[0.18em] text-white/80">
        {label.toUpperCase()}
      </div>
      <div className="flex flex-col gap-3.5 px-3 pb-3">{children}</div>
    </div>
  );
}

export function PropertiesPanel({
  controls,
  onChange,
  backgroundIndex,
  onBackgroundChange,
  shapeIndex,
  onShapeChange,
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
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <span className="text-[11px] font-medium tracking-[0.18em] text-white/80">
                SHAPE
              </span>
              <div className="w-[140px]">
                <SelectField
                  value={shapeIndex}
                  options={SHAPE_OPTIONS}
                  onChange={onShapeChange}
                />
              </div>
            </div>
            <div className="px-3 py-3">
              <Slider
                label="NOISE"
                labelClassName="text-[11px] font-medium tracking-[0.18em] text-white/80"
                value={controls.noiseAmount}
                min={0}
                max={1}
                step={0.01}
                onChange={num("noiseAmount")}
              />
            </div>
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
