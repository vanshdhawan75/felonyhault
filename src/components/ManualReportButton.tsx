import { useState } from "react";
import { Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useZentivo } from "@/lib/zentivo-context";
import { toast } from "sonner";

const REASONS = ["Medical emergency", "Accident", "Feeling unsafe", "Harassment", "Other"];

export function ManualReportButton() {
  const { fileManualReport, contacts } = useZentivo();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");

  const submit = () => {
    const final = details.trim() ? `${reason} — ${details.trim()}` : reason;
    const rec = fileManualReport(final);
    toast.success(`Report ${rec.reportId} filed`, {
      description: contacts.length
        ? `Notified ${contacts.length} contact${contacts.length > 1 ? "s" : ""}`
        : "No contacts configured — add some in Contacts.",
    });
    setOpen(false);
    setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" className="border-danger/50 text-danger hover:bg-danger/10 hover:text-danger">
          <Siren className="h-4 w-4 mr-2" /> Report Emergency
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Siren className="h-5 w-5 text-danger" /> File a manual report</DialogTitle>
          <DialogDescription>
            This immediately escalates and notifies all your emergency contacts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReason(r)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    reason === r
                      ? "bg-danger/20 border-danger text-danger"
                      : "bg-secondary border-border hover:bg-primary/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-details">Additional details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="What's happening?"
              rows={3}
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {contacts.length} contact{contacts.length === 1 ? "" : "s"} will be notified with your live location.
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-danger shadow-danger hover:opacity-95">
            <Siren className="h-4 w-4 mr-2" /> Send report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
