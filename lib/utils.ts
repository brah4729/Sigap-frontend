/**
 * Severity helpers — colors, labels, and icons for disaster severity.
 * Centralizing these means we change the color once, it updates everywhere.
 */

import type { SeverityLevel, DisasterStatus } from "./api";

export const severityConfig: Record<
  SeverityLevel,
  { color: string; bg: string; border: string; dot: string; label: string }
> = {
  CRITICAL: {
    color: "text-red-400",
    bg: "bg-red-950",
    border: "border-red-700",
    dot: "bg-red-500",
    label: "CRITICAL",
  },
  HIGH: {
    color: "text-orange-400",
    bg: "bg-orange-950",
    border: "border-orange-700",
    dot: "bg-orange-500",
    label: "HIGH",
  },
  MEDIUM: {
    color: "text-yellow-400",
    bg: "bg-yellow-950",
    border: "border-yellow-700",
    dot: "bg-yellow-500",
    label: "MEDIUM",
  },
  LOW: {
    color: "text-green-400",
    bg: "bg-green-950",
    border: "border-green-700",
    dot: "bg-green-500",
    label: "LOW",
  },
};

export const statusConfig: Record<
  DisasterStatus,
  { color: string; label: string }
> = {
  DETECTED: { color: "text-blue-400", label: "DETECTED" },
  ASSESSING: { color: "text-yellow-400", label: "ASSESSING" },
  RESPONDING: { color: "text-orange-400", label: "RESPONDING" },
  RESOLVED: { color: "text-green-400", label: "RESOLVED" },
};

export function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatCoords(lat: number | null, lon: number | null): string {
  if (!lat || !lon) return "Unknown location";
  return `${Math.abs(lat).toFixed(2)}°${lat < 0 ? "S" : "N"}, ${Math.abs(lon).toFixed(2)}°${lon < 0 ? "W" : "E"}`;
}
