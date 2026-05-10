import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import type { DitherControls } from "./DitherCanvas";
import { SHAPES } from "../shapes";
import { useSounds } from "../sounds";

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
  darkUI?: boolean;
};

export type Background = {
  id: string;
  name: string;
  swatch: string;
  page: string;
  darkUI?: boolean;
};

export const BACKGROUNDS: Background[] = [
  {
    id: "blue",
    name: "Midnight",
    swatch:
      "radial-gradient(circle at 35% 30%, #4A7DEF 0%, #002A9A 55%, #00021B 100%)",
    page: "linear-gradient(to bottom, #00021B 0%, #002A9A 40%, #0081F3 69%, #F1F8FE 100%)",
  },
  {
    id: "ember",
    name: "Ember",
    swatch:
      "radial-gradient(circle at 35% 30%, #000000 0%, #872F03 33%, #D87518 66%, #FFD99E 100%)",
    page: "linear-gradient(to bottom, #000000 0%, #872F03 33%, #D87518 66%, #FFD99E 100%)",
  },
  {
    id: "dusk",
    name: "Dusk",
    swatch:
      "radial-gradient(circle at 35% 30%, #1F123E 0%, #754A78 38%, #C86B75 56%, #FD7A23 78%, #C72B03 88%, #050005 100%)",
    page:
      "linear-gradient(to bottom, #1F123E 0%, #754A78 38%, #C86B75 56%, #FD7A23 78%, #C72B03 88%, #050005 100%)",
  },
  {
    id: "dawn",
    name: "Dawn",
    swatch:
      "radial-gradient(circle at 35% 30%, #03030D 15%, #0273C9 35%, #FDD88F 55%, #F6B83D 70%, #FF8F2D 85%, #FE0000 100%)",
    page:
      "linear-gradient(to bottom, #03030D 15%, #0273C9 35%, #FDD88F 55%, #F6B83D 70%, #FF8F2D 85%, #FE0000 100%)",
  },
  {
    id: "orange",
    name: "Marigold",
    swatch:
      "radial-gradient(circle at 35% 30%, #E08A4A 0%, #B0501A 55%, #2A1000 100%)",
    page: "linear-gradient(to bottom, #2A1000 0%, #5A2818 40%, #B0501A 70%, #E08A4A 100%)",
  },
  {
    id: "purple",
    name: "Lavender",
    swatch:
      "radial-gradient(circle at 35% 30%, #C880E0 0%, #8A40C0 55%, #4A1080 100%)",
    page: "linear-gradient(to bottom, #4A1080 0%, #6A20A0 40%, #8A40C0 70%, #C880E0 100%)",
  },
  {
    id: "sunset",
    name: "Mulberry",
    swatch:
      "radial-gradient(circle at 50% 20%, #6A2A8A 0%, #2A1820 50%, #E04020 100%)",
    page: "linear-gradient(to bottom, #4A1A50 0%, #2A1A30 40%, #E04020 100%)",
  },
  {
    id: "teal",
    name: "Lagoon",
    swatch:
      "radial-gradient(circle at 35% 30%, #4AE0C0 0%, #1A8090 55%, #002030 100%)",
    page: "linear-gradient(to bottom, #002030 0%, #1A8090 50%, #4AE0C0 100%)",
  },
  {
    id: "candy",
    name: "Bubblegum",
    swatch:
      "radial-gradient(circle at 35% 30%, #000000 0%, #293684 33%, #D16AB3 66%, #FBF6FA 100%)",
    page:
      "linear-gradient(to bottom, #000000 0%, #293684 33%, #D16AB3 66%, #FBF6FA 100%)",
  },
  {
    id: "glacier",
    name: "Glacier",
    swatch:
      "radial-gradient(circle at 35% 30%, #010609 0%, #1A648B 50%, #BDE8FF 100%)",
    page:
      "linear-gradient(to bottom, #010609 0%, #1A648B 50%, #BDE8FF 100%)",
  },
  // {
  //   id: "lime",
  //   name: "Lime",
  //   swatch:
  //     "radial-gradient(circle at 35% 30%, #15FB3F 0%, #FFF701 50%, #FEFEFE 100%)",
  //   page:
  //     "linear-gradient(to bottom, #15FB3F 0%, #FFF701 50%, #FEFEFE 100%)",
  //   darkUI: true,
  // },
  // {
  //   id: "hibiscus",
  //   name: "Hibiscus",
  //   swatch:
  //     "radial-gradient(circle at 35% 30%, #EF765C 0%, #FC0146 30%, #FD6337 50%, #DEC7D9 100%)",
  //   page:
  //     "linear-gradient(to bottom, #EF765C 0%, #FC0146 30%, #FD6337 50%, #DEC7D9 100%)",
  //   darkUI: true,
  // },
];

