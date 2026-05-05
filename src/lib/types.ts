export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type UserStatus = "SAFE" | "MONITORING" | "HIGH_RISK";
export type Motion = "Normal" | "Abnormal";

export interface SensorReading {
  motion: Motion;
  heartRate: number;
  location: { lat: number; lng: number; label: string };
  timestamp: number;
}

export interface User {
  name: string;
  email: string;
  password: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export type AlertResponse = "Confirmed Safe" | "Confirmed Emergency" | "No Response" | "Manual Report" | "AI Self-Report";
export type AlertStatus = "Resolved" | "Escalated";
export type ReportSource = "AI" | "Manual" | "AI-Self";

export interface AlertRecord {
  id: string;
  timestamp: number;
  riskLevel: RiskLevel;
  response: AlertResponse;
  status: AlertStatus;
  heartRate: number;
  motion: Motion;
  source: ReportSource;
  reason?: string;
  location: { lat: number; lng: number; label: string };
  notifiedContacts: { name: string; phone: string }[];
  reportId: string;
}
