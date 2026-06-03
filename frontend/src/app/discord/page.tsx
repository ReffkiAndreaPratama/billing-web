"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { MessageCircle, Send, Terminal } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function DiscordPage() {
  const { token } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [commands, setCommands] = useState<any[]>([]);
  const [channel, setChannel] = useState("general");
  const [message, setMessage] = useState("");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  useEffect(() => {
    fetch(`${API}/discord/commands`, { headers })
      .then((r) => r.json())
      .then(setCommands)
      .catch(() => {});
    fetch(`${API}/discord/logs`, { headers })
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => {});
  }, []);
  const send = async () => {
    if (!message)
      return await fetch(`${API}/discord/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({ channel, message }),
      });
    setMessage("");
    fetch(`${API}/discord/logs`, { headers })
      .then((r) => r.json())
      .then(setLogs);
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-indigo-400" /> Discord Bot
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send Message</CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-3">
            {" "}
            <div>
              <label className="text-xs text-muted-foreground">Channel</label>
              <input
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </div>{" "}
            <div>
              <label className="text-xs text-muted-foreground">Message</label>
              <textarea
                className="w-full bg-muted border border-border rounded px-3 py-2 text-sm mt-1"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>{" "}
            <Button className="w-full" onClick={send}>
              <Send className="w-4 h-4 mr-1" /> Send to Discord
            </Button>{" "}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" /> Bot Commands
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-2">
            {" "}
            {commands.map((c: any, i: number) => (
              <div key={i} className="p-2 rounded-lg bg-muted">
                <code className="text-foreground text-xs">{c.command}</code>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.description}
                </div>
              </div>
            ))}{" "}
          </CardContent>
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Send Log ({logs.length})
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-1 max-h-80 overflow-y-auto">
            {" "}
            {logs.map((l: any, i: number) => (
              <div key={i} className="text-xs p-2 rounded bg-[#eee8dd]">
                <span className="text-muted-foreground">[{l.channel}]</span>{" "}
                {l.message}
              </div>
            ))}{" "}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
