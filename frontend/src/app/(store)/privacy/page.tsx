"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Cookie,
  UserCheck,
  Share2,
  FileCheck,
  HelpCircle,
  ChevronRight,
  Search,
  CheckCircle2,
  Mail,
  Shield,
  KeyRound,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sections = [
    { id: "overview", title: "1. Privacy Overview & Commitments", icon: ShieldCheck },
    { id: "collection", title: "2. Information We Collect", icon: Database },
    { id: "usage", title: "3. How We Use Your Data", icon: FileCheck },
    { id: "sharing", title: "4. Data Sharing & Third Parties", icon: Share2 },
    { id: "cookies", title: "5. Cookies & Tracking Technologies", icon: Cookie },
    { id: "security", title: "6. Data Encryption & Security", icon: Lock },
    { id: "rights", title: "7. Your Rights & Data Control", icon: UserCheck },
    { id: "children", title: "8. Children's Privacy", icon: Eye },
    { id: "updates", title: "9. Policy Updates", icon: KeyRound },
    { id: "dpo", title: "10. Contact DPO & Support", icon: HelpCircle },
  ];

  const privacyPillars = [
    {
      icon: Lock,
      title: "256-Bit SSL Encryption",
      desc: "All network communication and checkout details are end-to-end encrypted.",
    },
    {
      icon: Shield,
      title: "Zero Data Sale",
      desc: "We strictly never sell or rent your personal information to third-party advertisers.",
    },
    {
      icon: Cookie,
      title: "Cookie Control",
      desc: "Manage tracking preferences and essential session data transparently.",
    },
    {
      icon: UserCheck,
      title: "Full Rights Control",
      desc: "Export, edit, or request full deletion of your personal account data at any time.",
    },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-emerald-900 to-zinc-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-300 backdrop-blur-md border border-teal-500/30">
            <Lock className="h-3.5 w-3.5" />
            <span>Data Protection & Privacy</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-2xl">
            At Online-Bazar, we prioritize your data privacy. Learn how we collect, protect, and handle your information across our multi-vendor marketplace platform.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-teal-200/90 pt-2 font-medium">
            <span>Last Updated: September 20, 2026</span>
            <span>•</span>
            <span>Global GDPR & Privacy Standards Compliant</span>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      {/* Privacy Pillars Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {privacyPillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-teal-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Layout with Navigation Sidebar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar Nav */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white px-2">
              Privacy Topics
            </h3>

            {/* Quick Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search privacy topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-zinc-100 py-2 pl-9 pr-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <nav className="space-y-1">
              {sections
                .filter((s) =>
                  s.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollTo(sec.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-teal-50 text-teal-700 font-bold dark:bg-teal-950/60 dark:text-teal-400"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-zinc-400"}`} />
                        <span>{sec.title}</span>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 opacity-60 ${isActive ? "text-teal-600 dark:text-teal-400" : ""}`} />
                    </button>
                  );
                })}
            </nav>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href="/support"
                className="flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-teal-600"
              >
                <HelpCircle className="h-4 w-4" />
                Privacy Questions? Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Privacy Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1 */}
          <section
            id="overview"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                1. Privacy Overview & Commitments
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Online-Bazar (&quot;We&quot;, &quot;Marketplace&quot;, or &quot;Our&quot;) respects your right to privacy. This Privacy Policy describes how we collect, store, process, and protect your personal data when you visit our website, register an account, purchase products from independent seller shops, or apply to become a vendor.
            </p>
            <div className="rounded-2xl bg-teal-50/60 p-4 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-300">
              <strong>Our Commitment:</strong> We only collect data necessary to deliver exceptional e-commerce experiences, ensure buyer protection, facilitate order deliveries, and fulfill merchant operations.
            </div>
          </section>

          {/* Section 2 */}
          <section
            id="collection"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <Database className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                2. Information We Collect
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              We collect information directly provided by you, as well as automated diagnostic data:
            </p>
            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                <span><strong>Account & Contact Info:</strong> Name, email address, phone number, and password hash during signup.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                <span><strong>Order & Delivery Info:</strong> Shipping address, order items, billing details, and delivery instructions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                <span><strong>Seller Verification Info:</strong> Business name, Tax ID, store logo, and bank account details for payout processing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                <span><strong>Technical Data:</strong> IP address, browser type, device information, and anonymous usage analytics.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section
            id="usage"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <FileCheck className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                3. How We Use Your Data
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Your information is utilized solely for lawful business purposes, including:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50">
                <strong className="text-zinc-900 dark:text-white">Fulfilling Orders:</strong> Processing payments, sharing delivery details with vendor shops and courier services.
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50">
                <strong className="text-zinc-900 dark:text-white">Platform Security:</strong> Detecting suspicious activity, preventing checkout fraud, and protecting user accounts.
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50">
                <strong className="text-zinc-900 dark:text-white">Notifications:</strong> Sending order tracking updates, seller responses, and customer support alerts.
              </div>
              <div className="rounded-2xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50">
                <strong className="text-zinc-900 dark:text-white">Personalization:</strong> Recommending relevant products and saved wishlist items.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section
            id="sharing"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <Share2 className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                4. Data Sharing & Third-Party Services
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Online-Bazar never sells your personal information. We only share necessary data with trusted partners to operate our marketplace:
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>• <strong>Marketplace Sellers:</strong> Store owners receive order details and customer shipping addresses to pack and dispatch items.</li>
              <li>• <strong>Payment Gateways:</strong> Payment details are encrypted and transmitted directly to Stripe for credit/debit card processing.</li>
              <li>• <strong>Logistics & Couriers:</strong> Delivery partners receive recipient contact details and shipping destinations.</li>
              <li>• <strong>Legal Compliance:</strong> We may disclose data if required by law enforcement or valid court orders.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section
            id="cookies"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <Cookie className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                5. Cookies & Tracking Technologies
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              We use essential cookies and local storage to maintain session login states, remember items added to your shopping cart, and retain UI preferences like dark mode. You can adjust your browser settings to disable non-essential cookies.
            </p>
          </section>

          {/* Section 6 */}
          <section
            id="security"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <Lock className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                6. Data Encryption & Storage Security
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              All data transmitted to and from Online-Bazar is secured with TLS 1.3 encryption. User passwords are stored using salted cryptographic hash functions. Database storage is protected by strict access controls and automated threat detection.
            </p>
          </section>

          {/* Section 7 */}
          <section
            id="rights"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <UserCheck className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                7. Your Rights & Data Controls
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Depending on your jurisdiction (including GDPR rights), you possess the following rights:
            </p>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <p>• <strong>Right of Access:</strong> Request a copy of your personal data stored on our servers.</p>
              <p>• <strong>Right to Rectification:</strong> Update inaccurate account details directly under Account Settings.</p>
              <p>• <strong>Right to Erasure:</strong> Request permanent deletion of your account and personal history.</p>
            </div>
          </section>

          {/* Section 8 */}
          <section
            id="children"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <Eye className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                8. Children&apos;s Privacy
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Online-Bazar is not directed to individuals under 18 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          {/* Section 9 */}
          <section
            id="updates"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <KeyRound className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                9. Changes to This Privacy Policy
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              We may update this Privacy Policy periodically to reflect platform enhancements or legal revisions. Significant updates will be notified via email or homepage announcement.
            </p>
          </section>

          {/* Section 10 */}
          <section
            id="dpo"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400">
              <HelpCircle className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                10. Contact Data Protection Officer (DPO)
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              For privacy inquiries, data removal requests, or contacting our Data Protection Officer:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-teal-600 dark:text-teal-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>privacy@online-bazar.com</span>
              </div>
              <span>•</span>
              <Link href="/support" className="hover:underline">
                Visit Help Center
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
