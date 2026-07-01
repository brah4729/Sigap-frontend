/**
 * SIGAP API Client
 * 
 * Central place for all backend calls.
 * Why? If the backend URL changes, we only update it here.
 * All components import from this file, not directly from axios.
 */

import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000, // 30s — agents can take time to respond
});

// --- Types ---
export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DisasterStatus = "DETECTED" | "ASSESSING" | "RESPONDING" | "RESOLVED";
export type DisasterType =
  | "EARTHQUAKE"
  | "FLOOD"
  | "TSUNAMI"
  | "VOLCANO"
  | "LANDSLIDE"
  | "OTHER";

export interface Disaster {
  id: number;
  title: string;
  description: string | null;
  disaster_type: DisasterType;
  severity: SeverityLevel;
  status: DisasterStatus;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  source: string | null;
  detected_at: string;
  ai_assessment: string | null;
}

export interface AgentLog {
  id: number;
  agent: string;
  action: string;
  details: string | null;
  disaster_id: number | null;
  timestamp: string;
}

export interface ResourceDeployment {
  id: number;
  disaster_title: string | null;
  resource_name: string | null;
  resource_type: string | null;
  notes: string | null;
  deployed_at: string;
}

export interface Resource {
  id: number;
  name: string;
  type: string;
  quantity: number;
  location: string;
  is_available: boolean;
}

// --- API Functions ---

export const sigapApi = {
  // Disasters
  getDisasters: () => API.get<Disaster[]>("/api/disasters/"),
  getDisaster: (id: number) => API.get<Disaster>(`/api/disasters/${id}`),
  triggerScan: () => API.post("/api/disasters/scan"),

  // Agents
  runAgent: (name: string, disasterId?: number) =>
    API.post(`/api/agents/run/${name}`, null, {
      params: disasterId ? { disaster_id: disasterId } : {},
    }),
  getAgentLogs: () => API.get<AgentLog[]>("/api/agents/logs"),

  // Resources
  getResources: () => API.get<Resource[]>("/api/resources/"),
  getDeployments: () => API.get<ResourceDeployment[]>("/api/resources/deployments"),
  seedResources: () => API.post("/api/resources/seed"),
};
