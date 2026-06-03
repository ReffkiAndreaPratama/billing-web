"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Video, Play, Square, Save, List } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function ReplayPage() {
  const { token } = useAuthStore();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [activeRec, setActiveRec] = useState<any>(null);
  const [sessionId, setSessionId] = useState(`sess-${Date.now()}`);
  const [unitId, setUnitId] = useState("unit-1");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const start = async () => {
    const res = await fetch(`${API}/replay/start`, {
      method: "POST",
      headers,
      body: JSON.stringify({ sessionId, unitId, unitName: unitId }),
    });
    if (res.ok) {
      const d = await res.json();
      setActiveRec(d);
      setRecordings((prev) => [d, ...prev]);
    }
  };
  const stop = async () => {
    if (!activeRec) return;
    const res = await fetch(`${API}/replay/stop/${activeRec.id}`, {
      method: "POST",
      headers,
    });
    if (res.ok) {
      const d = await res.json();
      setActiveRec(null);
      setRecordings((prev) => [d, ...prev.filter((r: any) => r.id !== d.id)]);
    }
  };
  const save = async (id: string) => {
    await fetch(`${API}/replay/save/${id}`, { method: "POST", headers });
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Video className="w-6 h-6 text-foreground" /> Session Recording
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <Card>
          <CardContent className="p-6 space-y-4">
            {" "}
            <div
              className={`p-6 rounded-xl text-center ${activeRec ? "bg-red-500/10 border border-red-500/20" : "bg-muted"}`}
            >
              {" "}
              <div
                className={`text-4xl mb-2 ${activeRec ? "text-red-400" : "text-zinc-600"}`}
              >
                ●
              </div>{" "}
              <div className="text-sm font-medium">
                {activeRec ? "RECORDING" : "Not Recording"}
              </div>{" "}
            </div>{" "}
            <div>
              <label className="text-xs text-muted-foreground">
                Session ID
              </label>
              <input
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
              />
            </div>{" "}
            <div>
              <label className="text-xs text-muted-foreground">Unit</label>
              <input
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              />
            </div>{" "}
            <div className="flex gap-2">
              {" "}
              {!activeRec ? (
                <Button className="flex-1" onClick={start}>
                  <Play className="w-4 h-4 mr-1" /> Start
                </Button>
              ) : (
                <Button className="flex-1" variant="destructive" onClick={stop}>
                  <Square className="w-4 h-4 mr-1" /> Stop
                </Button>
              )}{" "}
            </div>{" "}
          </CardContent>
        </Card>{" "}
        <Card className="lg:col-span-2 max-h-96 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-base">
              <List className="w-4 h-4 inline mr-1" />
              Recordings
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-2">
            {" "}
            {recordings.map((r: any) => (
              <div
                key={r.id}
                className="flex justify-between items-center p-3 rounded-lg bg-muted text-sm"
              >
                {" "}
                <div>
                  <div className="font-mono text-xs">{r.id}</div>{" "}
                  <div className="text-xs text-muted-foreground">
                    {r.unitName} · {new Date(r.startTime).toLocaleTimeString()}
                    {r.duration ? ` · ${r.duration}s` : ""}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <Badge
                    className={
                      r.status === "RECORDING"
                        ? "bg-red-500/20 text-red-400"
                        : r.status === "SAVED"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }
                  >
                    {r.status}
                  </Badge>{" "}
                  {r.status === "STOPPED" && (
                    <Button size="sm" onClick={() => save(r.id)}>
                      <Save className="w-3 h-3" />
                    </Button>
                  )}{" "}
                </div>{" "}
              </div>
            ))}{" "}
            {recordings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recordings yet
              </div>
            )}{" "}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
