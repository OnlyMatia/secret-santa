"use client";

import { formatDisplayName, paletteForName } from "@/lib/reveal-colors";
import { setStoredName } from "@/lib/session";
import BackLink from "@/app/components/BackLink";
import PageWrap from "@/app/components/PageWrap";
import { useCallback, useEffect, useState } from "react";

export default function RoomNamePicker({ roomId, onContinue, title }) {
  const [names, setNames] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [manual, setManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const [error, setError] = useState("");

  const loadRoom = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || "Grupa nije pronađena");
        return;
      }
      setNames(data.names || []);
      setMeta({
        maxPrice: data.maxPrice,
        participantCount: data.participantCount,
      });
    } catch {
      setLoadError("Ne mogu učitati grupu");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  function pickName(storedName) {
    setStoredName(storedName);
    onContinue(storedName);
  }

  function submitManual(e) {
    e.preventDefault();
    const trimmed = manualName.trim();
    if (!trimmed) {
      setError("Upiši ime");
      return;
    }
    pickName(trimmed);
  }

  if (loading) {
    return (
      <PageWrap className="py-14 text-center text-sm text-slate-400">
        Učitavam sudionike…
      </PageWrap>
    );
  }

  if (loadError) {
    return (
      <PageWrap className="py-14 text-center">
        <p className="text-red-300">{loadError}</p>
        <div className="mt-8 flex justify-center">
          <BackLink>Početna — moje grupe</BackLink>
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap className="pb-10">
      <header className="mb-4 text-center lg:mb-6 lg:text-left">
        <p className="text-sm font-medium text-blue-400">Grupa {roomId}</p>
        <h1 className="mt-2 text-[1.75rem] font-semibold tracking-tight text-white">
          {title || "Tko si u ovoj grupi?"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Odaberi svoje ime s popisa. Tako se prijaviš bez greške u pisanju.
        </p>
        {meta && (
          <p className="mt-2 text-xs text-slate-500">
            {meta.participantCount} sudionika
            {meta.maxPrice != null && ` · maks. ${meta.maxPrice} €`}
          </p>
        )}
      </header>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {names.map((storedName, index) => {
          const palette = paletteForName(storedName);
          return (
            <li
              key={storedName}
              className="list-enter"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                type="button"
                onClick={() => pickName(storedName)}
                className="w-full rounded-[1.25rem] border px-5 py-4 text-left text-lg font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-[0.99]"
                style={{
                  background: palette.gradient,
                  borderColor: palette.border,
                  boxShadow: palette.shadow,
                }}
              >
                {formatDisplayName(storedName)}
              </button>
            </li>
          );
        })}
      </ul>

      {!manual ? (
        <button
          type="button"
          onClick={() => setManual(true)}
          className="apple-btn apple-btn-secondary mt-6 w-full py-3 text-sm text-slate-400"
        >
          Ručno upiši ime
        </button>
      ) : (
        <form onSubmit={submitManual} className="animate-fade-up mt-6 space-y-3">
          <input
            type="text"
            placeholder="Ime kao na popisu"
            value={manualName}
            onChange={(e) => {
              setManualName(e.target.value);
              setError("");
            }}
            className="apple-input"
          />
          {error && (
            <p className="text-sm text-red-300">{error}</p>
          )}
          <button
            type="submit"
            className="apple-btn apple-btn-primary w-full py-3 text-sm"
          >
            Nastavi
          </button>
        </form>
      )}

      <div className="mt-8 lg:max-w-xs">
        <BackLink>Natrag na moje grupe</BackLink>
      </div>
    </PageWrap>
  );
}