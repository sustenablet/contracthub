import Link from "next/link";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";

const serif = Instrument_Serif({ subsets: ["latin"], weight: ["400"] });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Terms of Service — MaidHub",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-[13px] text-[#18181B]/45 mt-2">Last updated: March 2026</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E2DED8] shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-8 space-y-8 text-[14px] text-[#18181B]/75 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">1. Agreement to Terms</h2>
            <p>By accessing or using MaidHub (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not use the Service.</p>
            <p>MaidHub is operated as a business management platform for solo residential and small-office cleaning business owners.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">2. Use of the Service</h2>
            <p>You may use the Service only for lawful business purposes. You agree not to:</p>
            <ul className="space-y-2 list-none">
              {[
                "Use the Service for any illegal or unauthorized purpose",
                "Attempt to gain unauthorized access to any part of the Service",
                "Interfere with or disrupt the integrity or performance of the Service",
                "Upload or transmit malicious code or content",
                "Resell or sublicense the Service without written permission",
                "Scrape, crawl, or extract data from the Service using automated means",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#18181B]/25 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">3. Accounts</h2>
            <p>You are responsible for maintaining the security of your account and password. MaidHub cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
            <p>You are responsible for all content posted and activity that occurs under your account. Each account is for a single user only — one account per cleaning business owner.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">4. Free Trial and Subscription</h2>
            <p>MaidHub offers a 30-day free trial upon account creation. No credit card is required to start the trial.</p>
            <p>After the trial period, continued use of the Service requires a paid subscription at the then-current pricing. Subscriptions are billed monthly or annually through our payment processor (Square).</p>
            <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">5. Your Content</h2>
            <p>You retain ownership of all data and content you enter into MaidHub, including client information, job records, invoices, and estimates (&ldquo;Your Content&rdquo;).</p>
            <p>By using the Service, you grant MaidHub a limited license to store, process, and display Your Content solely to provide the Service to you.</p>
            <p>You are responsible for ensuring Your Content complies with applicable laws, including data protection regulations governing your clients&rsquo; personal information.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">6. Privacy</h2>
            <p>Your use of the Service is also governed by our <Link href="/privacy" className="text-[#2A7C6F] hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">7. Service Availability</h2>
            <p>We strive for high availability but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience outages beyond our control. We are not liable for any loss caused by service downtime.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, MaidHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the Service.</p>
            <p>Our total liability for any claim arising from these Terms or your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">9. Disclaimer of Warranties</h2>
            <p>The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our sole discretion if you violate these Terms or engage in conduct we determine to be harmful to the Service or other users.</p>
            <p>You may delete your account at any time by contacting support. Upon deletion, your data will be removed within 30 days.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">11. Changes to Terms</h2>
            <p>We may modify these Terms at any time. We will provide notice of significant changes by posting an updated version in the application and updating the &ldquo;Last updated&rdquo; date above. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">12. Governing Law</h2>
            <p>These Terms shall be governed by the laws of the United States. Any disputes shall be resolved through binding arbitration rather than in court, except that either party may seek injunctive relief in court for intellectual property violations.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[16px] font-semibold text-[#18181B]">13. Contact</h2>
            <p>For questions about these Terms, contact us at:</p>
            <div className="mt-3 p-4 bg-[#F6F4F1] rounded-lg border border-[#E2DED8] text-[13px]">
              <p className="font-semibold text-[#18181B]">MaidHub Support</p>
              <p className="text-[#18181B]/55 mt-1">support@maidhub.io</p>
            </div>
          </section>

        </div>

        <div className="mt-8 flex items-center justify-between text-[12px] text-[#18181B]/35">
          <span>© {new Date().getFullYear()} MaidHub</span>
          <Link href="/privacy" className="hover:text-[#18181B]/60 transition-colors">Privacy Policy →</Link>
        </div>
      </main>
    </div>
  );
}
