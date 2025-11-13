import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentForm } from "./agent-form";

export default function AgentPage() {
  return (
    <div className="space-y-8">
      <Card className="space-y-6">
        <CardHeader className="mb-0">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-200">Ask the Agent</p>
          <CardTitle className="text-4xl text-white">Realtime Analyst</CardTitle>
          <CardDescription>
            Query the robotics intelligence agent for synthesized context. The model references the most
            recent articles and highlights gaps when data is missing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgentForm />
        </CardContent>
      </Card>
    </div>
  );
}
