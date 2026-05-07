"use client";
import { useState, useEffect } from "react";

export interface Draft {
  id: string;
  title: string;
  genres: string[];
  outputType: string;
  result: string;
  key: string;
  tempo: string;
  intensity: number;
  language: string;
  trackMode: string;
  instruments: string[];
  starred: boolean;
  createdAt: string;
}

const STORAGE_KEY = "metal-forge-drafts";

function loadDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDrafts(drafts: Draft[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch { /* silent */ }
}

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  function saveDraft(data: Omit<Draft, "id" | "starred" | "createdAt">) {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString()} · ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const draft: Draft = { ...data, id: crypto.randomUUID(), starred: false, createdAt: dateStr };
    setDrafts(prev => {
      const next = [draft, ...prev].slice(0, 20);
      saveDrafts(next);
      return next;
    });
  }

  function deleteDraft(id: string) {
    setDrafts(prev => {
      const next = prev.filter(d => d.id !== id);
      saveDrafts(next);
      return next;
    });
  }

  function toggleStar(id: string) {
    setDrafts(prev => {
      const next = prev.map(d => d.id === id ? { ...d, starred: !d.starred } : d);
      saveDrafts(next);
      return next;
    });
  }

  return { drafts, saveDraft, deleteDraft, toggleStar };
}