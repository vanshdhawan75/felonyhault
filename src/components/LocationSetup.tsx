import { useState } from "react";
import { MapPin, Save, Search, Loader2, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INDIAN_LOCATIONS, useZentivo } from "@/lib/zentivo-context";
import { toast } from "sonner";

interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationSetup() {
  const { reading, setManualLocation } = useZentivo();
  const [label, setLabel] = useState(reading.location.label);
  const [lat, setLat] = useState(String(reading.location.lat));
  const [lng, setLng] = useState(String(reading.location.lng));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);

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

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      const data: GeoResult[] = await res.json();
      if (!data.length) toast.error("No matching places found");
      setResults(data);
    } catch {
      toast.error("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const pickResult = (r: GeoResult) => {
    pick({ label: r.display_name, lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setResults([]);
    setQuery("");
  };

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-danger" />
        <h2 className="font-display font-semibold">Setup manual location</h2>
      </div>

      <form onSubmit={search} className="space-y-2">
        <Label htmlFor="loc-search">Search any place worldwide</Label>
        <div className="flex gap-2">
          <Input
            id="loc-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Eiffel Tower, MG Road Bengaluru, 10001 NYC"
          />
          <Button type="submit" disabled={searching} className="bg-gradient-danger shadow-danger hover:opacity-95">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {results.length > 0 && (
          <ul className="mt-2 max-h-56 overflow-auto rounded-md border border-border divide-y divide-border bg-background/60">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pickResult(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
                >
                  <div className="font-medium line-clamp-1">{r.display_name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {parseFloat(r.lat).toFixed(4)}, {parseFloat(r.lon).toFixed(4)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

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
            <Save className="h-4 w-4 mr-1" /> Save coordinates
          </Button>
          <Button type="button" variant="secondary" onClick={useBrowser}>
            <Crosshair className="h-4 w-4 mr-1" /> Use device location
          </Button>
        </div>
      </form>
    </div>
  );
}
