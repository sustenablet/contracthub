"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Receipt,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Wallet,
  HardHat,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  display_name: string | null;
  business_name: string | null;
  subscription_status: string;
  trial_start_date: string;
}

const workNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/schedule", label: "Work Orders", icon: CalendarDays },
];

const financeNav = [
  { href: "/dashboard/finances", label: "Overview", icon: Wallet },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/estimates", label: "Bids & Quotes", icon: FileText },
];

const activityNav = [
  { href: "/dashboard/notifications", label: "Activity", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }
  return email[0].toUpperCase();
}

function getTrialDaysLeft(trialStart: string): number {
  const end = new Date(trialStart);
  end.setDate(end.getDate() + 30);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function getBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1) return "Dashboard";
  const last = segments[segments.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "bg-[rgba(234,88,12,0.15)] text-[#FB923C]"
          : "text-[#94A3B8] hover:bg-white/[0.05] hover:text-[#CBD5E1]"
      }`}
    >
      <Icon
        className="h-[15px] w-[15px] shrink-0"
        strokeWidth={isActive ? 2.2 : 1.7}
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#EA580C] px-1 text-[9px] font-bold text-white tabular-nums">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function NavSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="px-3 mb-1 text-[10px] font-semibold tracking-[0.1em] text-[rgba(255,255,255,0.2)] uppercase">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarContent({
  profile,
  notifCount,
  onNavClick,
}: {
  profile: Profile | null;
  notifCount: number;
  onNavClick?: () => void;
}) {
  const daysLeft = profile?.trial_start_date
    ? getTrialDaysLeft(profile.trial_start_date)
    : 14;
  const isTrial =
    !profile?.subscription_status ||
    profile?.subscription_status === "trialing";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[rgba(255,255,255,0.07)]">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] bg-[#EA580C]">
          <HardHat className="h-[16px] w-[16px] text-white" strokeWidth={2} />
        </div>
        <span className="text-white font-bold text-[15px] tracking-[-0.02em]">
          ContractHub
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <NavSection label="Workspace">
          {workNav.map((item) => (
            <NavItem key={item.href} {...item} onClick={onNavClick} />
          ))}
        </NavSection>

        <NavSection label="Finances">
          {financeNav.map((item) => (
            <NavItem key={item.href} {...item} onClick={onNavClick} />
          ))}
        </NavSection>

        <NavSection label="Account">
          {activityNav.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              badge={item.label === "Activity" ? notifCount : undefined}
              onClick={onNavClick}
            />
          ))}
        </NavSection>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div className="mx-3 mb-4 rounded-[8px] bg-white/[0.06] border border-white/[0.08] p-3.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-[rgba(255,255,255,0.35)] uppercase tracking-[0.08em]">
              Free Trial
            </p>
            <span className="text-[11px] font-medium text-[#94A3B8] tabular-nums">
              {daysLeft}d left
            </span>
          </div>
          <div className="w-full h-[3px] rounded-full bg-white/[0.1] mb-3">
            <div
              className="h-[3px] rounded-full bg-[#EA580C] transition-all"
              style={{ width: `${Math.min(100, ((30 - daysLeft) / 30) * 100)}%` }}
            />
          </div>
          <Link
            href="/dashboard/upgrade"
            className="flex items-center justify-center gap-1.5 text-[11px] font-semibold bg-[#EA580C] text-white rounded-[6px] py-[7px] hover:bg-[#C2410C] transition-colors"
          >
            Upgrade Plan
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({
  user,
  profile,
  children,
}: {
  user: User;
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const pathname = usePathname();

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";
  const businessName = profile?.business_name || "My Business";
  const initials = getInitials(profile?.display_name, user.email || "U");
  const breadcrumb = getBreadcrumb(pathname);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function fetchCount() {
      const since = new Date();
      since.setHours(since.getHours() - 24);
      const isoSince = since.toISOString();

      const [jobsRes, invRes] = await Promise.allSettled([
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .gte("updated_at", isoSince),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .gte("updated_at", isoSince),
      ]);

      let total = 0;
      if (jobsRes.status === "fulfilled" && jobsRes.value.count)
        total += jobsRes.value.count;
      if (invRes.status === "fulfilled" && invRes.value.count)
        total += invRes.value.count;
      setNotifCount(total);
    }
    fetchCount();
  }, [supabase, pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-[#0D1B2A] sticky top-0 h-screen overflow-hidden">
        <SidebarContent profile={profile} notifCount={notifCount} />
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] bg-[#0D1B2A] transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-white/[0.07] text-[#64748B] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent
          profile={profile}
          notifCount={notifCount}
          onNavClick={() => setMobileOpen(false)}
        />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-[52px] bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-[#F0F4F8] text-[#64748B] transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-[#94A3B8] hidden sm:block font-medium">
                ContractHub
              </span>
              <span className="text-[#CBD5E1] hidden sm:block">/</span>
              <span className="text-[#0D1B2A] font-semibold">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Business name */}
            <span className="hidden sm:block text-[13px] text-[#94A3B8] mr-3 font-medium">
              {businessName}
            </span>

            {/* Bell */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-md hover:bg-[#F0F4F8] text-[#64748B] hover:text-[#0D1B2A] transition-colors"
            >
              <Bell className="h-4 w-4" strokeWidth={1.8} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#EA580C] px-0.5 text-[8px] font-bold text-white">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-md hover:bg-[#F0F4F8] transition-colors ml-0.5"
              >
                <div className="h-7 w-7 rounded-full bg-[#0D1B2A] flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-bold tracking-wide">
                    {initials}
                  </span>
                </div>
                <span className="hidden sm:block text-[13px] font-medium text-[#0D1B2A]">
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-[#94A3B8] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-[8px] shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] border border-[#E2E8F0] py-1 z-50 overflow-hidden">
                  <div className="px-3.5 py-2.5 border-b border-[#E2E8F0]">
                    <p className="text-[13px] font-semibold text-[#0D1B2A]">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-0.5">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#374151] hover:bg-[#F0F4F8] transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-[14px] w-[14px] text-[#64748B]" strokeWidth={1.8} />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[#E2E8F0] py-0.5">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-[14px] w-[14px]" strokeWidth={1.8} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
