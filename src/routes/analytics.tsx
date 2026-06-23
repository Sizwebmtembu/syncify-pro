import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadHistory, type HistoryItem } from "@/lib/history";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics" }] }),
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.56 0.20 260)", "oklch(0.72 0.13 185)", "oklch(0.68 0.18 290)"];

function AnalyticsPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    const r = () => setItems(loadHistory());
    r();
    window.addEventListener("aph-history-changed", r);
    return () => window.removeEventListener("aph-history-changed", r);
  }, []);

  const weekly = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = days.map((d) => ({ day: d, emails: 0, meetings: 0, tasks: 0 }));
    const now = new Date();
    items.forEach((i) => {
      const d = new Date(i.createdAt);
      const diff = (now.getTime() - d.getTime()) / 86400000;
      if (diff > 7) return;
      const idx = d.getDay();
      if (i.kind === "email") buckets[idx].emails++;
      else if (i.kind === "meeting") buckets[idx].meetings++;
      else buckets[idx].tasks++;
    });
    return buckets;
  }, [items]);

  const distribution = useMemo(() => {
    const counts = { Emails: 0, Meetings: 0, Tasks: 0 };
    items.forEach((i) => {
      if (i.kind === "email") counts.Emails++;
      else if (i.kind === "meeting") counts.Meetings++;
      else counts.Tasks++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [items]);

  const topTool = [...distribution].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle>Weekly performance</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="emails" stackId="a" fill={COLORS[0]} />
              <Bar dataKey="meetings" stackId="a" fill={COLORS[1]} />
              <Bar dataKey="tasks" stackId="a" fill={COLORS[2]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle>Distribution</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle>Productivity trends</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Total outputs" value={items.length} />
            <Stat label="This week" value={weekly.reduce((s, d) => s + d.emails + d.meetings + d.tasks, 0)} />
            <Stat label="Most-used tool" value={topTool && topTool.value > 0 ? topTool.name : "—"} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

