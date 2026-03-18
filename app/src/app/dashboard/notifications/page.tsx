"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Briefcase,
  Receipt,
  FileText,
  Check,
  BellOff,
  Loader2,
  Clock,
} from "lucide-react";

const syne = { fontFamily: "'Syne', sans-serif" } as const;
const fraunces = { fontFamily: "'Fraunces', serif" } as const;

type NotifCategory = "all" | "jobs" | "invoices" | "estimates";

interface ActivityItem {
  id: string;
  category: "jobs" | "invoices" | "estimates";
  title: string;
  message: string;
  timestamp: string;
  relativeTime: string;
  unread: boolean;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getIcon(category: string) {
  switch (category) {
    case "jobs":
      return { Icon: Briefcase, bg: "bg-teal-50", color: "text-teal-500" };
    case "invoices":
      return { Icon: Receipt, bg: "bg-blue-50", color: "text-blue-500" };
    case "estimates":
      return { Icon: FileText, bg: "bg-purple-50", color: "text-purple-500" };
    default:
      return { Icon: Bell, bg: "bg-gray-50", color: "text-gray-500" };
  }
}

const tabs: { label: string; value: NotifCategory }[] = [
  { label: "All", value: "all" },
  { label: "Jobs", value: "jobs" },
  { label: "Invoices", value: "invoices" },
  { label: "Estimates", value: "estimates" },
];

export default function NotificationsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<NotifCategory>("all");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const loadActivities = useCallback(async () => {
    setLoading(true);
    const items: ActivityItem[] = [];

    // Fetch recent jobs
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, scheduled_date, start_time, service_type, status, price, created_at, updated_at, clients(first_name, last_name)")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (jobs) {
      for (const job of jobs) {
        const clientRaw = job.clients as unknown as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
        const client = Array.isArray(clientRaw) ? clientRaw[0] ?? null : clientRaw;
        const clientName = client ? `${client.first_name} ${client.last_name}` : "Unknown Client";
        let title = "";
        let message = "";

        switch (job.status) {
          case "scheduled":
            title = "Job Scheduled";
            message = `${job.service_type || "Cleaning"} for ${clientName} on ${new Date(job.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}${job.start_time ? ` at ${job.start_time.slice(0, 5)}` : ""}`;
            break;
          case "in_progress":
            title = "Job In Progress";
            message = `${job.service_type || "Cleaning"} for ${clientName} is currently in progress`;
            break;
          case "completed":
            title = "Job Completed";
            message = `${job.service_type || "Cleaning"} for ${clientName} has been completed${job.price ? ` — $${Number(job.price).toFixed(0)}` : ""}`;
            break;
          case "invoiced":
            title = "Job Invoiced";
            message = `Invoice created for ${clientName}'s ${job.service_type || "cleaning"}${job.price ? ` — $${Number(job.price).toFixed(0)}` : ""}`;
            break;
          case "cancelled":
            title = "Job Cancelled";
            message = `${job.service_type || "Cleaning"} for ${clientName} was cancelled`;
            break;
        }

        items.push({
          id: `job-${job.id}`,
          category: "jobs",
          title,
          message,
          timestamp: job.updated_at || job.created_at,
          relativeTime: getRelativeTime(job.updated_at || job.created_at),
          unread: !readIds.has(`job-${job.id}`),
        });
      }
    }

    // Fetch recent invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, total, status, due_date, payment_date, created_at, updated_at, clients(first_name, last_name)")
      .order("updated_at", { ascending: false })
      .limit(15);

    if (invoices) {
      for (const inv of invoices) {
        const clientRaw = inv.clients as unknown as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
        const client = Array.isArray(clientRaw) ? clientRaw[0] ?? null : clientRaw;
        const clientName = client ? `${client.first_name} ${client.last_name}` : "Unknown Client";
        const amount = inv.total ? `$${Number(inv.total).toFixed(0)}` : "";
        let title = "";
        let message = "";

        switch (inv.status) {
          case "unpaid":
            const dueDate = inv.due_date ? new Date(inv.due_date) : null;
            const isOverdue = dueDate && dueDate < new Date();
            title = isOverdue ? "Invoice Overdue" : "Invoice Created";
            message = isOverdue
              ? `Invoice for ${amount} from ${clientName} is overdue${dueDate ? ` (due ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})` : ""}`
              : `New invoice for ${amount} sent to ${clientName}`;
            break;
          case "paid":
            title = "Payment Received";
            message = `${clientName} paid ${amount}${inv.payment_date ? ` on ${new Date(inv.payment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}`;
            break;
          case "void":
            title = "Invoice Voided";
            message = `Invoice for ${amount} to ${clientName} has been voided`;
            break;
        }

        items.push({
          id: `inv-${inv.id}`,
          category: "invoices",
          title,
          message,
          timestamp: inv.updated_at || inv.created_at,
          relativeTime: getRelativeTime(inv.updated_at || inv.created_at),
          unread: !readIds.has(`inv-${inv.id}`),
        });
      }
    }

    // Fetch recent estimates
    const { data: estimates } = await supabase
      .from("estimates")
      .select("id, total, status, created_at, updated_at, clients(first_name, last_name)")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (estimates) {
      for (const est of estimates) {
        const clientRaw = est.clients as unknown as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
        const client = Array.isArray(clientRaw) ? clientRaw[0] ?? null : clientRaw;
        const clientName = client ? `${client.first_name} ${client.last_name}` : "Unknown Client";
        const amount = est.total ? `$${Number(est.total).toFixed(0)}` : "";
        let title = "";
        let message = "";

        switch (est.status) {
          case "draft":
            title = "Estimate Draft";
            message = `Draft estimate for ${amount} created for ${clientName}`;
            break;
          case "sent":
            title = "Estimate Sent";
            message = `Estimate for ${amount} sent to ${clientName}`;
            break;
          case "accepted":
            title = "Estimate Accepted";
            message = `${clientName} accepted the estimate for ${amount}`;
            break;
          case "declined":
            title = "Estimate Declined";
            message = `${clientName} declined the estimate for ${amount}`;
            break;
          case "expired":
            title = "Estimate Expired";
            message = `Estimate for ${amount} to ${clientName} has expired`;
            break;
        }

        items.push({
          id: `est-${est.id}`,
          category: "estimates",
          title,
          message,
          timestamp: est.updated_at || est.created_at,
          relativeTime: getRelativeTime(est.updated_at || est.created_at),
          unread: !readIds.has(`est-${est.id}`),
        });
      }
    }

    // Sort all by timestamp descending
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(items);
    setLoading(false);
  }, [supabase, readIds]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const filtered =
    activeTab === "all"
      ? activities
      : activities.filter((a) => a.category === activeTab);

  const unreadCount = activities.filter((a) => a.unread).length;

  function markAllRead() {
    const allIds = new Set(activities.map((a) => a.id));
    setReadIds(allIds);
    setActivities((prev) => prev.map((a) => ({ ...a, unread: false })));
  }

  function markRead(id: string) {
    setReadIds((prev) => new Set([...prev, id]));
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, unread: false } : a))
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]" style={fraunces}>
            Notifications
          </h1>
          <p className="text-sm text-gray-400 mt-0.5" style={syne}>
            {loading
              ? "Loading activity…"
              : unreadCount > 0
                ? (
                  <span>
                    <strong className="text-[#1A2332]">{unreadCount}</strong> unread
                  </span>
                )
                : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1A2332]/60 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            style={syne}
          >
            <Check className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-3 border-b border-gray-100">
          {tabs.map((tab) => {
            const count =
              tab.value === "all"
                ? unreadCount
                : activities.filter(
                    (a) => a.category === tab.value && a.unread
                  ).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === tab.value
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-400 hover:text-[#1A2332] hover:bg-gray-50"
                }`}
                style={syne}
              >
                {tab.label}
                {count > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-teal-500 text-white text-[9px] font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
            <p className="text-sm text-gray-400 mt-3" style={syne}>
              Loading activity…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <BellOff className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-[#1A2332]" style={syne}>
              No activity yet
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs" style={syne}>
              {activeTab === "all"
                ? "Create clients, schedule jobs, and send invoices to see activity here"
                : `No ${activeTab} activity yet`}
            </p>
          </div>
        ) : (
          /* Activity Feed */
          <div className="divide-y divide-gray-50">
            {filtered.map((item) => {
              const { Icon, bg, color } = getIcon(item.category);
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                    item.unread ? "bg-teal-50/20" : ""
                  }`}
                  onClick={() => markRead(item.id)}
                >
                  {/* Icon */}
                  <div
                    className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold ${item.unread ? "text-[#1A2332]" : "text-[#1A2332]/70"}`}
                        style={syne}
                      >
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap" style={syne}>
                          <Clock className="h-3 w-3" />
                          {item.relativeTime}
                        </span>
                        {item.unread && (
                          <div className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed" style={syne}>
                      {item.message}
                    </p>
                    <span
                      className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 capitalize"
                      style={syne}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
