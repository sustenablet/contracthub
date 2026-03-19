"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export function SlidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "w-full max-w-lg",
}: SlidePanelProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 ${width} bg-white shadow-[0_24px_64px_rgba(0,0,0,0.14),0_4px_16px_rgba(0,0,0,0.08)] transform transition-transform duration-300 ease-out flex flex-col border-l border-[#E2E8F0] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#F1F5F9] shrink-0">
          <div>
            <h2 className="text-[16px] font-bold text-[#0D1B2A] tracking-[-0.02em]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12px] text-[#64748B] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#F0F4F8] text-[#94A3B8] hover:text-[#64748B] transition-colors -mr-1.5 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

/* ── Form helpers ─────────────────────────────────────────────── */

export function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold tracking-[0.1em] text-[#94A3B8] uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-[#374151]">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function FormInput({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-white border border-[#E2E8F0] rounded-[6px] text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all placeholder:text-[#CBD5E1] ${props.className || ""}`}
      style={props.style}
    />
  );
}

export function FormTextarea({
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-white border border-[#E2E8F0] rounded-[6px] text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all placeholder:text-[#CBD5E1] resize-none ${props.className || ""}`}
      style={props.style}
    />
  );
}

export function FormSelect({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 text-[13px] bg-white border border-[#E2E8F0] rounded-[6px] text-[#0D1B2A] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] transition-all ${props.className || ""}`}
      style={props.style}
    >
      {children}
    </select>
  );
}

export function FormActions({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 bg-white border-t border-[#F1F5F9] px-6 py-4 flex items-center justify-end gap-2.5">
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-[13px] font-semibold rounded-[6px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${props.className || ""}`}
      style={props.style}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Saving…
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-5 py-2 text-[13px] font-semibold text-[#374151] bg-white border border-[#E2E8F0] rounded-[6px] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors ${props.className || ""}`}
      style={props.style}
    >
      {children}
    </button>
  );
}
