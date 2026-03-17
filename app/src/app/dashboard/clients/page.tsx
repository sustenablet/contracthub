import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Badge variant="outline">Phase 2</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Client management (add, edit, archive clients and their service addresses) will be built in Phase 2.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
