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
import { Package, Plus, Wrench } from "lucide-react";
export default function AssetsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [assets, setAssets] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "MONITOR",
    serialNumber: "",
    purchasePrice: 0,
    condition: "GOOD",
  });
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadAssets();
  }, []);
  const loadAssets = async () => {
    try {
      const res = await api.assets.list(user?.branchId);
      setAssets(Array.isArray(res) ? res : []);
    } catch {}
  };
  const createAsset = async () => {
    try {
      await api.assets.create({
        ...form,
        purchaseDate: new Date().toISOString(),
        branchId: user?.branchId,
      });
      setShowCreate(false);
      loadAssets();
    } catch (err: any) {
      alert(err.message);
    }
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
            <Package className="w-6 h-6 text-foreground" /> Asset
            Management{" "}
          </h1>{" "}
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Asset
          </Button>{" "}
        </div>{" "}
        {showCreate && (
          <Card className="border-[#4d96ff]/30">
            {" "}
            <CardHeader>
              <CardTitle className="text-base">New Asset</CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-3">
              {" "}
              <Input
                placeholder="Asset Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />{" "}
              <select
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {" "}
                <option value="MONITOR">Monitor</option>{" "}
                <option value="STICK">Stick PS</option>{" "}
                <option value="KEYBOARD">Keyboard</option>{" "}
                <option value="MOUSE">Mouse</option>{" "}
                <option value="HEADSET">Headset</option>{" "}
                <option value="GPU">GPU</option> <option value="PC">PC</option>{" "}
                <option value="OTHER">Other</option>{" "}
              </select>{" "}
              <Input
                placeholder="Serial Number"
                value={form.serialNumber}
                onChange={(e) =>
                  setForm({ ...form, serialNumber: e.target.value })
                }
              />{" "}
              <Input
                type="number"
                placeholder="Purchase Price"
                value={form.purchasePrice}
                onChange={(e) =>
                  setForm({ ...form, purchasePrice: Number(e.target.value) })
                }
              />{" "}
              <div className="flex gap-2">
                {" "}
                <Button onClick={createAsset}>Save</Button>{" "}
                <Button variant="ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>
        )}{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {" "}
          {assets.map((a) => (
            <Card key={a.id}>
              {" "}
              <CardContent className="p-4">
                {" "}
                <div className="flex items-center justify-between mb-2">
                  {" "}
                  <Badge>{a.type}</Badge>{" "}
                  <Badge
                    variant={
                      a.condition === "GOOD"
                        ? "success"
                        : a.condition === "FAIR"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {a.condition}
                  </Badge>{" "}
                </div>{" "}
                <div className="font-bold text-foreground">{a.name}</div>{" "}
                <div className="text-xs text-muted-foreground mt-1">
                  {a.serialNumber || "No S/N"}
                </div>{" "}
                {a.purchasePrice && (
                  <div className="text-sm text-foreground mt-1">
                    {formatCurrency(a.purchasePrice)}
                  </div>
                )}{" "}
                {a.unit && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Unit: {a.unit.name}
                  </div>
                )}{" "}
                {a.purchaseDate && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Purchased: {formatDate(a.purchaseDate)}
                  </div>
                )}{" "}
              </CardContent>{" "}
            </Card>
          ))}{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
