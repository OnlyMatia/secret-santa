"use client";

import LoadingDots from "@/app/components/LoadingDots";
import { formatDisplayName } from "@/lib/reveal-colors";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrganizerPanel({
  roomId,
  sessionName,
  participants,
  onUpdated,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(
      participants.map((p) => ({
        id: p.id,
        name: p.name,
      })),
    );
  }, [participants]);

  async function handleRedraw() {
    if (
      !window.confirm(
        "Resetirati izvlačenje? Svi će dobiti nove parove i morat će ponovno izvući.",
      )
    ) {
      return;
    }
    setBusy("redraw");
    setError("");
    try {
      const res = await fetch(`/api/rooms/${roomId}/redraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sessionName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška");
        return;
      }
      setMessage("Izvlačenje je resetirano.");
      onUpdated();
    } finally {
      setBusy("");
    }
  }

  async function saveNames() {
    setBusy("save");
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/rooms/${roomId}/participants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName,
          participants: draft,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška");
        return;
      }
      setMessage("Imena su spremljena.");
      setEditing(false);
      onUpdated();
    } finally {
      setBusy("");
    }
  }

  async function deleteRoom() {
    if (
      !window.confirm(
        "Trajno obrisati cijelu grupu? Ovo se ne može poništiti.",
      )
    ) {
      return;
    }
    setBusy("delete");
    setError("");
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sessionName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Greška");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="glass rounded-[1.75rem] border border-amber-500/20 p-4 lg:p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="apple-btn apple-btn-secondary w-full justify-between px-4 py-2.5 text-sm"
      >
        <span>Organizator — upravljanje</span>
        <span className="text-slate-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="animate-fade-up mt-4 space-y-4">
          {message && (
            <p className="text-center text-xs text-emerald-300">{message}</p>
          )}
          {error && (
            <p className="text-center text-xs text-red-300">{error}</p>
          )}

          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={handleRedraw}
            className="apple-btn apple-btn-secondary w-full py-3 text-sm disabled:opacity-50"
          >
            {busy === "redraw" ? (
              <>
                <LoadingDots />
                Resetiram…
              </>
            ) : (
              "Ponovno izvuci (reset cijele grupe)"
            )}
          </button>

          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMessage("");
                setError("");
              }}
              className="apple-btn apple-btn-secondary w-full py-3 text-sm"
            >
              Uredi imena sudionika
            </button>
          ) : (
            <div className="space-y-2">
              {draft.map((p, index) => (
                <div key={p.id}>
                  <label className="mb-1 block text-xs text-slate-500">
                    {formatDisplayName(participants[index]?.name || p.name)}
                  </label>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev.map((row, i) =>
                          i === index ? { ...row, name: e.target.value } : row,
                        ),
                      )
                    }
                    className="apple-input text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setDraft(
                      participants.map((p) => ({ id: p.id, name: p.name })),
                    );
                  }}
                  className="apple-btn apple-btn-secondary flex-1 py-2.5 text-sm"
                >
                  Odustani
                </button>
                <button
                  type="button"
                  disabled={busy === "save"}
                  onClick={saveNames}
                  className="apple-btn apple-btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
                >
                  {busy === "save" ? "Spremam…" : "Spremi imena"}
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={deleteRoom}
            className="w-full rounded-2xl border border-red-900/50 bg-red-950/30 py-3 text-sm font-medium text-red-200 hover:bg-red-950/50 disabled:opacity-50"
          >
            {busy === "delete" ? "Brišem…" : "Obriši grupu"}
          </button>
        </div>
      )}
    </div>
  );
}