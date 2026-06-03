"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import { MessageSquare, Send, Bot } from "lucide-react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export default function ChatbotPage() {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [question, setQuestion] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const ask = async (q?: string) => {
    const text = q || question;
    if (!text) return setMessages((prev) => [...prev, { role: "user", text }]);
    setQuestion("");
    const res = await fetch(`${API}/chatbot/ask`, {
      method: "POST",
      headers,
      body: JSON.stringify({ question: text, sessionId: "web-1" }),
    });
    if (res.ok) {
      const d = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: d.answer }]);
      setSuggestions(d.suggestions || []);
    }
  };
  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bot className="w-6 h-6 text-foreground" /> AI Chatbot FAQ
      </h1>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {" "}
        <Card className="lg:col-span-3">
          {" "}
          <CardContent className="p-4 flex flex-col h-[500px]">
            {" "}
            <div className="flex-1 space-y-3 overflow-y-auto mb-4">
              {" "}
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Ask me anything about Game Center!
                </div>
              )}{" "}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {" "}
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-sm ${m.role === "user" ? "bg-primary/20 text-foreground" : "bg-muted text-[#aaa]"}`}
                  >
                    {m.text}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
            <div className="flex gap-2">
              {" "}
              <Input
                placeholder="Type your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
              />{" "}
              <Button onClick={() => ask()}>
                <Send className="w-4 h-4" />
              </Button>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Suggestions
            </CardTitle>
          </CardHeader>{" "}
          <CardContent className="space-y-2">
            {" "}
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="w-full text-left p-2 rounded-lg bg-muted text-sm hover:bg-[#d0c8b8]/50 transition"
                onClick={() => ask(s)}
              >
                {s}
              </button>
            ))}{" "}
            {suggestions.length === 0 &&
              [
                "Cek harga paket",
                "Cara booking",
                "Info member",
                "Jam operasional",
                "Topup saldo",
              ].map((s, i) => (
                <button
                  key={i}
                  className="w-full text-left p-2 rounded-lg bg-muted text-sm hover:bg-[#d0c8b8]/50 transition"
                  onClick={() => ask(s)}
                >
                  {s}
                </button>
              ))}{" "}
          </CardContent>
        </Card>{" "}
      </div>{" "}
    </div>
  );
}
