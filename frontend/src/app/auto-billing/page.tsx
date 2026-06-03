"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Zap, Power } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function AutoBillingPage() {
  const { token } = useAuthStore();
  const headers = { Authorization: `Bearer ${token}` };
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    const r = await fetch(`${API}/auto-billing/pending`, { headers });
    if (r.ok) setSessions(await r.json());
    setLoading(false);
  };
  useState(() => load());
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Zap className="w-6 h-6 text-yellow-400" /> Auto-Billing
      </h1>{" "}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex justify-between">
            <span>
              <Power className="w-4 h-4 inline mr-1" />
              Pending Auto Sessions
            </span>
            <Badge>{sessions.length}</Badge>
          </CardTitle>
        </CardHeader>{" "}
        <CardContent className="space-y-2">
          {sessions.map((s: any) => (
            <div
              key={s.id}
              className="flex justify-between items-center p-3 rounded-lg bg-muted"
            >
              {" "}
              <div>
                <div className="text-sm font-medium">Unit {s.unitId}</div>
                <div className="text-xs text-muted-foreground">
                  {s.memberId} · {s.status}
                </div>
              </div>{" "}
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await fetch(`${API}/auto-billing/start/${s.id}`, {
                    method: "POST",
                    headers,
                  });
                  load();
                }}
              >
                Start
              </Button>{" "}
            </div>
          ))}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
