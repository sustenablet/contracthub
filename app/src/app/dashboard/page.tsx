import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CalendarDays,
  FileText,
  Receipt,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const { count: jobCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("status", "scheduled");

  const { count: estimateCount } = await supabase
    .from("estimates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .in("status", ["draft", "sent"]);

  const { count: invoiceCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("status", "unpaid");

  const stats = [
    {
      title: "Clients",
      value: clientCount ?? 0,
      icon: Users,
      description: "Total active clients",
    },
    {
      title: "Upcoming Jobs",
      value: jobCount ?? 0,
      icon: CalendarDays,
      description: "Scheduled jobs",
    },
    {
      title: "Open Estimates",
      value: estimateCount ?? 0,
      icon: FileText,
      description: "Draft or sent",
    },
    {
      title: "Unpaid Invoices",
      value: invoiceCount ?? 0,
      icon: Receipt,
      description: "Awaiting payment",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Getting Started</CardTitle>
            <Badge variant="secondary">Phase 1</Badge>
          </div>
          <CardDescription>
            Your foundation is set up. Future phases will add client management,
            scheduling, estimates, invoicing, and notifications here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Authentication is live
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Database schema deployed
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Subscription gating active
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Client management (Phase 2)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Job scheduling (Phase 3)
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
