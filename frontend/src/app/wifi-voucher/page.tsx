"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Wifi, Plus, Check, Copy } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function WifiVoucherPage() {
  const { token } = useAuthStore();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [form, setForm] = useState({ durationHours: 1, price: 5000, count: 5 });
  const [validateCode, setValidateCode] = useState("");
  const [validResult, setValidResult] = useState<any>(null);
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const generate = async () => {
    const res = await fetch(`${API}/wifi-voucher/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      setVouchers((prev) => [...d, ...prev]);
    }
  };
  const validate = async () => {
    const res = await fetch(`${API}/wifi-voucher/validate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code: validateCode }),
    });
    if (res.ok) setValidResult(await res.json());
    else setValidResult(null);
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Wifi className="w-6 h-6 text-foreground" /> WiFi Voucher
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <Plus className="w-4 h-4 inline mr-1" />
              Generate
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-3">
            {" "}
            <div>
              <label className="text-xs text-muted-foreground">
                Duration (hours)
              </label>
              <input
                type="number"
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                value={form.durationHours}
                onChange={(e) =>
                  setForm({ ...form, durationHours: Number(e.target.value) })
                }
              />
            </div>{" "}
            <div>
              <label className="text-xs text-muted-foreground">
                Price (Rp)
              </label>
              <input
                type="number"
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>{" "}
            <div>
              <label className="text-xs text-muted-foreground">Count</label>
              <input
                type="number"
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                value={form.count}
                onChange={(e) =>
                  setForm({ ...form, count: Number(e.target.value) })
                }
              />
            </div>{" "}
            <Button className="w-full" onClick={generate}>
              Generate {form.count} Vouchers
            </Button>{" "}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Validate Voucher</CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-3">
            {" "}
            <input
              className="w-full bg-muted border border-border rounded px-3 py-2 text-sm"
              placeholder="WIFI-XXXXXX"
              value={validateCode}
              onChange={(e) => setValidateCode(e.target.value)}
            />{" "}
            <Button className="w-full" onClick={validate} variant="outline">
              <Check className="w-4 h-4 mr-1" /> Validate
            </Button>{" "}
            {validResult && (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-400 text-sm">
                ✅ Valid! {validResult.durationHours}h
              </div>
            )}{" "}
            {validResult === null && validateCode && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
                ❌ Invalid or used
              </div>
            )}{" "}
          </CardContent>
        </Card>{" "}
        <Card className="lg:col-span-1 max-h-96 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-base">
              Vouchers ({vouchers.length})
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-1">
            {" "}
            {vouchers.map((v: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center p-2 rounded bg-muted text-xs"
              >
                {" "}
                <span className="font-mono text-foreground">{v.code}</span>{" "}
                <Badge
                  className={
                    v.used
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }
                >
                  {v.used ? "USED" : `${v.durationHours}h`}
                </Badge>{" "}
              </div>
            ))}{" "}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
