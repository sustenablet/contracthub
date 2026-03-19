"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Users,
  CalendarDays,
  Receipt,
  FileText,
  RefreshCw,
  Smartphone,
  Shield,
  ArrowLeft,
  ArrowUpRight,
  Zap,
} from "lucide-react";
const features = [
  { icon: Users, label: "Unlimited clients & addresses" },
  { icon: CalendarDays, label: "Full job scheduling & calendar" },
  { icon: RefreshCw, label: "Recurring work order rules" },
  { icon: FileText, label: "Estimates with contract text" },
  { icon: Receipt, label: "Invoicing & payment tracking" },
  { icon: Smartphone, label: "Mobile-optimized interface" },
  { icon: Shield, label: "Secure cloud backup" },
  { icon: Zap, label: "Priority support" },
];

const plans = [
  {
    name: "Solo",
    price: 29,
    description: "Everything a solo contractor needs",
    popular: true,
    features: [
      "Unlimited clients",
      "Job scheduling",
      "Invoicing",
      "Estimates",
      "Calendar view",
      "Mobile access",
    ],
  },
  {
    name: "Team",
    price: 49,
    description: "For growing contractor businesses",
    popular: false,
    features: [
      "Everything in Solo",
      "Up to 5 team members",
      "Team scheduling",
      "Route optimization",
      "Client portal",
      "Advanced reports",
    ],
    comingSoon: true,
  },
];

export default function UpgradePage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  function handleSubscribe(plan: string) {
    // Phase 8 will redirect to Square checkout
    console.log(`Subscribe to ${plan} plan, billing: ${billing}`);
  }

  const yearlyDiscount = 0.8; // 20% off

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#8C7D6A] hover:text-[#E8DFD0] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-[#E8DFD0]">
          Choose your plan
        </h1>
        <p className="text-[15px] text-[#8C7D6A] max-w-md mx-auto leading-relaxed">
          Upgrade to keep managing your contracting business with all the tools you need.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 mt-5">
          <div className="flex items-center bg-white/[0.05] rounded-[6px] p-0.5">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-white text-[#E8DFD0] shadow-sm"
                  : "text-[#8C7D6A] hover:text-[#8C7D6A]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
                billing === "yearly"
                  ? "bg-white text-[#E8DFD0] shadow-sm"
                  : "text-[#8C7D6A] hover:text-[#8C7D6A]"
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold text-[#0D9488] bg-[#0D9488]/10 px-1.5 py-0.5 rounded">
                -20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const price = billing === "yearly"
            ? Math.round(plan.price * yearlyDiscount)
            : plan.price;

          return (
            <div
              key={plan.name}
              className={`relative bg-[#1F1B14] rounded-[6px] border overflow-hidden transition-all ${
                plan.popular
                  ? "border-[#1F1B14]/20 shadow-md"
                  : "border-[#312B20] shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1F1B14] text-white uppercase tracking-wider"
                  >
                    Recommended
                  </span>
                </div>
              )}

              <div className="p-6 pb-0">
                <p className="text-[13px] font-semibold text-[#8C7D6A] mb-1">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-[#E8DFD0]">
                    ${price}
                  </span>
                  <span className="text-[13px] text-[#8C7D6A]">
                    /month
                  </span>
                </div>
                {billing === "yearly" && (
                  <p className="text-[11px] text-[#8C7D6A] mb-1">
                    ${price * 12}/year, billed annually
                  </p>
                )}
                <p className="text-[13px] text-[#8C7D6A] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Features */}
                <div className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <div className="h-[18px] w-[18px] rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 mt-px">
                        <Check className="h-2.5 w-2.5 text-[#E8DFD0]" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] text-[#8C7D6A]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {plan.comingSoon ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-[6px] text-[13px] font-semibold bg-white/[0.05] text-[#8C7D6A] cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.name)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-[6px] text-[13px] font-semibold bg-[#1F1B14] text-white hover:bg-[#1F1B14]/90 transition-colors shadow-sm"
                  >
                    Get Started
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature grid */}
      <div className="bg-[#1F1B14] rounded-[6px] border border-[#312B20] p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#E8DFD0] mb-1">
          Everything included
        </h2>
        <p className="text-[13px] text-[#8C7D6A] mb-5">
          All the tools to run your contracting business efficiently
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3 p-3 rounded-[6px] bg-white/[0.02]">
              <div className="h-8 w-8 rounded-[6px] bg-white/[0.06] flex items-center justify-center shrink-0">
                <f.icon className="h-4 w-4 text-[#8C7D6A]" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-[#E8DFD0]">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-[12px] text-[#8C7D6A] pb-4">
        Powered by Square. Cancel anytime. No hidden fees.
      </p>
    </div>
  );
}
