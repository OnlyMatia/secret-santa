"use client";

import Link from "next/link";

export default function GroupList({ groups, loading }) {
  if (loading) {
    return (
      <div className="glass rounded-[1.75rem] p-8 text-center text-sm text-slate-400">
        Učitavam grupe…
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="glass animate-fade-up rounded-[1.75rem] p-8 text-center">
        <p className="text-sm text-slate-400">
          Još nisi u nijednoj grupi. Stvori novu ili otvori link koji dobiješ.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 lg:grid-cols-1 xl:grid-cols-2">
      {groups.map((g, index) => (
        <li
          key={g.roomId}
          className="list-enter"
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          <Link
            href={`/room/${g.roomId}`}
            className="glass block rounded-[1.75rem] p-5 transition hover:border-blue-500/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">Grupa {g.roomId}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {g.participantCount} sudionika
                  {g.maxPrice != null && ` · maks. ${g.maxPrice} €`}
                </p>
                {g.organizerName && (
                  <p className="mt-1 text-xs text-slate-500">
                    Organizator: {g.organizerName}
                  </p>
                )}
              </div>
              <span className="text-blue-400">→</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}