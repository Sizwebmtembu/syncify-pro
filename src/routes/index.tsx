import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, FileText, CalendarClock, TrendingUp, Sparkles, ArrowRight, Clock } from "lucide-react";
import { countsByKind, loadHistory, type HistoryItem } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Productivity Hub" },
      { name: "description", content: "Your AI-powered productivity dashboard." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [counts, setCounts] = useState({ email: 0, meeting: 0, task: 0, total: 0 });
  const [recent, setRecent] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const refresh = () => {
      setCounts(countsByKind());
      setRecent(loadHistory().slice(0, 5));
    };
    refresh();
    window.addEventListener("aph-history-changed", refresh);
    return () => window.removeEventListener("aph-history-changed", refresh);
  }, []);

  const score = Math.min(100, counts.total * 7 + 35);

  const stats = [
    { label: "Emails Generated", value: counts.email, icon: Mail, accent: "text-primary" },
    { label: "Meetings Summarized", value: counts.meeting, icon: FileText, accent: "text-accent" },
    { label: "Tasks Scheduled", value: counts.task, icon: CalendarClock, accent: "text-primary" },
    { label: "Productivity Score", value: `${score}`, icon: TrendingUp, accent: "text-accent" },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <Badge variant="secondary" className="mb-3 bg-accent/15 text-accent-foreground">
            <Sparkles className="mr-1 h-3 w-3" /> AI Workspace
          </Badge>
          <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft emails, summarize meetings, and plan your day — powered by AI.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to="/meetings">Summarize</Link>
          </Button>
          <Button asChild>
            <Link to="/email">New Email <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted">
                <s.icon className={`h-5 w-5 ${s.accent}`} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                <div className="text-2xl font-bold">{s.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No activity yet. Create your first email, summary, or plan to see it here.
              </div>
            )}
            {recent.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3">
                <KindIcon kind={item.kind} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <span className="shrink-0 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.preview}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elevated)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" /> AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-primary-foreground/90">
            <p>Batch similar tasks together. You spend 23% less time on context switching.</p>
            <p>Use the Urgent tone sparingly — it's most effective in &lt; 10% of outbound emails.</p>
            <p>Most-summarized meetings produce 4–6 action items. Aim for clear owners on each.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <QuickAction to="/email" icon={Mail} title="Draft an email" desc="Professional emails in seconds" />
        <QuickAction to="/meetings" icon={FileText} title="Summarize meeting" desc="Notes → action items" />
        <QuickAction to="/tasks" icon={CalendarClock} title="Plan your week" desc="AI-built schedules" />
      </section>
    </div>
  );
}

function KindIcon({ kind }: { kind: "email" | "meeting" | "task" }) {
  const Icon = kind === "email" ? Mail : kind === "meeting" ? FileText : CalendarClock;
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
      <Icon className="h-4 w-4 text-primary" />
    </div>
  );
}

function QuickAction({ to, icon: Icon, title, desc }: { to: string; icon: typeof Mail; title: string; desc: string }) {
  return (
    <Link to={to} className="group">
      <Card className="h-full border-border/60 transition hover:border-primary/60 hover:shadow-[var(--shadow-elevated)]">
        <CardContent className="flex items-center gap-3 p-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{title}</div>
            <div className="truncate text-xs text-muted-foreground">{desc}</div>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </CardContent>
      </Card>
    </Link>
  );
}
