import { useEffect, useRef } from "react";
import { useZentivo } from "@/lib/zentivo-context";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, X } from "lucide-react";

export function EmergencyAlert() {
  const { activeAlert, countdown, respondSafe, respondEmergency } = useZentivo();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeAlert) dialogRef.current?.focus();
  }, [activeAlert]);

  if (!activeAlert) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="alertdialog"
        aria-labelledby="alert-title"
        className="w-full max-w-md rounded-2xl border-2 p-6 md:p-8 animate-blink-alert outline-none"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-danger/20 grid place-items-center animate-pulse-ring">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <div>
            <h2 id="alert-title" className="text-2xl font-display font-bold">Are you safe?</h2>
            <p className="text-sm text-muted-foreground">High risk detected from sensors</p>
          </div>
        </div>

        <div className="my-6 text-center">
          <div className="font-mono text-6xl font-bold text-danger tabular-nums">{countdown}s</div>
          <p className="text-xs text-muted-foreground mt-2">
            No response will notify your emergency contacts
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" onClick={respondSafe} className="bg-safe hover:bg-safe/90 text-primary-foreground">
            <Check className="h-5 w-5 mr-2" /> Yes, I'm safe
          </Button>
          <Button size="lg" variant="destructive" onClick={respondEmergency}>
            <X className="h-5 w-5 mr-2" /> No, help!
          </Button>
        </div>
      </div>
    </div>
  );
}
