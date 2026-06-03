"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { Gift, Plus, CheckCircle, Copy } from "lucide-react";
export default function VouchersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    minPurchase: 0,
    maxUses: 0,
    description: "",
  });
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadVouchers();
  }, []);
  const loadVouchers = async () => {
    try {
      const res = await api.vouchers.list(user?.branchId);
      setVouchers(Array.isArray(res) ? res : []);
    } catch {}
  };
  const createVoucher = async () => {
    try {
      await api.vouchers.generate({
        ...form,
        branchId: user?.branchId,
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
      setShowCreate(false);
      loadVouchers();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const copyCode = (code: string) => navigator.clipboard.writeText(code);
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
            <Gift className="w-6 h-6 text-purple-400" /> Vouchers & Promo{" "}
          </h1>{" "}
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Voucher
          </Button>{" "}
        </div>{" "}
        {showCreate && (
          <Card className="border-purple-500/30">
            {" "}
            <CardHeader>
              <CardTitle className="text-base">New Voucher</CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-3">
              {" "}
              <Input
                placeholder="Code (e.g. WELCOME50)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />{" "}
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />{" "}
              <div className="flex gap-2">
                {" "}
                <select
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({ ...form, discountType: e.target.value })
                  }
                >
                  {" "}
                  <option value="PERCENTAGE">Percentage</option>{" "}
                  <option value="NOMINAL">Fixed Amount</option>{" "}
                </select>{" "}
                <Input
                  type="number"
                  placeholder="Value"
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({ ...form, discountValue: Number(e.target.value) })
                  }
                />{" "}
              </div>{" "}
              <div className="flex gap-2">
                {" "}
                <Input
                  type="number"
                  placeholder="Min Purchase (0=no min)"
                  value={form.minPurchase}
                  onChange={(e) =>
                    setForm({ ...form, minPurchase: Number(e.target.value) })
                  }
                />{" "}
                <Input
                  type="number"
                  placeholder="Max Uses (0=unlimited)"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm({ ...form, maxUses: Number(e.target.value) })
                  }
                />{" "}
              </div>{" "}
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />{" "}
              <div className="flex gap-2">
                {" "}
                <Button onClick={createVoucher}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Create
                </Button>{" "}
                <Button variant="ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        )}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {" "}
          {vouchers.map((v) => (
            <Card
              key={v.id}
              className={`border ${v.isActive ? "border-purple-500/20" : "border-border"}`}
            >
              {" "}
              <CardContent className="p-4">
                {" "}
                <div className="flex items-center justify-between mb-2">
                  {" "}
                  <Badge variant={v.isActive ? "info" : "danger"}>
                    {v.isActive ? "Active" : "Inactive"}
                  </Badge>{" "}
                  <Badge>{v.type}</Badge>{" "}
                </div>{" "}
                <div className="text-lg font-bold text-foreground">
                  {v.name}
                </div>{" "}
                <div className="flex items-center gap-2 mt-1">
                  {" "}
                  <code className="text-sm bg-muted px-2 py-0.5 rounded text-foreground">
                    {v.code}
                  </code>{" "}
                  <button onClick={() => copyCode(v.code)}>
                    <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>{" "}
                </div>{" "}
                <div className="text-2xl font-bold mt-2 text-purple-400">
                  {" "}
                  {v.type === "PERCENTAGE"
                    ? `${v.value}%`
                    : formatCurrency(v.value)}{" "}
                </div>{" "}
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  {" "}
                  <p>
                    Min:{" "}
                    {v.minPurchase ? formatCurrency(v.minPurchase) : "None"}
                  </p>{" "}
                  <p>
                    Used: {v.usedCount}/{v.maxUsage || "∞"}
                  </p>{" "}
                  <p>
                    Valid: {formatDate(v.startDate)} - {formatDate(v.endDate)}
                  </p>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>
          ))}{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
