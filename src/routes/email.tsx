import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Copy, RotateCw, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator" }] }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [form, setForm] = useState({
    purpose: "",
    recipient: "",
    subject: "",
    keyPoints: "",
    tone: "Professional" as "Professional" | "Friendly" | "Formal" | "Persuasive" | "Urgent",
    language: "English",
  });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!form.purpose.trim()) return toast.error("Describe the email purpose first.");
    setLoading(true);
    try {
      const r = await fn({ data: form });
      setOutput(r.email);
      addHistory({
        kind: "email",
        title: form.subject || form.purpose.slice(0, 60),
        preview: r.email.slice(0, 160),
        payload: { form, email: r.email },
      });
      toast.success("Email generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Smart Email Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Email purpose *">
            <Textarea
              placeholder="e.g. Follow up with a client about a delayed proposal"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              rows={3}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient">
              <Input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="Alex Chen" />
            </Field>
            <Field label="Subject hint">
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Proposal update" />
            </Field>
          </div>
          <Field label="Key points">
            <Textarea
              value={form.keyPoints}
              onChange={(e) => setForm({ ...form, keyPoints: e.target.value })}
              placeholder="Apologize for delay. New ETA Friday. Offer 10% discount."
              rows={4}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tone">
              <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v as typeof form.tone })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Professional", "Friendly", "Formal", "Persuasive", "Urgent"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Language">
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["English", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch", "Japanese"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Generating…" : "Generate email"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Generated email</CardTitle>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={copy} disabled={!output}><Copy className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={run} disabled={loading || !form.purpose}><RotateCw className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={download} disabled={!output}><Download className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Your generated email will appear here. You can edit it directly."
            className="min-h-[420px] font-mono text-sm"
          />
        </CardContent>
      </Card>
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