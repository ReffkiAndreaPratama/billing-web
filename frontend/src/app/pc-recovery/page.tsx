"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Monitor, RotateCcw, Power, HardDrive } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function PcRecoveryPage() {
  const { token } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [unitId, setUnitId] = useState("unit-1");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const action = async (type: string) => {
    const res = await fetch(`${API}/pc-recovery/${type}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ unitId, unitName: unitId }),
    });
    if (res.ok) {
      const d = await res.json();
      setLogs((prev) => [d, ...prev]);
    }
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Monitor className="w-6 h-6 text-foreground" /> PC Remote Recovery
      </h1>{" "}
      <Card>
        <CardContent className="p-6 space-y-4">
          {" "}
          <div>
            <label className="text-xs text-muted-foreground">Unit ID</label>
            <input
              className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            />
          </div>{" "}
          <div className="flex gap-2">
            {" "}
            <Button onClick={() => action("restart")}>
              <RotateCcw className="w-4 h-4 mr-1" /> Restart
            </Button>{" "}
            <Button variant="destructive" onClick={() => action("shutdown")}>
              <Power className="w-4 h-4 mr-1" /> Shutdown
            </Button>{" "}
            <Button variant="outline" onClick={() => action("reimage")}>
              <HardDrive className="w-4 h-4 mr-1" /> Re-image
            </Button>{" "}
          </div>{" "}
        </CardContent>
      </Card>{" "}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Log</CardTitle>
        </CardHeader>{" "}
        <CardContent className="space-y-2">
          {" "}
          {logs.map((l: any) => (
            <div
              key={l.id}
              className="flex justify-between items-center p-3 rounded-lg bg-muted text-sm"
            >
              {" "}
              <div>
                <span className="font-medium">{l.action}</span> — {l.unitName}
              </div>{" "}
              <Badge
                className={
                  l.status === "COMPLETED"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }
              >
                {l.status}
              </Badge>{" "}
            </div>
          ))}{" "}
          {logs.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No recovery actions yet
            </div>
          )}{" "}
        </CardContent>
      </Card>{" "}
    </div>
  );
}
