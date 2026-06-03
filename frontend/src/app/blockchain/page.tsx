"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function BlockchainPage() {
  const { token } = useAuthStore();
  const h = { Authorization: `Bearer ${token}` };
  const [wallet, setWallet] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const load = () => {
    fetch(`${API}/blockchain/wallet`, { headers: h })
      .then((r) => r.ok && r.json())
      .then(setWallet);
    fetch(`${API}/blockchain/transactions`, { headers: h })
      .then((r) => r.ok && r.json())
      .then(setTxs);
  };
  useState(() => load());
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Coins className="w-6 h-6 text-yellow-400" /> GAME Token Blockchain
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet</CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {wallet && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground truncate">
                  {wallet.address}
                </div>
                <div className="text-3xl font-bold text-yellow-400">
                  {wallet.balance}{" "}
                  <span className="text-sm text-muted-foreground">GAME</span>
                </div>{" "}
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600">
                    + Mint
                  </Button>
                  <Button size="sm" variant="outline">
                    Transfer
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>{" "}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Transactions</CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {txs.map((t: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2"
              >
                {" "}
                <div className="flex items-center gap-2">
                  {t.type === "MINT" ? (
                    <ArrowDownRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  )}{" "}
                  <div>
                    <div className="text-sm">{t.txHash.slice(0, 12)}...</div>
                    <div className="text-[10px] text-muted-foreground">
                      {t.type}
                    </div>
                  </div>
                </div>{" "}
                <span
                  className={
                    t.type === "MINT" ? "text-green-400" : "text-red-400"
                  }
                >
                  {t.type === "MINT" ? "+" : "-"}
                  {t.amount}
                </span>{" "}
              </div>
            ))}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
