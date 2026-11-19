export const SESSION_NAME_KEY = "secret_santa_name";

export function getStoredName() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(SESSION_NAME_KEY) || "";
}

export function setStoredName(name) {
  if (typeof window === "undefined") return;
  const value = String(name || "").trim();
  if (!value) {
    localStorage.removeItem(SESSION_NAME_KEY);
    return;
  }
  localStorage.setItem(SESSION_NAME_KEY, value);
}

export function clearStoredName() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_NAME_KEY);
}