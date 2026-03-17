import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EstimatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
        <Badge variant="outline">Phase 5</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Create and send estimates with line items, totals, and contract text in Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
