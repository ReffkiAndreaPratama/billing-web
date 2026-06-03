"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import {
  Lightbulb,
  Tv,
  Wind,
  Thermometer,
  Power,
  PowerOff,
} from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function IotPage() {
  const { token } = useAuthStore();
  const [rooms, setRooms] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [temps, setTemps] = useState<Record<string, number>>({});
  const headers = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    fetch(`${API}/iot/rooms`, { headers })
      .then((r) => r.json())
      .then(setRooms)
      .catch(() => {});
  }, []);
  const selectRoom = async (roomId: string) => {
    setSelectedRoom(roomId);
    const res = await fetch(`${API}/iot/devices/${roomId}`, { headers });
    if (res.ok) setDevices(await res.json());
    const tres = await fetch(`${API}/iot/temperature/${roomId}`, { headers });
    if (tres.ok) {
      const d = await tres.json();
      setTemps((prev) => ({ ...prev, [roomId]: d.temperature }));
    }
  };
  const control = async (id: string, status: "ON" | "OFF") => {
    await fetch(`${API}/iot/device/${id}/control`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    selectRoom(selectedRoom);
  };
  const autoRoom = async (roomId: string, mode: "on" | "off") => {
    await fetch(`${API}/iot/room/${roomId}/auto-${mode}`, {
      method: "POST",
      headers,
    });
    selectRoom(selectedRoom);
  };
  const iconMap: Record<string, any> = {
    LIGHT: Lightbulb,
    AC: Wind,
    TV: Tv,
    RELAY: Power,
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-yellow-400" /> Smart Room Automation
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {" "}
        {rooms.map((room) => (
          <Card
            key={room.id}
            className={`cursor-pointer transition-all ${selectedRoom === room.id ? "border-cyan-500 ring-1 ring-cyan-500" : ""}`}
            onClick={() => selectRoom(room.id)}
          >
            {" "}
            <CardContent className="p-4">
              {" "}
              <div className="text-sm font-medium">{room.name}</div>{" "}
              <div className="text-xs text-muted-foreground mt-1">
                Branch: {room.branchId}
              </div>{" "}
              {temps[room.id] && (
                <div className="text-xs text-foreground mt-1">
                  {temps[room.id].toFixed(1)}°C
                </div>
              )}{" "}
            </CardContent>{" "}
          </Card>
        ))}{" "}
      </div>{" "}
      {selectedRoom && (
        <>
          {" "}
          <div className="flex gap-2">
            {" "}
            <Button onClick={() => autoRoom(selectedRoom, "on")}>
              <Power className="w-4 h-4 mr-1" /> Auto ON All
            </Button>{" "}
            <Button
              variant="destructive"
              onClick={() => autoRoom(selectedRoom, "off")}
            >
              <PowerOff className="w-4 h-4 mr-1" /> Auto OFF All
            </Button>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {" "}
            {devices.map((d: any) => {
              const Icon = iconMap[d.type] || Power;
              return (
                <Card key={d.id}>
                  {" "}
                  <CardContent className="p-4 flex items-center justify-between">
                    {" "}
                    <div className="flex items-center gap-3">
                      {" "}
                      <div
                        className={`p-2 rounded-lg ${d.status === "ON" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}
                      >
                        {" "}
                        <Icon className="w-5 h-5" />{" "}
                      </div>{" "}
                      <div>
                        {" "}
                        <div className="text-sm font-medium">{d.name}</div>{" "}
                        <div className="text-xs text-muted-foreground">
                          {d.type}
                          {d.value ? ` · ${d.value}°C` : ""}
                        </div>{" "}
                      </div>{" "}
                    </div>{" "}
                    <div className="flex items-center gap-2">
                      {" "}
                      <Badge
                        className={
                          d.status === "ON"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-[#d0c8b8] text-muted-foreground"
                        }
                      >
                        {d.status}
                      </Badge>{" "}
                      <Button
                        size="sm"
                        variant={d.status === "ON" ? "destructive" : "default"}
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          control(d.id, d.status === "ON" ? "OFF" : "ON")
                        }
                      >
                        {" "}
                        {d.status === "ON" ? (
                          <PowerOff className="w-3 h-3" />
                        ) : (
                          <Power className="w-3 h-3" />
                        )}{" "}
                      </Button>{" "}
                    </div>{" "}
                  </CardContent>{" "}
                </Card>
              );
            })}{" "}
          </div>{" "}
        </>
      )}{" "}
      {!selectedRoom && (
        <div className="text-center py-12 text-muted-foreground">
          Select a room to control devices
        </div>
      )}{" "}
    </div>
  );
}
