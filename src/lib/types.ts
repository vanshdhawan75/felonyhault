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
  password: string; // mock only
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface AlertRecord {
  id: string;
  timestamp: number;
  riskLevel: RiskLevel;
  response: "Confirmed Safe" | "Confirmed Emergency" | "No Response";
  status: "Resolved" | "Escalated";
  heartRate: number;
  motion: Motion;
}
