export type HistoryKind = "email" | "meeting" | "task";
export interface HistoryItem {
  id: string;
  kind: HistoryKind;
  title: string;
  preview: string;
  payload: unknown;
  createdAt: number;
}

const KEY = "aph_history_v1";

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const all = loadHistory();
  const next: HistoryItem = { ...item, id: crypto.randomUUID(), createdAt: Date.now() };
  all.unshift(next);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 100)));
  window.dispatchEvent(new Event("aph-history-changed"));
  return next;
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("aph-history-changed"));
}

export function countsByKind() {
  const all = loadHistory();
  return {
    email: all.filter((i) => i.kind === "email").length,
    meeting: all.filter((i) => i.kind === "meeting").length,
    task: all.filter((i) => i.kind === "task").length,
    total: all.length,
  };
}