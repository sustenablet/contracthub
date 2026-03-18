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
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  display_name: string | null;
  business_name: string | null;
  subscription_status: string;
  trial_start_date: string;
}

const homeNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
];

const financeNav = [
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/estimates", label: "Estimates", icon: FileText },
];

const activityNav = [
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
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
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? "bg-[#1A2332]/[0.06] text-[#1A2332] border-l-[3px] border-[#1A2332] rounded-l-none pl-[10px]"
          : "text-[#1A2332]/50 hover:bg-[#1A2332]/[0.04] hover:text-[#1A2332]/80 border-l-[3px] border-transparent rounded-l-none pl-[10px]"
      }`}
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.8} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1A2332] px-1 text-[9px] font-bold text-white">
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
      <p
        className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#1A2332]/30 uppercase"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
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
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A2332]">
          <span
            className="text-[#A3E635] font-bold text-base leading-none"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            M
          </span>
        </div>
        <span
          className="text-[#1A2332] font-bold text-[17px] tracking-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          MaidHub
        </span>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-1 space-y-5 overflow-y-auto">
        <NavSection label="Home">
          {homeNav.map((item) => (
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
              badge={item.label === "Notifications" ? notifCount : undefined}
              onClick={onNavClick}
            />
          ))}
        </NavSection>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div className="mx-3 mb-4 rounded-xl bg-[#1A2332] p-4">
          <p
            className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.08em] mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Free Trial
          </p>
          <p
            className="text-[13px] text-white/80 mb-3 leading-relaxed"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="text-white font-semibold">{daysLeft} days</span>{" "}
            remaining
          </p>
          <Link
            href="/dashboard/upgrade"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-white text-[#1A2332] rounded-lg py-2 hover:bg-white/90 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fetch recent activity count (last 24h)
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
    <div className="flex min-h-screen bg-[#F7F7F5]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[232px] shrink-0 flex-col bg-[#F0EFEB] border-r border-[#1A2332]/[0.06] sticky top-0 h-screen overflow-hidden">
        <SidebarContent profile={profile} notifCount={notifCount} />
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#1A2332]/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[232px] bg-[#F0EFEB] border-r border-[#1A2332]/[0.06] transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[#1A2332]/5 text-[#1A2332]/40 transition-colors"
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
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-md border-b border-[#1A2332]/[0.06] flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-[#1A2332]/50 transition-colors"
            >
              <Menu className="h-4 w-4" />
            </button>
            {/* Breadcrumb */}
            <div
              className="flex items-center gap-2 text-sm"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <span className="text-[#1A2332]/25 hidden sm:block">Home</span>
              <span className="text-[#1A2332]/15 hidden sm:block">/</span>
              <span className="text-[#1A2332] font-semibold">{breadcrumb}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Business name */}
            <span
              className="hidden sm:block text-[13px] text-[#1A2332]/35 mr-3 font-medium"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {businessName}
            </span>

            {/* Bell */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-lg hover:bg-[#1A2332]/[0.04] text-[#1A2332]/40 hover:text-[#1A2332] transition-colors"
            >
              <Bell className="h-4 w-4" strokeWidth={1.8} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#1A2332] px-0.5 text-[8px] font-bold text-white">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-lg hover:bg-[#1A2332]/[0.04] transition-colors ml-0.5"
              >
                <div className="h-7 w-7 rounded-full bg-[#1A2332]/[0.08] flex items-center justify-center shrink-0">
                  <span
                    className="text-[#1A2332] text-[10px] font-bold"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {initials}
                  </span>
                </div>
                <span
                  className="hidden sm:block text-[13px] font-semibold text-[#1A2332]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {displayName}
                </span>
                <ChevronDown
                  className={`h-3 w-3 text-[#1A2332]/30 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-[#1A2332]/[0.08] py-1 z-50 overflow-hidden">
                  <div className="px-3.5 py-2.5 border-b border-[#1A2332]/[0.05]">
                    <p
                      className="text-[13px] font-semibold text-[#1A2332]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {displayName}
                    </p>
                    <p className="text-[11px] text-[#1A2332]/40 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-0.5">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#1A2332]/65 hover:bg-[#1A2332]/[0.03] hover:text-[#1A2332] transition-colors"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-[14px] w-[14px]" strokeWidth={1.8} />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[#1A2332]/[0.05] py-0.5">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-[13px] text-red-500/80 hover:bg-red-50/50 hover:text-red-600 transition-colors"
                      style={{ fontFamily: "'Syne', sans-serif" }}
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
