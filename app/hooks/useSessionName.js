"use client";

import { getStoredName, setStoredName } from "@/lib/session";
import { useCallback, useEffect, useState } from "react";

export function useSessionName() {
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setName(getStoredName());
    setReady(true);
  }, []);

  const login = useCallback((value) => {
    setStoredName(value);
    setName(value.trim());
  }, []);

  const logout = useCallback(() => {
    setStoredName("");
    setName("");
  }, []);

  return { name, ready, login, logout, isLoggedIn: Boolean(name.trim()) };
}