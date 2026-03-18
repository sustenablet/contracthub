import { createClient } from "@/lib/supabase/server";
import {
  Users,
  CalendarDays,
  FileText,
  Receipt,
  TrendingUp,
  Plus,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ServiceDonut } from "@/components/dashboard/service-donut";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all stats in parallel, gracefully handle missing tables
  const [clientsRes, jobsRes, estimatesRes, invoicesRes, todayJobsRes, recentJobsRes, recentInvoicesRes] =
    await Promise.allSettled([
      supabase.from("clients").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "scheduled"),
      supabase.from("estimates").select("*", { count: "exact", head: true }).eq("user_id", user!.id).in("status", ["draft", "sent"]),
      supabase.from("invoices").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("status", "unpaid"),
      // Today's jobs
      supabase.from("jobs").select("*, clients(first_name, last_name)").eq("user_id", user!.id).eq("scheduled_date", new Date().toISOString().split("T")[0]).order("start_time", { ascending: true }).limit(5),
      // Recent jobs (last 5 completed/scheduled)
      supabase.from("jobs").select("*, clients(first_name, last_name)").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(5),
      // Recent invoices
      supabase.from("invoices").select("*, clients(first_name, last_name)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
    ]);

  const clientCount = clientsRes.status === "fulfilled" ? (clientsRes.value.count ?? 0) : 0;
  const jobCount = jobsRes.status === "fulfilled" ? (jobsRes.value.count ?? 0) : 0;
  const estimateCount = estimatesRes.status === "fulfilled" ? (estimatesRes.value.count ?? 0) : 0;
  const invoiceCount = invoicesRes.status === "fulfilled" ? (invoicesRes.value.count ?? 0) : 0;
  const todayJobs = todayJobsRes.status === "fulfilled" ? (todayJobsRes.value.data ?? []) : [];
  const recentJobs = recentJobsRes.status === "fulfilled" ? (recentJobsRes.value.data ?? []) : [];
  const recentInvoices = recentInvoicesRes.status === "fulfilled" ? (recentInvoicesRes.value.data ?? []) : [];

  // Build activity feed from recent items
  type ActivityItem = { type: string; label: string; detail: string; time: string; icon: string; color: string };
  const activity: ActivityItem[] = [];

  for (const job of recentJobs) {
    const name = job.clients ? `${job.clients.first_name} ${job.clients.last_name}` : "Client";
    const statusLabel: Record<string, string> = {
      scheduled: "Job scheduled",
      in_progress: "Job started",
      completed: "Job completed",
      invoiced: "Job invoiced",
      cancelled: "Job cancelled",
    };
    activity.push({
      type: "job",
      label: statusLabel[job.status] || "Job updated",
      detail: `${name} — ${job.service_type || "Service"}`,
      time: job.updated_at,
      icon: "briefcase",
      color: job.status === "completed" ? "bg-green-50 text-green-500" : job.status === "cancelled" ? "bg-red-50 text-red-500" : "bg-teal-50 text-teal-500",
    });
  }

  for (const inv of recentInvoices) {
    const name = inv.clients ? `${inv.clients.first_name} ${inv.clients.last_name}` : "Client";
    activity.push({
      type: "invoice",
      label: inv.status === "paid" ? "Payment received" : "Invoice created",
      detail: `${name} — $${(inv.total || 0).toFixed(2)}`,
      time: inv.created_at,
      icon: "receipt",
      color: inv.status === "paid" ? "bg-green-50 text-green-500" : "bg-amber-50 text-amber-500",
    });
  }

  // Sort by time, take top 8
  activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const recentActivity = activity.slice(0, 8);

  const stats = [
    { title: "Clients", value: clientCount, icon: Users, iconClass: "bg-blue-50 text-blue-500", href: "/dashboard/clients" },
    { title: "Upcoming Jobs", value: jobCount, icon: CalendarDays, iconClass: "bg-teal-50 text-teal-500", href: "/dashboard/schedule" },
    { title: "Open Estimates", value: estimateCount, icon: FileText, iconClass: "bg-purple-50 text-purple-500", href: "/dashboard/estimates" },
    { title: "Unpaid Invoices", value: invoiceCount, icon: Receipt, iconClass: "bg-red-50 text-red-500", href: "/dashboard/invoices" },
  ];

  const jobStatusConfig: Record<string, { badge: string; label: string }> = {
    scheduled: { badge: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200", label: "Scheduled" },
    in_progress: { badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", label: "In Progress" },
    completed: { badge: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200", label: "Completed" },
    invoiced: { badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200", label: "Invoiced" },
    cancelled: { badge: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200", label: "Cancelled" },
  };

  function formatTime(time: string | null) {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }

  const ActivityIcon = ({ type, className }: { type: string; className: string }) => {
    if (type === "receipt") return <Receipt className={className} />;
    return <Briefcase className={className} />;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]" style={{ fontFamily: "'Fraunces', serif" }}>
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
            Welcome back. Here&apos;s your business at a glance.
          </p>
        </div>
        {/* Quick actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1A2332]/60 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Client
          </Link>
          <Link
            href="/dashboard/schedule"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-500 rounded-xl hover:bg-teal-600 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Job
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="group">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 group-hover:shadow-md group-hover:border-gray-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-10 w-10 rounded-xl ${stat.iconClass} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-gray-200 group-hover:text-teal-400 transition-colors" />
              </div>
              <div className="text-3xl font-bold text-[#1A2332] mb-1 tabular-nums" style={{ fontFamily: "'Fraunces', serif" }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 font-medium" style={{ fontFamily: "'Syne', sans-serif" }}>
                {stat.title}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Jobs + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Jobs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-teal-500" />
              <h2 className="text-sm font-semibold text-[#1A2332]" style={{ fontFamily: "'Syne', sans-serif" }}>
                Today&apos;s Jobs
              </h2>
            </div>
            <Link
              href="/dashboard/schedule"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              View All →
            </Link>
          </div>

          {todayJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400" style={{ fontFamily: "'Syne', sans-serif" }}>
                No jobs scheduled for today
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayJobs.map((job: { id: string; start_time: string | null; service_type: string | null; status: string; price: number | null; clients: { first_name: string; last_name: string } | null }) => {
                const config = jobStatusConfig[job.status] || jobStatusConfig.scheduled;
                return (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="text-xs font-mono text-gray-400 w-16 shrink-0" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {formatTime(job.start_time) || "TBD"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A2332] truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {job.clients ? `${job.clients.first_name} ${job.clients.last_name}` : "Client"}
                      </p>
                      <p className="text-xs text-gray-400 truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {job.service_type || "Service"}
                      </p>
                    </div>
                    {job.price != null && (
                      <span className="text-sm font-bold text-[#1A2332] shrink-0 tabular-nums" style={{ fontFamily: "'Fraunces', serif" }}>
                        ${Number(job.price).toFixed(0)}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.badge} shrink-0`} style={{ fontFamily: "'Syne', sans-serif" }}>
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-4 w-4 text-purple-500" />
            <h2 className="text-sm font-semibold text-[#1A2332]" style={{ fontFamily: "'Syne', sans-serif" }}>
              Recent Activity
            </h2>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                <Briefcase className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400" style={{ fontFamily: "'Syne', sans-serif" }}>
                Activity will appear here as you use MaidHub
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`h-8 w-8 rounded-lg ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <ActivityIcon type={item.icon} className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1A2332]" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400 truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-300 shrink-0 mt-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {timeAgo(item.time)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-[#1A2332]" style={{ fontFamily: "'Syne', sans-serif" }}>
              Revenue Statistics
            </h2>
            <select
              className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <option>Monthly</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="flex items-baseline gap-2.5 mb-5">
            <span className="text-2xl font-bold text-[#1A2332]" style={{ fontFamily: "'Fraunces', serif" }}>
              $9,355.00
            </span>
            <span className="text-xs text-gray-400" style={{ fontFamily: "'Syne', sans-serif" }}>
              Sample data
            </span>
          </div>
          <RevenueChart />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Service Category
          </h2>
          <ServiceDonut />
        </div>
      </div>
    </div>
  );
}
