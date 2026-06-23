import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planTasks } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Sparkles, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "AI Task Planner" }] }),
  component: TasksPage,
});

type Plan = {
  daily: { time: string; task: string; priority: string }[];
  weekly: { day: string; focus: string }[];
  priorityMatrix: {
    urgentImportant: string[];
    notUrgentImportant: string[];
    urgentNotImportant: string[];
    notUrgentNotImportant: string[];
  };
  recommendations: string[];
};

function TasksPage() {
  const fn = useServerFn(planTasks);
  const [form, setForm] = useState({
    goals: "",
    tasks: "",
    dueDate: "",
    workingHours: "9am-5pm",
    priority: "Medium" as "Low" | "Medium" | "High",
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!form.goals.trim()) return toast.error("Add at least one goal.");
    setLoading(true);
    try {
      const r = (await fn({ data: form })) as Plan;
      setPlan(r);
      addHistory({
        kind: "task",
        title: form.goals.slice(0, 60),
        preview: r.recommendations.slice(0, 2).join(" • ").slice(0, 160),
        payload: r,
      });
      toast.success("Plan ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" /> AI Task Planner</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Goals *">
              <Textarea rows={3} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} placeholder="Ship v2 onboarding flow, prep board deck…" />
            </Field>
            <Field label="Tasks (optional)">
              <Textarea rows={3} value={form.tasks} onChange={(e) => setForm({ ...form, tasks: e.target.value })} placeholder="Design review, write copy, QA…" />
            </Field>
          </div>
          <div className="space-y-4">
            <Field label="Due date">
              <Input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} placeholder="Friday, Oct 25" />
            </Field>
            <Field label="Working hours">
              <Input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} />
            </Field>
            <Field label="Overall priority">
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as typeof form.priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Low", "Medium", "High"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Button onClick={run} disabled={loading} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Planning…" : "Build my plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {plan && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader><CardTitle className="text-base">Today's schedule</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.daily.map((d, i) => (
                <div key={i} className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 p-3">
                  <div className="text-xs font-semibold text-primary">{d.time}</div>
                  <div className="truncate text-sm">{d.task}</div>
                  <Badge variant={d.priority.toLowerCase() === "high" ? "destructive" : "secondary"}>{d.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader><CardTitle className="text-base">Weekly plan</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.weekly.map((w, i) => (
                <div key={i} className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 rounded-lg border border-border/60 p-3">
                  <div className="text-xs font-semibold text-primary">{w.day}</div>
                  <div className="text-sm">{w.focus}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader><CardTitle className="text-base">Priority matrix</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Quadrant title="Urgent & Important" items={plan.priorityMatrix.urgentImportant} tone="destructive" />
              <Quadrant title="Important, Not Urgent" items={plan.priorityMatrix.notUrgentImportant} tone="primary" />
              <Quadrant title="Urgent, Not Important" items={plan.priorityMatrix.urgentNotImportant} tone="accent" />
              <Quadrant title="Neither" items={plan.priorityMatrix.notUrgentNotImportant} tone="muted" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border/60 bg-[image:var(--gradient-accent)] text-primary-foreground shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="h-4 w-4" /> Productivity recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {plan.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Quadrant({ title, items, tone }: { title: string; items: string[]; tone: "destructive" | "primary" | "accent" | "muted" }) {
  const toneClass = {
    destructive: "border-destructive/40 bg-destructive/5",
    primary: "border-primary/40 bg-primary/5",
    accent: "border-accent/40 bg-accent/10",
    muted: "border-border bg-muted/40",
  }[tone];
  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">{title}</div>
      <ul className="space-y-1 text-sm">
        {items.length === 0 && <li className="text-muted-foreground italic">—</li>}
        {items.map((it, i) => <li key={i}>• {it}</li>)}
      </ul>
    </div>
  );
}

