"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Download, Trash2, RotateCcw, HardDrive } from "lucide-react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function BackupPage() {
  const { token } = useAuthStore();
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const fetchBackups = async () => {
    try {
      const res = await fetch(`${API_URL}/backup`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setBackups(await res.json());
    } catch {}
  };
  useEffect(() => {
    fetchBackups();
  }, []);
  const createBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/backup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMsg("Backup created!");
        fetchBackups();
      }
    } catch {
      setMsg("Failed");
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };
  const restoreBackup = async (file: string) => {
    if (!confirm(`Restore ${file}? This will overwrite current data.`)) return;
    try {
      const res = await fetch(
        `${API_URL}/backup/restore/${encodeURIComponent(file)}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) setMsg("Restore initiated!");
    } catch {
      setMsg("Restore failed");
    }
    setTimeout(() => setMsg(""), 3000);
  };
  const deleteBackup = async (file: string) => {
    if (!confirm(`Delete ${file}?`)) return;
    try {
      await fetch(`${API_URL}/backup/${encodeURIComponent(file)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBackups();
    } catch {}
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <div className="flex items-center justify-between">
        {" "}
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-foreground" /> Backup & Restore
        </h1>{" "}
        <Button onClick={createBackup} disabled={loading}>
          <Download className="w-4 h-4 mr-1" />{" "}
          {loading ? "Creating..." : "Create Backup"}
        </Button>{" "}
      </div>{" "}
      {msg && (
        <div className="p-3 rounded-xl bg-primary/10 text-foreground border border-[#4d96ff]/20 text-sm">
          {msg}
        </div>
      )}{" "}
      <Card>
        {" "}
        <CardHeader>
          <CardTitle className="text-base">Database Backups</CardTitle>
        </CardHeader>{" "}
        <CardContent>
          {" "}
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backups yet. Create your first backup.
            </div>
          ) : (
            <div className="space-y-2">
              {" "}
              {backups.map((b: any) => (
                <div
                  key={b.file}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  {" "}
                  <div>
                    {" "}
                    <div className="text-sm font-medium">{b.file}</div>{" "}
                    <div className="text-xs text-muted-foreground">
                      {(b.size / 1024).toFixed(1)} KB ·{" "}
                      {new Date(b.createdAt).toLocaleString()}
                    </div>{" "}
                  </div>{" "}
                  <div className="flex gap-2">
                    {" "}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreBackup(b.file)}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" /> Restore
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBackup(b.file)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </CardContent>{" "}
      </Card>{" "}
    </div>
  );
}
