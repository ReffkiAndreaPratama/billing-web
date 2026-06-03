"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
export default function ShiftsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [shifts, setShifts] = useState<any[]>([]);
  const [initialCash, setInitialCash] = useState("0");
  const [closeData, setCloseData] = useState<{
    id: string;
    actualCash: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadShifts();
  }, []);
  const loadShifts = async () => {
    try {
      const res = await api.shifts.list();
      setShifts(res.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  const openShift = async () => {
    try {
      await api.shifts.open({
        branchId: user?.branchId,
        initialCash: parseInt(initialCash) || 0,
      });
      loadShifts();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const closeShift = async () => {
    if (!closeData) return;
    try {
      await api.shifts.close(closeData.id, {
        actualCash: parseInt(closeData.actualCash) || 0,
      });
      setCloseData(null);
      loadShifts();
    } catch (err: any) {
      alert(err.message);
    }
  };
  return (
    <div className="flex h-screen bg-background">
      {" "}
      <Sidebar />{" "}
      <main className="flex-1 overflow-y-auto">
        {" "}
        <div className="p-6 space-y-6">
          {" "}
          <h1 className="text-2xl font-bold text-foreground">Shifts</h1>{" "}
          {closeData && (
            <Card className="border-[#4d96ff]/30">
              {" "}
              <CardContent className="p-4 space-y-3">
                {" "}
                <p className="text-sm text-foreground">Close Shift</p>{" "}
                <div className="flex gap-2">
                  {" "}
                  <Input
                    type="number"
                    value={closeData.actualCash}
                    onChange={(e) =>
                      setCloseData({ ...closeData, actualCash: e.target.value })
                    }
                    placeholder="Actual Cash"
                  />{" "}
                  <Button onClick={closeShift}>Confirm Close</Button>{" "}
                  <Button variant="outline" onClick={() => setCloseData(null)}>
                    Cancel
                  </Button>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
          <Card>
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="text-base">Shift History</CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="p-0">
              {" "}
              <Table>
                {" "}
                <TableHeader>
                  {" "}
                  <TableRow>
                    {" "}
                    <TableHead>Code</TableHead> <TableHead>Kasir</TableHead>{" "}
                    <TableHead>Start</TableHead> <TableHead>End</TableHead>{" "}
                    <TableHead>Initial</TableHead>{" "}
                    <TableHead>Expected</TableHead>{" "}
                    <TableHead>Actual</TableHead> <TableHead>Diff</TableHead>{" "}
                    <TableHead>Status</TableHead>{" "}
                    <TableHead>Action</TableHead>{" "}
                  </TableRow>{" "}
                </TableHeader>{" "}
                <TableBody>
                  {" "}
                  {shifts.map((s) => (
                    <TableRow key={s.id}>
                      {" "}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.code}
                      </TableCell>{" "}
                      <TableCell className="text-foreground">
                        {s.user?.name}
                      </TableCell>{" "}
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(s.startTime)}
                      </TableCell>{" "}
                      <TableCell className="text-xs text-muted-foreground">
                        {s.endTime ? formatDate(s.endTime) : "-"}
                      </TableCell>{" "}
                      <TableCell>{formatCurrency(s.initialCash)}</TableCell>{" "}
                      <TableCell>
                        {s.expectedCash ? formatCurrency(s.expectedCash) : "-"}
                      </TableCell>{" "}
                      <TableCell>
                        {s.actualCash ? formatCurrency(s.actualCash) : "-"}
                      </TableCell>{" "}
                      <TableCell
                        className={
                          s.difference && s.difference !== 0
                            ? "text-red-400"
                            : "text-green-400"
                        }
                      >
                        {" "}
                        {s.difference ? formatCurrency(s.difference) : "-"}{" "}
                      </TableCell>{" "}
                      <TableCell>
                        <Badge
                          variant={s.status === "OPEN" ? "success" : "default"}
                        >
                          {s.status}
                        </Badge>
                      </TableCell>{" "}
                      <TableCell>
                        {" "}
                        {s.status === "OPEN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCloseData({ id: s.id, actualCash: "0" })
                            }
                          >
                            {" "}
                            Close{" "}
                          </Button>
                        )}{" "}
                      </TableCell>{" "}
                    </TableRow>
                  ))}{" "}
                </TableBody>{" "}
              </Table>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
