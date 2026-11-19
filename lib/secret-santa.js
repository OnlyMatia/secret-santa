import { randomBytes } from "crypto";

export function makeId(bytes = 5) {
  return randomBytes(bytes).toString("hex");
}

/** Sprema se u bazu: lowercase, latinica, jedini razmaci */
export function normalizeName(name) {
  const raw = String(name || "").trim();
  if (!raw) return "";

  const latin = raw
    .replace(/č/g, "c")
    .replace(/Č/g, "c")
    .replace(/ć/g, "c")
    .replace(/Ć/g, "c")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/š/g, "s")
    .replace(/Š/g, "s")
    .replace(/ž/g, "z")
    .replace(/Ž/g, "z");

  return latin.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Fisher–Yates shuffle, returns new array */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Random derangement: participant i gives to assignments[i], nobody gives to themselves */
export function buildDerangement(participantIds) {
  const n = participantIds.length;
  if (n < 2) {
    throw new Error("Potrebno je najmanje 2 sudionika");
  }

  const maxAttempts = 200;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const order = shuffle(participantIds);
    let valid = true;
    for (let i = 0; i < n; i++) {
      if (order[i] === participantIds[i]) {
        valid = false;
        break;
      }
    }
    if (valid) {
      const map = {};
      for (let i = 0; i < n; i++) {
        map[participantIds[i]] = order[i];
      }
      return map;
    }
  }

  // Deterministic fallback: rotate by 1 (works when all ids unique)
  const map = {};
  for (let i = 0; i < n; i++) {
    map[participantIds[i]] = participantIds[(i + 1) % n];
  }
  return map;
}