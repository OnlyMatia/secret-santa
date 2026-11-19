"use client";

import BackLink from "@/app/components/BackLink";
import PageWrap from "@/app/components/PageWrap";
import DrawRitual from "@/app/components/DrawRitual";
import LoadingDots from "@/app/components/LoadingDots";
import OrganizerPanel from "@/app/components/OrganizerPanel";
import RoomDrawOverview from "@/app/components/RoomDrawOverview";
import RoomNamePicker from "@/app/components/RoomNamePicker";
import RevealResult from "@/app/components/gsap/RevealResult";
import { useSessionName } from "@/app/hooks/useSessionName";
import { formatDisplayName } from "@/lib/reveal-colors";
import { useCallback, useEffect, useState } from "react";

const RITUAL_MS = 900;

export default function RoomClient({ roomId }) {
  const { name, ready, login, isLoggedIn } = useSessionName();
  const [roomInfo, setRoomInfo] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [myWishes, setMyWishes] = useState("");
  const [wishesOpen, setWishesOpen] = useState(false);
  const [savingWishes, setSavingWishes] = useState(false);
  const [wishesSaved, setWishesSaved] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [showReceiverWishes, setShowReceiverWishes] = useState(false);
  const [pickingName, setPickingName] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [revealDismissed, setRevealDismissed] = useState(true);
  const [revealPortalReady, setRevealPortalReady] = useState(false);

  const loadMe = useCallback(async () => {
    if (!roomId || !isLoggedIn) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}/me`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error || "Greška");
        return;
      }
      if (!data.inGroup) {
        setLoadError(
          "Nisi na popisu ove grupe. Provjeri ime ili pitaj organizatora.",
        );
        return;
      }
      setRoomInfo(data);
      setMyWishes(data.wishes || "");
    } catch {
      setLoadError("Ne mogu učitati grupu");
    }
  }, [roomId, name, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      setPickingName(false);
      loadMe();
    }
  }, [isLoggedIn, loadMe]);

  function handleRoomLogin(storedName) {
    login(storedName);
    setPickingName(false);
    setLoadError("");
    setRoomInfo(null);
    setResult(null);
  }

  async function saveMyWishes() {
    setSavingWishes(true);
    setWishesSaved(false);
    try {
      const res = await fetch(`/api/rooms/${roomId}/wishes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, wishes: myWishes }),
      });
      if (res.ok) setWishesSaved(true);
    } finally {
      setSavingWishes(false);
    }
  }

  async function handleDraw(e) {
    e.preventDefault();
    setError("");
    setShowReceiverWishes(false);
    setResult(null);
    setRevealDismissed(true);
    setRevealPortalReady(false);
    setDrawing(true);
    setRitual(true);

    const started = Date.now();

    try {
      const res = await fetch(`/api/rooms/${roomId}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      const wait = Math.max(0, RITUAL_MS - (Date.now() - started));
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));

      if (!res.ok) {
        setError(data.error || "Greška");
        setRitual(false);
        return;
      }

      setResult(data);
      setRevealKey((k) => k + 1);
      setRevealDismissed(false);
      setRitual(false);
      loadMe();
    } catch {
      setError("Nema veze s poslužiteljem");
      setRitual(false);
    } finally {
      setDrawing(false);
    }
  }

  const revealOverlayOpen =
    result && !revealDismissed && revealPortalReady;
  const showStickyDraw = !ritual && !revealOverlayOpen;
  const hasLeftColumn =
    (roomInfo?.drawStatus?.length ?? 0) > 0 || roomInfo?.isOrganizer;

  if (!ready) return null;

  if (!isLoggedIn || pickingName) {
    return (
      <RoomNamePicker
        roomId={roomId}
        title="Odaberi tko si"
        onContinue={handleRoomLogin}
      />
    );
  }

  if (loadError) {
    return (
      <PageWrap className="py-8 text-center">
        <p className="text-red-300">{loadError}</p>
        <button
          type="button"
          onClick={() => {
            setPickingName(true);
            setLoadError("");
          }}
          className="apple-btn apple-btn-primary mt-6 w-full max-w-xs py-3 text-sm"
        >
          Odaberi ime s popisa grupe
        </button>
        <div className="mt-6 flex justify-center">
          <BackLink>Moje grupe</BackLink>
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          Krivo ime? Na početnoj odaberi drugo ime.
        </p>
      </PageWrap>
    );
  }

  if (!roomInfo) {
    return (
      <PageWrap className="py-8 text-center text-sm text-slate-400">
        Učitavam…
      </PageWrap>
    );
  }

  return (
    <>
      <PageWrap className={showStickyDraw ? "pb-28 lg:pb-10" : "pb-6"}>
        <header className="mb-4 lg:mb-6">
          <div className="flex min-h-[1.25rem] items-center justify-between gap-3">
            <BackLink className="min-w-0 shrink">Moje grupe</BackLink>
            <p className="shrink-0 text-right text-sm font-semibold leading-5 tracking-tight text-white">
              Secret Santa
            </p>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {roomInfo.participantCount} sudionika
            {roomInfo.maxPrice != null && (
              <>
                {" "}
                · maks.{" "}
                <span className="text-blue-400">{roomInfo.maxPrice} €</span>
              </>
            )}
          </p>
        </header>

        <div
          className={
            hasLeftColumn
              ? "lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14"
              : "lg:mx-auto lg:max-w-xl"
          }
        >
          {hasLeftColumn ? (
            <div className="space-y-4 lg:space-y-6">
              {roomInfo.drawStatus?.length > 0 && (
                <RoomDrawOverview
                  participants={roomInfo.drawStatus}
                  revealedCount={roomInfo.revealedCount}
                  totalCount={roomInfo.totalCount}
                />
              )}

              {roomInfo.isOrganizer && (
                <OrganizerPanel
                  roomId={roomId}
                  sessionName={name}
                  participants={roomInfo.drawStatus}
                  onUpdated={() => {
                    setResult(null);
                    setRevealDismissed(true);
                    loadMe();
                  }}
                />
              )}
            </div>
          ) : null}

          <div
            className={`space-y-4 lg:space-y-6 ${
              hasLeftColumn ? "mt-6 lg:mt-0" : ""
            }`}
          >
            <div className="glass rounded-[1.75rem] p-4 lg:p-5">
              <button
                type="button"
                onClick={() => setWishesOpen((v) => !v)}
                className="apple-btn apple-btn-secondary w-full justify-between px-4 py-2.5 text-sm"
              >
                <span>Moje želje poklona</span>
                <span className="text-slate-500">{wishesOpen ? "▲" : "▼"}</span>
              </button>
              {wishesOpen && (
                <div className="wishes-panel mt-3 space-y-3">
                  <textarea
                    value={myWishes}
                    onChange={(e) => {
                      setMyWishes(e.target.value);
                      setWishesSaved(false);
                    }}
                    rows={4}
                    placeholder="Što bi volio/la dobiti?"
                    className="apple-input resize-none text-sm lg:min-h-[120px]"
                  />
                  <button
                    type="button"
                    disabled={savingWishes}
                    onClick={saveMyWishes}
                    className="apple-btn apple-btn-primary w-full py-3 text-sm disabled:opacity-50"
                  >
                    {savingWishes ? "Spremam…" : "Spremi želje"}
                  </button>
                  {wishesSaved && (
                    <p className="text-center text-xs text-blue-300">
                      Spremljeno ✓
                    </p>
                  )}
                </div>
              )}
            </div>

            {ritual && <DrawRitual />}

            {result && !ritual && (
              <RevealResult
                key={revealKey}
                title={
                  result.alreadyRevealed ? "Tvoj darovatelj je" : "Izvukao/la si"
                }
                nameKey={result.receiver.name}
                name={formatDisplayName(result.receiver.name)}
                showReceiverWishes={showReceiverWishes}
                onToggleWishes={() => setShowReceiverWishes((v) => !v)}
                receiverWishes={result.receiver.wishes}
                onDismissed={() => {
                  setRevealDismissed(true);
                  setRevealPortalReady(false);
                }}
                onPortalReady={setRevealPortalReady}
              />
            )}

            {showStickyDraw && (
              <div className="draw-bar-draw hidden rounded-[1.75rem] border border-white/10 p-4 lg:block">
                {error && (
                  <p className="glass-inset mb-3 rounded-xl px-3 py-2 text-center text-xs text-red-200">
                    {error}
                  </p>
                )}
                <form onSubmit={handleDraw}>
                  <button
                    type="submit"
                    disabled={drawing}
                    className="apple-btn apple-btn-primary w-full px-6 py-4 text-base shadow-lg disabled:opacity-50"
                  >
                    {drawing ? (
                      <>
                        <LoadingDots />
                        Izvlačim…
                      </>
                    ) : result && revealDismissed ? (
                      "Prikaži ponovno"
                    ) : (
                      "Odaberi osobu kojoj daruješ"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </PageWrap>

      {showStickyDraw && (
        <div className="draw-bar safe-bottom fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pt-3 lg:hidden">
          <div className="mx-auto w-full max-w-lg">
            {error && (
              <p className="glass-inset mb-2 rounded-xl px-3 py-2 text-center text-xs text-red-200">
                {error}
              </p>
            )}
            <form onSubmit={handleDraw}>
              <button
                type="submit"
                disabled={drawing}
                className="apple-btn apple-btn-primary w-full px-6 py-4 text-base shadow-lg disabled:opacity-50"
              >
                {drawing ? (
                  <>
                    <LoadingDots />
                    Izvlačim…
                  </>
                ) : result && revealDismissed ? (
                  "Prikaži ponovno"
                ) : (
                  "Odaberi osobu kojoj daruješ"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}