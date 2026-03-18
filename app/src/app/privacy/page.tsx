import Link from "next/link";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";

const serif = Instrument_Serif({ subsets: ["latin"], weight: ["400"] });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Privacy Policy — MaidHub",
};

export default function PrivacyPage() {
  return (
    <div className={`${sans.className} min-h-screen bg-[#F6F4F1]`}>
      {/* Header */}
      <header className="border-b border-[#E2DED8] bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-[6px] bg-[#18181B] flex items-center justify-center">
              <span className={`${serif.className} text-white text-[13px] italic font-bold leading-none`}>M</span>
            </div>
            <span className={`${serif.className} text-[#18181B] font-semibold text-[15px] tracking-[-0.02em]`}>MaidHub</span>
          </Link>
          <Link href="/login" className="text-[13px] font-medium text-[#18181B]/50 hover:text-[#18181B] transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#18181B]/35 mb-3">Legal</p>
          <h1 className={`${serif.className} text-[36px] text-[#18181B] tracking-[-0.02em] leading-tight`}>
            Privacy Policy
          </h1>
          <p className="text-[13px] text-[#18181B]/45 mt-2">Last updated: March 2026</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E2DED8] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-8 space-y-8 text-[14px] text-[#18181B]/75 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">1. Introduction</h2>
            <p>MaidHub (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates a business management platform for solo cleaning business owners. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>
            <p>By using MaidHub, you agree to the collection and use of information in accordance with this policy.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">2. Information We Collect</h2>
            <p><strong className="text-[#18181B]">Account information:</strong> When you create an account, we collect your name, email address, and business name.</p>
            <p><strong className="text-[#18181B]">Business data:</strong> Information you enter about your clients, jobs, invoices, and estimates. This data belongs to you and is stored securely in our database.</p>
            <p><strong className="text-[#18181B]">Payment information:</strong> We use Square to process payments. We do not store your full payment card information. Square&rsquo;s privacy policy governs how payment data is handled.</p>
            <p><strong className="text-[#18181B]">Usage data:</strong> We may collect information about how you interact with our platform (page visits, feature usage) to improve the service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">3. How We Use Your Information</h2>
            <ul className="space-y-2 list-none">
              {[
                "Provide, maintain, and improve the MaidHub platform",
                "Process transactions and send related information",
                "Send account notifications and service updates",
                "Respond to your comments and questions",
                "Monitor usage to detect and prevent fraud or abuse",
                "Comply with legal obligations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2A7C6F] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">4. Data Storage and Security</h2>
            <p>Your data is stored using Supabase, a secure cloud database provider hosted on AWS. We use row-level security to ensure each user can only access their own data.</p>
            <p>We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">5. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist in operating our platform:</p>
            <ul className="space-y-2 list-none">
              {[
                "Supabase — database and authentication",
                "Square — payment processing",
                "Vercel — application hosting",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#18181B]/25 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p>These providers are bound by their own privacy policies and are contractually obligated to protect your information.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="space-y-2 list-none">
              {[
                "Access the personal data we hold about you",
                "Request correction of inaccurate data",
                "Request deletion of your account and associated data",
                "Export your data in a portable format",
                "Opt out of non-essential communications",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#2A7C6F] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p>To exercise these rights, contact us at the email below.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">7. Cookies</h2>
            <p>We use essential cookies to maintain your authenticated session. We do not use cookies for advertising or tracking across third-party websites.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">8. Children&rsquo;s Privacy</h2>
            <p>MaidHub is not directed to individuals under 18 years of age. We do not knowingly collect personal information from children.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice in the application or sending an email to your registered address.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">10. Contact</h2>
            <p>If you have questions about this Privacy Policy or your data, contact us at:</p>
            <div className="mt-3 p-4 bg-[#F6F4F1] rounded-lg border border-[#E2DED8] text-[13px]">
              <p className="font-semibold text-[#18181B]">MaidHub Support</p>
              <p className="text-[#18181B]/55 mt-1">support@maidhub.io</p>
            </div>
          </section>

        </div>

        <div className="mt-8 flex items-center justify-between text-[12px] text-[#18181B]/35">
          <span>© {new Date().getFullYear()} MaidHub</span>
          <Link href="/terms" className="hover:text-[#18181B]/60 transition-colors">Terms of Service →</Link>
        </div>
      </main>
    </div>
  );
}
