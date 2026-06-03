"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { MapPin, Globe } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function GeoPage() {
  const { token } = useAuthStore();
  const [cities, setCities] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const h = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    fetch(`${API}/geo/cities`, { headers: h })
      .then((r) => r.json())
      .then(setCities)
      .catch(() => {});
    fetch(`${API}/geo/regions`, { headers: h })
      .then((r) => r.json())
      .then(setRegions)
      .catch(() => {});
  }, []);
  const maxCount = Math.max(...cities.map((c) => c.count), 1);
  const colors = [
    "bg-cyan-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-zinc-500",
  ];
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Globe className="w-6 h-6 text-foreground" /> Geo Analytics
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <Card className="lg:col-span-2">
          {" "}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-foreground" /> Visitor by City
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-3">
            {" "}
            {cities.map((c: any, i: number) => (
              <div key={c.city}>
                {" "}
                <div className="flex justify-between text-sm mb-1">
                  <span>{c.city}</span>
                  <span className="text-foreground">
                    {c.count.toLocaleString()} ({c.percentage}%)
                  </span>
                </div>{" "}
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors[i % colors.length]} transition-all`}
                    style={{ width: `${(c.count / maxCount) * 100}%` }}
                  />
                </div>{" "}
              </div>
            ))}{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Region</CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-3">
            {" "}
            {regions.map((r: any) => (
              <div key={r.region} className="p-3 rounded-lg bg-muted">
                {" "}
                <div className="text-sm font-medium">{r.region}</div>{" "}
                <div className="text-2xl font-bold text-foreground">
                  {r.total.toLocaleString()}
                </div>{" "}
                <div className="text-xs text-muted-foreground">
                  visitors
                </div>{" "}
              </div>
            ))}{" "}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
