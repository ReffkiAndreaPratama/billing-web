"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { Trophy, Medal, Award, Star } from "lucide-react";
const tierColors: Record<string, string> = {
  DIAMOND: "text-cyan-300",
  PLATINUM: "text-purple-400",
  GOLD: "text-yellow-400",
  SILVER: "text-muted-foreground/60",
  BRONZE: "text-orange-400",
};
const tierIcons: Record<string, any> = {
  DIAMOND: Trophy,
  PLATINUM: Medal,
  GOLD: Award,
  SILVER: Star,
  BRONZE: Star,
};
export default function LeaderboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [leaders, setLeaders] = useState<any[]>([]);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    api.gamification
      .leaderboard(user?.branchId)
      .then((res) => setLeaders(Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);
  return (
    <div className="flex h-screen bg-background">
      {" "}
      <Sidebar />{" "}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {" "}
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          {" "}
          <Trophy className="w-6 h-6 text-yellow-400" /> Member Leaderboard{" "}
        </h1>{" "}
        {/* Podium */}{" "}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {" "}
          {leaders.slice(0, 3).map((m, i) => {
            const heights = ["h-24", "h-32", "h-20"];
            const colors = [
              "bg-yellow-500/20 border-yellow-500/30",
              "bg-zinc-400/20 border-zinc-400/30",
              "bg-orange-500/20 border-orange-500/30",
            ];
            return (
              <div key={m.id} className="text-center">
                {" "}
                <div className="text-2xl mb-2">
                  {["🥇", "🥈", "🥉"][i]}
                </div>{" "}
                <div className={`flex items-end justify-center ${heights[i]}`}>
                  {" "}
                  <div
                    className={`w-full rounded-t-xl border ${colors[i]} p-2`}
                  >
                    {" "}
                    <div className="text-xs font-bold text-foreground truncate">
                      {m.name}
                    </div>{" "}
                    <div className="text-[10px] text-muted-foreground">
                      {m.totalPoints} pts
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
        {/* Full leaderboard */}{" "}
        <Card>
          {" "}
          <CardHeader>
            <CardTitle className="text-base">Rankings</CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-2">
            {" "}
            {leaders.map((m, i) => {
              const Icon = tierIcons[m.tier] || Star;
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <span className="text-sm font-bold text-muted-foreground w-6">
                      #{i + 1}
                    </span>{" "}
                    <Icon
                      className={`w-4 h-4 ${tierColors[m.tier] || "text-muted-foreground"}`}
                    />{" "}
                    <div>
                      {" "}
                      <div className="text-sm text-foreground">
                        {m.name}
                      </div>{" "}
                      <div className="text-[10px] text-muted-foreground">
                        {m.code}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="text-right">
                    {" "}
                    <div className="text-sm font-bold text-foreground">
                      {m.totalPoints} pts
                    </div>{" "}
                    <div className="text-[10px] text-muted-foreground">
                      {" "}
                      Spent: {formatCurrency(m.totalSpent)} · {m.visitCount}{" "}
                      visits{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
            {leaders.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No data yet
              </div>
            )}{" "}
          </CardContent>{" "}
        </Card>{" "}
      </main>{" "}
    </div>
  );
}
