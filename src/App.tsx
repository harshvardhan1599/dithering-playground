import { DitherCanvas } from "./components/DitherCanvas";

function App() {
  return (
    <div className="fixed inset-0">
      <DitherCanvas />
      <header className="pointer-events-none absolute left-6 top-6 font-mono text-xs uppercase tracking-[0.18em] text-white/80 mix-blend-difference">
        Dithering Playground
      </header>
      <footer className="pointer-events-none absolute bottom-6 left-6 font-mono text-[11px] uppercase tracking-[0.16em] text-white/60 mix-blend-difference">
        Move the cursor · tune the panel
      </footer>
    </div>
  );
}

export default App;
