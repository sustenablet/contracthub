"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  User,
  Building2,
  Phone,
  Loader2,
  Briefcase,
  Plus,
  X,
  Shield,
  ArrowUpRight,
  MapPin,
  Mail,
  Bell,
  DollarSign,
  Clock,
  Percent,
  Hash,
  AlertTriangle,
} from "lucide-react";
import { SERVICE_TYPES } from "@/lib/types";
import Link from "next/link";

const syne = { fontFamily: "'Syne', sans-serif" } as const;
const fraunces = { fontFamily: "'Fraunces', serif" } as const;

type SettingsTab = "profile" | "business" | "notifications" | "account";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "profile", label: "Profile", icon: User, description: "Your personal info" },
  { id: "business", label: "Business", icon: Building2, description: "Services & pricing" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Email preferences" },
  { id: "account", label: "Account", icon: Shield, description: "Plan & security" },
];

/* ─── Reusable components ────────────────────────────── */

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-1">
      <h3 className="text-[14px] font-bold text-[#1A2332]" style={syne}>{title}</h3>
      {description && (
        <p className="text-[12px] text-[#1A2332]/35 mt-0.5" style={syne}>{description}</p>
      )}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  hint,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1A2332]/50" style={syne}>
        {Icon && <Icon className="h-3 w-3" strokeWidth={1.8} />}
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-[#1A2332]/25" style={syne}>{hint}</p>
      )}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-[#1A2332]/[0.015] border border-[#1A2332]/[0.08] rounded-lg outline-none transition-all focus:border-[#1A2332]/20 focus:shadow-[0_0_0_3px_rgba(26,35,50,0.04)] placeholder:text-[#1A2332]/20 ${className || ""}`}
      style={{ ...syne, ...props.style }}
    />
  );
}

function TextArea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-[#1A2332]/[0.015] border border-[#1A2332]/[0.08] rounded-lg outline-none transition-all focus:border-[#1A2332]/20 focus:shadow-[0_0_0_3px_rgba(26,35,50,0.04)] placeholder:text-[#1A2332]/20 resize-none ${className || ""}`}
      style={{ ...syne, ...props.style }}
    />
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
        enabled ? "bg-[#1A2332]" : "bg-[#1A2332]/[0.12]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function NotifRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#1A2332]/[0.04] last:border-0">
      <div className="pr-4">
        <p className="text-[13px] font-semibold text-[#1A2332]" style={syne}>{label}</p>
        <p className="text-[12px] text-[#1A2332]/35 mt-0.5 leading-relaxed" style={syne}>{description}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#1A2332]/[0.06] shadow-sm overflow-hidden">
      {children}
    </div>
  );
}

function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="px-6 py-4 border-b border-[#1A2332]/[0.05]">
      <h2 className="text-[15px] font-bold text-[#1A2332]" style={syne}>{title}</h2>
      {description && (
        <p className="text-[12px] text-[#1A2332]/35 mt-0.5" style={syne}>{description}</p>
      )}
    </div>
  );
}

