"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Bitcoin, Wallet, RefreshCw, Copy } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function CryptoPage() {
  const { token } = useAuthStore();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [payments, setPayments] = useState<any[]>([]);
  const [form, setForm] = useState({ amount: 100000, currency: "USDT" });
  const [msg, setMsg] = useState("");
  const h = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    fetch(`${API}/crypto/rates`, { headers: h })
      .then((r) => r.json())
      .then(setRates)
      .catch(() => {});
    fetch(`${API}/crypto/payments`, { headers: h })
      .then((r) => r.json())
      .then(setPayments)
      .catch(() => {});
  }, []);
  const createPayment = async () => {
    const res = await fetch(`${API}/crypto/payment`, {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMsg("Payment created! Confirm in ~30s.");
      fetch(`${API}/crypto/payments`, { headers: h })
        .then((r) => r.json())
        .then(setPayments);
    } else setMsg("Failed");
    setTimeout(() => setMsg(""), 4000);
  };
  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setMsg("Address copied!");
    setTimeout(() => setMsg(""), 2000);
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bitcoin className="w-6 h-6 text-yellow-400" /> Crypto Payment
      </h1>{" "}
      {msg && (
        <div className="p-3 rounded-xl bg-primary/10 text-foreground border border-[#4d96ff]/20 text-sm">
          {msg}
        </div>
      )}{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        {/* Rates */}{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-yellow-400" /> Rates
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-3">
            {" "}
            {Object.entries(rates).map(([currency, rate]) => (
              <div
                key={currency}
                className="flex justify-between items-center p-2 rounded-lg bg-muted"
              >
                {" "}
                <span className="font-medium">{currency}</span>{" "}
                <span className="text-foreground font-mono">
                  Rp {rate.toLocaleString()}
                </span>{" "}
              </div>
            ))}{" "}
          </CardContent>{" "}
        </Card>{" "}
        {/* Create Payment */}{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle className="text-base">New Payment</CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-3">
            {" "}
            <div>
              <label className="text-xs text-muted-foreground">
                Amount (IDR)
              </label>{" "}
              <input
                type="number"
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
              />{" "}
            </div>{" "}
            <div>
              <label className="text-xs text-muted-foreground">Currency</label>{" "}
              <select
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {" "}
                <option value="BTC">BTC</option>{" "}
                <option value="USDT">USDT</option>{" "}
                <option value="ETH">ETH</option>{" "}
              </select>{" "}
            </div>{" "}
            {form.amount > 0 && rates[form.currency] && (
              <div className="p-3 rounded-lg bg-muted text-center">
                {" "}
                <div className="text-xs text-muted-foreground">
                  You pay
                </div>{" "}
                <div className="text-xl font-bold text-yellow-400">
                  {(form.amount / rates[form.currency]).toFixed(6)}{" "}
                  {form.currency}
                </div>{" "}
              </div>
            )}{" "}
            <Button className="w-full" onClick={createPayment}>
              <Bitcoin className="w-4 h-4 mr-1" /> Generate Payment
            </Button>{" "}
          </CardContent>{" "}
        </Card>{" "}
        {/* Payment History */}{" "}
        <Card className="max-h-96 overflow-y-auto">
          {" "}
          <CardHeader>
            <CardTitle className="text-base">Payments</CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-2">
            {" "}
            {payments.map((p: any) => (
              <div key={p.id} className="p-3 rounded-lg bg-muted text-sm">
                {" "}
                <div className="flex justify-between">
                  <span className="font-mono">
                    {p.currency} {p.amount}
                  </span>{" "}
                  <Badge
                    className={
                      p.status === "CONFIRMED"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }
                  >
                    {p.status}
                  </Badge>{" "}
                </div>{" "}
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {" "}
                  <span className="truncate">{p.address}</span>{" "}
                  <button onClick={() => copyAddress(p.address)}>
                    <Copy className="w-3 h-3 text-foreground" />
                  </button>{" "}
                </div>{" "}
                <div className="text-xs text-zinc-600 mt-1">
                  Exp: {new Date(p.expiresAt).toLocaleTimeString()}
                </div>{" "}
              </div>
            ))}{" "}
            {payments.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No payments
              </div>
            )}{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
