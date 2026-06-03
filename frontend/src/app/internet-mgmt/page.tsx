"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Wifi, Ban, Sliders } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function InternetMgmtPage() {
  const { token } = useAuthStore();
  const h = { Authorization: `Bearer ${token}` };
  const [blocks, setBlocks] = useState<any[]>([]);
  const [limits, setLimits] = useState<any>({});
  const load = () => {
    fetch(`${API}/internet-mgmt/blocks`, { headers: h })
      .then((r) => r.json())
      .then(setBlocks);
    fetch(`${API}/internet-mgmt/pc-limits`, { headers: h })
      .then((r) => r.json())
      .then(setLimits);
  };
  useState(() => load());
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Wifi className="w-6 h-6 text-foreground" /> Internet Usage Management
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Ban className="w-4 h-4 inline mr-1" />
              Block / Slow List
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {blocks.map((b: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2"
              >
                {" "}
                <div>
                  <div className="text-sm">{b.url}</div>
                  <Badge className="text-[10px]">{b.type}</Badge>
                </div>{" "}
                <Button
                  size="sm"
                  variant={b.active ? "destructive" : "outline"}
                  onClick={async () => {
                    await fetch(`${API}/internet-mgmt/block/toggle`, {
                      method: "POST",
                      headers: { ...h, "Content-Type": "application/json" },
                      body: JSON.stringify({ url: b.url }),
                    });
                    load();
                  }}
                >
                  {b.active ? "Blocked" : "Allowed"}
                </Button>{" "}
              </div>
            ))}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Sliders className="w-4 h-4 inline mr-1" />
              PC Bandwidth Limits
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {Object.entries(limits).map(([unit, mbps]: [string, any]) => (
              <div
                key={unit}
                className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2"
              >
                {" "}
                <span className="text-sm">{unit}</span>{" "}
                <span className="text-foreground font-mono">
                  {mbps} Mbps
                </span>{" "}
              </div>
            ))}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
