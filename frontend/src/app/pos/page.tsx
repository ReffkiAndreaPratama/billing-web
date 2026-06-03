"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getStatusBg } from "@/lib/utils";
import type { Unit, Member, Package } from "@/types";
import { Search, Monitor, User, Clock, Zap, DollarSign } from "lucide-react";
export default function POSPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [member, setMember] = useState<Member | null>(null);
  const [duration, setDuration] = useState(60);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadUnits();
    loadPackages();
  }, []);
  const loadPackages = async () => {
    try {
      const res = await api.packages.list();
      setPackages(res);
    } catch {}
  };
  const loadUnits = async () => {
    try {
      const res = await api.units.list(user?.branchId);
      setUnits(res);
    } catch (err) {
      console.error(err);
    }
  };
  const searchMember = async () => {
    if (!searchPhone) return;
    try {
      const res = await api.members.findByPhone(searchPhone);
      setMember(res);
    } catch {
      setMember(null);
      setMessage("Member not found");
    }
  };
  const quickDuration = (min: number) => {
    setDuration(min);
    setSelectedPkg("");
  };
  const startBilling = async () => {
    if (!selectedUnit) {
      setMessage("Select a unit first");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api.billing.start({
        unitId: selectedUnit.id,
        duration: selectedPkg ? 0 : duration,
        packageId: selectedPkg || undefined,
        memberId: member?.id,
        paymentMethod: "CASH",
      });
      setMessage(`✅ Billing started at ${selectedUnit.name}`);
      setSelectedUnit(null);
      loadUnits();
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const totalCost = selectedPkg
    ? packages.find((p) => p.id === selectedPkg)?.price || 0
    : selectedUnit
      ? selectedUnit.hourlyRate * (duration / 60)
      : 0;
  return (
    <div className="flex h-screen bg-background">
      {" "}
      <Sidebar />{" "}
      <main className="flex-1 overflow-y-auto">
        {" "}
        <div className="p-6 space-y-6">
          {" "}
          <h1 className="text-2xl font-bold text-foreground">
            POS / Kasir
          </h1>{" "}
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${message.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : message.startsWith("❌") ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}
            >
              {" "}
              {message}{" "}
            </div>
          )}{" "}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {" "}
            {/* Unit Selection */}{" "}
            <Card className="lg:col-span-2">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle className="text-base flex items-center gap-2">
                  {" "}
                  <Monitor className="w-4 h-4 text-foreground" /> Select
                  Unit{" "}
                </CardTitle>{" "}
              </CardHeader>{" "}
              <CardContent>
                {" "}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {" "}
                  {units
                    .filter((u) => u.isActive !== false)
                    .map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          selectedUnit?.id === unit.id
                            ? "border-cyan-500 bg-primary/10 shadow-lg shadow-cyan-500/10"
                            : getStatusBg(unit.status)
                        } ${unit.status !== "AVAILABLE" ? "opacity-50 cursor-not-allowed" : "hover:border-zinc-600"}`}
                        disabled={unit.status !== "AVAILABLE"}
                      >
                        {" "}
                        <div className="text-lg font-bold text-foreground">
                          {unit.name}
                        </div>{" "}
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {unit.type}
                        </div>{" "}
                        <Badge
                          variant={
                            unit.status === "AVAILABLE"
                              ? "success"
                              : unit.status === "IN_USE"
                                ? "warning"
                                : unit.status === "BOOKED"
                                  ? "info"
                                  : "danger"
                          }
                          className="mt-2 text-[10px]"
                        >
                          {" "}
                          {unit.status}{" "}
                        </Badge>{" "}
                        <div className="text-xs text-muted-foreground mt-1">
                          {" "}
                          {formatCurrency(unit.hourlyRate)}/jam{" "}
                        </div>{" "}
                      </button>
                    ))}{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>{" "}
            {/* Action Panel */}{" "}
            <Card>
              {" "}
              <CardHeader>
                {" "}
                <CardTitle className="text-base flex items-center gap-2">
                  {" "}
                  <Zap className="w-4 h-4 text-yellow-400" /> Start Billing{" "}
                </CardTitle>{" "}
              </CardHeader>{" "}
              <CardContent className="space-y-4">
                {" "}
                {/* Selected Unit */}{" "}
                <div className="p-3 rounded-lg bg-muted border border-border">
                  {" "}
                  <div className="text-xs text-muted-foreground">
                    Selected Unit
                  </div>{" "}
                  <div className="text-lg font-bold text-foreground mt-1">
                    {" "}
                    {selectedUnit ? selectedUnit.name : "-"}{" "}
                  </div>{" "}
                </div>{" "}
                {/* Member Search */}{" "}
                <div>
                  {" "}
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Search Member (phone)
                  </label>{" "}
                  <div className="flex gap-2">
                    {" "}
                    <Input
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      placeholder="Phone number"
                      onKeyDown={(e) => e.key === "Enter" && searchMember()}
                    />{" "}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={searchMember}
                    >
                      {" "}
                      <Search className="w-4 h-4" />{" "}
                    </Button>{" "}
                  </div>{" "}
                  {member && (
                    <div className="mt-2 p-2 rounded bg-primary/10 text-xs text-foreground">
                      {" "}
                      {member.name} ({member.code}) — Balance:{" "}
                      {formatCurrency(member.balance)}{" "}
                    </div>
                  )}{" "}
                </div>{" "}
                {/* Package Selection */}{" "}
                {packages.length > 0 && (
                  <div>
                    {" "}
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Package
                    </label>{" "}
                    <div className="grid grid-cols-1 gap-1">
                      {" "}
                      <button
                        onClick={() => setSelectedPkg("")}
                        className={`text-left px-2 py-1.5 rounded text-xs transition-all ${selectedPkg === "" ? "bg-primary/20 text-foreground border border-[#4d96ff]/30" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {" "}
                        Per-minute rate{" "}
                      </button>{" "}
                      {packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => {
                            setSelectedPkg(pkg.id);
                            setDuration(pkg.duration);
                          }}
                          className={`text-left px-2 py-1.5 rounded text-xs transition-all ${selectedPkg === pkg.id ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                        >
                          {" "}
                          <span className="font-medium">{pkg.name}</span>{" "}
                          <span className="float-right text-purple-400">
                            {formatCurrency(pkg.price)}
                          </span>{" "}
                          <br />{" "}
                          <span className="text-[10px] text-muted-foreground">
                            {pkg.duration}m •{" "}
                            {formatCurrency(
                              Math.round((pkg.price / pkg.duration) * 60),
                            )}
                            /jam
                          </span>{" "}
                        </button>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                {/* Quick Duration */}{" "}
                <div>
                  {" "}
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Quick Duration
                  </label>{" "}
                  <div className="grid grid-cols-3 gap-2">
                    {" "}
                    {[30, 60, 120, 180, 240, 360].map((min) => (
                      <Button
                        key={min}
                        variant={
                          duration === min && !selectedPkg
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => quickDuration(min)}
                      >
                        {" "}
                        {min >= 60 ? `${min / 60}j` : `${min}m`}{" "}
                      </Button>
                    ))}{" "}
                  </div>{" "}
                </div>{" "}
                {/* Custom Duration */}{" "}
                <div>
                  {" "}
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Custom (minutes)
                  </label>{" "}
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => {
                      setDuration(Number(e.target.value));
                      setSelectedPkg("");
                    }}
                    min={1}
                  />{" "}
                </div>{" "}
                {/* Total & Start */}{" "}
                <div className="p-3 rounded-lg bg-muted border border-border">
                  {" "}
                  <div className="text-xs text-muted-foreground">
                    Total
                  </div>{" "}
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {" "}
                    {formatCurrency(totalCost)}{" "}
                  </div>{" "}
                </div>{" "}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={startBilling}
                  disabled={loading || !selectedUnit}
                >
                  {" "}
                  {loading ? "Processing..." : "Start Billing"}{" "}
                </Button>{" "}
              </CardContent>{" "}
            </Card>{" "}
          </div>{" "}
          {/* Active Sessions Quick View */} <ActiveSessions />{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
function ActiveSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.billing.active();
        setSessions(res);
      } catch {}
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);
  if (!sessions.length) return null;
  return (
    <Card>
      {" "}
      <CardHeader>
        {" "}
        <CardTitle className="text-base flex items-center gap-2">
          {" "}
          <Clock className="w-4 h-4 text-foreground" /> Active Sessions (
          {sessions.length}){" "}
        </CardTitle>{" "}
      </CardHeader>{" "}
      <CardContent>
        {" "}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {" "}
          {sessions.map((s: any) => {
            const elapsed = Math.floor(
              (Date.now() - new Date(s.startTime).getTime()) / 60000,
            );
            const remaining = s.duration - elapsed;
            const pausedMinutes =
              s.pauses
                ?.filter((p: any) => !p.pauseEnd)
                .reduce((sum: number) => sum + 1, 0) || 0;
            return (
              <div
                key={s.id}
                className="p-3 rounded-lg border border-border bg-muted"
              >
                {" "}
                <div className="flex justify-between items-start">
                  {" "}
                  <span className="font-bold text-foreground">
                    {s.unit?.name}
                  </span>{" "}
                  <Badge
                    variant={s.status === "PAUSED" ? "warning" : "info"}
                    className="text-[10px]"
                  >
                    {" "}
                    {s.status}{" "}
                  </Badge>{" "}
                </div>{" "}
                <div
                  className={`text-lg font-mono mt-2 ${remaining < 10 ? "text-red-400 timer-critical" : remaining < 30 ? "text-yellow-400 timer-warning" : "text-foreground"}`}
                >
                  {" "}
                  {Math.max(0, remaining - pausedMinutes)}m{" "}
                </div>{" "}
                <div className="text-xs text-muted-foreground mt-1">
                  {s.member?.name || "Walk-in"}
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
      </CardContent>{" "}
    </Card>
  );
}
