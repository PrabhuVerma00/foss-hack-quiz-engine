import React from 'react';

export default function HostModeration({ players, onMute, onUnmute, mutedSet }) {
  return (
    <div className="host-moderation">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Moderation</p>
      <div className="flex flex-col gap-2">
        {players.map(p => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-300">{p.name}</span>
            </div>
            <div className="flex gap-2">
              {mutedSet.has(p.id) ? (
                <button onClick={() => onUnmute(p.id)} className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30">UNMUTE</button>
              ) : (
                <button onClick={() => onMute(p.id)} className="rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/30">MUTE</button>
              )}
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-3 py-4 text-center text-xs text-slate-500">
            No players available for moderation.
          </div>
        )}
      </div>
    </div>
  );
}
