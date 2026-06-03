"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Percent, RefreshCw } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function DynamicPromoPage() {
  const { token } = useAuthStore();
  const h = { Authorization: `Bearer ${token}` };
  const [promos, setPromos] = useState<any[]>([]);
  const load = () =>
    fetch(`${API}/dynamic-promo/active`, { headers: h })
      .then((r) => r.json())
      .then(setPromos);
  useState(() => load());
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Percent className="w-6 h-6 text-green-400" /> Dynamic Promotions
      </h1>{" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle className="text-base flex justify-between">
            <span>
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Auto-Discount Rules
            </span>
            <Badge>{promos.length} active</Badge>
          </CardTitle>
        </CardHeader>{" "}
        <CardContent>
          {promos.map((p: any, i: number) => (
            <div
              key={i}
              className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2"
            >
              {" "}
              <div>
                <div className="text-sm font-medium">{p.rule}</div>
                <div className="text-xs text-muted-foreground">
                  {p.discount}
                </div>
              </div>{" "}
              <Badge className={p.active ? "bg-green-600" : "bg-zinc-600"}>
                {p.active ? "Active" : "Inactive"}
              </Badge>{" "}
            </div>
          ))}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
