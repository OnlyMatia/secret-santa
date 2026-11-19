"use client";

import { formatDisplayName, paletteForName } from "@/lib/reveal-colors";

export default function RoomDrawOverview({
  participants,
  revealedCount,
  totalCount,
}) {
  return (
    <div className="glass animate-fade-up rounded-[1.75rem] p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-slate-200">Pregled izvlačenja</h2>
        <p className="text-xs text-slate-500">
          {revealedCount}/{totalCount} izvuklo
        </p>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Ne prikazuje se tko je kome dodijeljen — samo je li osoba već izvukla.
      </p>
      <ul className="mt-4 space-y-2">
        {participants.map((p) => {
          const palette = paletteForName(p.name);
          return (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/25 px-3 py-2.5"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background: p.assignmentRevealed
                    ? palette.gradient
                    : "rgba(148, 163, 184, 0.45)",
                  boxShadow: p.assignmentRevealed
                    ? `0 0 10px ${palette.glow}`
                    : "none",
                }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                {formatDisplayName(p.name)}
              </span>
              <span
                className={`text-xs font-medium ${
                  p.assignmentRevealed ? "text-emerald-400/90" : "text-slate-500"
                }`}
              >
                {p.assignmentRevealed ? "Izvukao/la" : "Čeka"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}