"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Store, ShoppingCart, Search } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function MarketplacePage() {
  const { token, user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"store" | "history">("store");
  const headers = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    fetch(`${API}/marketplace/products`, { headers })
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
    fetch(`${API}/marketplace/categories`, { headers })
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
    fetch(`${API}/marketplace/purchases`, { headers })
      .then((r) => r.json())
      .then(setPurchases)
      .catch(() => {});
  }, []);
  const filtered = products.filter(
    (p) =>
      (selectedCat ? p.category === selectedCat : true) &&
      (search ? p.name.toLowerCase().includes(search.toLowerCase()) : true),
  );
  const buy = async (productId: string) => {
    const q = prompt("Quantity:", "1");
    if (!q || isNaN(Number(q)) || Number(q) < 1) return;
    const res = await fetch(`${API}/marketplace/buy`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: Number(q),
        buyerName: user?.username || "Unknown",
        buyerId: user?.id || "0",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMsg(`Purchased! Code: ${data.code || "N/A"}`);
      fetch(`${API}/marketplace/purchases`, { headers })
        .then((r) => r.json())
        .then(setPurchases);
    } else setMsg("Purchase failed");
    setTimeout(() => setMsg(""), 5000);
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Store className="w-6 h-6 text-foreground" /> Marketplace
      </h1>{" "}
      {msg && (
        <div className="p-3 rounded-xl bg-primary/10 text-foreground border border-[#4d96ff]/20 text-sm">
          {msg}
        </div>
      )}{" "}
      <div className="flex gap-2">
        {" "}
        <Button
          variant={tab === "store" ? "default" : "outline"}
          onClick={() => setTab("store")}
        >
          <Store className="w-4 h-4 mr-1" /> Store
        </Button>{" "}
        <Button
          variant={tab === "history" ? "default" : "outline"}
          onClick={() => setTab("history")}
        >
          <ShoppingCart className="w-4 h-4 mr-1" /> Purchase History
        </Button>{" "}
      </div>{" "}
      {tab === "store" && (
        <>
          {" "}
          <div className="flex gap-3 items-center">
            {" "}
            <div className="relative flex-1 max-w-md">
              {" "}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />{" "}
              <Input
                className="pl-9"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />{" "}
            </div>{" "}
            <button
              onClick={() => setSelectedCat("")}
              className={`px-3 py-1.5 rounded-full text-xs ${!selectedCat ? "bg-primary/20 text-foreground" : "bg-muted text-muted-foreground"}`}
            >
              All
            </button>{" "}
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs ${selectedCat === c ? "bg-primary/20 text-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {c}
              </button>
            ))}{" "}
          </div>{" "}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {" "}
            {filtered.map((p: any) => (
              <Card key={p.id} className="bg-muted border-border">
                {" "}
                <CardContent className="p-4 space-y-2">
                  {" "}
                  <Badge className="text-[10px]">{p.type}</Badge>{" "}
                  <div className="font-medium text-sm">{p.name}</div>{" "}
                  <div className="text-xs text-muted-foreground">
                    {p.description}
                  </div>{" "}
                  <div className="text-lg font-bold text-foreground">
                    Rp {p.price.toLocaleString()}
                  </div>{" "}
                  <div className="text-xs text-muted-foreground">
                    Stock: {p.stock}
                  </div>{" "}
                  <Button
                    className="w-full h-8 text-xs"
                    onClick={() => buy(p.id)}
                    disabled={p.stock < 1}
                  >
                    Buy Now
                  </Button>{" "}
                </CardContent>{" "}
              </Card>
            ))}{" "}
          </div>{" "}
        </>
      )}{" "}
      {tab === "history" && (
        <Card>
          {" "}
          <CardHeader>
            <CardTitle className="text-base">Purchase History</CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {" "}
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchases yet
              </div>
            ) : (
              <table className="w-full text-sm">
                {" "}
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Buyer</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-center py-2">Total</th>
                    <th className="text-center py-2">Code</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>{" "}
                <tbody>
                  {" "}
                  {purchases.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50">
                      {" "}
                      <td className="py-2">{p.productName}</td>{" "}
                      <td className="py-2 text-muted-foreground">
                        {p.buyerName}
                      </td>{" "}
                      <td className="py-2 text-center">{p.quantity}</td>{" "}
                      <td className="py-2 text-center text-foreground">
                        Rp {p.total.toLocaleString()}
                      </td>{" "}
                      <td className="py-2 text-center font-mono text-xs">
                        {p.code || "-"}
                      </td>{" "}
                      <td className="py-2 text-center">
                        <Badge
                          className={
                            p.status === "COMPLETED"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>{" "}
                    </tr>
                  ))}{" "}
                </tbody>{" "}
              </table>
            )}{" "}
          </CardContent>{" "}
        </Card>
      )}{" "}
    </div>
  );
}
