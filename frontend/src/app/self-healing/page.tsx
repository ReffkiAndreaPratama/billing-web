"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { HeartPulse, RefreshCw, Activity } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function SelfHealingPage() {
  const { token } = useAuthStore();
  const h = { Authorization: `Bearer ${token}` };
  const [checks, setChecks] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  useState(() => {
    fetch(`${API}/self-healing/status`, { headers: h })
      .then((r) => r.json())
      .then(setChecks);
    fetch(`${API}/self-healing/incidents`, { headers: h })
      .then((r) => r.json())
      .then(setIncidents);
  });
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <HeartPulse className="w-6 h-6 text-green-400" /> Auto-Healing System
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Activity className="w-4 h-4 inline mr-1" />
              Service Health
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {checks.map((c: any) => (
              <div
                key={c.service}
                className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2"
              >
                {" "}
                <div>
                  <div className="text-sm font-medium">{c.service}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.latencyMs}ms
                  </div>
                </div>{" "}
                <Badge
                  className={
                    c.status === "OK"
                      ? "bg-green-600"
                      : c.status === "DEGRADED"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                  }
                >
                  {c.status}
                </Badge>{" "}
              </div>
            ))}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Recent Incidents
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {incidents.map((inc: any) => (
              <div
                key={inc.id}
                className="p-3 rounded-lg bg-muted mb-2 text-sm"
              >
                {" "}
                <div className="flex justify-between">
                  <span className="font-medium">{inc.service}</span>
                  <Badge variant="outline">{inc.status}</Badge>
                </div>{" "}
                <div className="text-xs text-muted-foreground">
                  {inc.issue} → {inc.action}
                </div>{" "}
              </div>
            ))}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
