"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Monitor,
  Power,
  PowerOff,
  MessageSquare,
  Camera,
  Lock,
  Unlock,
  RefreshCw,
  Activity,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function AgentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadAgents();
    const interval = setInterval(loadAgents, 10000);
    return () => clearInterval(interval);
  }, []);
  const loadAgents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/agents${user?.branchId ? `?branchId=${user.branchId}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch {}
  };
  const sendCommand = async (machineId: string, command: string) => {
    try {
      const token = localStorage.getItem("token"); // Using socket via API await fetch(`${API_URL}/agents/${machineId}/command`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ command }), })
    } catch {}
  };
  const setupSocket = () => {}; // In production, this would use Socket.io client. For now, use REST endpoints
  const loadStats = async (machineId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/agents/stats/${machineId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
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
          <div className="flex items-center justify-between">
            {" "}
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {" "}
              <Monitor className="w-6 h-6 text-foreground" /> Desktop Agent
              Monitor{" "}
            </h1>{" "}
            <Badge variant="info">{agents.length} Online</Badge>{" "}
          </div>{" "}
          {/* Agents Grid */}{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {" "}
            {agents.map((agent) => (
              <Card
                key={agent.machineId}
                className={`cursor-pointer transition-all hover:border-[#4d96ff]/30 ${selectedAgent?.machineId === agent.machineId ? "border-cyan-500/50" : ""}`}
                onClick={() => {
                  setSelectedAgent(agent);
                  loadStats(agent.machineId);
                }}
              >
                {" "}
                <CardContent className="p-4">
                  {" "}
                  <div className="flex items-center justify-between mb-2">
                    {" "}
                    <div className="flex items-center gap-2">
                      {" "}
                      <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />{" "}
                      <span className="font-medium text-foreground text-sm">
                        {agent.hostname}
                      </span>{" "}
                    </div>{" "}
                    <Badge variant="success" className="text-[10px]">
                      Online
                    </Badge>{" "}
                  </div>{" "}
                  <div className="text-xs text-muted-foreground space-y-1">
                    {" "}
                    <p>ID: {agent.machineId}</p>{" "}
                    <p>
                      Platform: {agent.platform} ({agent.arch})
                    </p>{" "}
                    <p>Last Seen: {formatDate(agent.lastSeen)}</p>{" "}
                  </div>{" "}
                </CardContent>{" "}
              </Card>
            ))}{" "}
            {agents.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                {" "}
                <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />{" "}
                <p>No agents connected</p>{" "}
                <p className="text-sm mt-1">
                  Install the Desktop Agent on client PCs
                </p>{" "}
              </div>
            )}{" "}
          </div>{" "}
          {/* Selected Agent Controls */}{" "}
          {selectedAgent && (
            <Card className="border-[#4d96ff]/30">
              {" "}
              <CardHeader>
                {" "}
                <CardTitle className="text-base flex items-center gap-2">
                  {" "}
                  <Activity className="w-4 h-4 text-foreground" /> Control:{" "}
                  {selectedAgent.hostname}{" "}
                </CardTitle>{" "}
              </CardHeader>{" "}
              <CardContent>
                {" "}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {" "}
                  <Button
                    variant="outline"
                    onClick={() => sendCommand(selectedAgent.machineId, "lock")}
                  >
                    {" "}
                    <Lock className="w-4 h-4 mr-1" /> Lock{" "}
                  </Button>{" "}
                  <Button
                    variant="outline"
                    onClick={() =>
                      sendCommand(selectedAgent.machineId, "unlock")
                    }
                  >
                    {" "}
                    <Unlock className="w-4 h-4 mr-1" /> Unlock{" "}
                  </Button>{" "}
                  <Button
                    variant="destructive"
                    onClick={() =>
                      sendCommand(selectedAgent.machineId, "shutdown")
                    }
                  >
                    {" "}
                    <PowerOff className="w-4 h-4 mr-1" /> Shutdown{" "}
                  </Button>{" "}
                  <Button
                    variant="outline"
                    onClick={() =>
                      sendCommand(selectedAgent.machineId, "restart")
                    }
                  >
                    {" "}
                    <RefreshCw className="w-4 h-4 mr-1" /> Restart{" "}
                  </Button>{" "}
                  <Button
                    variant="outline"
                    onClick={() =>
                      sendCommand(selectedAgent.machineId, "screenshot")
                    }
                  >
                    {" "}
                    <Camera className="w-4 h-4 mr-1" /> Screenshot{" "}
                  </Button>{" "}
                </div>{" "}
                {/* Message */}{" "}
                <div className="flex gap-2">
                  {" "}
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Send message to client PC..."
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      messageText &&
                      sendCommand(
                        selectedAgent.machineId,
                        `message:${messageText}`,
                      )
                    }
                  />{" "}
                  <Button
                    onClick={() => {
                      if (messageText) {
                        sendCommand(
                          selectedAgent.machineId,
                          `message:${messageText}`,
                        );
                        setMessageText("");
                      }
                    }}
                  >
                    {" "}
                    <MessageSquare className="w-4 h-4 mr-1" /> Send{" "}
                  </Button>{" "}
                </div>{" "}
                {/* Stats */}{" "}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {" "}
                    <div className="p-3 rounded-lg bg-muted">
                      {" "}
                      <p className="text-xs text-muted-foreground">CPU</p>{" "}
                      <p className="text-lg font-bold text-foreground">
                        {stats.cpu?.load || 0}%
                      </p>{" "}
                    </div>{" "}
                    <div className="p-3 rounded-lg bg-muted">
                      {" "}
                      <p className="text-xs text-muted-foreground">RAM</p>{" "}
                      <p className="text-lg font-bold text-purple-400">
                        {stats.memory?.usagePercent || 0}%
                      </p>{" "}
                    </div>{" "}
                    <div className="p-3 rounded-lg bg-muted">
                      {" "}
                      <p className="text-xs text-muted-foreground">
                        Uptime
                      </p>{" "}
                      <p className="text-lg font-bold text-foreground">
                        {" "}
                        {stats.os?.uptime
                          ? `${Math.floor(stats.os.uptime / 3600)}h`
                          : "-"}{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="p-3 rounded-lg bg-muted">
                      {" "}
                      <p className="text-xs text-muted-foreground">
                        Processes
                      </p>{" "}
                      <p className="text-lg font-bold text-foreground">
                        {stats.processes?.running || 0}
                      </p>{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </CardContent>{" "}
            </Card>
          )}{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
