"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  User,
  Building2,
  Phone,
  Save,
  Loader2,
  Briefcase,
  Plus,
  X,
  GripVertical,
} from "lucide-react";
import { SERVICE_TYPES } from "@/lib/types";

const syne = { fontFamily: "'Syne', sans-serif" } as const;
const fraunces = { fontFamily: "'Fraunces', serif" } as const;

export default function SettingsPage() {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Service types management (local for MVP — stored in-memory, could extend DB later)
  const [serviceTypes, setServiceTypes] = useState<string[]>([...SERVICE_TYPES]);
  const [newService, setNewService] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("display_name, business_name, phone")
        .eq("id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setBusinessName(data.business_name || "");
        setPhone(data.phone || "");
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
      toast.success("Profile updated successfully");
    }
    setLoading(false);
  }

  function addServiceType() {
    const trimmed = newService.trim();
    if (!trimmed) return;
    if (serviceTypes.includes(trimmed)) {
      toast.error("Service type already exists");
      return;
    }
    setServiceTypes((prev) => [...prev, trimmed]);
    setNewService("");
    toast.success(`Added "${trimmed}"`);
  }

  function removeServiceType(index: number) {
    setServiceTypes((prev) => prev.filter((_, i) => i !== index));
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A2332]" style={fraunces}>
          Settings
        </h1>
        <p className="text-sm text-gray-400 mt-0.5" style={syne}>
          Manage your profile and business preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <User className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A2332]" style={syne}>
                Profile Information
              </h2>
              <p className="text-xs text-gray-400" style={syne}>
                Your personal and business details
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="px-6 py-5 space-y-4">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A2332]/70" style={syne}>
                <span className="flex items-center gap-1.5">
                  <User className="h-3 w-3" />
                  Display Name
                </span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all placeholder:text-gray-300"
                style={syne}
              />
            </div>

            {/* Business Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A2332]/70" style={syne}>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" />
                  Business Name
                </span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Sparkling Clean Co."
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all placeholder:text-gray-300"
                style={syne}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A2332]/70" style={syne}>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  Phone Number
                </span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all placeholder:text-gray-300"
                style={syne}
              />
            </div>
          </div>

          {/* Save */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={syne}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Service Types Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-50 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A2332]" style={syne}>
                Service Types
              </h2>
              <p className="text-xs text-gray-400" style={syne}>
                Manage the cleaning services you offer
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Add new */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add a new service type…"
              className="flex-1 px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all placeholder:text-gray-300"
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
              className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              style={syne}
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {/* Service list */}
          <div className="space-y-1.5">
            {serviceTypes.map((service, index) => (
              <div
                key={`${service}-${index}`}
                className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl group hover:bg-gray-100/50 transition-colors"
              >
                <GripVertical className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                <span className="flex-1 text-sm text-[#1A2332]" style={syne}>
                  {service}
                </span>
                <button
                  type="button"
                  onClick={() => removeServiceType(index)}
                  className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400" style={syne}>
            These service types appear in job and estimate forms.
          </p>
        </div>
      </div>

      {/* Account Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <span className="text-amber-600 text-sm">🔒</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A2332]" style={syne}>
                Account
              </h2>
              <p className="text-xs text-gray-400" style={syne}>
                Subscription and account management
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-[#1A2332]" style={syne}>
                Current Plan
              </p>
              <p className="text-xs text-gray-400 mt-0.5" style={syne}>
                Free Trial
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold bg-[#A3E635]/20 text-[#1A2332] rounded-full" style={syne}>
              Trialing
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-[#1A2332]" style={syne}>
                Email
              </p>
              <p className="text-xs text-gray-400 mt-0.5" style={syne}>
                Managed by your auth provider
              </p>
            </div>
            <span className="text-sm text-gray-500" style={syne}>
              Linked via login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
