import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useZentivo } from "@/lib/zentivo-context";

const fmt = (t: number) =>
  new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function History() {
  const { alerts, clearAlerts } = useZentivo();

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Audit log</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Alert History</h1>
        </div>
        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAlerts}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear
          </Button>
        )}
      </header>

      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          No alerts triggered yet. Try “Simulate Emergency” on the dashboard.
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-3">
                <th>Time</th>
                <th>Risk</th>
                <th>Vitals</th>
                <th>Response</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                const escalated = a.status === "Escalated";
                return (
                  <tr key={a.id} className="border-b border-border/60 last:border-0 [&>td]:px-4 [&>td]:py-3">
                    <td className="font-mono text-xs text-muted-foreground">{fmt(a.timestamp)}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-danger">
                        <span className="stat-dot bg-danger" /> {a.riskLevel}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                      {a.heartRate} bpm · {a.motion}
                    </td>
                    <td>{a.response}</td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
                          escalated ? "bg-danger/15 text-danger" : "bg-safe/15 text-safe"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
