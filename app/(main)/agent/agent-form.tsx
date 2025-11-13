"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AgentForm() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [contextCount, setContextCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion) {
      return;
    }
    setLoading(true);
    setError(null);
    setAnswer(null);
    setContextCount(null);

    try {
      const response = await fetch("/api/agent/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: cleanQuestion }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to query the agent");
      }

      const payload = (await response.json()) as { answer: string; context_articles_count: number };
      setAnswer(payload.answer);
      setContextCount(payload.context_articles_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask for a summary, funding update, or comparison..."
          rows={6}
        />
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={!question.trim()} loading={loading}>
            Submit question
          </Button>
          {contextCount !== null && (
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Context: {contextCount} articles
            </span>
          )}
        </div>
      </form>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {answer && (
        <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 text-sm text-slate-100">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
