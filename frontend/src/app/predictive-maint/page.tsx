"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { AlertTriangle, HardDrive, Thermometer } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function PredictiveMaintPage() {
  const { token } = useAuthStore();
  const h = { Authorization: `Bearer ${token}` };
  const [preds, setPreds] = useState<any[]>([]);
  useState(() =>
    fetch(`${API}/predictive-maint/predictions`, { headers: h })
      .then((r) => r.json())
      .then(setPreds),
  );
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-orange-400" /> Predictive
        Maintenance
      </h1>{" "}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <HardDrive className="w-4 h-4 inline mr-1" />
              High Risk
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="text-3xl font-bold text-red-400">
            {preds.filter((p) => p.risk === "HIGH").length}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medium Risk</CardTitle>
          </CardHeader>{" "}
          <CardContent className="text-3xl font-bold text-yellow-400">
            {preds.filter((p) => p.risk === "MEDIUM").length}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Thermometer className="w-4 h-4 inline mr-1" />
              Low Risk
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="text-3xl font-bold text-green-400">
            {preds.filter((p) => p.risk === "LOW").length}
          </CardContent>
        </Card>{" "}
      </div>{" "}
      <Card>
        <CardContent className="pt-4 space-y-2">
          {preds.map((p: any, i: number) => (
            <div
              key={i}
              className="flex justify-between items-center p-3 rounded-lg bg-muted"
            >
              {" "}
              <div>
                <div className="font-medium text-sm">{p.unitName}</div>
                <div className="text-xs text-muted-foreground">
                  {p.issue} · {p.daysLeft}d
                </div>
              </div>{" "}
              <div className="text-right">
                <Badge
                  className={
                    p.risk === "HIGH"
                      ? "bg-red-600"
                      : p.risk === "MEDIUM"
                        ? "bg-yellow-600"
                        : "bg-green-600"
                  }
                >
                  {p.risk}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {(p.probability * 100).toFixed(0)}%
                </div>
              </div>{" "}
            </div>
          ))}
        </CardContent>
      </Card>{" "}
    </div>
  );
}
