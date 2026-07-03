"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  Activity,
  Radio,
  Cpu,
  RefreshCw,
  ChevronRight,
  Shield,
  Zap,
  Package,
} from "lucide-react";
import { sigapApi, type Disaster, type AgentLog, type ResourceDeployment } from "@/lib/api";
import { severityConfig, statusConfig, timeAgo } from "@/lib/utils";

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded border px-4 py-3 ${
        accent
          ? "border-red-800 bg-red-950/40"
          : "border-zinc-800 bg-zinc-900/60"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          accent ? "text-red-400" : "text-zinc-100"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-zinc-600">{sub}</p>}
    </div>
  );
}

// ─── Agent Button ─────────────────────────────────────────────────────────────
function AgentButton({
  name,
  label,
  icon: Icon,
  loading,
  onClick,
}: {
  name: string;
  label: string;
  icon: React.ElementType;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-all hover:border-red-700 hover:bg-red-950/30 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Icon size={13} className={loading ? "animate-spin" : ""} />
      {loading ? "Running..." : label}
    </button>
  );
}

// ─── Disaster Row ─────────────────────────────────────────────────────────────
function DisasterRow({
  disaster,
  onClick,
  selected,
}: {
  disaster: Disaster;
  onClick: () => void;
  selected: boolean;
}) {
  const sev = severityConfig[disaster.severity];
  const stat = statusConfig[disaster.status];

  return (
    <button
      onClick={onClick}
      className={`w-full rounded border px-3 py-2.5 text-left transition-all ${
        selected
          ? "border-red-700 bg-red-950/30"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Severity dot — pulses for CRITICAL */}
          <span
            className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${sev.dot} ${
              disaster.severity === "CRITICAL" ? "pulse-red" : ""
            }`}
          />
          <span className="truncate text-xs font-medium text-zinc-200">
            {disaster.title}
          </span>
        </div>
        <span className={`shrink-0 text-[10px] font-bold ${sev.color}`}>
          {sev.label}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-3 pl-4">
        <span className="text-[10px] text-zinc-600">
          {disaster.location_name ?? "Unknown"}
        </span>
        <span className={`text-[10px] font-semibold ${stat.color}`}>
          {stat.label}
        </span>
        <span className="text-[10px] text-zinc-700">
          {timeAgo(disaster.detected_at)}
        </span>
      </div>
    </button>
  );
}

