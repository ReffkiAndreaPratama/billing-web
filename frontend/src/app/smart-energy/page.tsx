"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Zap, Moon, Sun, PiggyBank } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function SmartEnergyPage() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const [stats, setStats] = useState<any[]>([]);
  const [total, setTotal] = useState<any>({});
  const [savings, setSavings] = useState<any>({});
  const load = () => {
    fetch(`${API}/smart-energy/stats`, { headers })
      .then((r) => r.json())
      .then(setStats);
    fetch(`${API}/smart-energy/total`, { headers })
      .then((r) => r.json())
      .then(setTotal);
    fetch(`${API}/smart-energy/savings`, { headers })
      .then((r) => r.json())
      .then(setSavings);
  };
  useState(() => load());
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Zap className="w-6 h-6 text-yellow-400" /> Smart Energy Management
      </h1>{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Power</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-yellow-400">
            {total.totalWatts}W
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Cost</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-400">
            Rp{total.totalCost?.toLocaleString()}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <PiggyBank className="w-4 h-4 inline mr-1 text-green-400" />
              Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-green-400">
            Rp{savings.monthlySavings?.toLocaleString()}
          </CardContent>
        </Card>{" "}
      </div>{" "}
      <Card>
        <CardContent className="pt-4 space-y-2">
          {stats.map((s: any) => (
            <div
              key={s.unitId}
              className="flex justify-between items-center p-3 rounded-lg bg-muted"
            >
              {" "}
              <div className="flex items-center gap-2">
                {s.status === "SLEEP" ? (
                  <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-400" />
                )}{" "}
                <div>
                  <div className="text-sm font-medium">{s.unitId}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.powerWatts}W · idle {s.idleMinutes}m
                  </div>
                </div>
              </div>{" "}
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    s.status === "ACTIVE"
                      ? "bg-green-600"
                      : s.status === "IDLE"
                        ? "bg-yellow-600"
                        : "bg-blue-600"
                  }
                >
                  {s.status}
                </Badge>{" "}
                {s.status !== "SLEEP" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await fetch(`${API}/smart-energy/sleep/${s.unitId}`, {
                        method: "POST",
                        headers,
                      });
                      load();
                    }}
                  >
                    Sleep
                  </Button>
                )}{" "}
                {s.status === "SLEEP" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await fetch(`${API}/smart-energy/wake/${s.unitId}`, {
                        method: "POST",
                        headers,
                      });
                      load();
                    }}
                  >
                    Wake
                  </Button>
                )}
              </div>{" "}
            </div>
          ))}
        </CardContent>
      </Card>{" "}
    </div>
  );
}
