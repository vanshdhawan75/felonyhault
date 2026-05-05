import { useState } from "react";
import { Bot, BrainCircuit, ChevronDown, ChevronRight, Hand, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useZentivo } from "@/lib/zentivo-context";

const fmt = (t: number) =>
  new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function History() {
  const { alerts, clearAlerts } = useZentivo();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Audit log</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Alert &amp; Report History</h1>
        </div>
        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAlerts}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear
          </Button>
        )}
      </header>

      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          No reports filed yet. Try “Simulate Emergency” or “Report Emergency” on the dashboard.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const escalated = a.status === "Escalated";
            const isOpen = open === a.id;
            const Source = a.source === "AI" ? Bot : Hand;
            return (
              <div key={a.id} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : a.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-secondary/40 transition-colors"
                >
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <Source className={`h-4 w-4 ${a.source === "Manual" ? "text-warn" : "text-danger"}`} />
                    <span className="text-xs uppercase tracking-wider">{a.source} report</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground hidden sm:block">{a.reportId}</div>
                  <div className="font-mono text-xs text-muted-foreground hidden md:block">{fmt(a.timestamp)}</div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">{a.response}</span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                        escalated ? "bg-danger/15 text-danger" : "bg-safe/15 text-safe"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-border/60 grid sm:grid-cols-2 gap-4 text-sm animate-fade-in">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Report</p>
                      <p className="font-mono text-xs">{a.reportId}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{fmt(a.timestamp)}</p>
                      <p className="mt-2">Risk: <span className="text-danger">{a.riskLevel}</span></p>
                      <p>Response: {a.response}</p>
                      {a.reason && <p className="mt-1 text-muted-foreground">Reason: {a.reason}</p>}
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Vitals & location</p>
                      <p>{a.heartRate} bpm · {a.motion}</p>
                      <p className="text-muted-foreground mt-1">{a.location.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {a.location.lat.toFixed(4)}, {a.location.lng.toFixed(4)}
                      </p>
                    </div>
                    {a.notifiedContacts.length > 0 && (
                      <div className="sm:col-span-2">
                        <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Notified contacts</p>
                        <div className="flex flex-wrap gap-2">
                          {a.notifiedContacts.map((c) => (
                            <span key={c.phone} className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-border">
                              {c.name} · <span className="font-mono text-muted-foreground">{c.phone}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
