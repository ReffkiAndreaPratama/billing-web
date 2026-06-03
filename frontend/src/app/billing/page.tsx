"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useBillingStore } from "@/stores/billingStore";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatDuration } from "@/lib/utils";
import type { BillingSession } from "@/types";
import {
  Clock,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Receipt,
} from "lucide-react";
export default function BillingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    sessions,
    setSessions,
    upsertSession,
    removeSession,
    setLoading,
    loading,
  } = useBillingStore();
  const [now, setNow] = useState(Date.now());
  const [paymentModal, setPaymentModal] = useState<{
    session: BillingSession;
    amount: number;
  } | null>(null);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadSessions();
    const token = localStorage.getItem("token") || undefined;
    const socket = connectSocket(token);
    socket.on("billing:started", (data: BillingSession) => upsertSession(data));
    socket.on("billing:ended", (data: { sessionId: string }) =>
      removeSession(data.sessionId),
    );
    socket.on("billing:paused", (data: BillingSession) => upsertSession(data));
    socket.on("billing:resumed", (data: BillingSession) => upsertSession(data));
    return () => {
      disconnectSocket();
    };
  }, []);
  // 1-second tick for realtime countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await api.billing.active(user?.branchId);
      setSessions(res);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  const endSession = async (id: string) => {
    try {
      const res = await api.billing.end(id);
      if (res?.paymentRequired) {
        const session = sessions.find((s) => s.id === id);
        if (session) setPaymentModal({ session, amount: res.amount });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };
  const pauseSession = async (id: string) => {
    try {
      await api.billing.pause(id);
    } catch (err: any) {
      alert(err.message);
    }
  };
  const resumeSession = async (id: string) => {
    try {
      await api.billing.resume(id);
    } catch (err: any) {
      alert(err.message);
    }
  };
  const calcRemaining = useCallback(
    (session: BillingSession) => {
      const elapsed = Math.floor(
        (now - new Date(session.startTime).getTime()) / 60000,
      );
      const pausedTotal = session.pauses
        .filter((p) => p.pauseEnd)
        .reduce((sum, p) => sum + (p.duration || 0), 0);
      const activePause = session.pauses.find((p) => !p.pauseEnd);
      const activePauseMinutes = activePause
        ? Math.floor((now - new Date(activePause.pauseStart).getTime()) / 60000)
        : 0;
      return session.duration - (elapsed - pausedTotal - activePauseMinutes);
    },
    [now],
  );
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
              Active Billing
            </h1>{" "}
            <Button variant="outline" onClick={loadSessions}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>{" "}
          </div>{" "}
          {sessions.length === 0 && (
            <Card>
              {" "}
              <CardContent className="p-12 text-center text-muted-foreground">
                {" "}
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />{" "}
                <p>No active billing sessions</p>{" "}
                <p className="text-sm mt-1">
                  Start a session from the POS page
                </p>{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {" "}
            {sessions.map((session) => {
              const remaining = calcRemaining(session);
              const isCritical = remaining < 10;
              const isWarning = remaining < 30 && !isCritical;
              return (
                <Card
                  key={session.id}
                  className={`border ${isCritical ? "border-red-500/30" : isWarning ? "border-yellow-500/30" : "border-[#4d96ff]/20"}`}
                >
                  {" "}
                  <CardHeader className="pb-3">
                    {" "}
                    <div className="flex justify-between items-start">
                      {" "}
                      <div>
                        {" "}
                        <CardTitle className="text-lg">
                          {session.unit?.name}
                        </CardTitle>{" "}
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.unit?.type}
                        </p>{" "}
                      </div>{" "}
                      <Badge
                        variant={
                          session.status === "ACTIVE"
                            ? "info"
                            : session.status === "PAUSED"
                              ? "warning"
                              : "success"
                        }
                      >
                        {session.status}
                      </Badge>{" "}
                    </div>{" "}
                  </CardHeader>{" "}
                  <CardContent>
                    {" "}
                    <div
                      className={`text-4xl font-mono font-bold text-center py-4 ${isCritical ? "text-red-400 timer-critical" : isWarning ? "text-yellow-400 timer-warning" : "text-foreground"}`}
                    >
                      {" "}
                      {Math.max(0, remaining)}m{" "}
                    </div>{" "}
                    <div className="space-y-2 text-sm">
                      {" "}
                      <div className="flex justify-between">
                        {" "}
                        <span className="text-muted-foreground">
                          Duration
                        </span>{" "}
                        <span className="text-foreground">
                          {formatDuration(session.duration)}
                        </span>{" "}
                      </div>{" "}
                      <div className="flex justify-between">
                        {" "}
                        <span className="text-muted-foreground">Cost</span>{" "}
                        <span className="text-foreground">
                          {formatCurrency(session.totalCost)}
                        </span>{" "}
                      </div>{" "}
                      <div className="flex justify-between">
                        {" "}
                        <span className="text-muted-foreground">
                          Member
                        </span>{" "}
                        <span className="text-foreground">
                          {session.member?.name || "Walk-in"}
                        </span>{" "}
                      </div>{" "}
                      <div className="flex justify-between">
                        {" "}
                        <span className="text-muted-foreground">
                          Start
                        </span>{" "}
                        <span className="text-muted-foreground text-xs">
                          {formatDate(session.startTime)}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex gap-2 mt-4">
                      {" "}
                      {session.status === "ACTIVE" && (
                        <>
                          {" "}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => pauseSession(session.id)}
                          >
                            {" "}
                            <Pause className="w-3 h-3 mr-1" /> Pause{" "}
                          </Button>{" "}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => endSession(session.id)}
                          >
                            {" "}
                            <StopCircle className="w-3 h-3 mr-1" /> End{" "}
                          </Button>{" "}
                        </>
                      )}{" "}
                      {session.status === "PAUSED" && (
                        <>
                          {" "}
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => resumeSession(session.id)}
                          >
                            {" "}
                            <Play className="w-3 h-3 mr-1" /> Resume{" "}
                          </Button>{" "}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => endSession(session.id)}
                          >
                            {" "}
                            <Receipt className="w-3 h-3 mr-1" /> Pay & End{" "}
                          </Button>{" "}
                        </>
                      )}{" "}
                    </div>{" "}
                  </CardContent>{" "}
                </Card>
              );
            })}{" "}
          </div>{" "}
        </div>{" "}
        {/* Payment Modal */}{" "}
        {paymentModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setPaymentModal(null)}
          >
            {" "}
            <Card
              className="w-96 border-[#4d96ff]/30"
              onClick={(e) => e.stopPropagation()}
            >
              {" "}
              <CardHeader>
                {" "}
                <CardTitle className="text-base">
                  Payment Required
                </CardTitle>{" "}
              </CardHeader>{" "}
              <CardContent className="space-y-4">
                {" "}
                <div className="text-center">
                  {" "}
                  <Receipt className="w-12 h-12 mx-auto text-foreground mb-2" />{" "}
                  <div className="text-3xl font-bold text-foreground">
                    {formatCurrency(paymentModal.amount)}
                  </div>{" "}
                  <p className="text-sm text-muted-foreground mt-1">
                    {paymentModal.session.unit?.name}
                  </p>{" "}
                </div>{" "}
                <div className="space-y-2">
                  {" "}
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Cash
                  </Button>{" "}
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    QRIS
                  </Button>{" "}
                  <Button className="w-full bg-[#d0c8b8] hover:bg-zinc-600">
                    Deduct from Wallet
                  </Button>{" "}
                </div>{" "}
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setPaymentModal(null)}
                >
                  Cancel
                </Button>{" "}
              </CardContent>{" "}
            </Card>{" "}
          </div>
        )}{" "}
      </main>{" "}
    </div>
  );
}
