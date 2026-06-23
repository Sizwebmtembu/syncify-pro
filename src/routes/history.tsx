import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, FileText, CalendarClock, Trash2 } from "lucide-react";
import { loadHistory, clearHistory, type HistoryItem } from "@/lib/history";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    const refresh = () => setItems(loadHistory());
    refresh();
    window.addEventListener("aph-history-changed", refresh);
    return () => window.removeEventListener("aph-history-changed", refresh);
  }, []);

  const Icon = (k: HistoryItem["kind"]) => (k === "email" ? Mail : k === "meeting" ? FileText : CalendarClock);

  return (
    <div className="mx-auto max-w-5xl">
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>History</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearHistory} disabled={items.length === 0}>
            <Trash2 className="mr-1 h-4 w-4" /> Clear all
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              Nothing yet. Generated outputs will appear here.
            </div>
          )}
          {items.map((item) => {
            const I = Icon(item.kind);
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                  <I className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <Badge variant="outline" className="capitalize">{item.kind}</Badge>
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.preview}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

