"use client";

import { paletteForName } from "@/lib/reveal-colors";
import { EASE_SPRING, isReducedMotion } from "@/app/gsap/motion";
import gsap from "gsap";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CONFETTI_COUNT = 42;
const CONFETTI_COLORS = [
  "#fde047",
  "#f472b6",
  "#34d399",
  "#60a5fa",
  "#fb923c",
  "#c4b5fd",
  "#f87171",
];

function random(min, max) {
  return min + Math.random() * (max - min);
}

export default function RevealResult({
  title,
  name,
  nameKey,
  showReceiverWishes,
  onToggleWishes,
  receiverWishes,
  onDismissed,
  onPortalReady,
}) {
  const palette = useMemo(
    () => paletteForName(nameKey ?? name),
    [nameKey, name],
  );

  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [spinDone, setSpinDone] = useState(false);

  const overlayRef = useRef(null);
  const flipRef = useRef(null);
  const confettiWrapRef = useRef(null);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted || dismissed) {
      onPortalReady?.(false);
      return;
    }
    if (overlayRef.current) onPortalReady?.(true);
    return () => onPortalReady?.(false);
  }, [mounted, dismissed, onPortalReady]);

  useEffect(() => {
    if (!mounted || dismissed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted, dismissed]);

  useLayoutEffect(() => {
    if (!mounted || dismissed) return;

    const flip = flipRef.current;
    const overlay = overlayRef.current;
    if (!flip || !overlay) return;

    const reduced = isReducedMotion();
    let cancelled = false;
    const pieces = confettiWrapRef.current?.querySelectorAll("[data-confetti]");

    const burstConfetti = () => {
      if (!pieces?.length) return;
      pieces.forEach((el) => {
        const angle = random(-155, -25) * (Math.PI / 180);
        const dist = random(100, 240);
        const side = Math.random() > 0.5 ? 1 : -1;
        const dx = Math.cos(angle) * dist * 0.55 + side * random(50, 140);
        const dy = Math.sin(angle) * dist;
        const spin = random(-720, 720);

        gsap.fromTo(
          el,
          { x: 0, y: 0, opacity: 1, rotate: 0, scale: random(0.7, 1.1) },
          {
            x: dx,
            y: dy,
            rotate: spin,
            opacity: 0,
            duration: random(0.85, 1.35),
            ease: "power2.out",
            delay: random(0, 0.12),
          },
        );
      });
    };

    let finished = false;
    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      setSpinDone(true);
      burstConfetti();
      const labels = flip.querySelectorAll("[data-front-label]");
      gsap.set(labels, { opacity: 1, y: 0, clearProps: "transform" });
      if (!reduced) {
        gsap.fromTo(
          labels,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.45, ease: EASE_SPRING },
        );
      }
    };

    const safety = window.setTimeout(finish, 3200);

    const gsapCtxRef = { current: null };

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;

        gsapCtxRef.current = gsap.context(() => {
          if (reduced) {
            gsap.set(flip, { rotateY: 180, force3D: true });
            finish();
            return;
          }

          gsap.killTweensOf(flip);
          gsap.set(flip, {
            rotateY: 0,
            force3D: true,
            transformPerspective: 1000,
          });
          gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.28 });

          gsap.to(flip, {
            rotateY: 180,
            duration: 1.35,
            ease: EASE_SPRING,
            force3D: true,
            onComplete: () => {
              window.clearTimeout(safety);
              finish();
            },
          });
        }, overlay);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
      gsapCtxRef.current?.revert();
    };
  }, [mounted, dismissed, nameKey, name]);

  function dismiss() {
    setDismissed(true);
    onDismissed?.();
  }

  const wishesBlock = (
    <div className="animate-fade-up glass rounded-[1.75rem] p-4">
      <button
        type="button"
        onClick={onToggleWishes}
        className="apple-btn apple-btn-secondary w-full py-3.5 text-sm text-blue-100"
      >
        {showReceiverWishes
          ? "Sakrij želje"
          : "Otkrij želje / temu poklona"}
      </button>
      {showReceiverWishes && (
        <div className="wishes-panel glass-inset mt-3 rounded-[1.25rem] p-4 text-sm text-slate-300">
          {receiverWishes || (
            <span className="text-slate-500">Još nema unesenih želja.</span>
          )}
        </div>
      )}
    </div>
  );

  if (dismissed) {
    return (
      <div className="mt-4 space-y-4">
        <div
          className="rounded-[2rem] p-7 text-center"
          style={{
            background: palette.gradient,
            border: `1px solid ${palette.border}`,
            boxShadow: palette.shadow,
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: palette.label }}
          >
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{name}</p>
        </div>
        {wishesBlock}
      </div>
    );
  }

  if (!mounted) return null;

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-sm">
        <div
          ref={confettiWrapRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
            <span
              key={i}
              data-confetti
              className="absolute left-0 top-0 block h-2 w-1.5 rounded-sm"
              style={{
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              }}
            />
          ))}
        </div>

        <div className="mx-auto w-full" style={{ perspective: "1000px" }}>
          <div
            ref={flipRef}
            className="relative min-h-[220px] w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] px-6 py-8 text-center"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                background: "linear-gradient(165deg, #1e293b, #0f172a)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
              }}
            >
              <p className="text-sm font-medium text-slate-400">Izvlačim…</p>
              <p className="mt-4 text-5xl font-bold text-white/90">?</p>
            </div>

            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] px-6 py-8 text-center"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                background: palette.gradient,
                border: `1px solid ${palette.border}`,
                boxShadow: palette.shadow,
              }}
            >
              <p
                id="reveal-title"
                data-front-label
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: palette.label, opacity: 0 }}
              >
                {title}
              </p>
              <p
                data-front-label
                className="mt-3 text-[2rem] font-bold leading-tight text-white drop-shadow-sm"
                style={{ opacity: 0 }}
              >
                {name}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!spinDone}
          onClick={dismiss}
          className="apple-btn apple-btn-primary mt-6 w-full py-4 text-base disabled:opacity-40"
        >
          {spinDone ? "Nastavi" : "Pričekaj…"}
        </button>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}