import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <Badge variant="outline">Phase 6</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Invoicing and receipt generation will be built in Phase 6.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
