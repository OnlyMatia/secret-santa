export const REVEAL_PALETTES = [
  {
    gradient:
      "linear-gradient(165deg, #7dd3fc 0%, #0ea5e9 42%, #0369a1 100%)",
    glow: "rgba(14, 165, 233, 0.4)",
    shadow: "0 24px 48px -16px rgba(14, 165, 233, 0.55)",
    border: "rgba(255, 255, 255, 0.35)",
    label: "rgba(255,255,255,0.8)",
  },
  {
    gradient:
      "linear-gradient(165deg, #c4b5fd 0%, #8b5cf6 42%, #5b21b6 100%)",
    glow: "rgba(139, 92, 246, 0.38)",
    shadow: "0 24px 48px -16px rgba(124, 58, 237, 0.5)",
    border: "rgba(255, 255, 255, 0.32)",
    label: "rgba(255,255,255,0.82)",
  },
  {
    gradient:
      "linear-gradient(165deg, #fcd34d 0%, #f59e0b 45%, #b45309 100%)",
    glow: "rgba(245, 158, 11, 0.38)",
    shadow: "0 24px 48px -16px rgba(217, 119, 6, 0.5)",
    border: "rgba(255, 255, 255, 0.38)",
    label: "rgba(20,20,20,0.55)",
  },
  {
    gradient:
      "linear-gradient(165deg, #6ee7b7 0%, #10b981 45%, #047857 100%)",
    glow: "rgba(16, 185, 129, 0.38)",
    shadow: "0 24px 48px -16px rgba(5, 150, 105, 0.48)",
    border: "rgba(255, 255, 255, 0.34)",
    label: "rgba(255,255,255,0.85)",
  },
  {
    gradient:
      "linear-gradient(165deg, #fda4af 0%, #f43f5e 45%, #be123c 100%)",
    glow: "rgba(244, 63, 94, 0.36)",
    shadow: "0 24px 48px -16px rgba(225, 29, 72, 0.48)",
    border: "rgba(255, 255, 255, 0.34)",
    label: "rgba(255,255,255,0.85)",
  },
  {
    gradient:
      "linear-gradient(165deg, #5eead4 0%, #14b8a6 45%, #0f766e 100%)",
    glow: "rgba(20, 184, 166, 0.38)",
    shadow: "0 24px 48px -16px rgba(13, 148, 136, 0.48)",
    border: "rgba(255, 255, 255, 0.34)",
    label: "rgba(255,255,255,0.85)",
  },
  {
    gradient:
      "linear-gradient(165deg, #fdba74 0%, #f97316 45%, #c2410c 100%)",
    glow: "rgba(249, 115, 22, 0.38)",
    shadow: "0 24px 48px -16px rgba(234, 88, 12, 0.48)",
    border: "rgba(255, 255, 255, 0.36)",
    label: "rgba(255,255,255,0.88)",
  },
  {
    gradient:
      "linear-gradient(165deg, #a5b4fc 0%, #6366f1 45%, #3730a3 100%)",
    glow: "rgba(99, 102, 241, 0.38)",
    shadow: "0 24px 48px -16px rgba(79, 70, 229, 0.48)",
    border: "rgba(255, 255, 255, 0.34)",
    label: "rgba(255,255,255,0.85)",
  },
];

export function paletteForName(name) {
  const s = String(name || "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash + s.charCodeAt(i) * (i + 1)) % 1_000_003;
  }
  return REVEAL_PALETTES[hash % REVEAL_PALETTES.length];
}

/** Prikaz na gumbima: matija s → Matija S */
export function formatDisplayName(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}