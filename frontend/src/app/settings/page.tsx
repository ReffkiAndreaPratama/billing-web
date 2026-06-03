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
import { Settings, Shield, UserCog } from "lucide-react";
export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    role: "KASIR",
    phone: "",
  });
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadUsers();
  }, []);
  const loadUsers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/users`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
  };
  const addUser = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ...form, branchId: user?.branchId }),
        },
      );
      setShowAddUser(false);
      setForm({
        username: "",
        password: "",
        name: "",
        role: "KASIR",
        phone: "",
      });
      loadUsers();
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
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          {" "}
          <Settings className="w-6 h-6 text-foreground" /> Settings{" "}
        </h1>{" "}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {" "}
          {/* User Management */}{" "}
          <Card>
            {" "}
            <CardHeader>
              {" "}
              <div className="flex items-center justify-between">
                {" "}
                <CardTitle className="text-base flex items-center gap-2">
                  {" "}
                  <UserCog className="w-4 h-4 text-foreground" /> User
                  Management{" "}
                </CardTitle>{" "}
                <Button size="sm" onClick={() => setShowAddUser(true)}>
                  + Add User
                </Button>{" "}
              </div>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-2">
              {" "}
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  {" "}
                  <div>
                    {" "}
                    <div className="text-sm text-foreground font-medium">
                      {u.name}
                    </div>{" "}
                    <div className="text-xs text-muted-foreground">
                      @{u.username}
                    </div>{" "}
                  </div>{" "}
                  <Badge
                    variant={
                      u.role === "KASIR"
                        ? "info"
                        : u.role === "ADMIN"
                          ? "warning"
                          : "success"
                    }
                  >
                    {u.role}
                  </Badge>{" "}
                </div>
              ))}{" "}
              {showAddUser && (
                <div className="space-y-2 p-3 rounded-lg bg-muted border border-[#4d96ff]/30">
                  {" "}
                  <Input
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />{" "}
                  <Input
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />{" "}
                  <Input
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />{" "}
                  <Input
                    placeholder="Phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />{" "}
                  <select
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {" "}
                    <option value="KASIR">Kasir</option>{" "}
                    <option value="ADMIN">Admin</option>{" "}
                    <option value="OWNER">Owner</option>{" "}
                  </select>{" "}
                  <div className="flex gap-2">
                    {" "}
                    <Button size="sm" onClick={addUser}>
                      Save
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddUser(false)}
                    >
                      Cancel
                    </Button>{" "}
                  </div>{" "}
                </div>
              )}{" "}
            </CardContent>{" "}
          </Card>{" "}
          {/* RBAC Info */}{" "}
          <Card>
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="text-base flex items-center gap-2">
                {" "}
                <Shield className="w-4 h-4 text-purple-400" /> Role &
                Permission{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-3">
              {" "}
              {[
                {
                  role: "SUPERADMIN",
                  desc: "Full access to all branches and settings",
                  color: "text-red-400",
                },
                {
                  role: "OWNER",
                  desc: "View all reports, manage branches, manage users",
                  color: "text-purple-400",
                },
                {
                  role: "ADMIN",
                  desc: "Manage billing, members, inventory, shift, reports",
                  color: "text-foreground",
                },
                {
                  role: "KASIR",
                  desc: "POS, start/end billing, basic member search",
                  color: "text-green-400",
                },
              ].map((r) => (
                <div key={r.role} className="p-3 rounded-lg bg-[#eee8dd]">
                  {" "}
                  <div className={`font-bold text-sm ${r.color}`}>
                    {r.role}
                  </div>{" "}
                  <div className="text-xs text-muted-foreground mt-1">
                    {r.desc}
                  </div>{" "}
                </div>
              ))}{" "}
              <div className="pt-2">
                {" "}
                <div className="text-xs text-muted-foreground mb-2">
                  Current user:
                </div>{" "}
                <Badge variant="info" className="text-xs">
                  {user?.role} — {user?.name}
                </Badge>{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