function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-5 ${className || ""}`}>{children}</div>;
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-t border-[#1A2332]/[0.05] flex justify-end gap-3">
      {children}
    </div>
  );
}

function SaveButton({ loading, onClick }: { loading: boolean; onClick?: () => void }) {
  return (
    <button
      type="submit"
      disabled={loading}
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2 bg-[#1A2332] hover:bg-[#1A2332]/90 text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={syne}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {loading ? "Saving..." : "Save Changes"}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────── */

export default function SettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [initialLoading, setInitialLoading] = useState(true);

  // Profile
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessStreet, setBusinessStreet] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessZip, setBusinessZip] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Business
  const [serviceTypes, setServiceTypes] = useState<string[]>([...SERVICE_TYPES]);
  const [newService, setNewService] = useState("");
  const [defaultRate, setDefaultRate] = useState("50");
  const [taxRate, setTaxRate] = useState("0");
  const [paymentTerms, setPaymentTerms] = useState("14");
  const [defaultDuration, setDefaultDuration] = useState("120");

  // Notifications
  const [notifJobReminder, setNotifJobReminder] = useState(true);
  const [notifInvoiceReminder, setNotifInvoiceReminder] = useState(true);
  const [notifPaymentReceived, setNotifPaymentReceived] = useState(true);
  const [notifNewClient, setNotifNewClient] = useState(false);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);

  // Account
  const [subscriptionStatus, setSubscriptionStatus] = useState("trialing");
  const [subscriptionPlan, setSubscriptionPlan] = useState("solo");
  const [trialStart, setTrialStart] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data } = await supabase
        .from("users")
        .select("display_name, business_name, phone, subscription_status, subscription_plan, trial_start_date")
        .eq("id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setBusinessName(data.business_name || "");
        setPhone(data.phone || "");
        setSubscriptionStatus(data.subscription_status || "trialing");
        setSubscriptionPlan(data.subscription_plan || "solo");
        setTrialStart(data.trial_start_date || "");
      }
      setInitialLoading(false);
    }
    load();
  }, [supabase]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        display_name: displayName,
        business_name: businessName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated");
    }
    setProfileSaving(false);
  }

  function addServiceType() {
    const trimmed = newService.trim();
    if (!trimmed) return;
    if (serviceTypes.includes(trimmed)) {
      toast.error("Already exists");
      return;
    }
    setServiceTypes((prev) => [...prev, trimmed]);
    setNewService("");
    toast.success(`Added "${trimmed}"`);
  }

  function removeServiceType(index: number) {
    const removed = serviceTypes[index];
    setServiceTypes((prev) => prev.filter((_, i) => i !== index));
    toast.success(`Removed "${removed}"`);
  }

  function getTrialDaysLeft() {
    if (!trialStart) return 14;
    const end = new Date(trialStart);
    end.setDate(end.getDate() + 30);
    const diff = Math.ceil((end.getTime() - Date.now()) / 86400000);
    return Math.max(0, diff);
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 text-[#1A2332]/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A2332]" style={fraunces}>
          Settings
        </h1>
        <p className="text-[13px] text-[#1A2332]/40 mt-0.5" style={syne}>
          Manage your profile, business, and account preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all whitespace-nowrap lg:whitespace-normal min-w-fit ${
                    isActive
                      ? "bg-white shadow-sm border border-[#1A2332]/[0.06] text-[#1A2332]"
                      : "text-[#1A2332]/40 hover:text-[#1A2332]/65 hover:bg-[#1A2332]/[0.02]"
                  }`}
                  style={syne}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? "bg-[#1A2332]/[0.06]" : "bg-transparent"
                  }`}>
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-[13px] font-semibold leading-tight">{tab.label}</p>
                    <p className={`text-[11px] mt-0.5 ${isActive ? "text-[#1A2332]/40" : "text-[#1A2332]/25"}`}>
                      {tab.description}
                    </p>
                  </div>
                  <span className="lg:hidden text-[13px] font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ─── PROFILE TAB ─────────────────────────────── */}
          {activeTab === "profile" && (
            <>
              <Card>
                <CardHeader title="Personal Information" description="How you appear across MaidHub" />
                <form onSubmit={handleProfileSave}>
                  <CardBody className="space-y-5">
                    {/* Avatar + name row */}
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-[#1A2332]/[0.07] flex items-center justify-center shrink-0">
                        <span className="text-[#1A2332] text-lg font-bold" style={syne}>
                          {displayName ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
                        </span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <Field label="Display Name" icon={User}>
                          <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your full name"
                          />
                        </Field>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email Address" icon={Mail} hint="Managed by your login provider">
                        <Input value={email} disabled className="opacity-50 cursor-not-allowed" />
                      </Field>
                      <Field label="Phone Number" icon={Phone}>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 000-0000"
                        />
                      </Field>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <SaveButton loading={profileSaving} />
                  </CardFooter>
                </form>
              </Card>

              <Card>
                <CardHeader title="Business Details" description="Your cleaning business information shown on invoices and estimates" />
                <form onSubmit={handleProfileSave}>
                  <CardBody className="space-y-4">
                    <Field label="Business Name" icon={Building2}>
                      <Input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Sparkling Clean Co."
                      />
                    </Field>

                    <SectionHeader title="Business Address" description="Appears on your invoices and estimates" />
                    <Field label="Street Address" icon={MapPin}>
                      <Input
                        value={businessStreet}
                        onChange={(e) => setBusinessStreet(e.target.value)}
                        placeholder="123 Main St, Suite 4"
                      />
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="City">
                        <Input
                          value={businessCity}
                          onChange={(e) => setBusinessCity(e.target.value)}
                          placeholder="Brooklyn"
                        />
                      </Field>
                      <Field label="State">
                        <Input
                          value={businessState}
                          onChange={(e) => setBusinessState(e.target.value)}
                          placeholder="NY"
                        />
                      </Field>
                      <Field label="ZIP">
                        <Input
                          value={businessZip}
                          onChange={(e) => setBusinessZip(e.target.value)}
                          placeholder="11201"
                        />
                      </Field>
                    </div>
                  </CardBody>
                  <CardFooter>
                    <SaveButton loading={profileSaving} />
                  </CardFooter>
                </form>
              </Card>
            </>
          )}

          {/* ─── BUSINESS TAB ────────────────────────────── */}
          {activeTab === "business" && (
            <>
              <Card>
                <CardHeader title="Service Types" description="The cleaning services you offer. These appear in job and estimate forms." />
                <CardBody className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add a new service type..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addServiceType();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addServiceType}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#1A2332] hover:bg-[#1A2332]/90 text-white text-[13px] font-semibold rounded-lg transition-colors shrink-0"
                      style={syne}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      Add
                    </button>
                  </div>

                  <div className="space-y-1">
                    {serviceTypes.map((service, index) => (
                      <div
                        key={`${service}-${index}`}
                        className="flex items-center gap-3 px-3 py-2.5 bg-[#1A2332]/[0.015] border border-[#1A2332]/[0.05] rounded-lg group hover:bg-[#1A2332]/[0.03] transition-colors"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-[#1A2332]/20 shrink-0" />
                        <span className="flex-1 text-[13px] text-[#1A2332]/70" style={syne}>
                          {service}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeServiceType(index)}
                          className="p-1 rounded text-[#1A2332]/15 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#1A2332]/25" style={syne}>
                    {serviceTypes.length} service type{serviceTypes.length !== 1 ? "s" : ""} configured
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Default Pricing" description="Defaults when creating new jobs and invoices. You can always override per-job." />
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Default Hourly Rate" icon={DollarSign} hint="Used when creating new jobs">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#1A2332]/30" style={syne}>$</span>
                        <Input
                          type="number"
                          min="0"
                          step="5"
                          value={defaultRate}
                          onChange={(e) => setDefaultRate(e.target.value)}
                          className="pl-7"
                          placeholder="50"
                        />
                      </div>
                    </Field>

                    <Field label="Tax Rate" icon={Percent} hint="Applied to invoice totals">
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={taxRate}
                          onChange={(e) => setTaxRate(e.target.value)}
                          className="pr-7"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#1A2332]/30" style={syne}>%</span>
                      </div>
                    </Field>

                    <Field label="Default Job Duration" icon={Clock} hint="Minutes per cleaning session">
                      <div className="relative">
                        <Input
                          type="number"
                          min="30"
                          step="15"
                          value={defaultDuration}
                          onChange={(e) => setDefaultDuration(e.target.value)}
                          className="pr-12"
                          placeholder="120"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#1A2332]/25" style={syne}>min</span>
                      </div>
                    </Field>

                    <Field label="Payment Terms" icon={Hash} hint="Days until invoice is due">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#1A2332]/25" style={syne}>Net</span>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          className="pl-10"
                          placeholder="14"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#1A2332]/25" style={syne}>days</span>
                      </div>
                    </Field>
                  </div>
                </CardBody>
                <CardFooter>
                  <button
                    type="button"
                    onClick={() => toast.success("Business defaults saved")}
                    className="flex items-center gap-2 px-5 py-2 bg-[#1A2332] hover:bg-[#1A2332]/90 text-white text-[13px] font-semibold rounded-lg transition-colors"
                    style={syne}
                  >
                    Save Defaults
                  </button>
                </CardFooter>
              </Card>
            </>
          )}

          {/* ─── NOTIFICATIONS TAB ───────────────────────── */}
          {activeTab === "notifications" && (
            <>
              <Card>
                <CardHeader title="Email Notifications" description="Choose which emails you receive. You can change these at any time." />
                <CardBody>
                  <NotifRow
                    label="Job reminders"
                    description="Get reminded about upcoming jobs the day before they're scheduled"
                    enabled={notifJobReminder}
                    onChange={setNotifJobReminder}
                  />
                  <NotifRow
                    label="Invoice reminders"
                    description="Automatic reminder when an invoice is approaching its due date"
                    enabled={notifInvoiceReminder}
                    onChange={setNotifInvoiceReminder}
                  />
                  <NotifRow
                    label="Payment received"
                    description="Get notified when a client pays an invoice"
                    enabled={notifPaymentReceived}
                    onChange={setNotifPaymentReceived}
                  />
                  <NotifRow
                    label="New client added"
                    description="Confirmation when a new client is added to your account"
                    enabled={notifNewClient}
                    onChange={setNotifNewClient}
                  />
                  <NotifRow
                    label="Weekly summary"
                    description="A digest of your jobs, revenue, and activity from the past week"
                    enabled={notifWeeklySummary}
                    onChange={setNotifWeeklySummary}
                  />
                </CardBody>
                <CardFooter>
                  <button
                    type="button"
                    onClick={() => toast.success("Notification preferences saved")}
                    className="flex items-center gap-2 px-5 py-2 bg-[#1A2332] hover:bg-[#1A2332]/90 text-white text-[13px] font-semibold rounded-lg transition-colors"
                    style={syne}
                  >
                    Save Preferences
                  </button>
                </CardFooter>
              </Card>

              <div className="bg-[#1A2332]/[0.02] rounded-xl border border-[#1A2332]/[0.05] px-5 py-4">
                <p className="text-[12px] text-[#1A2332]/35 leading-relaxed" style={syne}>
                  Email notifications are sent to <span className="font-semibold text-[#1A2332]/50">{email}</span>.
                  To change your email address, update it through your login provider.
                </p>
              </div>
            </>
          )}

          {/* ─── ACCOUNT TAB ─────────────────────────────── */}
          {activeTab === "account" && (
            <>
              <Card>
                <CardHeader title="Subscription" />
                <CardBody className="space-y-0">
                  <div className="flex items-center justify-between py-3.5 border-b border-[#1A2332]/[0.04]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A2332]" style={syne}>Current Plan</p>
                      <p className="text-[12px] text-[#1A2332]/35 mt-0.5" style={syne}>
                        {subscriptionPlan === "solo" ? "Solo Cleaner" : "Team"} Plan
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-1 text-[10px] font-semibold bg-[#1A2332]/[0.06] text-[#1A2332]/60 rounded-md uppercase tracking-wider"
                      style={syne}
                    >
                      {subscriptionStatus}
                    </span>
                  </div>

                  {subscriptionStatus === "trialing" && (
                    <div className="flex items-center justify-between py-3.5 border-b border-[#1A2332]/[0.04]">
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A2332]" style={syne}>Trial Period</p>
                        <p className="text-[12px] text-[#1A2332]/35 mt-0.5" style={syne}>
                          {getTrialDaysLeft()} days remaining in your free trial
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-[#1A2332]/[0.05] flex items-center justify-center">
                        <Clock className="h-4 w-4 text-[#1A2332]/40" strokeWidth={1.8} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3.5 border-b border-[#1A2332]/[0.04]">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A2332]" style={syne}>Email</p>
                      <p className="text-[12px] text-[#1A2332]/35 mt-0.5" style={syne}>{email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A2332]" style={syne}>Payment Method</p>
                      <p className="text-[12px] text-[#1A2332]/35 mt-0.5" style={syne}>
                        {subscriptionStatus === "trialing" ? "No payment method on file" : "Managed by Square"}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {subscriptionStatus === "trialing" && (
                <Link
                  href="/dashboard/upgrade"
                  className="flex items-center justify-between p-5 bg-[#1A2332] rounded-2xl group hover:bg-[#1A2332]/95 transition-colors"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-white" style={syne}>
                      Upgrade your plan
                    </p>
                    <p className="text-[12px] text-white/45 mt-0.5" style={syne}>
                      Get unlimited access to all MaidHub features
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/40 group-hover:text-white transition-colors" strokeWidth={1.8} />
                </Link>
              )}

              <Card>
                <div className="px-6 py-4 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={1.8} />
                    <h2 className="text-[15px] font-bold text-red-500" style={syne}>Danger Zone</h2>
                  </div>
                </div>
                <CardBody className="space-y-3">
                  <p className="text-[12px] text-[#1A2332]/40 leading-relaxed" style={syne}>
                    Deleting your account is permanent. All your data including clients, jobs, invoices,
                    and estimates will be permanently removed. This action cannot be undone.
                  </p>
                  <button
                    type="button"
                    onClick={() => toast.error("Contact support to delete your account")}
                    className="px-4 py-2 text-[13px] font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                    style={syne}
                  >
                    Delete Account
                  </button>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
