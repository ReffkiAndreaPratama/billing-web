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
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Unit, Booking } from "@/types";
import { Calendar, Plus } from "lucide-react";
export default function BookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    unitId: "",
    customerName: "",
    customerPhone: "",
    startTime: "",
    duration: 60,
  });
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);
  const loadData = async () => {
    try {
      const [bRes, uRes] = await Promise.all([
        api.bookings.list(),
        api.units.list(user?.branchId),
      ]);
      setBookings(bRes.data || []);
      setUnits(uRes);
    } catch {}
  };
  const createBooking = async () => {
    try {
      await api.bookings.create(form);
      setShowAdd(false);
      setForm({
        unitId: "",
        customerName: "",
        customerPhone: "",
        startTime: "",
        duration: 60,
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const updateStatus = async (id: string, status: string) => {
    try {
      await api.bookings.updateStatus(id, status);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const statusBadge = (status: string) => {
    const map: Record<
      string,
      "info" | "success" | "warning" | "danger" | "default"
    > = {
      PENDING: "warning",
      CONFIRMED: "info",
      CHECKED_IN: "info",
      COMPLETED: "success",
      CANCELLED: "danger",
      NO_SHOW: "danger",
    };
    return <Badge variant={map[status] || "default"}>{status}</Badge>;
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
            <h1 className="text-2xl font-bold text-foreground">
              Bookings
            </h1>{" "}
            <Button onClick={() => setShowAdd(!showAdd)}>
              {" "}
              <Plus className="w-4 h-4 mr-1" /> New Booking{" "}
            </Button>{" "}
          </div>{" "}
          {showAdd && (
            <Card>
              {" "}
              <CardContent className="p-4 space-y-3">
                {" "}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {" "}
                  <Select
                    options={[
                      { value: "", label: "Select Unit" },
                      ...units
                        .filter((u) => u.isActive !== false)
                        .map((u) => ({
                          value: u.id,
                          label: `${u.name} (${u.type})`,
                        })),
                    ]}
                    value={form.unitId}
                    onChange={(e) =>
                      setForm({ ...form, unitId: e.target.value })
                    }
                  />{" "}
                  <Input
                    value={form.customerName}
                    onChange={(e) =>
                      setForm({ ...form, customerName: e.target.value })
                    }
                    placeholder="Customer Name"
                  />{" "}
                  <Input
                    value={form.customerPhone}
                    onChange={(e) =>
                      setForm({ ...form, customerPhone: e.target.value })
                    }
                    placeholder="Phone"
                  />{" "}
                  <Input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                  />{" "}
                </div>{" "}
                <Button onClick={createBooking}>Create Booking</Button>{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
          <Card>
            {" "}
            <CardContent className="p-0">
              {" "}
              <Table>
                {" "}
                <TableHeader>
                  {" "}
                  <TableRow>
                    {" "}
                    <TableHead>Code</TableHead> <TableHead>Unit</TableHead>{" "}
                    <TableHead>Customer</TableHead> <TableHead>Start</TableHead>{" "}
                    <TableHead>End</TableHead> <TableHead>Total</TableHead>{" "}
                    <TableHead>Status</TableHead>{" "}
                    <TableHead>Action</TableHead>{" "}
                  </TableRow>{" "}
                </TableHeader>{" "}
                <TableBody>
                  {" "}
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      {" "}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {b.code}
                      </TableCell>{" "}
                      <TableCell className="text-foreground">
                        {b.unit?.name}
                      </TableCell>{" "}
                      <TableCell>
                        {b.member?.name || b.customerName || "-"}
                      </TableCell>{" "}
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(b.startTime)}
                      </TableCell>{" "}
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(b.endTime)}
                      </TableCell>{" "}
                      <TableCell className="text-foreground">
                        {formatCurrency(b.totalCost)}
                      </TableCell>{" "}
                      <TableCell>{statusBadge(b.status)}</TableCell>{" "}
                      <TableCell>
                        {" "}
                        <div className="flex gap-1">
                          {" "}
                          {b.status === "PENDING" && (
                            <>
                              {" "}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatus(b.id, "CONFIRMED")}
                              >
                                Confirm
                              </Button>{" "}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400"
                                onClick={() => updateStatus(b.id, "CANCELLED")}
                              >
                                X
                              </Button>{" "}
                            </>
                          )}{" "}
                          {b.status === "CONFIRMED" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => updateStatus(b.id, "CHECKED_IN")}
                            >
                              Check In
                            </Button>
                          )}{" "}
                          {b.status === "CHECKED_IN" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(b.id, "COMPLETED")}
                            >
                              Complete
                            </Button>
                          )}{" "}
                        </div>{" "}
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
