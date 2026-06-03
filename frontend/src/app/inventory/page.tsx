"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    load();
  }, []);
  const load = async () => {
    try {
      setItems([]);
    } catch {}
  };
  return (
    <div className="flex h-screen bg-background">
      {" "}
      <Sidebar />{" "}
      <main className="flex-1 overflow-y-auto">
        {" "}
        <div className="p-6 space-y-6">
          {" "}
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>{" "}
          <Card>
            {" "}
            <CardContent className="p-12 text-center text-muted-foreground">
              {" "}
              <p>Inventory management module</p>{" "}
              <p className="text-sm mt-1">
                Coming soon with full CRUD, stock alerts, and supplier
                management
              </p>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
