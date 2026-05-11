import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import useSound from "use-sound";

type Kind = "click" | "tick" | "swatch";

type SoundsContextValue = {
  play: (kind: Kind) => void;
  /** Scrub the slider sample: pct in [0,1] maps to position in the buffer. */
  scrubSlider: (pct: number) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
};

const SoundsContext = createContext<SoundsContextValue | null>(null);
const STORAGE_KEY = "dithering-playground:sounds-muted";

const SLIDER_SLICE_MS = 60;
const SLIDER_FADE_MS = 10;
const SLIDER_THROTTLE_MS = 25;
const SLIDER_VOLUME = 0.5;

export function SoundsProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  }, [muted]);

  const [playClick] = useSound("/sounds/click.wav", {
    volume: 0.5,
    soundEnabled: !muted,
  });
  const [playTick] = useSound("/sounds/tick.ogg", {
    volume: 0.5,
    soundEnabled: !muted,
  });
  const [playSwatch] = useSound("/sounds/swatch.wav", {
    volume: 0.5,
    soundEnabled: !muted,
  });

  // Web Audio scrub setup (lazily initialized on first user gesture).
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sliderBufferRef = useRef<AudioBuffer | null>(null);
  const lastScrubMsRef = useRef(0);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/sounds/slider.mp3");
        const arr = await res.arrayBuffer();
        // Defer AudioContext creation until first scrub to satisfy autoplay
        // policy; but we can decode using a temporary context's decodeAudioData.
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
        const buf = await audioCtxRef.current.decodeAudioData(arr);
        if (!cancelled) sliderBufferRef.current = buf;
      } catch (err) {
        console.warn("[sounds] failed to load slider sample", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrubSlider = useCallback((pct: number) => {
    if (mutedRef.current) return;
    const ctx = audioCtxRef.current;
    const buffer = sliderBufferRef.current;
    if (!ctx || !buffer) return;

    // Throttle: avoid stacking dozens of overlapping sources on rapid drag.
    const nowMs = performance.now();
    if (nowMs - lastScrubMsRef.current < SLIDER_THROTTLE_MS) return;
    lastScrubMsRef.current = nowMs;

    if (ctx.state === "suspended") void ctx.resume();

    const clamped = Math.min(1, Math.max(0, pct));
    const sliceSec = SLIDER_SLICE_MS / 1000;
    const fadeSec = SLIDER_FADE_MS / 1000;
    const startOffset = clamped * Math.max(0, buffer.duration - sliceSec);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(SLIDER_VOLUME, t + fadeSec);
    gain.gain.setValueAtTime(SLIDER_VOLUME, t + sliceSec - fadeSec);
    gain.gain.linearRampToValueAtTime(0, t + sliceSec);
    src.connect(gain).connect(ctx.destination);
    src.start(t, startOffset);
    src.stop(t + sliceSec);
  }, []);

  const play = useCallback(
    (kind: Kind) => {
      if (muted) return;
      if (kind === "click") playClick();
      else if (kind === "tick") playTick();
      else if (kind === "swatch") playSwatch();
    },
    [muted, playClick, playTick, playSwatch],
  );

  return (
    <SoundsContext.Provider value={{ play, scrubSlider, muted, setMuted }}>
      {children}
    </SoundsContext.Provider>
  );
}

const NOOP_VALUE: SoundsContextValue = {
  play: () => {},
  scrubSlider: () => {},
  muted: false,
  setMuted: () => {},
};

export function useSounds(): SoundsContextValue {
  return useContext(SoundsContext) ?? NOOP_VALUE;
}
