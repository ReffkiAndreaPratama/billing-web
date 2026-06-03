"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Monitor, Clock, Users, Gamepad2 } from "lucide-react";
const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-500 shadow-green-500/50",
  IN_USE: "bg-red-500 shadow-red-500/50",
  BOOKED: "bg-yellow-500 shadow-yellow-500/50",
  MAINTENANCE: "bg-zinc-500 shadow-zinc-500/50",
};
const statusLabels: Record<string, string> = {
  AVAILABLE: "Available",
  IN_USE: "In Use",
  BOOKED: "Booked",
  MAINTENANCE: "Maintenance",
};
export default function TVDisplayPage() {
  const { isAuthenticated } = useAuthStore();
  const [units, setUnits] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [clock, setClock] = useState(new Date());
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Welcome to Game Center!",
    "Try our new VIP Room packages!",
    "Join our tournament this weekend!",
  ];
  useEffect(() => {
    if (!isAuthenticated()) return;
    const load = async () => {
      try {
        const [u, s, b] = await Promise.all([
          api.units.list(),
          api.billing.active(),
          api.bookings.list("status=APPROVED"),
        ]);
        setUnits(Array.isArray(u) ? u : []);
        setSessions(Array.isArray(s) ? s : []);
        setBookings(Array.isArray(b) ? b : []);
      } catch {}
    };
    load();
    const t1 = setInterval(load, 10000);
    const t2 = setInterval(() => setClock(new Date()), 1000);
    const t3 = setInterval(
      () => setMessageIndex((i) => (i + 1) % messages.length),
      8000,
    );
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, []);
  const getSessionForUnit = (unitId: string) =>
    sessions.find((s: any) => s.unitId === unitId);
  return (
    <div className="h-screen bg-black text-foreground overflow-hidden flex flex-col">
      {" "}
      {/* Header */}{" "}
      <div className="flex items-center justify-between px-8 py-4 bg-muted border-b border-border">
        {" "}
        <div className="flex items-center gap-3">
          {" "}
          <Gamepad2 className="w-8 h-8 text-foreground" />{" "}
          <h1 className="text-2xl font-bold">GAME CENTER</h1>{" "}
        </div>{" "}
        <div className="flex items-center gap-6">
          {" "}
          <div className="flex items-center gap-2">
            {" "}
            <Monitor className="w-5 h-5 text-foreground" />{" "}
            <span className="text-lg">
              {units.filter((u) => u.status === "AVAILABLE").length}/
              {units.length}
            </span>{" "}
          </div>{" "}
          <div className="flex items-center gap-2">
            {" "}
            <Users className="w-5 h-5 text-green-400" />{" "}
            <span className="text-lg">{sessions.length}</span>{" "}
          </div>{" "}
          <div className="text-3xl font-mono font-bold text-foreground">
            {" "}
            {clock.toLocaleTimeString()}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Running text */}{" "}
      <div className="bg-primary/10 border-y border-[#4d96ff]/20 py-2 overflow-hidden">
        {" "}
        <div className="animate-marquee whitespace-nowrap text-foreground text-lg font-medium">
          {" "}
          {messages[messageIndex]} {" • ".repeat(20)}{" "}
          {messages[(messageIndex + 1) % messages.length]}{" "}
        </div>{" "}
      </div>{" "}
      {/* Main grid */}{" "}
      <div className="flex-1 overflow-y-auto p-6">
        {" "}
        <div className="grid grid-cols-6 xl:grid-cols-8 gap-3">
          {" "}
          {units.map((unit) => {
            const session = getSessionForUnit(unit.id);
            const remaining = session
              ? Math.max(
                  0,
                  Math.floor(
                    (new Date(session.startTime).getTime() +
                      session.duration * 60000 -
                      Date.now()) /
                      60000,
                  ),
                )
              : 0;
            return (
              <div
                key={unit.id}
                className={`rounded-xl p-4 border-2 transition-all ${unit.status === "AVAILABLE" ? "border-green-500/30 bg-green-500/5" : unit.status === "IN_USE" ? "border-red-500/30 bg-red-500/5" : unit.status === "BOOKED" ? "border-yellow-500/30 bg-yellow-500/5" : "border-border bg-[#eee8dd]"}`}
              >
                {" "}
                <div className="flex items-center gap-2 mb-2">
                  {" "}
                  <div
                    className={`w-3 h-3 rounded-full ${statusColors[unit.status] || "bg-zinc-500"} shadow-lg`}
                  />{" "}
                  <span className="font-bold text-lg">{unit.name}</span>{" "}
                </div>{" "}
                <Badge
                  variant={
                    unit.status === "AVAILABLE"
                      ? "success"
                      : unit.status === "IN_USE"
                        ? "danger"
                        : unit.status === "BOOKED"
                          ? "warning"
                          : "default"
                  }
                  className="text-xs"
                >
                  {statusLabels[unit.status]}
                </Badge>{" "}
                {session && (
                  <div
                    className={`mt-2 text-2xl font-mono font-bold ${remaining < 10 ? "text-red-400" : remaining < 30 ? "text-yellow-400" : "text-foreground"}`}
                  >
                    {" "}
                    {remaining}m{" "}
                  </div>
                )}{" "}
                <div className="mt-1 text-xs text-muted-foreground">
                  {unit.type}
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
      </div>{" "}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>{" "}
    </div>
  );
}
