export const EASE_SMOOTH = "power2.out";
export const EASE_SPRING = "back.out(1.35)";

export function isReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function instantShow(target) {
  if (!target) return;
  import("gsap").then(({ default: gsap }) => {
    gsap.set(target, { opacity: 1, clearProps: "transform,filter,scale,y,x,rotateX" });
  });
}