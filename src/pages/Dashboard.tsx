import { Activity, Bot, Heart, MapPin, Radio, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useZentivo } from "@/lib/zentivo-context";
import { AppShell } from "@/components/AppShell";
import { ManualReportButton } from "@/components/ManualReportButton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function StatusCard() {
  const { status, user } = useZentivo();
  const map = {
    SAFE: { label: "Safe", icon: ShieldCheck, color: "text-safe", ring: "ring-safe/40", bg: "bg-safe/10" },
    MONITORING: { label: "Monitoring", icon: Radio, color: "text-warn", ring: "ring-warn/40", bg: "bg-warn/10" },
    HIGH_RISK: { label: "High Risk", icon: ShieldAlert, color: "text-danger", ring: "ring-danger/50", bg: "bg-danger/15" },
  } as const;
  const s = map[status];
  const Icon = s.icon;
  return (
    <div className="glass-card p-6 col-span-1 md:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Current status</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
            {user?.name?.split(" ")[0] || "User"} is <span className={s.color}>{s.label}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Continuous AI evaluation of motion, vitals, and location.
          </p>
        </div>
        <div className={`h-16 w-16 rounded-2xl grid place-items-center ring-4 ${s.ring} ${s.bg} ${status === "HIGH_RISK" ? "animate-pulse-ring" : ""}`}>
          <Icon className={`h-7 w-7 ${s.color}`} />
        </div>
      </div>
    </div>
  );
}

function RiskCard() {
  const { risk } = useZentivo();
  const palette = {
    LOW: { label: "Low", color: "text-safe", bar: "bg-safe", w: "w-1/3" },
    MEDIUM: { label: "Medium", color: "text-warn", bar: "bg-warn", w: "w-2/3" },
    HIGH: { label: "High", color: "text-danger", bar: "bg-danger", w: "w-full" },
  } as const;
  const p = palette[risk];
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">AI Risk Level</p>
        <Zap className={`h-4 w-4 ${p.color}`} />
      </div>
      <div className={`font-display text-4xl font-bold mt-3 ${p.color}`}>{p.label}</div>
      <div className="mt-4 h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div className={`h-full ${p.bar} ${p.w} transition-all duration-700`} />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Rule: HR &gt; 120 bpm OR abnormal motion → HIGH
      </p>
    </div>
  );
}

function HeartRateCard() {
  const { reading } = useZentivo();
  const high = reading.heartRate > 120;
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Heart rate</p>
        <Heart className={`h-4 w-4 ${high ? "text-danger" : "text-safe"}`} />
      </div>
      <div className="font-display text-4xl font-bold mt-3 tabular-nums">
        {reading.heartRate}
        <span className="text-base font-medium text-muted-foreground ml-1">bpm</span>
      </div>
      <div className="mt-4 h-10 overflow-hidden rounded-md bg-secondary/50 relative">
        <svg viewBox="0 0 200 40" className="h-full w-[200%] animate-ekg" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={high ? "hsl(var(--danger))" : "hsl(var(--safe))"}
            strokeWidth="1.5"
            points="0,20 20,20 25,8 30,32 35,20 60,20 65,12 70,28 75,20 100,20 105,8 110,32 115,20 140,20 145,12 150,28 155,20 200,20"
          />
          <polyline
            fill="none"
            stroke={high ? "hsl(var(--danger))" : "hsl(var(--safe))"}
            strokeWidth="1.5"
            points="200,20 220,20 225,8 230,32 235,20 260,20 265,12 270,28 275,20 300,20 305,8 310,32 315,20 340,20 345,12 350,28 355,20 400,20"
          />
        </svg>
      </div>
    </div>
  );
}

function MotionCard() {
  const { reading } = useZentivo();
  const abnormal = reading.motion === "Abnormal";
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Motion</p>
        <Activity className={`h-4 w-4 ${abnormal ? "text-danger" : "text-safe"}`} />
      </div>
      <div className={`font-display text-4xl font-bold mt-3 ${abnormal ? "text-danger" : "text-foreground"}`}>
        {reading.motion}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Accelerometer + gyroscope pattern recognition.
      </p>
    </div>
  );
}

function LocationCard() {
  const { reading } = useZentivo();
  return (
    <div className="glass-card p-6 md:col-span-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Last known location</p>
        <MapPin className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="font-display text-2xl font-semibold mt-3">{reading.location.label}</div>
      <p className="text-xs text-muted-foreground mt-1 font-mono">
        {reading.location.lat.toFixed(4)}, {reading.location.lng.toFixed(4)}
      </p>
      <div className="mt-4 rounded-lg overflow-hidden border border-border h-40">
        <iframe
          title="Live location"
          className="w-full h-full grayscale-[40%] contrast-110"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${reading.location.lng - 0.01},${reading.location.lat - 0.01},${reading.location.lng + 0.01},${reading.location.lat + 0.01}&layer=mapnik&marker=${reading.location.lat},${reading.location.lng}`}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { status, selfReportDemo, runSelfReportDemo } = useZentivo();
  const navigate = useNavigate();

  const handleSelfReport = async () => {
    const rec = await runSelfReportDemo();
    if (rec) {
      toast.success(`AI self-report ${rec.reportId} filed`, {
        description: rec.reason,
      });
      navigate(`/dispatch/${rec.reportId}`);
    }
  };

  return (
    <AppShell>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Live monitoring</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Safety Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSelfReport}
            disabled={selfReportDemo.active}
            size="lg"
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Bot className="h-4 w-4 mr-2" />
            {selfReportDemo.active ? "AI working…" : "Run AI Self-Report"}
          </Button>
          <ManualReportButton />
        </div>
      </header>

      {selfReportDemo.active && (
        <div className="glass-card p-4 mb-4 border-primary/40 flex items-center gap-3 animate-fade-in">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <div className="text-sm">
            <span className="text-primary font-semibold">AI Self-Report:</span>{" "}
            <span className="text-muted-foreground">Scenario:</span> {selfReportDemo.scenario}
            <span className="mx-2 text-muted-foreground">·</span>
            <span>{selfReportDemo.phase}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard />
        <RiskCard />
        <HeartRateCard />
        <MotionCard />
        <LocationCard />
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        {status === "HIGH_RISK"
          ? "Active high-risk state — escalation will start if you don't respond to the alert."
          : "All vitals within safe thresholds. AI is continuously evaluating new readings."}
      </p>
    </AppShell>
  );
}
