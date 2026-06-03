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
import { formatCurrency, formatDate } from "@/lib/utils";
import { Swords } from "lucide-react";
export default function TournamentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    game: "",
    type: "single_elimination",
    maxTeams: 8,
    maxPlayers: 5,
    prizePool: 0,
    entryFee: 0,
    startDate: "",
    rules: "",
  });
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    load();
  }, []);
  const load = async () => {
    try {
      const res = await api.tournaments.list();
      setTournaments(res);
    } catch {}
  };
  const create = async () => {
    try {
      await api.tournaments.create(form);
      setShowCreate(false);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };
  const statusBadge = (s: string) => {
    const map: Record<
      string,
      "info" | "success" | "warning" | "danger" | "default"
    > = {
      DRAFT: "default",
      REGISTRATION: "info",
      ONGOING: "success",
      COMPLETED: "warning",
      CANCELLED: "danger",
    };
    return <Badge variant={map[s] || "default"}>{s}</Badge>;
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
            <h1 className="text-2xl font-bold text-foreground">
              Tournaments
            </h1>{" "}
            <Button onClick={() => setShowCreate(!showCreate)}>
              {" "}
              <Swords className="w-4 h-4 mr-1" /> New Tournament{" "}
            </Button>{" "}
          </div>{" "}
          {showCreate && (
            <Card>
              {" "}
              <CardContent className="p-4 space-y-3">
                {" "}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {" "}
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tournament Name"
                  />{" "}
                  <Input
                    value={form.game}
                    onChange={(e) => setForm({ ...form, game: e.target.value })}
                    placeholder="Game"
                  />{" "}
                  <Input
                    type="number"
                    value={form.maxTeams}
                    onChange={(e) =>
                      setForm({ ...form, maxTeams: Number(e.target.value) })
                    }
                    placeholder="Max Teams"
                  />{" "}
                  <Input
                    type="number"
                    value={form.prizePool}
                    onChange={(e) =>
                      setForm({ ...form, prizePool: Number(e.target.value) })
                    }
                    placeholder="Prize Pool"
                  />{" "}
                  <Input
                    type="number"
                    value={form.entryFee}
                    onChange={(e) =>
                      setForm({ ...form, entryFee: Number(e.target.value) })
                    }
                    placeholder="Entry Fee"
                  />{" "}
                  <Input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />{" "}
                </div>{" "}
                <Button onClick={create}>Create Tournament</Button>{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {" "}
            {tournaments.map((t: any) => (
              <Card key={t.id}>
                {" "}
                <CardHeader>
                  {" "}
                  <div className="flex justify-between items-start">
                    {" "}
                    <CardTitle className="text-base">{t.name}</CardTitle>{" "}
                    {statusBadge(t.status)}{" "}
                  </div>{" "}
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.game}
                  </p>{" "}
                </CardHeader>{" "}
                <CardContent className="space-y-2 text-sm">
                  {" "}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teams</span>
                    <span>
                      {t._count?.teams || 0}/{t.maxTeams}
                    </span>
                  </div>{" "}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prize</span>
                    <span className="text-yellow-400">
                      {formatCurrency(t.prizePool)}
                    </span>
                  </div>{" "}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span>{formatCurrency(t.entryFee)}</span>
                  </div>{" "}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start</span>
                    <span className="text-xs">{formatDate(t.startDate)}</span>
                  </div>{" "}
                </CardContent>{" "}
              </Card>
            ))}{" "}
            {tournaments.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                {" "}
                <Swords className="w-12 h-12 mx-auto mb-3 opacity-50" />{" "}
                <p>No tournaments yet</p>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
