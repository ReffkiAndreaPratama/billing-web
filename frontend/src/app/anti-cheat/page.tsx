"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Shield, ShieldOff, Search, AlertTriangle } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function AntiCheatPage() {
  const { token } = useAuthStore();
  const [report, setReport] = useState<any>(null);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [unitId, setUnitId] = useState("unit-1");
  const h = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const scan = async () => {
    const res = await fetch(`${API}/anti-cheat/scan`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({ unitId }),
    });
    if (res.ok) setReport(await res.json());
    fetch(`${API}/anti-cheat/blacklist`, { headers: h })
      .then((r) => r.json())
      .then(setBlacklist)
      .catch(() => {});
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="w-6 h-6 text-red-400" /> Anti-Cheat Scanner
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
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
            <Button className="w-full" onClick={scan}>
              <Search className="w-4 h-4 mr-1" /> Scan Now
            </Button>{" "}
            {report && (
              <div
                className={`p-4 rounded-xl ${report.safe ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}
              >
                {" "}
                <div className="flex items-center gap-2">
                  {report.safe ? (
                    <Shield className="text-green-400" />
                  ) : (
                    <ShieldOff className="text-red-400" />
                  )}{" "}
                  <span
                    className={report.safe ? "text-green-400" : "text-red-400"}
                  >
                    {report.safe ? "CLEAN" : "THREATS DETECTED"}
                  </span>{" "}
                </div>{" "}
                {report.results?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 mt-2 text-sm">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-red-400">{r.processName}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.reason}
                    </span>
                  </div>
                ))}{" "}
              </div>
            )}{" "}
          </CardContent>
        </Card>{" "}
        <Card className="lg:col-span-2">
          {" "}
          <CardHeader>
            <CardTitle className="text-base">
              Blacklist ({blacklist.length})
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            <div className="grid grid-cols-2 gap-1">
              {" "}
              {blacklist.map((p: string, i: number) => (
                <div
                  key={i}
                  className="p-2 rounded bg-muted text-xs font-mono text-red-400"
                >
                  {p}
                </div>
              ))}{" "}
            </div>
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
