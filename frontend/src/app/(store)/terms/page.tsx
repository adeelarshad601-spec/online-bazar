"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  UserCheck,
  Scale,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  Search,
  CheckCircle2,
  Mail,
} from "lucide-react";

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState<string>("intro");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sections = [
    { id: "intro", title: "1. Introduction & Acceptance", icon: FileText },
    { id: "accounts", title: "2. Account Terms & Security", icon: UserCheck },
    { id: "marketplace", title: "3. Multi-Vendor Platform Rules", icon: ShoppingBag },
    { id: "payments", title: "4. Payments & Pricing", icon: CreditCard },
    { id: "shipping", title: "5. Shipping & 7-Day Returns", icon: Truck },
    { id: "sellers", title: "6. Seller Obligations & Commission", icon: Scale },
    { id: "prohibited", title: "7. Prohibited Conduct", icon: AlertTriangle },
    { id: "ip", title: "8. Intellectual Property", icon: ShieldCheck },
    { id: "liability", title: "9. Limitation of Liability", icon: Scale },
    { id: "contact", title: "10. Contact & Support", icon: HelpCircle },
  ];

  const highlights = [
    {
      icon: ShieldCheck,
      title: "100% Secure Trading",
      desc: "Protected payments via Stripe & verified marketplace seller checks.",
    },
    {
      icon: RotateCcw,
      title: "7-Day Return Guarantee",
      desc: "Hassle-free return policy on eligible orders across all vendor shops.",
    },
    {
      icon: UserCheck,
      title: "Verified Sellers",
      desc: "All merchant storefronts undergo identity and business verification.",
    },
    {
      icon: CreditCard,
      title: "Transparent Pricing",
      desc: "No hidden fees for buyers. Clear checkout itemization including taxes.",
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-zinc-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md border border-emerald-500/30">
            <Scale className="h-3.5 w-3.5" />
            <span>Legal Framework & Terms</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Terms & Conditions
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
            Welcome to Online-Bazar. Please read these Terms and Conditions carefully before accessing or using our multi-vendor marketplace services.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200/90 pt-2 font-medium">
            <span>Last Updated: September 20, 2026</span>
            <span>•</span>
            <span>Applies to Buyers, Sellers & Visitors</span>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Quick Feature Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-emerald-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
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
              Table of Contents
            </h3>

            {/* Quick Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-zinc-100 py-2 pl-9 pr-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800 dark:text-white"
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
                          ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`} />
                        <span>{sec.title}</span>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 opacity-60 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                    </button>
                  );
                })}
            </nav>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Link
                href="/support"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500"
              >
                <HelpCircle className="h-4 w-4" />
                Have Questions? Support
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Clauses Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1 */}
          <section
            id="intro"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <FileText className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                1. Introduction & Acceptance of Terms
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Welcome to <strong>Online-Bazar</strong> (&quot;Platform&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;). These Terms and Conditions govern your access to and use of the Online-Bazar website, mobile applications, marketplace services, buyer features, and seller management portal.
            </p>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              By registering an account, placing an order, creating a vendor shop, or browsing our website, you expressly agree to be bound by these Terms, along with our <Link href="/privacy" className="text-emerald-600 font-semibold underline">Privacy Policy</Link>. If you do not agree to all terms, please refrain from accessing our platform.
            </p>
          </section>

          {/* Section 2 */}
          <section
            id="accounts"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                2. User Account & Registration Security
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span><strong>Eligibility:</strong> You must be at least 18 years old or possess legal parental consent to create an account and transact on Online-Bazar.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span><strong>Account Accuracy:</strong> Users agree to provide truthful, complete, and updated information during account registration and checkout.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span><strong>Credential Protection:</strong> You are responsible for safeguarding your login credentials. Online-Bazar is not liable for unauthorized activity resulting from unsecure passwords.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section
            id="marketplace"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                3. Multi-Vendor Platform Mechanics
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Online-Bazar operates as an electronic multi-vendor marketplace connecting independent third-party sellers with customers.
            </p>
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50 space-y-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Key Platform Distinctions:</h4>
              <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                • Products are listed, packaged, and fulfilled by their respective shop owners.<br />
                • Online-Bazar provides infrastructure, payment processing, fraud detection, buyer protection, and customer service escalation.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section
            id="payments"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                4. Payments, Pricing & Cash on Delivery (COD)
              </h2>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <p>
                <strong>Payment Methods:</strong> We accept major credit/debit cards processed securely via Stripe, as well as Cash on Delivery (COD) for eligible nationwide delivery locations.
              </p>
              <p>
                <strong>Price Integrity:</strong> All product prices are set by individual store vendors. Total order cost including taxes and shipping fees will be presented clearly prior to payment confirmation.
              </p>
              <p>
                <strong>Order Processing:</strong> Orders placed via card are confirmed upon successful authorization. COD orders require valid phone and shipping address verification.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section
            id="shipping"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Truck className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                5. Shipping, Delivery & 7-Day Return Policy
              </h2>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <p>
                <strong>Delivery Timelines:</strong> Estimated shipping timelines are provided by sellers upon order dispatch. Tracking information is updated in real-time under your account order history.
              </p>
              <div className="rounded-2xl bg-emerald-50/70 p-4 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <RotateCcw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  7-Day Buyer Protection Return Guarantee
                </h4>
                <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300/90">
                  Customers may request a return or refund within 7 calendar days of delivery if the received product is damaged, defective, incomplete, or significantly different from the vendor listing.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section
            id="sellers"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Scale className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                6. Seller Obligations, Fees & Payouts
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Vendors operating shops on Online-Bazar must comply with merchant guidelines:
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>• Sellers must maintain accurate stock counts, authentic product images, and fair pricing.</li>
              <li>• Marketplace platform commission and payment processing fees apply according to chosen seller plans.</li>
              <li>• Seller payout balances are disbursed automatically to verified bank accounts following return window completion.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section
            id="prohibited"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                7. Prohibited Items & Conduct
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Users and sellers are strictly prohibited from engaging in illegal, deceptive, fraudulent, or harmful activities on Online-Bazar.
            </p>
            <div className="rounded-2xl bg-amber-50/80 p-4 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300">
              Prohibited items include counterfeit goods, hazardous materials, illegal substances, adult items without proper age restrictions, and trademark-infringed merchandise. Accounts violating these rules will face immediate suspension.
            </div>
          </section>

          {/* Section 8 */}
          <section
            id="ip"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                8. Intellectual Property Rights
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              All platform design elements, software code, logos, branding, and text are the exclusive property of Online-Bazar. Vendor shop logos and product descriptions remain property of their respective owners licensed to Online-Bazar for promotional and sales display.
            </p>
          </section>

          {/* Section 9 */}
          <section
            id="liability"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Scale className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                9. Limitation of Liability
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              To the maximum extent permitted by applicable law, Online-Bazar shall not be liable for direct, indirect, incidental, or consequential damages resulting from third-party seller conduct, website unavailability, or delays caused by third-party logistics partners.
            </p>
          </section>

          {/* Section 10 */}
          <section
            id="contact"
            className="scroll-mt-28 space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <HelpCircle className="h-6 w-6" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                10. Contact Us & Legal Inquiries
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              If you have any questions regarding these Terms and Conditions, or require legal support, please contact our legal team:
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>legal@online-bazar.com</span>
              </div>
              <span>•</span>
              <Link href="/support" className="hover:underline">
                Visit Customer Support
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
