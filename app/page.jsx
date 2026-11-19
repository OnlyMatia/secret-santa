"use client";

import CreateGroupForm from "./components/CreateGroupForm";
import GroupList from "./components/GroupList";
import NameGate from "./components/NameGate";
import { useSessionName } from "./hooks/useSessionName";
import Link from "next/link";
import BackLink from "./components/BackLink";
import PageWrap from "./components/PageWrap";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const { name, ready, login, logout, isLoggedIn } = useSessionName();
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadGroups = useCallback(async (userName) => {
    setGroupsLoading(true);
    try {
      const res = await fetch("/api/me/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName }),
      });
      const data = await res.json();
      if (res.ok) setGroups(data.groups || []);
      else setGroups([]);
    } catch {
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadGroups(name);
  }, [isLoggedIn, name, loadGroups]);

  if (!ready) {
    return null;
  }

  if (!isLoggedIn) {
    return <NameGate onContinue={login} />;
  }

  const shareUrl =
    typeof window !== "undefined" && createdId
      ? `${window.location.origin}/room/${createdId}`
      : "";

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <PageWrap className="pb-10">
      <header className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[2rem] font-semibold tracking-tight text-white">
            Moje grupe
          </h1>
          <p className="shrink-0 text-sm font-semibold leading-5 text-white">
            Secret Santa
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-3 text-sm text-slate-400 underline-offset-4 hover:text-blue-300 hover:underline"
        >
          Odaberi drugo ime
        </button>
      </header>

      {createdId ? (
        <div className="animate-pop-reveal mx-auto max-w-2xl space-y-5 lg:max-w-3xl">
          <div className="glass success-pulse rounded-[1.75rem] p-6">
            <h2 className="text-xl font-semibold text-white">Grupa je spremna</h2>
            <p className="mt-2 text-sm text-slate-400">
              Podijeli link ili otvori grupu s popisa.
            </p>
          </div>
          <div className="glass-inset break-all rounded-[1.5rem] px-5 py-4 text-sm">
            {shareUrl}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={copyLink}
              className="apple-btn apple-btn-secondary flex-1 py-3.5 text-sm"
            >
              {copied ? "Kopirano ✓" : "Kopiraj link"}
            </button>
            <Link
              href={`/room/${createdId}`}
              className="apple-btn apple-btn-primary flex-1 py-3.5 text-center text-sm"
            >
              Uđi u grupu
            </Link>
          </div>
          <BackLink fullWidth>Natrag na grupe</BackLink>
        </div>
      ) : creating ? (
        <div className="mx-auto w-full max-w-2xl lg:max-w-4xl">
          <CreateGroupForm
            organizerName={name}
            onCancel={() => setCreating(false)}
            onCreated={(roomId) => {
              setCreating(false);
              setCreatedId(roomId);
              loadGroups(name);
            }}
          />
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
          <section className="mb-6 lg:mb-0 lg:sticky lg:top-6">
            <p className="mb-4 hidden text-sm leading-relaxed text-slate-400 lg:block">
              Stvori grupu, dodaj sudionike i podijeli link. Svaki sudionik
              izvlači kome daruje.
            </p>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="apple-btn apple-btn-primary animate-fade-up stagger-2 w-full py-4 text-base lg:py-5"
            >
              + Nova grupa
            </button>
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-300 lg:mb-4 lg:text-base">
              Tvoje grupe
            </h2>
            <GroupList groups={groups} loading={groupsLoading} />
          </section>
        </div>
      )}
    </PageWrap>
  );
}