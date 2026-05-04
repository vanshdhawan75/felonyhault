import { AppShell } from "@/components/AppShell";
import { useZentivo } from "@/lib/zentivo-context";
import { MapPin } from "lucide-react";

const HIGH_RISK_ZONES = [
  { name: "Tenderloin", note: "Recent incident reports" },
  { name: "Industrial Yard 14", note: "Low pedestrian visibility" },
  { name: "Highway 101 Overpass", note: "Frequent accident zone" },
];

export default function MapPage() {
  const { reading, status, alerts } = useZentivo();
  const lastEscalated = alerts.find((a) => a.status === "Escalated");

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Geo monitoring</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Location</h1>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-2 lg:col-span-2 overflow-hidden">
          <iframe
            title="User location"
            className="w-full h-[420px] rounded-xl grayscale-[30%]"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${reading.location.lng - 0.02},${reading.location.lat - 0.02},${reading.location.lng + 0.02},${reading.location.lat + 0.02}&layer=mapnik&marker=${reading.location.lat},${reading.location.lng}`}
          />
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-danger" />
              <h2 className="font-display font-semibold">Current location</h2>
            </div>
            <div className="font-medium">{reading.location.label}</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              {reading.location.lat.toFixed(5)}, {reading.location.lng.toFixed(5)}
            </div>
            <div className="mt-3 text-xs">
              Status: <span className={status === "HIGH_RISK" ? "text-danger" : status === "MONITORING" ? "text-warn" : "text-safe"}>{status.replace("_", " ")}</span>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="font-display font-semibold mb-3">High-risk zones</h2>
            <ul className="space-y-2 text-sm">
              {HIGH_RISK_ZONES.map((z) => (
                <li key={z.name} className="flex items-start gap-3">
                  <span className="stat-dot bg-danger mt-1.5" />
                  <div>
                    <div className="font-medium">{z.name}</div>
                    <div className="text-xs text-muted-foreground">{z.note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {lastEscalated && (
            <div className="glass-card p-5 border-danger/40">
              <h2 className="font-display font-semibold mb-1">Last escalated alert</h2>
              <p className="text-xs text-muted-foreground">
                {new Date(lastEscalated.timestamp).toLocaleString()}
              </p>
              <p className="text-sm mt-2">
                {lastEscalated.heartRate} bpm · {lastEscalated.motion}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
