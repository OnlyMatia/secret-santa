"use client";

import LoadingDots from "@/app/components/LoadingDots";
import { useRef, useState } from "react";

export default function CreateGroupForm({ organizerName, onCancel, onCreated }) {
  const idRef = useRef(0);
  const makePerson = () => ({
    id: `p-${++idRef.current}`,
    name: "",
    wishes: "",
  });

  const [maxPrice, setMaxPrice] = useState("");
  const [people, setPeople] = useState(() => [makePerson(), makePerson()]);
  const [expandedWishes, setExpandedWishes] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleWishes(id) {
    setExpandedWishes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updatePerson(index, field, value) {
    setPeople((prev) => {
      let next = prev.map((p, i) => (i === index ? { ...p, [field]: value } : p));

      if (field === "name") {
        const last = next[next.length - 1];
        if (last?.name.trim()) {
          next = [...next, makePerson()];
        }
        if (next.length < 2) {
          while (next.length < 2) next.push(makePerson());
        }
      }

      return next;
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerName,
          maxPrice,
          participants: people.filter((p) => p.name.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška");
        return;
      }
      onCreated(data.roomId);
    } catch {
      setError("Nema veze s poslužiteljem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="animate-fade-up space-y-5">
      <div className="glass animate-fade-up stagger-1 rounded-[1.75rem] p-6">
        <p className="text-sm text-slate-400">Organizator</p>
        <p className="mt-1 text-lg font-medium text-white">{organizerName}</p>
        <p className="mt-2 text-xs text-slate-500">
          Ime se u bazi sprema malim slovima i latinicom (npr. matija s).
        </p>
      </div>

      <div className="glass animate-fade-up stagger-2 rounded-[1.75rem] p-6">
        <label htmlFor="maxPrice" className="text-sm font-medium text-slate-300">
          Maksimalna cijena (opcionalno)
        </label>
        <div className="mt-3 flex items-center gap-3">
          <input
            id="maxPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="npr. 30"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="apple-input"
          />
          <span className="shrink-0 text-sm text-slate-500">€</span>
        </div>
      </div>

      <div>
        <h2 className="px-1 text-sm font-medium text-blue-300/90">
          Ostali sudionici
        </h2>
        <p className="mt-1 px-1 text-xs text-slate-500">
          Kad popuniš karticu, pojavi se sljedeća prazna. Prazne se ne spremaju.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {people.map((person, index) => (
          <div
            key={person.id}
            className="glass list-enter space-y-3 rounded-[1.75rem] p-5"
            style={{ animationDelay: `${0.05 * index}s` }}
          >
            <input
              type="text"
              placeholder={`Sudionik ${index + 1}`}
              value={person.name}
              onChange={(e) => updatePerson(index, "name", e.target.value)}
              className="apple-input"
            />

            <button
              type="button"
              onClick={() => toggleWishes(person.id)}
              className="apple-btn apple-btn-secondary w-full justify-between px-4 py-2.5 text-sm"
            >
              <span>Želje poklona (opcionalno)</span>
              <span className="text-slate-500">
                {expandedWishes.has(person.id) ? "▲" : "▼"}
              </span>
            </button>

            {expandedWishes.has(person.id) && (
              <div className="wishes-panel">
                <textarea
                  placeholder="Možeš i kasnije u grupi, prijavljen svojim imenom"
                  value={person.wishes}
                  onChange={(e) =>
                    updatePerson(index, "wishes", e.target.value)
                  }
                  rows={3}
                  className="apple-input resize-none text-sm"
                />
              </div>
            )}
          </div>
        ))}
        </div>
      </div>

      {error && (
        <p className="glass-inset rounded-[1.25rem] px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="back-link back-link-block flex-1"
          >
            <span className="back-link-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14.5 6.5L9 12l5.5 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="back-link-text">Natrag</span>
          </button>
        <button
          type="submit"
          disabled={loading}
          className="apple-btn apple-btn-primary flex-[2] px-6 py-4 text-base disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingDots />
              Stvaram…
            </>
          ) : (
            "Stvori grupu"
          )}
        </button>
      </div>
    </form>
  );
}