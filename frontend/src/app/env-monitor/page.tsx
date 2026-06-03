"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import {
  Thermometer,
  Droplets,
  Volume2,
  Wind,
  AlertTriangle,
} from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function EnvMonitorPage() {
  const { token } = useAuthStore();
  const [reading, setReading] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [roomId, setRoomId] = useState("room-1");
  const headers = { Authorization: `Bearer ${token}` };
  const readNow = async () => {
    const res = await fetch(`${API}/env-monitor/read/${roomId}`, {
      method: "POST",
      headers,
    });
    if (res.ok) {
      const d = await res.json();
      setReading(d);
    }
    fetch(`${API}/env-monitor/history/${roomId}?limit=10`, { headers })
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {});
    fetch(`${API}/env-monitor/alerts`, { headers })
      .then((r) => r.json())
      .then(setAlerts)
      .catch(() => {});
  };
  const getColor = (val: number, thresholds: [number, number, number]) => {
    if (val < thresholds[0]) return "text-green-400";
    if (val < thresholds[1]) return "text-yellow-400";
    return "text-red-400";
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Thermometer className="w-6 h-6 text-foreground" /> Environment
        Monitoring
      </h1>{" "}
      <div className="flex gap-2 items-center">
        {" "}
        <input
          className="bg-muted border border-border rounded px-3 py-2 text-sm"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />{" "}
        <Button onClick={readNow}>
          <Wind className="w-4 h-4 mr-1" /> Read Sensors
        </Button>{" "}
      </div>{" "}
      {reading && (
        <div className="grid grid-cols-4 gap-4">
          {" "}
          <Card>
            <CardContent className="p-4 text-center">
              <Thermometer className="w-6 h-6 mx-auto mb-2 text-red-400" />{" "}
              <div
                className={`text-2xl font-bold ${getColor(reading.temperature, [30, 35, 40])}`}
              >
                {reading.temperature}°C
              </div>{" "}
              <div className="text-xs text-muted-foreground">Temperature</div>
            </CardContent>
          </Card>{" "}
          <Card>
            <CardContent className="p-4 text-center">
              <Droplets className="w-6 h-6 mx-auto mb-2 text-blue-400" />{" "}
              <div
                className={`text-2xl font-bold ${getColor(reading.humidity, [60, 75, 85])}`}
              >
                {reading.humidity}%
              </div>{" "}
              <div className="text-xs text-muted-foreground">Humidity</div>
            </CardContent>
          </Card>{" "}
          <Card>
            <CardContent className="p-4 text-center">
              <Volume2 className="w-6 h-6 mx-auto mb-2 text-yellow-400" />{" "}
              <div
                className={`text-2xl font-bold ${getColor(reading.noise, [40, 60, 75])}`}
              >
                {reading.noise}dB
              </div>{" "}
              <div className="text-xs text-muted-foreground">Noise</div>
            </CardContent>
          </Card>{" "}
          <Card>
            <CardContent className="p-4 text-center">
              <Wind className="w-6 h-6 mx-auto mb-2 text-green-400" />{" "}
              <div
                className={`text-2xl font-bold ${getColor(reading.airQuality, [80, 60, 40])}`}
              >
                {reading.airQuality}%
              </div>{" "}
              <div className="text-xs text-muted-foreground">Air Quality</div>
            </CardContent>
          </Card>{" "}
        </div>
      )}{" "}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" /> Alerts
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-1">
            {alerts.map((a: any, i: number) => (
              <div
                key={i}
                className="p-2 rounded bg-yellow-500/10 text-yellow-400 text-xs"
              >
                {a.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}{" "}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              History (last {history.length})
            </CardTitle>
          </CardHeader>{" "}
          <CardContent>
            <div className="grid grid-cols-5 gap-1 text-xs">
              {" "}
              {history.map((h: any, i: number) => (
                <div key={i} className="p-1 rounded bg-muted text-center">
                  {" "}
                  <div className="text-red-400">{h.temperature}°</div>{" "}
                  <div className="text-blue-400">{h.humidity}%</div>{" "}
                </div>
              ))}{" "}
            </div>
          </CardContent>
        </Card>
      )}{" "}
    </div>
  );
}
