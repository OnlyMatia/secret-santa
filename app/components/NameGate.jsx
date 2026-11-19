"use client";

import PageWrap from "@/app/components/PageWrap";
import { setStoredName } from "@/lib/session";
import { useState } from "react";

export default function NameGate({ onContinue, title = "Tko si?", hint }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Upiši ime");
      return;
    }
    setStoredName(trimmed);
    onContinue(trimmed);
  }

  return (
    <PageWrap className="pb-10">
      <div className="mx-auto w-full max-w-lg lg:max-w-md">
      <header className="mb-4 text-center">
        <p className="text-sm font-medium tracking-wide text-blue-400">Prijava</p>
        <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-slate-400">
          {hint ||
            "Unesi ime kako stoji na popisu grupe. Koristi se samo za prepoznavanje — nema lozinke."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="animate-fade-up stagger-1 space-y-4">
        <div className="glass rounded-[1.75rem] p-6">
          <label
            htmlFor="login-name"
            className="text-sm font-medium text-slate-300"
          >
            Tvoje ime
          </label>
          <input
            id="login-name"
            type="text"
            autoComplete="name"
            autoFocus
            placeholder="npr. Matija ili Matija Š."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            className="apple-input mt-3"
          />
        </div>

        {error && (
          <p className="glass-inset rounded-[1.25rem] px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="apple-btn apple-btn-primary w-full px-6 py-4 text-base"
        >
          Nastavi
        </button>
      </form>
      </div>
    </PageWrap>
  );
}