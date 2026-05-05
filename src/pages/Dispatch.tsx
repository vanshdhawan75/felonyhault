import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useZentivo } from "@/lib/zentivo-context";
import { Button } from "@/components/ui/button";
import {
  Ambulance, ArrowLeft, BellRing, CheckCircle2, Flame, Hospital, Loader2,
  MapPin, Phone, Shield, Siren, Users,
} from "lucide-react";

const AUTHORITIES = [
  { key: "police",   name: "Police Control Room",          number: "100", icon: Shield,   delay: 600 },
  { key: "ambulance",name: "Emergency Medical Services",   number: "108", icon: Ambulance,delay: 1500 },
  { key: "fire",     name: "Fire & Rescue Services",       number: "101", icon: Flame,    delay: 2400 },
  { key: "hospital", name: "Nearest Partner Hospital",     number: "—",   icon: Hospital, delay: 3300 },
  { key: "contacts", name: "Personal Emergency Contacts",  number: "SMS", icon: Users,    delay: 4100 },
] as const;

export default function Dispatch() {
  const { reportId } = useParams();
  const { alerts } = useZentivo();
  const report = useMemo(() => alerts.find((a) => a.reportId === reportId), [alerts, reportId]);
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDoneKeys(new Set());
    const timers = AUTHORITIES.map((a) =>
      setTimeout(() => {
        setDoneKeys((prev) => {
          const next = new Set(prev);
          next.add(a.key);
          return next;
        });
      }, a.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [reportId]);

  if (!report) {
    return (
      <AppShell>
        <div className="glass-card p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Report not found</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            We couldn't locate report <span className="font-mono">{reportId}</span>.
          </p>
          <Button asChild className="mt-6">
            <Link to="/history"><ArrowLeft className="h-4 w-4 mr-2" /> Back to history</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const allDone = doneKeys.size === AUTHORITIES.length;

  return (
    <AppShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live dispatch</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1 flex items-center gap-3">
            <Siren className={`h-7 w-7 text-danger ${!allDone ? "animate-pulse" : ""}`} />
            Emergency Dispatch
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Report <span className="font-mono text-foreground">{report.reportId}</span> ·{" "}
            {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>
        <Button asChild variant="ghost"><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Dashboard</Link></Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <BellRing className={`h-5 w-5 text-primary ${!allDone ? "animate-pulse" : ""}`} />
              Notifying authorities
            </h2>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${
              allDone
                ? "border-safe/40 text-safe bg-safe/10"
                : "border-danger/40 text-danger bg-danger/10 animate-pulse"
            }`}>
              {allDone ? "All channels notified" : "Dispatch in progress"}
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {AUTHORITIES.map((a) => {
              const done = doneKeys.has(a.key);
              const Icon = a.icon;
              return (
                <li
                  key={a.key}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    done ? "border-safe/30 bg-safe/5" : "border-border bg-secondary/40"
                  }`}
                >
                  <div className={`h-11 w-11 rounded-lg grid place-items-center ${
                    done ? "bg-safe/15 text-safe" : "bg-danger/15 text-danger"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <Phone className="h-3 w-3" /> {a.number}
                    </div>
                  </div>
                  <div className="text-xs">
                    {done ? (
                      <span className="flex items-center gap-1.5 text-safe">
                        <CheckCircle2 className="h-4 w-4" /> Acknowledged
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Dispatching…
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-display text-xl font-bold">Incident details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Source</dt>
              <dd className="font-medium mt-0.5">{report.source}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Risk</dt>
              <dd className="font-medium mt-0.5 text-danger">{report.riskLevel}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Reason</dt>
              <dd className="font-medium mt-0.5">{report.reason || report.response}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Vitals at trigger</dt>
              <dd className="font-medium mt-0.5">
                HR <span className="tabular-nums">{report.heartRate}</span> bpm · {report.motion}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location shared
              </dt>
              <dd className="font-medium mt-0.5">{report.location.label}</dd>
              <dd className="font-mono text-xs text-muted-foreground">
                {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-lg overflow-hidden border border-border h-40">
            <iframe
              title="Dispatch location"
              className="w-full h-full grayscale-[40%] contrast-110"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${report.location.lng - 0.01},${report.location.lat - 0.01},${report.location.lng + 0.01},${report.location.lat + 0.01}&layer=mapnik&marker=${report.location.lat},${report.location.lng}`}
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mt-4">
        <h2 className="font-display text-lg font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Contacts notified
        </h2>
        {report.notifiedContacts.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-2">
            No personal contacts were configured. Add some in the Contacts page.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.notifiedContacts.map((c) => (
              <li key={c.phone} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/40">
                <CheckCircle2 className="h-4 w-4 text-safe" />
                <div className="text-sm">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.phone}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        <Button asChild variant="outline"><Link to="/history">View full history</Link></Button>
        <Button asChild><Link to="/">Back to dashboard</Link></Button>
      </div>
    </AppShell>
  );
}
