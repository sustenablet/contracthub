import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileText,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

const syne = { fontFamily: "'Syne', sans-serif" } as const;
const fraunces = { fontFamily: "'Fraunces', serif" } as const;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr.split("T")[0]);
}

export default async function FinancesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch all financial data in parallel
  const [
    allInvoicesRes,
    paidInvoicesRes,
    unpaidInvoicesRes,
    overdueRes,
    recentInvoicesRes,
    estimatesRes,
    openEstimatesRes,
    monthInvoicesRes,
  ] = await Promise.allSettled([
    // All invoices (non-void)
    supabase.from("invoices").select("total, status").eq("user_id", user.id).neq("status", "void"),
    // Paid invoices
    supabase.from("invoices").select("total").eq("user_id", user.id).eq("status", "paid"),
    // Unpaid invoices
    supabase.from("invoices").select("total, due_date").eq("user_id", user.id).eq("status", "unpaid"),
    // Overdue (unpaid + past due date)
    supabase.from("invoices").select("total").eq("user_id", user.id).eq("status", "unpaid").lt("due_date", new Date().toISOString().split("T")[0]),
    // Recent invoices for table
    supabase.from("invoices").select("id, total, status, due_date, payment_date, created_at, clients(first_name, last_name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    // Total estimates
    supabase.from("estimates").select("total, status").eq("user_id", user.id),
    // Open estimates
    supabase.from("estimates").select("total").eq("user_id", user.id).in("status", ["draft", "sent"]),
    // This month's paid invoices
    supabase.from("invoices").select("total").eq("user_id", user.id).eq("status", "paid").gte("payment_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]),
  ]);

  // Calculate totals
  const allInvoices = allInvoicesRes.status === "fulfilled" ? (allInvoicesRes.value.data ?? []) : [];
  const paidInvoices = paidInvoicesRes.status === "fulfilled" ? (paidInvoicesRes.value.data ?? []) : [];
  const unpaidInvoices = unpaidInvoicesRes.status === "fulfilled" ? (unpaidInvoicesRes.value.data ?? []) : [];
  const overdueInvoices = overdueRes.status === "fulfilled" ? (overdueRes.value.data ?? []) : [];
  const recentInvoices = recentInvoicesRes.status === "fulfilled" ? (recentInvoicesRes.value.data ?? []) : [];
  const allEstimates = estimatesRes.status === "fulfilled" ? (estimatesRes.value.data ?? []) : [];
  const openEstimates = openEstimatesRes.status === "fulfilled" ? (openEstimatesRes.value.data ?? []) : [];
  const monthInvoices = monthInvoicesRes.status === "fulfilled" ? (monthInvoicesRes.value.data ?? []) : [];

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const thisMonthRevenue = monthInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalEstimatesValue = openEstimates.reduce((sum, est) => sum + (Number(est.total) || 0), 0);
  const avgInvoice = allInvoices.length > 0
    ? allInvoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0) / allInvoices.length
    : 0;

  // Status breakdown
  const invoiceCount = allInvoices.length;
  const paidCount = paidInvoices.length;
  const unpaidCount = unpaidInvoices.length;
  const overdueCount = overdueInvoices.length;

  const statusConfig: Record<string, { className: string; label: string }> = {
    paid: { className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200", label: "Paid" },
    unpaid: { className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200", label: "Unpaid" },
    void: { className: "bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-200", label: "Void" },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]" style={fraunces}>
            Finances
          </h1>
          <p className="text-[13px] text-[#1A2332]/40 mt-0.5" style={syne}>
            Overview of your revenue, invoices, and estimates
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-[#1A2332]/55 bg-white border border-[#1A2332]/[0.08] rounded-lg hover:bg-[#1A2332]/[0.02] transition-colors"
            style={syne}
          >
            <Receipt className="h-3.5 w-3.5" strokeWidth={1.8} />
            Invoices
          </Link>
          <Link
            href="/dashboard/estimates"
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-[#1A2332]/55 bg-white border border-[#1A2332]/[0.08] rounded-lg hover:bg-[#1A2332]/[0.02] transition-colors"
            style={syne}
          >
            <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
            Estimates
          </Link>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          detail={`${paidCount} paid invoice${paidCount !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={Clock}
          detail={`${unpaidCount} unpaid`}
          alert={overdueCount > 0}
        />
        <StatCard
          label="This Month"
          value={formatCurrency(thisMonthRevenue)}
          icon={TrendingUp}
          detail={new Date().toLocaleDateString("en-US", { month: "long" })}
        />
        <StatCard
          label="Avg. Invoice"
          value={formatCurrency(avgInvoice)}
          icon={Receipt}
          detail={`${invoiceCount} total`}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Recent transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#1A2332]/[0.06] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A2332]/[0.05]">
            <h2 className="text-[14px] font-bold text-[#1A2332]" style={syne}>
              Recent Transactions
            </h2>
            <Link
              href="/dashboard/invoices"
              className="flex items-center gap-1 text-[12px] font-semibold text-[#1A2332]/40 hover:text-[#1A2332] transition-colors"
              style={syne}
            >
              View All
              <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="h-12 w-12 rounded-xl bg-[#1A2332]/[0.04] flex items-center justify-center mb-3">
                <Receipt className="h-6 w-6 text-[#1A2332]/20" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] font-semibold text-[#1A2332]/60" style={syne}>
                No transactions yet
              </p>
              <p className="text-[12px] text-[#1A2332]/30 mt-1 max-w-xs" style={syne}>
                Create your first invoice to start tracking revenue
              </p>
              <Link
                href="/dashboard/invoices"
                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold bg-[#1A2332] text-white rounded-lg hover:bg-[#1A2332]/90 transition-colors"
                style={syne}
              >
                Create Invoice
                <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1A2332]/[0.04]">
              {recentInvoices.map((inv: {
                id: string;
                total: number | null;
                status: string;
                due_date: string | null;
                payment_date: string | null;
                created_at: string;
                clients: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
              }) => {
                const clientRaw = inv.clients;
                const client = Array.isArray(clientRaw) ? clientRaw[0] ?? null : clientRaw;
                const clientName = client ? `${client.first_name} ${client.last_name}` : "Unknown";
                const config = statusConfig[inv.status] || statusConfig.unpaid;

                return (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#1A2332]/[0.01] transition-colors">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      inv.status === "paid" ? "bg-emerald-50" : inv.status === "unpaid" ? "bg-amber-50" : "bg-gray-50"
                    }`}>
                      {inv.status === "paid" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={1.8} />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" strokeWidth={1.8} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A2332] truncate" style={syne}>
                        {clientName}
                      </p>
                      <p className="text-[11px] text-[#1A2332]/30" style={syne}>
                        {timeAgo(inv.created_at)}
                        {inv.due_date && inv.status === "unpaid" && (
                          <> &middot; Due {formatDate(inv.due_date)}</>
                        )}
                      </p>
                    </div>

                    <span className="text-[14px] font-bold text-[#1A2332] tabular-nums shrink-0" style={fraunces}>
                      {inv.total != null ? formatCurrency(Number(inv.total)) : "-"}
                    </span>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.className} shrink-0`}
                      style={syne}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Summary panel */}
        <div className="space-y-4">
          {/* Payment Status */}
          <div className="bg-white rounded-2xl border border-[#1A2332]/[0.06] shadow-sm p-5">
            <h3 className="text-[13px] font-bold text-[#1A2332] mb-4" style={syne}>
              Invoice Status
            </h3>
            <div className="space-y-3">
              <StatusRow
                label="Paid"
                count={paidCount}
                total={invoiceCount}
                color="bg-emerald-500"
              />
              <StatusRow
                label="Unpaid"
                count={unpaidCount - overdueCount}
                total={invoiceCount}
                color="bg-amber-400"
              />
              <StatusRow
                label="Overdue"
                count={overdueCount}
                total={invoiceCount}
                color="bg-red-400"
              />
            </div>

            {invoiceCount === 0 && (
              <p className="text-[12px] text-[#1A2332]/25 text-center py-4" style={syne}>
                No invoices yet
              </p>
            )}
          </div>

          {/* Overdue alert */}
          {overdueCount > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-100 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" strokeWidth={1.8} />
                <div>
                  <p className="text-[13px] font-semibold text-red-600" style={syne}>
                    {overdueCount} overdue invoice{overdueCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[12px] text-red-400 mt-0.5" style={syne}>
                    {formatCurrency(totalOverdue)} outstanding past due date
                  </p>
                  <Link
                    href="/dashboard/invoices"
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-500 hover:text-red-600 mt-2 transition-colors"
                    style={syne}
                  >
                    Review invoices
                    <ArrowRight className="h-3 w-3" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Open Estimates */}
          <div className="bg-white rounded-2xl border border-[#1A2332]/[0.06] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-bold text-[#1A2332]" style={syne}>
                Open Estimates
              </h3>
              <Link
                href="/dashboard/estimates"
                className="text-[11px] font-semibold text-[#1A2332]/35 hover:text-[#1A2332] transition-colors"
                style={syne}
              >
                View All
              </Link>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1A2332] tabular-nums" style={fraunces}>
                {formatCurrency(totalEstimatesValue)}
              </span>
            </div>
            <p className="text-[12px] text-[#1A2332]/30 mt-1" style={syne}>
              {openEstimates.length} estimate{openEstimates.length !== 1 ? "s" : ""} pending response
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Link
              href="/dashboard/invoices"
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#1A2332]/[0.06] hover:border-[#1A2332]/[0.12] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#1A2332]/[0.04] flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-[#1A2332]/50" strokeWidth={1.8} />
                </div>
                <span className="text-[13px] font-semibold text-[#1A2332]/70" style={syne}>
                  Create Invoice
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#1A2332]/20 group-hover:text-[#1A2332]/50 transition-colors" strokeWidth={1.8} />
            </Link>

            <Link
              href="/dashboard/estimates"
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#1A2332]/[0.06] hover:border-[#1A2332]/[0.12] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#1A2332]/[0.04] flex items-center justify-center">
                  <FileText className="h-4 w-4 text-[#1A2332]/50" strokeWidth={1.8} />
                </div>
                <span className="text-[13px] font-semibold text-[#1A2332]/70" style={syne}>
                  New Estimate
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#1A2332]/20 group-hover:text-[#1A2332]/50 transition-colors" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────── */

function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  alert,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  detail?: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#1A2332]/[0.06] shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          alert ? "bg-red-50" : "bg-[#1A2332]/[0.04]"
        }`}>
          <Icon className={`h-4 w-4 ${alert ? "text-red-400" : "text-[#1A2332]/40"}`} strokeWidth={1.8} />
        </div>
        {alert && (
          <AlertCircle className="h-3.5 w-3.5 text-red-400" strokeWidth={1.8} />
        )}
      </div>
      <p className="text-xl font-bold text-[#1A2332] tabular-nums" style={{ fontFamily: "'Fraunces', serif" }}>
        {value}
      </p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-[11px] text-[#1A2332]/35 font-medium" style={{ fontFamily: "'Syne', sans-serif" }}>
          {label}
        </p>
        {detail && (
          <p className="text-[10px] text-[#1A2332]/25" style={{ fontFamily: "'Syne', sans-serif" }}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#1A2332]/55 font-medium" style={{ fontFamily: "'Syne', sans-serif" }}>
          {label}
        </span>
        <span className="text-[12px] text-[#1A2332]/35 tabular-nums" style={{ fontFamily: "'Syne', sans-serif" }}>
          {count}
        </span>
      </div>
      <div className="h-1.5 bg-[#1A2332]/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
