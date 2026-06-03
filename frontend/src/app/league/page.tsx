"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Trophy, Swords, Plus, Play, Square } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function LeaguePage() {
  const { token } = useAuthStore();
  const [seasons, setSeasons] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [tab, setTab] = useState<"seasons" | "leaderboard">("seasons");
  const [form, setForm] = useState({
    name: "",
    game: "",
    startDate: "",
    endDate: "",
  });
  const headers = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    fetch(`${API}/league/seasons`, { headers })
      .then((r) => r.json())
      .then(setSeasons)
      .catch(() => {});
  }, []);
  const createSeason = async () => {
    const res = await fetch(`${API}/league/season`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status: "UPCOMING" }),
    });
    if (res.ok) {
      setForm({ name: "", game: "", startDate: "", endDate: "" });
      fetch(`${API}/league/seasons`, { headers })
        .then((r) => r.json())
        .then(setSeasons);
    }
  };
  const startSeason = async (id: string) => {
    await fetch(`${API}/league/season/${id}/start`, {
      method: "POST",
      headers,
    });
    fetch(`${API}/league/seasons`, { headers })
      .then((r) => r.json())
      .then(setSeasons);
  };
  const endSeason = async (id: string) => {
    await fetch(`${API}/league/season/${id}/end`, {
      method: "POST",
      headers,
    });
    fetch(`${API}/league/seasons`, { headers })
      .then((r) => r.json())
      .then(setSeasons);
  };
  const loadLeaderboard = async (seasonId: string) => {
    setSelectedSeason(seasonId);
    setTab("leaderboard");
    const res = await fetch(`${API}/league/leaderboard/${seasonId}`, {
      headers,
    });
    if (res.ok) setLeaderboard(await res.json());
  };
  const statusBadge: Record<string, string> = {
    UPCOMING: "bg-yellow-500/20 text-yellow-400",
    ACTIVE: "bg-green-500/20 text-green-400",
    ENDED: "bg-[#666]/20 text-muted-foreground",
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" /> Esports League
      </h1>{" "}
      <div className="flex gap-2">
        {" "}
        <Button
          variant={tab === "seasons" ? "default" : "outline"}
          onClick={() => setTab("seasons")}
        >
          Seasons
        </Button>{" "}
        <Button
          variant={tab === "leaderboard" ? "default" : "outline"}
          onClick={() => setTab("leaderboard")}
          disabled={!selectedSeason}
        >
          Leaderboard
        </Button>{" "}
      </div>{" "}
      {tab === "seasons" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {" "}
          <Card>
            {" "}
            <CardHeader>
              <CardTitle className="text-base">New Season</CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-3">
              {" "}
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <input
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>{" "}
              <div>
                <label className="text-xs text-muted-foreground">Game</label>
                <input
                  className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                  value={form.game}
                  onChange={(e) => setForm({ ...form, game: e.target.value })}
                />
              </div>{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div>
                  <label className="text-xs text-muted-foreground">Start</label>
                  <input
                    type="date"
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>{" "}
                <div>
                  <label className="text-xs text-muted-foreground">End</label>
                  <input
                    type="date"
                    className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>{" "}
              </div>{" "}
              <Button className="w-full" onClick={createSeason}>
                <Plus className="w-4 h-4 mr-1" /> Create Season
              </Button>{" "}
            </CardContent>{" "}
          </Card>{" "}
          <Card className="lg:col-span-2">
            {" "}
            <CardHeader>
              <CardTitle className="text-base">All Seasons</CardTitle>
            </CardHeader>{" "}
            <CardContent className="space-y-2">
              {" "}
              {seasons.map((s: any) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-muted border border-border/50"
                >
                  {" "}
                  <div className="flex justify-between items-start">
                    {" "}
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.game} · {s.startDate} → {s.endDate}
                      </div>
                    </div>{" "}
                    <Badge className={statusBadge[s.status]}>
                      {s.status}
                    </Badge>{" "}
                  </div>{" "}
                  <div className="flex gap-2 mt-2">
                    {" "}
                    <Button size="sm" onClick={() => loadLeaderboard(s.id)}>
                      <Trophy className="w-3 h-3 mr-1" /> Leaderboard
                    </Button>{" "}
                    {s.status === "UPCOMING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startSeason(s.id)}
                      >
                        <Play className="w-3 h-3 mr-1" /> Start
                      </Button>
                    )}{" "}
                    {s.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => endSeason(s.id)}
                      >
                        <Square className="w-3 h-3 mr-1" /> End
                      </Button>
                    )}{" "}
                  </div>{" "}
                </div>
              ))}{" "}
              {seasons.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No seasons yet
                </div>
              )}{" "}
            </CardContent>{" "}
          </Card>{" "}
        </div>
      )}{" "}
      {tab === "leaderboard" && (
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="text-base flex items-center gap-2">
              <Swords className="w-4 h-4 text-yellow-400" /> Leaderboard
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <table className="w-full text-sm">
              {" "}
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Player</th>
                  <th className="text-center py-2">Points</th>
                  <th className="text-center py-2">W</th>
                  <th className="text-center py-2">L</th>
                </tr>
              </thead>{" "}
              <tbody>
                {" "}
                {leaderboard.map((e: any, i: number) => (
                  <tr key={e.id} className="border-b border-border/50">
                    {" "}
                    <td className="py-2">
                      {i === 0
                        ? "🥇"
                        : i === 1
                          ? "🥈"
                          : i === 2
                            ? "🥉"
                            : `#${e.rank}`}
                    </td>{" "}
                    <td className="py-2 font-medium">{e.playerName}</td>{" "}
                    <td className="py-2 text-center text-yellow-400 font-bold">
                      {e.points}
                    </td>{" "}
                    <td className="py-2 text-center text-green-400">
                      {e.wins}
                    </td>{" "}
                    <td className="py-2 text-center text-red-400">
                      {e.losses}
                    </td>{" "}
                  </tr>
                ))}{" "}
              </tbody>{" "}
            </table>{" "}
            {leaderboard.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No players registered
              </div>
            )}{" "}
          </CardContent>{" "}
        </Card>
      )}{" "}
    </div>
  );
}