const STROKE = "currentColor";

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
  darkUI?: boolean;
};

function Slider({
  label,
  labelClassName,
  value,
  min,
  max,
  step,
  onChange,
  darkUI = false,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const decimals = useMemo(() => decimalsFor(step), [step]);
  const { play } = useSounds();

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const t = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = min + t * (max - min);
    const snapped = Math.round(raw / step) * step;
    const next = clamp(snapped, min, max);
    if (next !== value) {
      play("tick");
      onChange(next);
    }
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
        <span
          className={
            labelClassName ?? (darkUI ? "text-black/70" : "text-white/70")
          }
        >
          {label}
        </span>
        <span
          className={`tabular-nums ${darkUI ? "text-black/80" : "text-white/80"}`}
        >
          {display}
        </span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative h-6 cursor-pointer touch-none select-none"
      >
        <div
          className={`absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full ${
            darkUI ? "bg-black/20" : "bg-white/20"
          }`}
          style={{
            boxShadow: "none",
          }}
        />
        <div
          className={`absolute top-1/2 h-1 -translate-y-1/2 rounded-full ${
            darkUI ? "bg-black/80" : "bg-white/80"
          }`}
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

type KnobProps = {
  label: string;
  labelClassName?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  darkUI?: boolean;
};

const KNOB_DISK = 88;
const KNOB_NUM_R = KNOB_DISK / 2 + 22;
const KNOB_DOT_R = (KNOB_DISK / 2) * 0.65;
const KNOB_CONTAINER = KNOB_NUM_R * 2 + 24;

function Knob({
  label,
  labelClassName,
  value,
  min,
  max,
  step,
  onChange,
  darkUI = false,
}: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  const wheelAccumRef = useRef(0);
  const { play } = useSounds();
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  });

  useEffect(() => {
    valueRef.current = value;
  });

  const valueFromPointer = (clientX: number, clientY: number): number | null => {
    const el = knobRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    if (dx * dx + dy * dy < 25) return null; // ignore near-center clicks
    let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (a > 135) a = 135;
    else if (a < -135) a = -135;
    const t = (a + 135) / 270;
    const raw = min + t * (max - min);
    return clamp(Math.round(raw / step) * step, min, max);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const next = valueFromPointer(e.clientX, e.clientY);
    if (next != null && next !== value) {
      play("tick");
      onChange(next);
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return;
    const next = valueFromPointer(e.clientX, e.clientY);
    if (next != null && next !== valueRef.current) {
      play("tick");
      onChange(next);
    }
  };

  // Native wheel listener so preventDefault actually stops the page from
  // scrolling while the cursor is over the knob.
  useEffect(() => {
    const el = knobRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const dy = -e.deltaY;
      const dx = e.deltaX;
      const composite = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
      wheelAccumRef.current += composite;
      const THRESHOLD = 30;
      if (Math.abs(wheelAccumRef.current) < THRESHOLD) return;
      const sign = Math.sign(wheelAccumRef.current);
      wheelAccumRef.current = 0;
      const next = clamp(valueRef.current + sign * step, min, max);
      if (next !== valueRef.current) {
        playRef.current("tick");
        onChange(next);
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [min, max, step, onChange]);

  const valueToAngle = (v: number) =>
    -135 + ((v - min) / (max - min)) * 270;

  const numbers: number[] = [];
  for (let v = min; v <= max + 1e-6; v += step) numbers.push(Math.round(v));

  const currentAngle = valueToAngle(value);
  const currentRad = (currentAngle * Math.PI) / 180;
  const dotX = Math.sin(currentRad) * KNOB_DOT_R;
  const dotY = -Math.cos(currentRad) * KNOB_DOT_R;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px]">
        <span
          className={
            labelClassName ?? (darkUI ? "text-black/70" : "text-white/70")
          }
        >
          {label}
        </span>
        <span
          className={`tabular-nums ${darkUI ? "text-black/80" : "text-white/80"}`}
        >
          {Math.round(value)}
        </span>
      </div>
      <div
        className="relative mx-auto"
        style={{ width: KNOB_CONTAINER, height: KNOB_CONTAINER }}
      >
        {numbers.map((v) => {
          const a = valueToAngle(v);
          const rad = (a * Math.PI) / 180;
          const x = Math.sin(rad) * KNOB_NUM_R;
          const y = -Math.cos(rad) * KNOB_NUM_R;
          const active = v === Math.round(value);
          const numColor = darkUI
            ? active
              ? "text-black"
              : "text-black/55"
            : active
              ? "text-white"
              : "text-white/55";
          return (
            <span
              key={v}
              className={`pointer-events-none absolute text-[10px] tabular-nums ${numColor}`}
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${a}deg)`,
              }}
            >
              {v}
            </span>
          );
        })}
        <div
          ref={knobRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          className="absolute left-1/2 top-1/2 cursor-pointer touch-none select-none"
          style={{
            width: KNOB_DISK,
            height: KNOB_DISK,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background:
              "linear-gradient(#DFDFE1, #DFDFE1) padding-box, linear-gradient(to bottom, #FFFFFF, #A7A7A7) border-box",
            border: "2px solid transparent",
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.18)",
          }}
        >
          <div
            className="pointer-events-none absolute"
            style={{
              left: "50%",
              top: "50%",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#FF5A1F",
              transform: `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`,
            }}
          />
        </div>
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
  darkUI?: boolean;
};

function SelectField<T extends number | string>({
  label,
  value,
  options,
  onChange,
  darkUI = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { play } = useSounds();
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

  const buttonClasses = darkUI
    ? "border-black/20 bg-black/10 text-black/90 hover:bg-black/15"
    : "border-white/20 bg-white/10 text-white/90 hover:bg-white/15";
  const menuShell = darkUI
    ? "border-black/20 bg-white/70"
    : "border-white/20 bg-black/70";
  const menuItem = (active: boolean) =>
    darkUI
      ? `${active ? "text-black" : "text-black/80"} hover:bg-black/10`
      : `${active ? "text-white" : "text-white/80"} hover:bg-white/10`;
  const labelColor = darkUI ? "text-black/70" : "text-white/70";

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className={`text-[12px] ${labelColor}`}>{label}</span>}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          play("click");
          setOpen((o) => !o);
        }}
        className={`flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-[12px] ${buttonClasses}`}
      >
        <span>{current}</span>
        <Chevron open={open} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            className={`overflow-hidden rounded-md border backdrop-blur-xl ${menuShell}`}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 50,
              fontFamily: "'Departure Mono', ui-monospace, monospace",
            }}
          >
            {options.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => {
                  play("tick");
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-2.5 py-1.5 text-[12px] ${menuItem(o.value === value)}`}
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
  labelClassName,
  value,
  onChange,
  darkUI = false,
}: {
  label: string;
  labelClassName?: string;
  value: string;
  onChange: (v: string) => void;
  darkUI?: boolean;
}) {
  const { play } = useSounds();
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span
        className={
          labelClassName ?? (darkUI ? "text-black/70" : "text-white/70")
        }
      >
        {label}
      </span>
      <label
        className="flex cursor-pointer items-center gap-2"
        onClick={() => play("click")}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <span
          className={`block h-5 w-5 rounded-md border ${darkUI ? "border-black/20" : "border-white/20"}`}
          style={{ backgroundColor: value }}
        />
        <span
          className={`tabular-nums uppercase ${darkUI ? "text-black/80" : "text-white/80"}`}
        >
          {value}
        </span>
      </label>
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
  darkUI = false,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { play } = useSounds();

  const num =
    <K extends keyof DitherControls>(key: K) =>
    (v: number) =>
      onChange(key, v as DitherControls[K]);

  const sectionLabel = `text-[11px] font-medium tracking-[0.18em] ${darkUI ? "text-black/80" : "text-white/80"}`;
  const panelShell = darkUI
    ? "border-black/20 bg-black/20 text-black"
    : "border-white/20 bg-white/20 text-white";
  const headerLabel = darkUI ? "text-black/80" : "text-white/80";
  const toggleBtn = darkUI
    ? "text-black/80 hover:text-black"
    : "text-white/80 hover:text-white";
  const divider = darkUI ? "bg-black/15" : "bg-white/15";
  const ringSelected = darkUI ? "ring-black" : "ring-white";
  const ringDefault = darkUI
    ? "ring-black/25 hover:ring-black/60"
    : "ring-white/25 hover:ring-white/60";

  return (
    <div
      className={`fixed top-4 right-4 z-10 w-[280px] rounded-2xl border shadow-lg backdrop-blur-xl ${panelShell}`}
      style={{ fontFamily: "'Departure Mono', ui-monospace, monospace" }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span
          className={`text-[13px] font-medium tracking-[0.18em] ${headerLabel}`}
        >
          PROPERTIES
        </span>
        <button
          type="button"
          onClick={() => {
            play("click");
            setCollapsed((c) => !c);
          }}
          aria-label={collapsed ? "Expand panel" : "Collapse panel"}
          aria-expanded={!collapsed}
          className={`grid h-6 w-6 place-items-center rounded ${toggleBtn}`}
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
          <div className={`h-px ${divider}`} />
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="px-3 py-3">
              <div className="grid grid-cols-5 gap-2 px-1 py-1">
                {BACKGROUNDS.map((bg, i) => {
                  const selected = i === backgroundIndex;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => {
                        play("swatch");
                        onBackgroundChange(i);
                      }}
                      aria-label={bg.id}
                      aria-pressed={selected}
                      className={`block h-7 w-7 shrink-0 rounded-full transition-shadow ${
                        selected ? `ring-2 ${ringSelected}` : `ring-1 ${ringDefault}`
                      }`}
                      style={{ background: bg.swatch }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <span className={sectionLabel}>SHAPE</span>
              <div className="w-[140px]">
                <SelectField
                  value={shapeIndex}
                  options={SHAPE_OPTIONS}
                  onChange={onShapeChange}
                  darkUI={darkUI}
                />
              </div>
            </div>
            <div className="px-3 py-3">
              <ColorField
                label="COLOR"
                labelClassName={sectionLabel}
                value={controls.color}
                onChange={(v) => onChange("color", v)}
                darkUI={darkUI}
              />
            </div>
            <div className="px-3 py-3">
              <Knob
                label="PIXEL SIZE"
                labelClassName={sectionLabel}
                value={controls.pixelSize}
                min={1}
                max={12}
                step={1}
                onChange={num("pixelSize")}
                darkUI={darkUI}
              />
            </div>
            <div className="px-3 py-3">
              <Slider
                label="NOISE"
                labelClassName={sectionLabel}
                value={controls.noiseAmount}
                min={0}
                max={1}
                step={0.01}
                onChange={num("noiseAmount")}
                darkUI={darkUI}
              />
            </div>
            <div className="px-3 py-3">
              <Slider
                label="SPARSITY"
                labelClassName={sectionLabel}
                value={controls.sparsity}
                min={0}
                max={1}
                step={0.01}
                onChange={num("sparsity")}
                darkUI={darkUI}
              />
            </div>
            <div className="px-3 py-3">
              <Slider
                label="DOT JITTER"
                labelClassName={sectionLabel}
                value={controls.dotJitter}
                min={0}
                max={1}
                step={0.01}
                onChange={num("dotJitter")}
                darkUI={darkUI}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
