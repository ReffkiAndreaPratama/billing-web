"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { Gamepad2, Trophy, TrendingUp } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function GamePlatformPage() {
  const { token } = useAuthStore();
  const h = { Authorization: `Bearer ${token}` };
  const [games, setGames] = useState<any[]>([]);
  const [player, setPlayer] = useState<any>(null);
  useState(() => {
    fetch(`${API}/game-platform/popular`, { headers: h })
      .then((r) => r.json())
      .then(setGames);
  });
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Gamepad2 className="w-6 h-6 text-foreground" /> Game Platform Stats
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              <Trophy className="w-4 h-4 inline mr-1 text-yellow-400" />
              Popular Games
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            {games.map((g: any) => (
              <div
                key={g.game}
                className="flex justify-between items-center p-3 rounded-lg bg-muted mb-2"
              >
                {" "}
                <div>
                  <div className="font-medium">
                    #{g.rank} {g.game}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {g.playHours.toLocaleString()}h playtime
                  </div>
                </div>{" "}
                <div className="text-foreground font-bold">
                  {g.peakPlayers}
                </div>{" "}
              </div>
            ))}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <TrendingUp className="w-4 h-4 inline mr-1 text-green-400" />
              Player Lookup
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-3">
            {" "}
            <input
              className="w-full bg-muted border border-border rounded px-3 py-2 text-sm"
              placeholder="Member ID"
              onKeyDown={async (e: any) => {
                if (e.key === "Enter") {
                  const r = await fetch(
                    `${API}/game-platform/player/${e.target.value}`,
                    { headers: h },
                  );
                  if (r.ok) setPlayer(await r.json());
                }
              }}
            />{" "}
            {player && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                {Object.entries(player).map(
                  ([platform, data]: [string, any]) => (
                    <div key={platform} className="mb-2">
                      <div className="font-medium capitalize">{platform}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {data.id} · {data.hours}h
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}{" "}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
