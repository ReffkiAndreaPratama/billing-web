"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api";
import { Bell, MessageSquare, Phone, Bot } from "lucide-react";
const typeIcons: Record<string, any> = {
  INAPP: Bell,
  WA: Phone,
  TELEGRAM: Bot,
  PUSH: Bell,
  BOOKING: Bell,
  BILLING: Bell,
};
const typeColors: Record<string, string> = {
  INAPP: "bg-primary/10 text-foreground",
  WA: "bg-green-500/10 text-green-400",
  TELEGRAM: "bg-blue-500/10 text-blue-400",
  PUSH: "bg-purple-500/10 text-purple-400",
};
export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    api.notifications
      .list()
      .then((res) => setNotifications(Array.isArray(res) ? res : []))
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
          <Bell className="w-6 h-6 text-foreground" /> Notifications{" "}
        </h1>{" "}
        <Card>
          {" "}
          <CardContent className="p-0">
            {" "}
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                {" "}
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />{" "}
                <p>No notifications</p>{" "}
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {" "}
                {notifications.map((n) => {
                  const Icon = typeIcons[n.type] || Bell;
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 p-4 hover:bg-[#eee8dd] transition-colors"
                    >
                      {" "}
                      <div
                        className={`p-2 rounded-full ${typeColors[n.type] || "bg-[#d0c8b8]"}`}
                      >
                        {" "}
                        <Icon className="w-4 h-4" />{" "}
                      </div>{" "}
                      <div className="flex-1 min-w-0">
                        {" "}
                        <div className="flex items-center justify-between">
                          {" "}
                          <span className="text-sm font-medium text-foreground">
                            {n.title}
                          </span>{" "}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(n.createdAt)}
                          </span>{" "}
                        </div>{" "}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {n.message}
                        </p>{" "}
                        <Badge variant="info" className="mt-1 text-[10px]">
                          {n.type}
                        </Badge>{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>
            )}{" "}
          </CardContent>{" "}
        </Card>{" "}
      </main>{" "}
    </div>
  );
}
