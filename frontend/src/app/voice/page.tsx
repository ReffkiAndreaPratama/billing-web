"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Mic, Volume2, Command } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function VoicePage() {
  const { token } = useAuthStore();
  const [commands, setCommands] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  useEffect(() => {
    fetch(`${API}/voice/commands`, { headers })
      .then((r) => r.json())
      .then(setCommands)
      .catch(() => {});
  }, []);
  const processVoice = async () => {
    const text = transcript || "buka billing PC 1";
    const res = await fetch(`${API}/voice/process`, {
      method: "POST",
      headers,
      body: JSON.stringify({ transcript: text }),
    });
    if (res.ok) setResult(await res.json());
  };
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Web Speech API not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.onresult = (event: any) => {
      setTranscript(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.start();
    setListening(true);
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Volume2 className="w-6 h-6 text-purple-400" /> Voice Command
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            {" "}
            <Button
              size="lg"
              className={`rounded-full w-20 h-20 ${listening ? "bg-red-500 animate-pulse" : ""}`}
              onClick={startListening}
            >
              {" "}
              <Mic className="w-8 h-8" />{" "}
            </Button>{" "}
            <div className="text-sm">
              {listening ? "Listening..." : "Click to speak"}
            </div>{" "}
            <textarea
              className="w-full bg-muted border border-border rounded px-3 py-2 text-sm"
              rows={2}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Or type command..."
            />{" "}
            <Button className="w-full" onClick={processVoice}>
              Process Command
            </Button>{" "}
            {result && (
              <div
                className={`p-3 rounded-lg text-sm ${result.confidence > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
              >
                {" "}
                <div>Action: {result.action}</div> <div>{result.response}</div>{" "}
                {result.confidence > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Confidence: {(result.confidence * 100).toFixed(0)}%
                  </div>
                )}{" "}
              </div>
            )}{" "}
          </CardContent>
        </Card>{" "}
        <Card className="lg:col-span-2">
          {" "}
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Command className="w-4 h-4 text-purple-400" /> Available Commands
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-2">
            {" "}
            {commands.map((c: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-muted">
                <code className="text-purple-400 text-sm">
                  {c.pattern.source}
                </code>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.response}
                </div>
              </div>
            ))}{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
