"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils";
import type { DashboardData } from "@/types";
import {
  Monitor,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);
  const loadData = async () => {
    try {
      const res = await api.analytics.dashboard(user?.branchId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted border-[2px] border-border w-48" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-white border-[3px] border-border"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }
  const stats = [
    {
      label: "Active Sessions",
      value: data?.activeSessions || 0,
      icon: Clock,
      bg: "#ffd93d",
    },
    {
      label: "Today Revenue",
      value: formatCurrency(data?.todayRevenue || 0),
      icon: DollarSign,
      bg: "#6bcb77",
    },
    {
      label: "Units Used",
      value: `${data?.usedUnits || 0}/${data?.totalUnits || 0}`,
      icon: Monitor,
      bg: "#4d96ff",
    },
    {
      label: "Occupancy",
      value: `${data?.occupancyRate || 0}%`,
      icon: TrendingUp,
      bg: "#ff8c42",
    },
    {
      label: "Total Members",
      value: data?.totalMembers || 0,
      icon: Users,
      bg: "#c084fc",
    },
    {
      label: "Available",
      value: data?.availableUnits || 0,
      icon: Activity,
      bg: "#ff6b6b",
    },
  ];
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
              <p className="text-sm font-bold text-muted-foreground mt-1">
                Welcome back, {user?.name || "Admin"}
              </p>
            </div>
            <Badge variant="success">
              <Activity className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, i) => (
              <Card
                key={i}
                className="animate-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className="flex items-center justify-between p-4 border-b-[3px] border-border"
                  style={{ backgroundColor: stat.bg }}
                >
                  <stat.icon className="w-5 h-5 text-foreground" />
                </div>
                <CardContent className="p-4">
                  <p className="text-2xl font-black text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Recent Transactions Today
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentTransactions?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground/60 py-8 font-bold"
                      >
                        No transactions today
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.recentTransactions?.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs font-bold">
                        {t.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.type === "BILLING" ? "info" : "success"}
                        >
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-foreground">
                        {formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell className="font-bold text-muted-foreground">
                        {t.member?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
