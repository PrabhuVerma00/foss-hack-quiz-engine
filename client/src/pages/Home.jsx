import { useEffect, useState } from 'react'
import Host from '../components/Host'
import Player from '../components/Player'
import DeckStudio from './DeckStudio'

const VIEW_STORAGE_KEY = 'lf_home_view';

function readInitialView() {
  if (typeof window === 'undefined') return 'landing';
  const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
  return ['landing', 'host', 'player', 'studio'].includes(saved) ? saved : 'landing';
}

export default function Home() {
  const [view, setView] = useState(readInitialView)
  const [studioQuestions, setStudioQuestions] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  const goHome = () => {
    setView('landing');
    setStudioQuestions(null);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_STORAGE_KEY, 'landing');
    }
  };

  if (view === 'host')   return <Host studioQuestions={studioQuestions} onBack={goHome} />
  if (view === 'player') return <Player onBack={goHome} />
  if (view === 'studio') {
    return (
      <DeckStudio
        onBack={goHome}
        onHostDeck={(questions) => {
          setStudioQuestions(questions);
          setView('host');
        }}
      />
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(16,185,129,0.20),rgba(2,6,23,0)_70%)]" />
      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-12 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="z-10 flex w-full max-w-sm animate-phase-in flex-col items-center rounded-3xl border border-emerald-900/40 bg-slate-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.5em] text-emerald-400">Local Multiplayer Quiz</p>
        <h1 className="text-6xl font-black tracking-tight mb-2">LocalFlux</h1>
        <p className="text-slate-400 text-sm mb-10">Fast rounds. Live chat. Instant score swings.</p>

        <div className="flex flex-col gap-4 w-full">
        <button
          onClick={() => setView('host')}
          className="w-full rounded-2xl bg-emerald-400 py-5 text-xl font-black tracking-tight text-black transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-500/30 active:translate-y-0 active:scale-95"
        >
          HOST
        </button>
        <button
          onClick={() => setView('studio')}
          className="w-full rounded-2xl border border-amber-400/40 bg-amber-400/10 py-4 text-lg font-black tracking-tight text-amber-200 transition-all duration-150 hover:-translate-y-0.5 hover:bg-amber-400/20 active:translate-y-0 active:scale-95"
        >
          DECK STUDIO
        </button>
        <button
          onClick={() => setView('player')}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-5 text-xl font-black tracking-tight text-white transition-all duration-150 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-slate-900 active:translate-y-0 active:scale-95"
        >
          JOIN
        </button>
        </div>
      </div>
    </div>
  )
}
