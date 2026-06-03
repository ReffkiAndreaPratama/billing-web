"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { ListOrdered, Users, Clock } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function QueueOptimizerPage() {
  const { token } = useAuthStore();
  const h = { Authorization: `Bearer ${token}` };
  const [queue, setQueue] = useState<any[]>([]);
  const [optimal, setOptimal] = useState<any[]>([]);
  const load = () => {
    fetch(`${API}/queue-optimizer/queue`, { headers: h })
      .then((r) => r.json())
      .then(setQueue);
    fetch(`${API}/queue-optimizer/optimize`, { headers: h })
      .then((r) => r.json())
      .then(setOptimal);
  };
  useState(() => load());
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ListOrdered className="w-6 h-6 text-foreground" /> Queue Optimizer
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Users className="w-4 h-4 inline mr-1" />
              Waiting Queue
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {queue.map((q: any) => (
              <div
                key={q.id}
                className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2"
              >
                {" "}
                <div>
                  <div className="text-sm font-medium">{q.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {q.partySize}人
                  </div>
                </div>{" "}
                <Badge variant="outline">
                  {q.preferredUnitType || "Any"}
                </Badge>{" "}
              </div>
            ))}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Clock className="w-4 h-4 inline mr-1 text-green-400" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {optimal.map((o: any, i: number) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted mb-2"
              >
                {" "}
                <div className="text-green-400 font-mono">
                  {o.waitTimeMinutes}m
                </div>{" "}
                <div>
                  <div className="text-sm">
                    {o.customerName} → {o.suggestedUnit}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {o.reason}
                  </div>
                </div>{" "}
              </div>
            ))}
          </CardContent>
        </Card>{" "}
      </div>{" "}
      <div className="flex justify-center">
        <Button onClick={load} className="bg-cyan-600">
          Re-Optimize
        </Button>
      </div>{" "}
    </div>
  );
}
