import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Download, Upload, Users, CheckCircle2, Target, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meeting Notes Summarizer" }] }),
  component: MeetingsPage,
});

type Result = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
  participants: string[];
};

function MeetingsPage() {
  const fn = useServerFn(summarizeMeeting);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (transcript.trim().length < 20) return toast.error("Paste meeting notes (at least 20 characters).");
    setLoading(true);
    try {
      const r = (await fn({ data: { transcript } })) as Result;
      setResult(r);
      addHistory({
        kind: "meeting",
        title: r.summary.slice(0, 60),
        preview: r.summary.slice(0, 160),
        payload: r,
      });
      toast.success("Meeting summarized");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    const text = await f.text();
    setTranscript(text);
  };

  const download = () => {
    if (!result) return;
    const md = `# Meeting Summary\n\n${result.summary}\n\n## Key Points\n${result.keyPoints.map((p) => `- ${p}`).join("\n")}\n\n## Decisions\n${result.decisions.map((d) => `- ${d}`).join("\n")}\n\n## Action Items\n${result.actionItems.map((a) => `- [${a.owner}] ${a.task} (due ${a.deadline})`).join("\n")}\n\n## Participants\n${result.participants.join(", ")}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `meeting-${Date.now()}.md`;
    a.click();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Meeting Notes Summarizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={10}
            placeholder="Paste your meeting transcript or notes here…"
            className="font-mono text-sm"
          />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
              <Upload className="h-4 w-4" /> Upload notes
              <input type="file" accept=".txt,.md,.vtt,.srt" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
            <Button onClick={run} disabled={loading} className="shrink-0">
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Summarizing…" : "Summarize"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Executive summary</CardTitle>
              <Button variant="outline" size="sm" onClick={download}><Download className="mr-1 h-4 w-4" /> Download</Button>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <p className="leading-relaxed">{result.summary}</p>

              <Section icon={Target} title="Key discussion points" items={result.keyPoints} />
              <Section icon={CheckCircle2} title="Decisions made" items={result.decisions} accent />

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <ListChecks className="h-4 w-4 text-primary" /> Action items
                </div>
                <div className="space-y-2">
                  {result.actionItems.map((a, i) => (
                    <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border/60 p-3 sm:flex sm:flex-wrap sm:justify-between">
                      <div className="min-w-0 text-sm">{a.task}</div>
                      <div className="flex shrink-0 gap-2">
                        <Badge variant="secondary">{a.owner}</Badge>
                        <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20">{a.deadline}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-[var(--shadow-soft)] h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-primary" /> Participants</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {result.participants.map((p) => (
                <Badge key={p} variant="outline">{p}</Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, items, accent }: { icon: typeof Target; title: string; items: string[]; accent?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className={`h-4 w-4 ${accent ? "text-accent" : "text-primary"}`} /> {title}
      </div>
      <ul className="space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}