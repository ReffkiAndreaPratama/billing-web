"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Member } from "@/types";
import { Users, Plus, Search, DollarSign } from "lucide-react";
export default function MembersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [topupAmount, setTopupAmount] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadMembers();
  }, []);
  const loadMembers = async () => {
    try {
      const res = await api.members.list(search ? `search=${search}` : "");
      setMembers(res.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  const createMember = async () => {
    try {
      await api.members.create(form);
      setShowAdd(false);
      setForm({ name: "", phone: "", email: "" });
      loadMembers();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleTopup = async () => {
    if (!selectedMember || !topupAmount) return;
    try {
      await api.members.topup(selectedMember.id, {
        amount: parseInt(topupAmount),
        paymentMethod: "CASH",
      });
      setSelectedMember(null);
      setTopupAmount("");
      loadMembers();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const tierBadge = (tier: string) => {
    const variants: Record<
      string,
      "info" | "success" | "warning" | "danger" | "default"
    > = {
      BRONZE: "default",
      SILVER: "info",
      GOLD: "warning",
      PLATINUM: "success",
      DIAMOND: "danger",
    };
    return <Badge variant={variants[tier] || "default"}>{tier}</Badge>;
  };
  return (
    <div className="flex h-screen bg-background">
      {" "}
      <Sidebar />{" "}
      <main className="flex-1 overflow-y-auto">
        {" "}
        <div className="p-6 space-y-6">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <h1 className="text-2xl font-bold text-foreground">Members</h1>{" "}
            <Button onClick={() => setShowAdd(!showAdd)}>
              {" "}
              <Plus className="w-4 h-4 mr-1" /> Add Member{" "}
            </Button>{" "}
          </div>{" "}
          {/* Search */}{" "}
          <div className="flex gap-2">
            {" "}
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or code..."
              className="max-w-sm"
              onKeyDown={(e) => e.key === "Enter" && loadMembers()}
            />{" "}
            <Button variant="outline" onClick={loadMembers}>
              <Search className="w-4 h-4" />
            </Button>{" "}
          </div>{" "}
          {/* Add Form */}{" "}
          {showAdd && (
            <Card>
              {" "}
              <CardContent className="p-4 space-y-3">
                {" "}
                <div className="grid grid-cols-3 gap-3">
                  {" "}
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Name"
                  />{" "}
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="Phone"
                  />{" "}
                  <Input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="Email (optional)"
                  />{" "}
                </div>{" "}
                <Button onClick={createMember}>Save Member</Button>{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
          {/* Topup Dialog */}{" "}
          {selectedMember && (
            <Card className="border-[#4d96ff]/30">
              {" "}
              <CardContent className="p-4 space-y-3">
                {" "}
                <p className="text-sm text-foreground">
                  {" "}
                  Topup for <strong>{selectedMember.name}</strong> — Balance:{" "}
                  {formatCurrency(selectedMember.balance)}{" "}
                </p>{" "}
                <div className="flex gap-2">
                  {" "}
                  <Input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Amount"
                  />{" "}
                  <Button onClick={handleTopup}>
                    <DollarSign className="w-4 h-4 mr-1" /> Topup
                  </Button>{" "}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMember(null)}
                  >
                    Cancel
                  </Button>{" "}
                </div>{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
          {/* Table */}{" "}
          <Card>
            {" "}
            <CardContent className="p-0">
              {" "}
              <Table>
                {" "}
                <TableHeader>
                  {" "}
                  <TableRow>
                    {" "}
                    <TableHead>Code</TableHead> <TableHead>Name</TableHead>{" "}
                    <TableHead>Phone</TableHead> <TableHead>Tier</TableHead>{" "}
                    <TableHead>Balance</TableHead> <TableHead>Points</TableHead>{" "}
                    <TableHead>Visits</TableHead>{" "}
                    <TableHead>Action</TableHead>{" "}
                  </TableRow>{" "}
                </TableHeader>{" "}
                <TableBody>
                  {" "}
                  {members.map((m) => (
                    <TableRow key={m.id}>
                      {" "}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {m.code}
                      </TableCell>{" "}
                      <TableCell className="font-medium text-foreground">
                        {m.name}
                      </TableCell>{" "}
                      <TableCell className="text-muted-foreground">
                        {m.phone}
                      </TableCell>{" "}
                      <TableCell>{tierBadge(m.tier)}</TableCell>{" "}
                      <TableCell className="text-foreground">
                        {formatCurrency(m.balance)}
                      </TableCell>{" "}
                      <TableCell className="text-muted-foreground">
                        {m.totalPoints}
                      </TableCell>{" "}
                      <TableCell className="text-muted-foreground">
                        {m.visitCount}
                      </TableCell>{" "}
                      <TableCell>
                        {" "}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMember(m)}
                        >
                          {" "}
                          <DollarSign className="w-3 h-3 mr-1" /> Topup{" "}
                        </Button>{" "}
                      </TableCell>{" "}
                    </TableRow>
                  ))}{" "}
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        No members found
                      </TableCell>
                    </TableRow>
                  )}{" "}
                </TableBody>{" "}
              </Table>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
