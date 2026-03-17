import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <Badge variant="outline">Phase 3</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Job scheduling, recurring rules, and calendar views will be built in Phase 3.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