// ─── Assessment Panel ─────────────────────────────────────────────────────────
function AssessmentPanel({ disaster }: { disaster: Disaster }) {
  let assessment: Record<string, unknown> = {};
  try {
    if (disaster.ai_assessment) assessment = JSON.parse(disaster.ai_assessment);
  } catch {}

  const sev = severityConfig[disaster.severity];
  const actions =
    (assessment.recommended_actions as Array<{ priority: number; action: string; timeframe: string }>) ?? [];
  const risks = (assessment.immediate_risks as string[]) ?? [];
  const resources = assessment.required_resources as Record<string, number> | undefined;

  return (
    <div className="space-y-3">
      <div className={`rounded border ${sev.border} ${sev.bg} px-3 py-2`}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Severity
        </p>
        <p className={`text-lg font-bold ${sev.color}`}>{disaster.severity}</p>
      </div>

      {Boolean(assessment.affected_population) && (
        <div className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Estimated Affected
          </p>
          <p className="mt-0.5 text-sm text-zinc-200">
            {String(assessment.affected_population ?? assessment.affected_population_estimate ?? "—")}
          </p>
        </div>
      )}

      {risks.length > 0 && (
        <div className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Immediate Risks
          </p>
          <ul className="space-y-1">
            {risks.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {actions.length > 0 && (
        <div className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Response Actions
          </p>
          <ol className="space-y-1.5">
            {actions.map((a, i) => (
              <li key={i} className="text-xs text-zinc-400">
                <span className="font-bold text-red-400">{i + 1}.</span>{" "}
                {a.action}
                {a.timeframe && (
                  <span className="ml-1 text-zinc-600">({a.timeframe})</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {resources && (
        <div className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Required Resources
          </p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(resources).map(([k, v]) => (
              <div key={k} className="text-xs">
                <span className="text-zinc-600 capitalize">
                  {k.replace(/_/g, " ")}:{" "}
                </span>
                <span className="font-semibold text-zinc-300">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!assessment.summary && !actions.length && (
        <p className="text-xs text-zinc-600 italic">
          Assessment pending — run Assessment Agent to analyze this event.
        </p>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [deployments, setDeployments] = useState<ResourceDeployment[]>([]);
  const [selected, setSelected] = useState<Disaster | null>(null);
  const [loadingAgent, setLoadingAgent] = useState<string | null>(null);
  const [agentResult, setAgentResult] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [d, l, dep] = await Promise.all([
        sigapApi.getDisasters(),
        sigapApi.getAgentLogs(),
        sigapApi.getDeployments(),
      ]);
      setDisasters(d.data);
      setLogs(l.data);
      setDeployments(dep.data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Run an agent and refresh data after
  const runAgent = async (name: string) => {
    setLoadingAgent(name);
    setAgentResult(null);
    try {
      const res = await sigapApi.runAgent(name);
      const data = res.data;
      const msg =
        data.message ||
        data.report?.slice(0, 200) ||
        `${name} completed`;
      setAgentResult(`✅ ${msg}`);

      // First refresh — catches immediately saved data
      await fetchAll();

      // If monitor ran, the automated pipeline
      // (assess + coordinate) runs AFTER the response returns.
      // We do 2 more delayed refreshes to catch deployments
      // as they get committed to the DB.
      if (name === "monitor") {
        setAgentResult(`✅ ${msg} — Pipeline running, updating...`);
        setTimeout(async () => {
          await fetchAll();
        }, 8000);  // 8s — after assessment starts
        setTimeout(async () => {
          await fetchAll();
          setAgentResult(`✅ Pipeline complete. Check deployments →`);
        }, 20000); // 20s — after coordination finishes
      }

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setAgentResult(`❌ ${name} failed: ${msg}`);
    } finally {
      setLoadingAgent(null);
    }
  };

  // Stats
  const criticalCount = disasters.filter((d) => d.severity === "CRITICAL").length;
  const highCount = disasters.filter((d) => d.severity === "HIGH").length;
  const resolvedCount = disasters.filter((d) => d.status === "RESOLVED").length;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a] text-zinc-200">

      {/* ── Header ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-red-600">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-zinc-100">
              SIGAP
            </h1>
            <p className="text-[10px] text-zinc-600">
              Sistem Informasi Geospasial Agent Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 pulse-red" />
            <span className="text-[10px] font-semibold text-green-400">
              LIVE
            </span>
          </div>
          <span className="text-[10px] text-zinc-700">
            Updated {timeAgo(lastRefresh.toISOString())}
          </span>
          <button
            onClick={fetchAll}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded border border-zinc-700 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 disabled:opacity-40"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      {/* ── Stat Bar ── */}
      <div className="grid shrink-0 grid-cols-4 gap-3 border-b border-zinc-800 bg-zinc-950/50 px-5 py-3">
        <StatCard label="Active Disasters" value={disasters.length} />
        <StatCard
          label="Critical"
          value={criticalCount}
          sub={`${highCount} HIGH`}
          accent={criticalCount > 0}
        />
        <StatCard label="Resolved" value={resolvedCount} sub="This session" />
        <StatCard label="Deployments" value={deployments.length} sub="Resources dispatched" />
      </div>

      {/* ── Main Content ── */}
      <div className="flex min-h-0 flex-1 gap-0">

        {/* Left — Disaster List */}
        <div className="flex w-72 shrink-0 flex-col border-r border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Radio size={12} className="text-red-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Disasters
              </span>
            </div>
            <span className="text-[10px] text-zinc-600">{disasters.length} events</span>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
            {disasters.length === 0 ? (
              <div className="pt-8 text-center">
                <p className="text-xs text-zinc-600">No disasters detected.</p>
                <p className="mt-1 text-[10px] text-zinc-700">
                  Run Monitor Agent to scan.
                </p>
              </div>
            ) : (
              disasters.map((d) => (
                <DisasterRow
                  key={d.id}
                  disaster={d}
                  selected={selected?.id === d.id}
                  onClick={() => setSelected(selected?.id === d.id ? null : d)}
                />
              ))
            )}
          </div>
        </div>

        {/* Center — Detail / Assessment */}
        <div className="flex min-w-0 flex-1 flex-col border-r border-zinc-800">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
            <Activity size={12} className="text-red-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              {selected ? "Assessment Detail" : "Select a disaster"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selected ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">
                    {selected.title}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-zinc-600">
                    {selected.location_name} · Source: {selected.source} ·{" "}
                    {timeAgo(selected.detected_at)}
                  </p>
                </div>
                <AssessmentPanel disaster={selected} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <AlertTriangle size={32} className="mx-auto mb-3 text-zinc-700" />
                  <p className="text-xs text-zinc-600">
                    Click a disaster on the left to view its AI assessment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Agents + Deployments */}
        <div className="flex w-72 shrink-0 flex-col">

          {/* Agent Controls */}
          <div className="border-b border-zinc-800">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
              <Cpu size={12} className="text-red-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Agent Controls
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              <AgentButton
                name="monitor"
                label="Monitor"
                icon={Radio}
                loading={loadingAgent === "monitor"}
                onClick={() => runAgent("monitor")}
              />
              <AgentButton
                name="assessment"
                label="Assess"
                icon={Activity}
                loading={loadingAgent === "assessment"}
                onClick={() => runAgent("assessment")}
              />
              <AgentButton
                name="coordinator"
                label="Coordinate"
                icon={Zap}
                loading={loadingAgent === "coordinator"}
                onClick={() => runAgent("coordinator")}
              />
              <AgentButton
                name="orchestrator"
                label="Orchestrate"
                icon={Cpu}
                loading={loadingAgent === "orchestrator"}
                onClick={() => runAgent("orchestrator")}
              />
            </div>

            {/* Agent result toast */}
            {agentResult && (
              <div className="mx-3 mb-3 rounded border border-zinc-700 bg-zinc-900 px-3 py-2">
                <p className="text-[11px] text-zinc-400">{agentResult}</p>
                <button
                  onClick={() => setAgentResult(null)}
                  className="mt-1 text-[10px] text-zinc-600 hover:text-zinc-400"
                >
                  dismiss
                </button>
              </div>
            )}
          </div>

          {/* Resource Deployments */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
              <Package size={12} className="text-red-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Deployments
              </span>
            </div>
            <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
              {deployments.length === 0 ? (
                <p className="pt-4 text-center text-[11px] text-zinc-700">
                  No resources deployed yet.
                </p>
              ) : (
                deployments.map((dep) => (
                  <div
                    key={dep.id}
                    className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-300">
                        {dep.resource_name}
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400">
                        {dep.resource_type}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-600">
                      <ChevronRight size={9} />
                      <span className="truncate">{dep.disaster_title}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-zinc-700">
                      {timeAgo(dep.deployed_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Agent Log Footer ── */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950/80">
        <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-2">
          <Activity size={11} className="text-red-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Agent Activity Log
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 py-2.5">
          {logs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="flex shrink-0 items-center gap-2 rounded border border-zinc-800 bg-zinc-900/50 px-3 py-1.5"
            >
              <span className="text-[10px] font-bold text-red-400">
                {log.agent.replace("Agent", "")}
              </span>
              <span className="text-[10px] text-zinc-500">→</span>
              <span className="text-[10px] text-zinc-400">{log.action}</span>
              <span className="text-[10px] text-zinc-700">
                {timeAgo(log.timestamp)}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-[11px] text-zinc-700">
              No agent activity yet. Run an agent to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
