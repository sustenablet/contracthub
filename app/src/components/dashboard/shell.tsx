"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  CreditCard,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  display_name: string | null;
  business_name: string | null;
  subscription_status: string;
  trial_start_date: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/dashboard/estimates", label: "Estimates", icon: FileText },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

function getInitials(name: string | null | undefined, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          MaidHub
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      {profile?.subscription_status === "trialing" && (
        <div className="mx-2 mb-2 rounded-md border bg-muted/50 px-3 py-2">
          <p className="text-xs font-medium">Free Trial</p>
          <p className="text-xs text-muted-foreground">
            {getTrialDaysLeft(profile.trial_start_date)} days remaining
          </p>
          <Link href="/dashboard/upgrade">
            <Button size="sm" variant="outline" className="mt-2 w-full text-xs">
              <CreditCard className="mr-1.5 h-3 w-3" />
              Upgrade
            </Button>
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
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = profile?.display_name || user.email || "User";
  const initials = getInitials(profile?.display_name, user.email || "U");

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <Sidebar profile={profile} />
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar profile={profile} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="gap-2" />}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline-block">
                {displayName}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                render={<Link href="/dashboard/settings" />}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
