"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Coffee, Plus, Utensils } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function CafePage() {
  const { token } = useAuthStore();
  const [menu, setMenu] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [unitId, setUnitId] = useState("unit-1");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API}/cafe/menu`, { headers })
      .then((r) => r.json())
      .then(setMenu)
      .catch(() => {});
    fetch(`${API}/cafe/categories`, { headers })
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
    fetch(`${API}/cafe/orders`, { headers })
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, []);
  const filteredMenu = selectedCat
    ? menu.filter((m) => m.category === selectedCat)
    : menu;
  const addToCart = (id: string) =>
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: string) =>
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] <= 1) delete next[id];
      else next[id]--;
      return next;
    });
  const submitOrder = async () => {
    const items = Object.entries(cart).map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity,
    }));
    if (!items.length) return;
    const res = await fetch(`${API}/cafe/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ unitId, items }),
    });
    if (res.ok) {
      setMsg("Order placed!");
      setCart({});
      fetch(`${API}/cafe/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then(setOrders);
    }
    setTimeout(() => setMsg(""), 3000);
  };
  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`${API}/cafe/order/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetch(`${API}/cafe/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setOrders);
  };
  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    CONFIRMED: "bg-blue-500/20 text-blue-400",
    PREPARING: "bg-purple-500/20 text-purple-400",
    DELIVERED: "bg-green-500/20 text-green-400",
    CANCELLED: "bg-red-500/20 text-red-400",
  };
  const totalCart = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return sum + (item?.price || 0) * qty;
  }, 0);
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Coffee className="w-6 h-6 text-foreground" /> Cafe Order
      </h1>{" "}
      {msg && (
        <div className="p-3 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-sm">
          {msg}
        </div>
      )}{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        {/* Menu */}{" "}
        <Card className="lg:col-span-2">
          {" "}
          <CardHeader>
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <CardTitle className="text-base">
                <Utensils className="w-4 h-4 inline mr-2" />
                Menu
              </CardTitle>{" "}
              <div className="flex gap-1 flex-wrap">
                {" "}
                <button
                  onClick={() => setSelectedCat("")}
                  className={`px-3 py-1 rounded-full text-xs ${!selectedCat ? "bg-primary/20 text-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  All
                </button>{" "}
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCat(c)}
                    className={`px-3 py-1 rounded-full text-xs ${selectedCat === c ? "bg-primary/20 text-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {c}
                  </button>
                ))}{" "}
              </div>{" "}
            </div>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {" "}
              {filteredMenu.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-muted border border-border/50"
                >
                  {" "}
                  <div className="text-sm font-medium">{item.name}</div>{" "}
                  <div className="text-xs text-muted-foreground">
                    {item.category}
                  </div>{" "}
                  <div className="text-sm text-foreground mt-1">
                    Rp {item.price.toLocaleString()}
                  </div>{" "}
                  <Button
                    size="sm"
                    className="w-full mt-2 h-7 text-xs"
                    onClick={() => addToCart(item.id)}
                  >
                    + Add
                  </Button>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        {/* Cart & Orders */}{" "}
        <div className="space-y-4">
          {" "}
          <Card>
            {" "}
            <CardHeader>
              <CardTitle className="text-base">
                Cart ({Object.keys(cart).length})
              </CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-3">
              {" "}
              {Object.entries(cart).length === 0 ? (
                <div className="text-sm text-muted-foreground">Cart empty</div>
              ) : (
                <>
                  {" "}
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = menu.find((m) => m.id === id);
                    return (
                      <div
                        key={id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>
                          {item?.name} x{qty}
                        </span>
                        <span className="text-foreground">
                          Rp {((item?.price || 0) * qty).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}{" "}
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-foreground">
                      Rp {totalCart.toLocaleString()}
                    </span>
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="text-xs text-muted-foreground">
                      Unit
                    </label>{" "}
                    <input
                      className="w-full bg-muted border border-border rounded px-2 py-1 text-sm mt-1"
                      value={unitId}
                      onChange={(e) => setUnitId(e.target.value)}
                    />{" "}
                  </div>{" "}
                  <Button className="w-full" onClick={submitOrder}>
                    <Plus className="w-4 h-4 mr-1" /> Place Order
                  </Button>{" "}
                </>
              )}{" "}
            </CardContent>{" "}
          </Card>{" "}
          <Card>
            {" "}
            <CardHeader>
              <CardTitle className="text-base">
                Orders ({orders.length})
              </CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {" "}
              {orders.map((o: any) => (
                <div key={o.id} className="p-2 rounded-lg bg-muted text-sm">
                  {" "}
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      {o.unitId}
                    </span>{" "}
                    <Badge
                      className={`text-[10px] ${statusColor[o.status] || ""}`}
                    >
                      {o.status}
                    </Badge>{" "}
                  </div>{" "}
                  <div className="text-xs text-muted-foreground mt-1">
                    Rp {o.total.toLocaleString()}
                  </div>{" "}
                  {o.status !== "DELIVERED" && o.status !== "CANCELLED" && (
                    <div className="flex gap-1 mt-1">
                      {" "}
                      {o.status === "PENDING" && (
                        <Button
                          size="sm"
                          className="h-6 text-[10px]"
                          onClick={() => updateOrderStatus(o.id, "CONFIRMED")}
                        >
                          Confirm
                        </Button>
                      )}{" "}
                      {o.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          className="h-6 text-[10px]"
                          onClick={() => updateOrderStatus(o.id, "PREPARING")}
                        >
                          Prepare
                        </Button>
                      )}{" "}
                      {o.status === "PREPARING" && (
                        <Button
                          size="sm"
                          className="h-6 text-[10px]"
                          onClick={() => updateOrderStatus(o.id, "DELIVERED")}
                        >
                          Deliver
                        </Button>
                      )}{" "}
                      <Button
                        size="sm"
                        className="h-6 text-[10px]"
                        variant="destructive"
                        onClick={() => updateOrderStatus(o.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>{" "}
                    </div>
                  )}{" "}
                </div>
              ))}{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
