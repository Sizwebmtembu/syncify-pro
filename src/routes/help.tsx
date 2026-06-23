import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help & Support" }] }),
  component: HelpPage,
});

const faqs = [
  { q: "How does the AI generate emails?", a: "We send your inputs to a large language model that drafts a tailored message in your chosen tone and language. You can edit the result before sending." },
  { q: "Is my data stored?", a: "Recent outputs are stored locally in your browser only. Nothing is sent to a third party beyond the AI request itself." },
  { q: "Can I upload audio?", a: "Currently the meeting summarizer accepts text and transcript files (.txt, .md, .vtt, .srt). Voice transcription is on the roadmap." },
  { q: "How accurate is the productivity score?", a: "It's a lightweight engagement metric, not a clinical measurement. Treat it as a directional indicator." },
];

function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle>Frequently asked</CardTitle></CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`i${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-amber-900">
            <AlertTriangle className="h-4 w-4" /> Responsible AI notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-900/80">
          AI-generated content may occasionally contain inaccuracies or incomplete information. Users
          should review all generated emails, meeting summaries, schedules, and recommendations
          before making decisions or sharing information. This application is designed to assist
          productivity and does not replace human judgment, professional advice, or organizational
          policies.
        </CardContent>
      </Card>
    </div>
  );
}