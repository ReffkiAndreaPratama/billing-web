"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { CreditCard, QrCode, Zap } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function RfidPage() {
  const { token } = useAuthStore();
  const [cards, setCards] = useState<any[]>([]);
  const [tapResult, setTapResult] = useState<any>(null);
  const [uid, setUid] = useState("");
  const headers = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    fetch(`${API}/rfid/cards`, { headers })
      .then((r) => r.json())
      .then(setCards)
      .catch(() => {});
  }, []);
  const tap = async () => {
    const code = uid || "RFID-001";
    const res = await fetch(`${API}/rfid/tap`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ uid: code }),
    });
    if (res.ok) setTapResult(await res.json());
    else setTapResult({ error: "Card not found or inactive" });
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-foreground" /> RFID / NFC Login
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            {" "}
            <div className="p-6 rounded-full bg-primary/10 w-24 h-24 mx-auto flex items-center justify-center">
              <QrCode className="w-12 h-12 text-foreground" />
            </div>{" "}
            <div className="text-lg font-bold">Tap RFID Card</div>{" "}
            <Input
              placeholder="RFID-001"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
            />{" "}
            <Button className="w-full" onClick={tap}>
              <Zap className="w-4 h-4 mr-1" /> Simulate Tap
            </Button>{" "}
            {tapResult && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                {" "}
                {tapResult.error ? (
                  <div className="text-red-400">{tapResult.error}</div>
                ) : (
                  <>
                    <div className="text-green-400">
                      ✅ Member: {tapResult.memberName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Unit: {tapResult.unitId}
                    </div>
                  </>
                )}{" "}
              </div>
            )}{" "}
          </CardContent>
        </Card>{" "}
        <Card className="lg:col-span-2">
          {" "}
          <CardHeader>
            <CardTitle className="text-base">Registered Cards</CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {cards.map((c: any) => (
              <div
                key={c.uid}
                className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2"
              >
                {" "}
                <div>
                  <div className="font-mono text-sm">{c.uid}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.memberName}
                  </div>
                </div>{" "}
                <Badge
                  className={
                    c.status === "ACTIVE"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }
                >
                  {c.status}
                </Badge>{" "}
              </div>
            ))}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
