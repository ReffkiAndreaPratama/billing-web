"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { ListOrdered, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
export default function QueuePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [queue, setQueue] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [estimate, setEstimate] = useState<any>(null);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    if (user?.branchId) {
      loadQueue();
      api.queue
        .estimate(user.branchId)
        .then(setEstimate)
        .catch(() => {});
    }
  }, [user?.branchId]);
  const loadQueue = async () => {
    if (!user?.branchId) return;
    try {
      const res = await api.queue.get(user.branchId);
      setQueue(Array.isArray(res) ? res : []);
    } catch {}
  };
  const joinQueue = async () => {
    if (!customerName || !user?.branchId) return;
    try {
      await api.queue.join({
        customerName,
        customerPhone: customerPhone || undefined,
        branchId: user.branchId,
      });
      setShowAdd(false);
      setCustomerName("");
      setCustomerPhone("");
      loadQueue();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const serveCustomer = async (id: string) => {
    try {
      await api.queue.serve(id);
      loadQueue();
    } catch {}
  };
  const cancelQueue = async (id: string) => {
    try {
      await api.queue.cancel(id);
      loadQueue();
    } catch {}
  };
  return (
    <div className="flex h-screen bg-background">
      {" "}
      <Sidebar />{" "}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {" "}
        <div className="flex items-center justify-between">
          {" "}
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {" "}
            <ListOrdered className="w-6 h-6 text-foreground" /> Waiting
            Queue{" "}
          </h1>{" "}
          <div className="flex items-center gap-3">
            {" "}
            {estimate && (
              <div className="text-sm text-muted-foreground">
                Est. wait: ~{estimate.estimatedMinutes}m
              </div>
            )}{" "}
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Customer
            </Button>{" "}
          </div>{" "}
        </div>{" "}
        {showAdd && (
          <Card className="border-[#4d96ff]/30">
            {" "}
            <CardHeader>
              <CardTitle className="text-base">Add to Queue</CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-3">
              {" "}
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />{" "}
              <Input
                placeholder="Phone (optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />{" "}
              <div className="flex gap-2">
                {" "}
                <Button onClick={joinQueue}>Add to Queue</Button>{" "}
                <Button variant="ghost" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        )}{" "}
        {queue.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No customers in queue
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {" "}
            {queue.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border/50"
              >
                {" "}
                <div className="flex items-center gap-4">
                  {" "}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-foreground font-bold">
                    {" "}
                    {i + 1}{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <div className="text-foreground font-medium">
                      {q.customerName}
                    </div>{" "}
                    <div className="text-xs text-muted-foreground">
                      {" "}
                      {q.customerPhone || "No phone"} ·{" "}
                      {q.requestedUnitType || "Any unit"}{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex gap-2">
                  {" "}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-400"
                    onClick={() => serveCustomer(q.id)}
                  >
                    {" "}
                    <CheckCircle className="w-3 h-3 mr-1" /> Serve{" "}
                  </Button>{" "}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400"
                    onClick={() => cancelQueue(q.id)}
                  >
                    {" "}
                    <XCircle className="w-3 h-3 mr-1" />{" "}
                  </Button>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>
        )}{" "}
      </main>{" "}
    </div>
  );
}
