"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
export default function ReportsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [report, setReport] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tab, setTab] = useState<"daily" | "forecast">("daily");
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    if (tab === "daily") loadReport();
  }, [date]);
  const loadReport = async () => {
    try {
      const res = await api.reports.daily(date, user?.branchId);
      setReport(res);
    } catch {}
  };
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
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>{" "}
            <div className="flex gap-2">
              {" "}
              <Button
                variant={tab === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setTab("daily")}
              >
                Daily
              </Button>{" "}
              <Button
                variant={tab === "forecast" ? "default" : "outline"}
                size="sm"
                onClick={() => setTab("forecast")}
              >
                Forecast
              </Button>{" "}
            </div>{" "}
          </div>{" "}
          {tab === "daily" && report && (
            <>
              {" "}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {" "}
                <Card>
                  {" "}
                  <CardContent className="p-4">
                    {" "}
                    <p className="text-xs text-muted-foreground">
                      Total Revenue
                    </p>{" "}
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(report.totalRevenue)}
                    </p>{" "}
                  </CardContent>{" "}
                </Card>{" "}
                <Card>
                  {" "}
                  <CardContent className="p-4">
                    {" "}
                    <p className="text-xs text-muted-foreground">
                      Transactions
                    </p>{" "}
                    <p className="text-2xl font-bold text-foreground">
                      {report.totalTransactions}
                    </p>{" "}
                  </CardContent>{" "}
                </Card>{" "}
                <Card>
                  {" "}
                  <CardContent className="p-4">
                    {" "}
                    <p className="text-xs text-muted-foreground">
                      Completed Sessions
                    </p>{" "}
                    <p className="text-2xl font-bold text-foreground">
                      {report.completedSessions}
                    </p>{" "}
                  </CardContent>{" "}
                </Card>{" "}
                <Card>
                  {" "}
                  <CardContent className="p-4">
                    {" "}
                    <p className="text-xs text-muted-foreground">
                      Payment Methods
                    </p>{" "}
                    <div className="space-y-1 mt-2">
                      {" "}
                      {report.paymentMethods?.map((pm: any) => (
                        <div
                          key={pm.method}
                          className="flex justify-between text-xs"
                        >
                          {" "}
                          <span className="text-muted-foreground">
                            {pm.method}
                          </span>{" "}
                          <span className="text-foreground">
                            {formatCurrency(pm.total)}
                          </span>{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </CardContent>{" "}
                </Card>{" "}
              </div>{" "}
              <Card>
                {" "}
                <CardHeader>
                  {" "}
                  <CardTitle className="text-base">Transactions</CardTitle>{" "}
                </CardHeader>{" "}
                <CardContent className="p-0">
                  {" "}
                  <Table>
                    {" "}
                    <TableHeader>
                      {" "}
                      <TableRow>
                        {" "}
                        <TableHead>Invoice</TableHead>{" "}
                        <TableHead>Type</TableHead>{" "}
                        <TableHead>Amount</TableHead>{" "}
                        <TableHead>Method</TableHead>{" "}
                        <TableHead>Time</TableHead>{" "}
                      </TableRow>{" "}
                    </TableHeader>{" "}
                    <TableBody>
                      {" "}
                      {report.transactions?.map((t: any) => (
                        <TableRow key={t.id}>
                          {" "}
                          <TableCell className="font-mono text-xs">
                            {t.invoiceNumber}
                          </TableCell>{" "}
                          <TableCell>{t.type}</TableCell>{" "}
                          <TableCell className="text-foreground font-medium">
                            {formatCurrency(t.amount)}
                          </TableCell>{" "}
                          <TableCell className="text-muted-foreground">
                            {t.paymentMethod || "-"}
                          </TableCell>{" "}
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(t.createdAt)}
                          </TableCell>{" "}
                        </TableRow>
                      ))}{" "}
                    </TableBody>{" "}
                  </Table>{" "}
                </CardContent>{" "}
              </Card>{" "}
            </>
          )}{" "}
          {tab === "forecast" && (
            <div className="space-y-6">
              {" "}
              {/* Peak Hours Heatmap */}{" "}
              <Card>
                {" "}
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-4 h-4 text-foreground" /> Peak Hours
                    Analysis
                  </CardTitle>
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  <div className="grid grid-cols-8 gap-2">
                    {" "}
                    {[
                      { hour: 8, occ: 20, label: "08" },
                      { hour: 10, occ: 40, label: "10" },
                      { hour: 12, occ: 55, label: "12" },
                      { hour: 14, occ: 60, label: "14" },
                      { hour: 16, occ: 80, label: "16" },
                      { hour: 18, occ: 90, label: "18" },
                      { hour: 20, occ: 95, label: "20" },
                      { hour: 22, occ: 70, label: "22" },
                    ].map((h) => (
                      <div key={h.hour} className="text-center">
                        {" "}
                        <div className="text-xs text-muted-foreground mb-1">
                          {h.label}:00
                        </div>{" "}
                        <div
                          className="relative mx-auto"
                          style={{ width: 28, height: 100 }}
                        >
                          {" "}
                          <div
                            className="absolute bottom-0 w-full rounded-t-sm transition-all"
                            style={{
                              height: `${h.occ}%`,
                              backgroundColor:
                                h.occ > 80
                                  ? "#ef4444"
                                  : h.occ > 50
                                    ? "#f59e0b"
                                    : "#22c55e",
                            }}
                          />{" "}
                        </div>{" "}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {h.occ}%
                        </div>{" "}
                      </div>
                    ))}{" "}
                  </div>{" "}
                  <div className="mt-3 text-xs text-muted-foreground text-center">
                    Peak at 20:00 (95% occupancy) · Recommended: activate
                    premium pricing
                  </div>{" "}
                </CardContent>{" "}
              </Card>{" "}
              {/* Financial Forecast */}{" "}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {" "}
                <Card>
                  {" "}
                  <CardContent className="p-4">
                    {" "}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-muted-foreground">
                        Projected Monthly Revenue
                      </span>
                    </div>{" "}
                    <div className="text-2xl font-bold text-green-400 mt-1">
                      Rp 89.500.000
                    </div>{" "}
                    <div className="text-xs text-muted-foreground mt-1">
                      ↑ 12.5% from last month
                    </div>{" "}
                  </CardContent>{" "}
                </Card>{" "}
                <Card>
                  {" "}
                  <CardContent className="p-4">
                    {" "}
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">
                        Break-Even Point
                      </span>
                    </div>{" "}
                    <div className="text-2xl font-bold text-yellow-400 mt-1">
                      Rp 42.000.000
                    </div>{" "}
                    <div className="text-xs text-muted-foreground mt-1">
                      BEP at 47% occupancy
                    </div>{" "}
                  </CardContent>{" "}
                </Card>{" "}
                <Card>
                  {" "}
                  <CardContent className="p-4">
                    {" "}
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-foreground" />
                      <span className="text-xs text-muted-foreground">
                        ROI Projection
                      </span>
                    </div>{" "}
                    <div className="text-2xl font-bold text-foreground mt-1">
                      213%
                    </div>{" "}
                    <div className="text-xs text-muted-foreground mt-1">
                      Annual return on investment
                    </div>{" "}
                  </CardContent>{" "}
                </Card>{" "}
              </div>{" "}
              <Card>
                {" "}
                <CardHeader>
                  <CardTitle className="text-base">
                    Revenue Forecast (Next 30 Days)
                  </CardTitle>
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  <div className="grid grid-cols-7 gap-1">
                    {" "}
                    {Array.from({ length: 30 }, (_, i) => {
                      const day = new Date(Date.now() + i * 86400000);
                      const isWeekend =
                        day.getDay() === 6 || day.getDay() === 0;
                      const base = isWeekend ? 3500000 : 2500000;
                      const variance = Math.random() * 500000;
                      const revenue = Math.round(base + variance);
                      return (
                        <div key={i} className="text-center">
                          {" "}
                          <div className="text-[9px] text-zinc-600">
                            {day.getDate()}/{day.getMonth() + 1}
                          </div>{" "}
                          <div className="text-[9px] text-foreground">
                            Rp{(revenue / 1000000).toFixed(1)}jt
                          </div>{" "}
                          <div
                            className="mx-auto mt-1 rounded-sm"
                            style={{
                              width: "100%",
                              height: Math.max(4, revenue / 100000),
                              backgroundColor: isWeekend
                                ? "#06b6d4"
                                : "#22c55e",
                              opacity: 0.6,
                            }}
                          />{" "}
                        </div>
                      );
                    })}{" "}
                  </div>{" "}
                </CardContent>{" "}
              </Card>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
