"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Building2, Plus } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function WhiteLabelPage() {
  const { token } = useAuthStore();
  const h = { Authorization: `Bearer ${token}` };
  const [tenants, setTenants] = useState<any[]>([]);
  useState(() =>
    fetch(`${API}/white-label/tenants`, { headers: h })
      .then((r) => r.json())
      .then(setTenants),
  );
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Building2 className="w-6 h-6 text-foreground" /> White Label Management
      </h1>{" "}
      <div className="flex justify-end">
        <Button className="bg-cyan-600">
          <Plus className="w-4 h-4 mr-1" />
          New Tenant
        </Button>
      </div>{" "}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((t: any) => (
          <Card key={t.id} className="hover:border-cyan-700 transition-colors">
            <CardContent className="pt-4 space-y-2">
              {" "}
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{t.name}</h3>
                <Badge
                  className={
                    t.plan === "ENTERPRISE"
                      ? "bg-purple-600"
                      : t.plan === "PRO"
                        ? "bg-cyan-600"
                        : "bg-zinc-600"
                  }
                >
                  {t.plan}
                </Badge>
              </div>{" "}
              <div className="text-xs text-muted-foreground">{t.domain}</div>
              <Badge variant={t.active ? "default" : "outline"}>
                {t.active ? "Active" : "Inactive"}
              </Badge>{" "}
            </CardContent>
          </Card>
        ))}
      </div>{" "}
    </div>
  );
}
