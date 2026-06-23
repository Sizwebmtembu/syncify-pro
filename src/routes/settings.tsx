import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { clearHistory } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Display name</Label><Input defaultValue="You" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="you@example.com" /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Row title="Default tone" desc="Used as the default for new emails">
            <Input className="w-40" defaultValue="Professional" />
          </Row>
          <Separator />
          <Row title="Email notifications" desc="Reminders and weekly summaries">
            <Switch defaultChecked />
          </Row>
          <Separator />
          <Row title="Save activity locally" desc="Store recent outputs in this browser">
            <Switch defaultChecked />
          </Row>
        </CardContent>
      </Card>
      <Card className="border-border/60 shadow-[var(--shadow-soft)]">
        <CardHeader><CardTitle className="text-destructive">Danger zone</CardTitle></CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => { clearHistory(); toast.success("History cleared"); }}>
            Clear all history
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

