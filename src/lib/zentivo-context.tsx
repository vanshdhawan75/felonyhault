import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AlertRecord, AlertResponse, AlertStatus, Contact, Motion, ReportSource, RiskLevel, SensorReading, User, UserStatus } from "./types";

const LS = {
  user: "zentivo.user",
  session: "zentivo.session",
  contacts: "zentivo.contacts",
  alerts: "zentivo.alerts",
  location: "zentivo.location",
};

function load<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(k: string, v: T) {
  localStorage.setItem(k, JSON.stringify(v));
}

export const INDIAN_LOCATIONS = [
  { label: "Mumbai, Maharashtra", lat: 19.076, lng: 72.8777 },
  { label: "New Delhi, Delhi", lat: 28.6139, lng: 77.209 },
  { label: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 },
  { label: "Hyderabad, Telangana", lat: 17.385, lng: 78.4867 },
  { label: "Chennai, Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { label: "Kolkata, West Bengal", lat: 22.5726, lng: 88.3639 },
  { label: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567 },
  { label: "Ahmedabad, Gujarat", lat: 23.0225, lng: 72.5714 },
  { label: "Jaipur, Rajasthan", lat: 26.9124, lng: 75.7873 },
  { label: "Lucknow, Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { label: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { label: "Kochi, Kerala", lat: 9.9312, lng: 76.2673 },
];

interface ManualLocation { lat: number; lng: number; label: string }

interface ZentivoState {
  user: User | null;
  signup: (u: User) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;

  reading: SensorReading;
  risk: RiskLevel;
  status: UserStatus;
  simulating: boolean;
  simulateEmergency: () => void;
  resetToSafe: () => void;

  activeAlert: boolean;
  countdown: number;
  respondSafe: () => void;
  respondEmergency: () => void;

  contacts: Contact[];
  addContact: (c: Omit<Contact, "id">) => void;
  updateContact: (id: string, c: Omit<Contact, "id">) => void;
  removeContact: (id: string) => void;

  alerts: AlertRecord[];
  clearAlerts: () => void;

  setManualLocation: (loc: ManualLocation) => void;
  fileManualReport: (reason: string) => AlertRecord;
}

const Ctx = createContext<ZentivoState | null>(null);

const ALERT_WINDOW = 12;

const DEFAULT_LOCATION = { lat: 19.076, lng: 72.8777, label: "Mumbai, Maharashtra" };

const baseReading = (location = DEFAULT_LOCATION): SensorReading => ({
  motion: "Normal",
  heartRate: 72,
  location,
  timestamp: Date.now(),
});

export function ZentivoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => load<User | null>(LS.session, null));
  const [contacts, setContacts] = useState<Contact[]>(() => load<Contact[]>(LS.contacts, [
    { id: "c1", name: "Aarav Sharma", phone: "+91 98765 43210" },
    { id: "c2", name: "Priya Singh", phone: "+91 98200 11223" },
  ]));
  const [alerts, setAlerts] = useState<AlertRecord[]>(() => load<AlertRecord[]>(LS.alerts, []));
  const [savedLocation, setSavedLocation] = useState<ManualLocation>(() =>
    load<ManualLocation>(LS.location, DEFAULT_LOCATION),
  );
  const [reading, setReading] = useState<SensorReading>(() => baseReading(load<ManualLocation>(LS.location, DEFAULT_LOCATION)));
  const [simulating, setSimulating] = useState(false);
  const [activeAlert, setActiveAlert] = useState(false);
  const [countdown, setCountdown] = useState(ALERT_WINDOW);
  const alertResolvedRef = useRef(false);
  const contactsRef = useRef(contacts);
  const readingRef = useRef(reading);
  useEffect(() => { contactsRef.current = contacts; }, [contacts]);
  useEffect(() => { readingRef.current = reading; }, [reading]);

  useEffect(() => save(LS.contacts, contacts), [contacts]);
  useEffect(() => save(LS.alerts, alerts), [alerts]);
  useEffect(() => save(LS.location, savedLocation), [savedLocation]);
  useEffect(() => {
    if (user) save(LS.session, user);
    else localStorage.removeItem(LS.session);
  }, [user]);

  // Sensor tick
  useEffect(() => {
    const id = setInterval(() => {
      setReading((r) => {
        if (simulating) {
          return {
            ...r,
            motion: "Abnormal",
            heartRate: Math.min(165, r.heartRate + Math.round(Math.random() * 6 + 2)),
            timestamp: Date.now(),
          };
        }
        const next = Math.round(70 + Math.sin(Date.now() / 4000) * 4 + (Math.random() - 0.5) * 3);
        return { ...r, motion: "Normal", heartRate: next, timestamp: Date.now() };
      });
    }, 1200);
    return () => clearInterval(id);
  }, [simulating]);

  const risk: RiskLevel = useMemo(() => {
    if (reading.heartRate > 120 || reading.motion === "Abnormal") return "HIGH";
    if (reading.heartRate > 100) return "MEDIUM";
    return "LOW";
  }, [reading]);

  const status: UserStatus = useMemo(() => {
    if (risk === "HIGH") return "HIGH_RISK";
    if (risk === "MEDIUM") return "MONITORING";
    return "SAFE";
  }, [risk]);

  useEffect(() => {
    if (risk === "HIGH" && !activeAlert) {
      alertResolvedRef.current = false;
      setActiveAlert(true);
      setCountdown(ALERT_WINDOW);
      try { playAlertTone(); } catch {/* ignore */}
    }
  }, [risk, activeAlert]);

  useEffect(() => {
    if (!activeAlert) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          if (!alertResolvedRef.current) escalate();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlert]);

  const buildReport = (
    response: AlertResponse,
    statusVal: AlertStatus,
    source: ReportSource,
    riskLevel: RiskLevel = "HIGH",
    reason?: string,
  ): AlertRecord => {
    const r = readingRef.current;
    const notified = statusVal === "Escalated"
      ? contactsRef.current.map((c) => ({ name: c.name, phone: c.phone }))
      : [];
    return {
      id: crypto.randomUUID(),
      reportId: "ZEN-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      timestamp: Date.now(),
      riskLevel,
      response,
      status: statusVal,
      heartRate: r.heartRate,
      motion: r.motion,
      source,
      reason,
      location: r.location,
      notifiedContacts: notified,
    };
  };

  const pushAlert = (a: AlertRecord) => setAlerts((prev) => [a, ...prev].slice(0, 100));

  const escalate = () => {
    alertResolvedRef.current = true;
    pushAlert(buildReport("No Response", "Escalated", "AI"));
    setActiveAlert(false);
  };
  const respondSafe = () => {
    alertResolvedRef.current = true;
    pushAlert(buildReport("Confirmed Safe", "Resolved", "AI"));
    setActiveAlert(false);
    resetToSafe();
  };
  const respondEmergency = () => {
    alertResolvedRef.current = true;
    pushAlert(buildReport("Confirmed Emergency", "Escalated", "AI"));
    setActiveAlert(false);
  };

  const simulateEmergency = () => {
    setSimulating(true);
    setReading((r) => ({ ...r, motion: "Abnormal" as Motion, heartRate: 128, timestamp: Date.now() }));
  };
  const resetToSafe = () => {
    setSimulating(false);
    setReading(baseReading(savedLocation));
  };

  const fileManualReport = (reason: string) => {
    const rec = buildReport("Manual Report", "Escalated", "Manual", "HIGH", reason);
    pushAlert(rec);
    try { playAlertTone(); } catch {/* ignore */}
    return rec;
  };

  const setManualLocation = (loc: ManualLocation) => {
    setSavedLocation(loc);
    setReading((r) => ({ ...r, location: loc, timestamp: Date.now() }));
  };

  const signup = (u: User) => {
    const existing = load<User | null>(LS.user, null);
    if (existing && existing.email === u.email) return "An account with this email already exists.";
    save(LS.user, u);
    setUser(u);
    return null;
  };
  const login = (email: string, password: string) => {
    const existing = load<User | null>(LS.user, null);
    if (!existing) return "No account found. Please sign up first.";
    if (existing.email !== email || existing.password !== password) return "Invalid email or password.";
    setUser(existing);
    return null;
  };
  const logout = () => setUser(null);

  const addContact = useCallback((c: Omit<Contact, "id">) => {
    setContacts((prev) => [...prev, { ...c, id: crypto.randomUUID() }]);
  }, []);
  const updateContact = useCallback((id: string, c: Omit<Contact, "id">) => {
    setContacts((prev) => prev.map((x) => (x.id === id ? { ...x, ...c } : x)));
  }, []);
  const removeContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((x) => x.id !== id));
  }, []);
  const clearAlerts = () => setAlerts([]);

  const value: ZentivoState = {
    user, signup, login, logout,
    reading, risk, status, simulating, simulateEmergency, resetToSafe,
    activeAlert, countdown, respondSafe, respondEmergency,
    contacts, addContact, updateContact, removeContact,
    alerts, clearAlerts,
    setManualLocation, fileManualReport,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useZentivo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useZentivo must be used inside ZentivoProvider");
  return v;
}

function playAlertTone() {
  const AC = (window.AudioContext || (window as any).webkitAudioContext);
  if (!AC) return;
  const ctx = new AC();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(880, ctx.currentTime);
  o.frequency.setValueAtTime(660, ctx.currentTime + 0.18);
  o.frequency.setValueAtTime(880, ctx.currentTime + 0.36);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.6);
}
