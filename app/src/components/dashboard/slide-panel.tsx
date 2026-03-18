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
        className={`fixed inset-0 z-40 bg-[#18181B]/25 backdrop-blur-[2px] transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 ${width} bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.06)] transform transition-transform duration-300 ease-out flex flex-col border-l border-[#E2DED8] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4.5 border-b border-[#ECEAE6] shrink-0">
          <div>
            <h2 className="text-[16px] font-semibold text-[#18181B] font-display tracking-[-0.01em]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12px] text-[#18181B]/38 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#18181B]/[0.05] text-[#18181B]/35 hover:text-[#18181B]/60 transition-colors -mr-1.5 mt-0.5"
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
      <p className="text-[10px] font-bold tracking-[0.1em] text-[#18181B]/30 uppercase">
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
      <label className="text-[12px] font-semibold text-[#18181B]/65">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
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
      className={`w-full px-3 py-2 text-[13px] bg-[#F6F4F1] border border-[#E2DED8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18181B]/[0.06] focus:border-[#18181B]/20 transition-all placeholder:text-[#18181B]/25 ${props.className || ""}`}
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
      className={`w-full px-3 py-2 text-[13px] bg-[#F6F4F1] border border-[#E2DED8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18181B]/[0.06] focus:border-[#18181B]/20 transition-all placeholder:text-[#18181B]/25 resize-none ${props.className || ""}`}
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
      className={`w-full px-3 py-2 text-[13px] bg-[#F6F4F1] border border-[#E2DED8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#18181B]/[0.06] focus:border-[#18181B]/20 transition-all ${props.className || ""}`}
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
    <div className="sticky bottom-0 bg-white border-t border-[#ECEAE6] px-6 py-4 flex items-center justify-end gap-2.5">
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
      className={`px-5 py-2 bg-[#18181B] hover:bg-[#18181B]/88 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ""}`}
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
      className={`px-5 py-2 text-[13px] font-semibold text-[#18181B]/55 bg-white border border-[#E2DED8] rounded-lg hover:bg-[#F6F4F1] transition-colors ${props.className || ""}`}
      style={props.style}
    >
      {children}
    </button>
  );
}
