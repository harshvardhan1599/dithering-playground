import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import useSound from "use-sound";

type Kind = "click" | "tick" | "swatch";

type SoundsContextValue = {
  play: (kind: Kind) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
};

const SoundsContext = createContext<SoundsContextValue | null>(null);
const STORAGE_KEY = "dithering-playground:sounds-muted";

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
  const [playTick] = useSound("/sounds/tick.wav", {
    volume: 0.4,
    soundEnabled: !muted,
  });
  const [playSwatch] = useSound("/sounds/swatch.wav", {
    volume: 0.5,
    soundEnabled: !muted,
  });

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
    <SoundsContext.Provider value={{ play, muted, setMuted }}>
      {children}
    </SoundsContext.Provider>
  );
}

const NOOP_VALUE: SoundsContextValue = {
  play: () => {},
  muted: false,
  setMuted: () => {},
};

export function useSounds(): SoundsContextValue {
  return useContext(SoundsContext) ?? NOOP_VALUE;
}
