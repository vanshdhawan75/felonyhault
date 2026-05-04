import { useState } from "react";
import { MapPin, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INDIAN_LOCATIONS, useZentivo } from "@/lib/zentivo-context";
import { toast } from "sonner";

export function LocationSetup() {
  const { reading, setManualLocation } = useZentivo();
  const [label, setLabel] = useState(reading.location.label);
  const [lat, setLat] = useState(String(reading.location.lat));
  const [lng, setLng] = useState(String(reading.location.lng));

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const la = parseFloat(lat);
    const ln = parseFloat(lng);
    if (Number.isNaN(la) || Number.isNaN(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) {
      return toast.error("Enter valid latitude (-90..90) and longitude (-180..180)");
    }
    if (!label.trim()) return toast.error("Enter a location label");
    setManualLocation({ lat: la, lng: ln, label: label.trim() });
    toast.success("Location updated");
  };

  const pick = (loc: { label: string; lat: number; lng: number }) => {
    setLabel(loc.label);
    setLat(String(loc.lat));
    setLng(String(loc.lng));
    setManualLocation(loc);
    toast.success(`Location set: ${loc.label}`);
  };

  const useBrowser = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: "My current location" };
        setLabel(loc.label);
        setLat(String(loc.lat));
        setLng(String(loc.lng));
        setManualLocation(loc);
        toast.success("Using browser location");
      },
      () => toast.error("Could not retrieve location"),
    );
  };

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-danger" />
        <h2 className="font-display font-semibold">Setup manual location</h2>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Quick pick — India</p>
        <div className="flex flex-wrap gap-2">
          {INDIAN_LOCATIONS.map((loc) => (
            <button
              key={loc.label}
              type="button"
              onClick={() => pick(loc)}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-secondary hover:bg-primary/15 hover:border-primary/40 transition-colors"
            >
              {loc.label.split(",")[0]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={apply} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="loc-label">Label</Label>
          <Input id="loc-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Andheri East, Mumbai" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="loc-lat">Latitude</Label>
            <Input id="loc-lat" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="19.0760" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc-lng">Longitude</Label>
            <Input id="loc-lng" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="72.8777" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="bg-gradient-danger shadow-danger hover:opacity-95">
            <Save className="h-4 w-4 mr-1" /> Save location
          </Button>
          <Button type="button" variant="secondary" onClick={useBrowser}>
            <Search className="h-4 w-4 mr-1" /> Use device location
          </Button>
        </div>
      </form>
    </div>
  );
}
