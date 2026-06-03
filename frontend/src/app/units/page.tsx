"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getStatusBg } from "@/lib/utils";
import type { Unit } from "@/types";
import { Monitor, Plus, Layout } from "lucide-react";
export default function UnitsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [units, setUnits] = useState<Unit[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("map");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadUnits();
  }, []);
  const loadUnits = async () => {
    try {
      const res = await api.units.list(user?.branchId);
      setUnits(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }; // Calculate grid dimensions
  const maxX = Math.max(...units.map((u) => u.positionX || 0), 4);
  const maxY = Math.max(...units.map((u) => u.positionY || 0), 4);
  return (
    <div className="flex h-screen bg-background">
      {" "}
      <Sidebar />{" "}
      <main className="flex-1 overflow-y-auto">
        {" "}
        <div className="p-6 space-y-6">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <h1 className="text-2xl font-bold text-foreground">Units</h1>{" "}
            <div className="flex gap-2">
              {" "}
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
              >
                {" "}
                <Layout className="w-4 h-4 mr-1" /> Map{" "}
              </Button>{" "}
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                {" "}
                <Monitor className="w-4 h-4 mr-1" /> List{" "}
              </Button>{" "}
            </div>{" "}
          </div>{" "}
          {viewMode === "map" ? (
            <Card>
              {" "}
              <CardContent className="p-6">
                {" "}
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(maxX + 1, 5)}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${Math.max(maxY + 1, 5)}, auto)`,
                  }}
                >
                  {" "}
                  {units
                    .filter((u) => u.isActive !== false)
                    .map((unit) => (
                      <div
                        key={unit.id}
                        className={`p-3 rounded-xl border text-center transition-all ${getStatusBg(unit.status)}`}
                        style={{
                          gridColumn: unit.positionX
                            ? `${unit.positionX + 1} / span ${unit.width || 1}`
                            : undefined,
                          gridRow: unit.positionY
                            ? `${unit.positionY + 1} / span ${unit.height || 1}`
                            : undefined,
                        }}
                      >
                        {" "}
                        <div
                          className={`text-lg font-bold ${unit.status === "AVAILABLE" ? "text-foreground" : "text-foreground"}`}
                        >
                          {" "}
                          {unit.name}{" "}
                        </div>{" "}
                        <div className="text-[10px] text-muted-foreground">
                          {unit.type}
                        </div>{" "}
                        <div
                          className={`text-xs mt-1 font-semibold ${unit.status === "AVAILABLE" ? "text-green-400" : unit.status === "IN_USE" ? "text-foreground" : unit.status === "BOOKED" ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {" "}
                          {unit.status}{" "}
                        </div>{" "}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {" "}
                          {formatCurrency(unit.hourlyRate)}/j{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>
          ) : (
            <Card>
              {" "}
              <CardContent className="p-6">
                {" "}
                <table className="w-full">
                  {" "}
                  <thead>
                    {" "}
                    <tr className="border-b border-border">
                      {" "}
                      <th className="text-left p-3 text-muted-foreground text-sm font-medium">
                        Name
                      </th>{" "}
                      <th className="text-left p-3 text-muted-foreground text-sm font-medium">
                        Type
                      </th>{" "}
                      <th className="text-left p-3 text-muted-foreground text-sm font-medium">
                        Status
                      </th>{" "}
                      <th className="text-left p-3 text-muted-foreground text-sm font-medium">
                        Rate
                      </th>{" "}
                    </tr>{" "}
                  </thead>{" "}
                  <tbody>
                    {" "}
                    {units.map((unit) => (
                      <tr
                        key={unit.id}
                        className="border-b border-border/50 hover:bg-[#eee8dd]"
                      >
                        {" "}
                        <td className="p-3 font-medium text-foreground">
                          {unit.name}
                        </td>{" "}
                        <td className="p-3 text-muted-foreground">
                          {unit.type}
                        </td>{" "}
                        <td className="p-3">
                          {" "}
                          <Badge
                            variant={
                              unit.status === "AVAILABLE"
                                ? "success"
                                : unit.status === "IN_USE"
                                  ? "info"
                                  : unit.status === "BOOKED"
                                    ? "warning"
                                    : "danger"
                            }
                          >
                            {unit.status}
                          </Badge>{" "}
                        </td>{" "}
                        <td className="p-3 text-muted-foreground">
                          {formatCurrency(unit.hourlyRate)}/jam
                        </td>{" "}
                      </tr>
                    ))}{" "}
                  </tbody>{" "}
                </table>{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
