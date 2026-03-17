import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <Badge variant="outline">Phase 7</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Email and SMS notifications (via Resend + Twilio) will be built in Phase 7.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
