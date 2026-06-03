"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Cloud, CloudOff, RefreshCw, Wifi, AlertTriangle } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function SyncStatusPage() {
  const { token } = useAuthStore();
  const [online, setOnline] = useState(navigator.onLine);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [syncResult, setSyncResult] = useState("");
  const headers = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    fetchConflicts();
    loadQueue();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const fetchConflicts = async () => {
    try {
      const res = await fetch(`${API}/sync/conflicts`, { headers });
      if (res.ok) setConflicts(await res.json());
    } catch {}
  };
  const loadQueue = () => {
    try {
      const q = localStorage.getItem("offlineQueue");
      setQueue(q ? JSON.parse(q) : []);
    } catch {}
  };
  const syncNow = async () => {
    if (queue.length === 0) {
      setSyncResult("Nothing to sync");
      setTimeout(() => setSyncResult(""), 2000);
      return;
    }
    const res = await fetch(`${API}/sync`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ operations: queue }),
    });
    if (res.ok) {
      const data = await res.json();
      setSyncResult(
        `Synced ${data.synced} operations, ${data.conflicts.length} conflicts`,
      );
      localStorage.removeItem("offlineQueue");
      setQueue([]);
      if (data.conflicts.length > 0) fetchConflicts();
    }
    setTimeout(() => setSyncResult(""), 4000);
  };
  const resolveConflict = async (
    id: string,
    resolution: "local" | "remote",
  ) => {
    await fetch(`${API}/sync/resolve/${id}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ resolution }),
    });
    fetchConflicts();
  };
  const addToQueue = () => {
    const operation = {
      id: `op-${Date.now()}`,
      type: "billing",
      data: { unitId: "unit-1", action: "start" },
      timestamp: new Date().toISOString(),
    };
    const q = JSON.parse(localStorage.getItem("offlineQueue") || "[]");
    q.push(operation);
    localStorage.setItem("offlineQueue", JSON.stringify(q));
    loadQueue();
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        {" "}
        {online ? (
          <Cloud className="w-6 h-6 text-foreground" />
        ) : (
          <CloudOff className="w-6 h-6 text-red-400" />
        )}{" "}
        Cloud Sync{" "}
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {" "}
        {/* Status */}{" "}
        <Card>
          {" "}
          <CardContent className="p-4 flex items-center gap-3">
            {" "}
            <div
              className={`p-3 rounded-full ${online ? "bg-green-500/20" : "bg-red-500/20"}`}
            >
              {" "}
              {online ? (
                <Wifi className="w-6 h-6 text-green-400" />
              ) : (
                <Wifi className="w-6 h-6 text-red-400" />
              )}{" "}
            </div>{" "}
            <div>
              {" "}
              <div className="font-medium">
                {online ? "Online" : "Offline"}
              </div>{" "}
              <div className="text-xs text-muted-foreground">
                {online ? "Connected to server" : "Working offline"}
              </div>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        {/* Queue */}{" "}
        <Card>
          {" "}
          <CardContent className="p-4">
            {" "}
            <div className="font-medium">Pending Queue</div>{" "}
            <div className="text-2xl font-bold text-foreground">
              {queue.length}
            </div>{" "}
            <div className="text-xs text-muted-foreground">
              Operations waiting to sync
            </div>{" "}
            <div className="flex gap-1 mt-2">
              {" "}
              <Button size="sm" onClick={addToQueue}>
                Simulate Offline Op
              </Button>{" "}
              <Button
                size="sm"
                variant="outline"
                onClick={syncNow}
                disabled={!online}
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Sync Now
              </Button>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        {/* Last Sync */}{" "}
        <Card>
          {" "}
          <CardContent className="p-4">
            {" "}
            <div className="font-medium">Sync Status</div>{" "}
            <div className="text-sm mt-1">{syncResult || "Idle"}</div>{" "}
            <div className="text-xs text-muted-foreground mt-1">
              Auto-sync when online
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
      {/* Conflicts */}{" "}
      {conflicts.length > 0 && (
        <Card>
          {" "}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" /> Conflicts (
              {conflicts.length})
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-2">
            {" "}
            {conflicts.map((c: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
              >
                {" "}
                <div className="text-sm">
                  <span className="text-yellow-400">Conflict:</span>{" "}
                  {c.operation?.type || "Unknown"}
                </div>{" "}
                <div className="flex gap-1">
                  {" "}
                  <Button
                    size="sm"
                    onClick={() => resolveConflict(c.operation?.id, "local")}
                  >
                    Keep Local
                  </Button>{" "}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(c.operation?.id, "remote")}
                  >
                    Keep Remote
                  </Button>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </CardContent>{" "}
        </Card>
      )}{" "}
    </div>
  );
}
