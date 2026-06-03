"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Gamepad2,
  Monitor,
  Clock,
  CalendarDays,
  Users,
  Search,
} from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function BookingOnlinePage() {
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    startHour: "10",
    duration: "2",
  });
  const [message, setMessage] = useState("");
  useEffect(() => {
    loadUnits();
  }, []);
  const loadUnits = async () => {
    try {
      const res = await fetch(`${API_URL}/units`);
      const data = await res.json();
      setUnits(
        Array.isArray(data)
          ? data.filter((u: any) => u.isActive !== false)
          : [],
      );
    } catch {}
  };
  const book = async () => {
    if (!selectedUnit || !form.name || !form.phone) {
      setMessage("Please fill all fields");
      return;
    }
    const startTime = new Date(`${form.date}T${form.startHour}:00:00`);
    const endTime = new Date(
      startTime.getTime() + Number(form.duration) * 3600000,
    );
    try {
      // Public booking endpoint (no auth)
      const res = await fetch(`${API_URL}/bookings/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnit.id,
          customerName: form.name,
          customerPhone: form.phone,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).message || "Booking failed");
      setMessage("✅ Booking submitted! We will confirm shortly.");
      setSelectedUnit(null);
      setForm({
        name: "",
        phone: "",
        date: "",
        startHour: "10",
        duration: "2",
      });
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {" "}
      {/* Header */}{" "}
      <header className="border-b border-border px-6 py-4">
        {" "}
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <Gamepad2 className="w-8 h-8 text-foreground" />{" "}
            <h1 className="text-2xl font-bold">Game Center</h1>{" "}
          </div>{" "}
          <div className="text-sm text-muted-foreground">
            Online Booking
          </div>{" "}
        </div>{" "}
      </header>{" "}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {" "}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm ${message.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
          >
            {message}
          </div>
        )}{" "}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {" "}
          {/* Unit Selection */}{" "}
          <Card className="lg:col-span-2">
            {" "}
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Monitor className="w-4 h-4 text-foreground" /> Select Your Unit
              </CardTitle>
            </CardHeader>{" "}
            <CardContent>
              {" "}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {" "}
                {units.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnit(u)}
                    className={`p-4 rounded-xl border text-center transition-all ${selectedUnit?.id === u.id ? "border-cyan-500 bg-primary/10 shadow-lg shadow-cyan-500/10" : u.status !== "AVAILABLE" ? "border-border opacity-50 cursor-not-allowed" : "border-border hover:border-zinc-600"}`}
                    disabled={u.status !== "AVAILABLE"}
                  >
                    {" "}
                    <div className="text-lg font-bold">{u.name}</div>{" "}
                    <div className="text-xs text-muted-foreground mt-1">
                      {u.type}
                    </div>{" "}
                    <Badge
                      variant={u.status === "AVAILABLE" ? "success" : "default"}
                      className="mt-2 text-[10px]"
                    >
                      {u.status}
                    </Badge>{" "}
                    <div className="text-xs text-foreground mt-1">
                      {formatCurrency(u.hourlyRate)}/jam
                    </div>{" "}
                  </button>
                ))}{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>{" "}
          {/* Booking Form */}{" "}
          <Card>
            {" "}
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-foreground" /> Book Now
              </CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-4">
              {" "}
              <div className="p-3 rounded-lg bg-muted text-center">
                {" "}
                <div className="text-xs text-muted-foreground">
                  Selected Unit
                </div>{" "}
                <div className="text-lg font-bold mt-1">
                  {selectedUnit ? selectedUnit.name : "-"}
                </div>{" "}
                {selectedUnit && (
                  <div className="text-xs text-foreground">
                    {formatCurrency(selectedUnit.hourlyRate)}/jam
                  </div>
                )}{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="text-xs text-muted-foreground mb-1 block">
                  Your Name
                </label>{" "}
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="text-xs text-muted-foreground mb-1 block">
                  Phone Number
                </label>{" "}
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08123456789"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label className="text-xs text-muted-foreground mb-1 block">
                  Date
                </label>{" "}
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div>
                  {" "}
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Start
                  </label>{" "}
                  <select
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={form.startHour}
                    onChange={(e) =>
                      setForm({ ...form, startHour: e.target.value })
                    }
                  >
                    {" "}
                    {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    ))}{" "}
                  </select>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Duration
                  </label>{" "}
                  <select
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                  >
                    {" "}
                    <option value="1">1 hour</option>{" "}
                    <option value="2">2 hours</option>{" "}
                    <option value="3">3 hours</option>{" "}
                    <option value="4">4 hours</option>{" "}
                    <option value="6">6 hours</option>{" "}
                  </select>{" "}
                </div>{" "}
              </div>{" "}
              {selectedUnit && (
                <div className="p-3 rounded-lg bg-muted">
                  {" "}
                  <div className="text-xs text-muted-foreground">
                    Estimated Total
                  </div>{" "}
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(
                      selectedUnit.hourlyRate * Number(form.duration),
                    )}
                  </div>{" "}
                </div>
              )}{" "}
              <Button
                className="w-full"
                size="lg"
                onClick={book}
                disabled={!selectedUnit}
              >
                {" "}
                <CalendarDays className="w-4 h-4 mr-1" /> Submit Booking{" "}
              </Button>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </main>{" "}
      <footer className="border-t border-border px-6 py-4 text-center text-xs text-zinc-600">
        {" "}
        Game Center Billing System © 2026 · Bookings subject to
        confirmation{" "}
      </footer>{" "}
    </div>
  );
}
