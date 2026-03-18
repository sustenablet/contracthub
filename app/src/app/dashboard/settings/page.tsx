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
} from "lucide-react";
import { SERVICE_TYPES } from "@/lib/types";
import Link from "next/link";

const syne = { fontFamily: "'Syne', sans-serif" } as const;
const fraunces = { fontFamily: "'Fraunces', serif" } as const;

type SettingsTab = "profile" | "services" | "account";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "account", label: "Account", icon: Shield },
];

export default function SettingsPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("trialing");

  // Service types management
  const [serviceTypes, setServiceTypes] = useState<string[]>([...SERVICE_TYPES]);
  const [newService, setNewService] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");

      const { data } = await supabase
        .from("users")
        .select("display_name, business_name, phone, subscription_status")
        .eq("id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setBusinessName(data.business_name || "");
        setPhone(data.phone || "");
        setSubscriptionStatus(data.subscription_status || "trialing");
      }
      setInitialLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
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
    setLoading(false);
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
    const name = serviceTypes[index];
    setServiceTypes((prev) => prev.filter((_, i) => i !== index));
    toast.success(`Removed "${name}"`);
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
          Manage your profile and business preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Tab navigation — vertical on desktop, horizontal on mobile */}
        <div className="md:w-48 shrink-0">
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#1A2332]/[0.06] text-[#1A2332]"
                      : "text-[#1A2332]/40 hover:text-[#1A2332]/70 hover:bg-[#1A2332]/[0.03]"
                  }`}
                  style={syne}
                >
                  <Icon className="h-[15px] w-[15px]" strokeWidth={1.8} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-[#1A2332]/[0.06] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1A2332]/[0.05]">
                <h2 className="text-[15px] font-bold text-[#1A2332]" style={syne}>
                  Profile Information
                </h2>
                <p className="text-[12px] text-[#1A2332]/35 mt-0.5" style={syne}>
                  Your personal and business details
                </p>
              </div>

              <form onSubmit={handleSave}>
                <div className="px-6 py-5 space-y-4">
                  <SettingsField label="Display Name" icon={User}>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="settings-input"
                      style={syne}
                    />
                  </SettingsField>

                  <SettingsField label="Business Name" icon={Building2}>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Sparkling Clean Co."
                      className="settings-input"
                      style={syne}
                    />
                  </SettingsField>

                  <SettingsField label="Phone Number" icon={Phone}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="settings-input"
                      style={syne}
                    />
                  </SettingsField>
                </div>

                <div className="px-6 py-4 border-t border-[#1A2332]/[0.05] flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 bg-[#1A2332] hover:bg-[#1A2332]/90 text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={syne}
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "services" && (
            <div className="bg-white rounded-2xl border border-[#1A2332]/[0.06] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1A2332]/[0.05]">
                <h2 className="text-[15px] font-bold text-[#1A2332]" style={syne}>
                  Service Types
                </h2>
                <p className="text-[12px] text-[#1A2332]/35 mt-0.5" style={syne}>
                  Manage the cleaning services you offer. These appear in job and estimate forms.
                </p>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Add new */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add a new service type..."
                    className="settings-input flex-1"
                    style={syne}
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1A2332] hover:bg-[#1A2332]/90 text-white text-[13px] font-semibold rounded-lg transition-colors"
                    style={syne}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    Add
                  </button>
                </div>

                {/* Service list */}
                <div className="space-y-1">
                  {serviceTypes.map((service, index) => (
                    <div
                      key={`${service}-${index}`}
                      className="flex items-center gap-3 px-3 py-2.5 bg-[#1A2332]/[0.02] border border-[#1A2332]/[0.05] rounded-lg group hover:bg-[#1A2332]/[0.04] transition-colors"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[#1A2332]/20 shrink-0" />
                      <span className="flex-1 text-[13px] text-[#1A2332]/75" style={syne}>
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
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#1A2332]/[0.06] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1A2332]/[0.05]">
                  <h2 className="text-[15px] font-bold text-[#1A2332]" style={syne}>
                    Account Details
                  </h2>
                </div>

                <div className="divide-y divide-[#1A2332]/[0.04]">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A2332]" style={syne}>
                        Email
                      </p>
                      <p className="text-[12px] text-[#1A2332]/40 mt-0.5" style={syne}>
                        {email || "Managed by auth provider"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A2332]" style={syne}>
                        Current Plan
                      </p>
                      <p className="text-[12px] text-[#1A2332]/40 mt-0.5" style={syne}>
                        {subscriptionStatus === "trialing" ? "Free Trial" : "Solo Plan"}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-1 text-[10px] font-semibold bg-[#1A2332]/[0.06] text-[#1A2332]/60 rounded-md uppercase tracking-wider"
                      style={syne}
                    >
                      {subscriptionStatus}
                    </span>
                  </div>
                </div>
              </div>

              {subscriptionStatus === "trialing" && (
                <Link
                  href="/dashboard/upgrade"
                  className="flex items-center justify-between p-5 bg-[#1A2332] rounded-2xl group hover:bg-[#1A2332]/95 transition-colors"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-white" style={syne}>
                      Upgrade your plan
                    </p>
                    <p className="text-[12px] text-white/45 mt-0.5" style={syne}>
                      Get unlimited access to all features
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/50 group-hover:text-white transition-colors" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline styles for the settings input class */}
      <style>{`
        .settings-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 13px;
          background: rgba(26, 35, 50, 0.02);
          border: 1px solid rgba(26, 35, 50, 0.08);
          border-radius: 8px;
          outline: none;
          transition: all 0.15s;
        }
        .settings-input:focus {
          border-color: rgba(26, 35, 50, 0.2);
          box-shadow: 0 0 0 3px rgba(26, 35, 50, 0.04);
        }
        .settings-input::placeholder {
          color: rgba(26, 35, 50, 0.2);
        }
      `}</style>
    </div>
  );
}

function SettingsField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const syne = { fontFamily: "'Syne', sans-serif" } as const;
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#1A2332]/50" style={syne}>
        <Icon className="h-3 w-3" strokeWidth={1.8} />
        {label}
      </label>
      {children}
    </div>
  );
}
