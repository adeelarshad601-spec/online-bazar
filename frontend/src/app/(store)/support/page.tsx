"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Package,
  RotateCcw,
  CreditCard,
  Store,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  Search,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const helpTopics = [
    {
      icon: Package,
      title: "Orders & Shipping",
      description: "Track deliveries, view order history, and manage shipping addresses.",
      link: "/orders",
    },
    {
      icon: RotateCcw,
      title: "Returns & Refunds",
      description: "Easy 7-day hassle-free return policy and refund status tracking.",
      link: "/orders",
    },
    {
      icon: CreditCard,
      title: "Payments & Coupons",
      description: "Supported payment methods, Stripe card payments, COD, and promo codes.",
      link: "/cart",
    },
    {
      icon: Store,
      title: "Seller Portal & Shop",
      description: "How to open your store, list products, manage inventory, and payouts.",
      link: "/seller/apply",
    },
    {
      icon: ShieldCheck,
      title: "Buyer Protection",
      description: "100% verified independent sellers, secure escrow, and dispute resolution.",
      link: "/products",
    },
    {
      icon: HelpCircle,
      title: "Account & Settings",
      description: "Update your profile details, password, notifications, and security.",
      link: "/account/settings",
    },
  ];

  const faqs = [
    {
      question: "How do I track my order on Online-Bazar?",
      answer: "You can track your order at any time by navigating to 'My Orders' in your account menu. Each seller provides real-time tracking updates as your item is prepared and dispatched.",
    },
    {
      question: "What payment methods are supported?",
      answer: "Online-Bazar supports Cash on Delivery (COD) and instant Credit/Debit Card payments via Stripe (Visa, Mastercard, American Express).",
    },
    {
      question: "How do I return an item?",
      answer: "We offer a 7-day return policy on all eligible purchases. Go to your Orders page, locate the order, and submit a return request with the reason.",
    },
    {
      question: "How do I become a verified seller?",
      answer: "Click on 'Become a Seller' in the navigation bar, fill out your shop name and verification details. Once approved by our team, you can immediately begin listing products with 0% listing fees.",
    },
    {
      question: "How can I contact customer service?",
      answer: "Our support team is available 24/7 via phone (+1 800-ONLINE-BAZAR), email (support@online-bazar.com), or through our seller messaging system.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 space-y-12 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-950 p-8 sm:p-14 text-center text-white shadow-xl">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <HelpCircle className="h-4 w-4" />
            <span>24/7 Help Center & Customer Care</span>
          </div>

          <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            How can we help you today?
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto">
            Find answers to common questions, manage your orders, or connect directly with our support team.
          </p>

          {/* Search Bar */}
          <div className="relative mx-auto mt-6 max-w-lg">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search help topics, returns, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-white py-3.5 pl-11 pr-4 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
            />
          </div>
        </div>
      </div>

      {/* Help Topics Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
          Browse by Topic
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {helpTopics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <Link
                key={i}
                href={topic.link}
                className="group rounded-3xl bg-[#f6f7f9] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* FAQs Section */}
      <div id="faqs" className="space-y-6 scroll-mt-32">
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl bg-[#f6f7f9] dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-xs sm:text-sm font-bold text-zinc-900 dark:text-white"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-zinc-200/60 p-5 pt-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Contact Channels */}
      <div className="rounded-3xl bg-[#f6f7f9] p-8 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
            Still need help?
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Our specialized support team is online 24/7 to help resolve your inquiry promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-xs dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Phone Support</h3>
            <p className="text-xs text-emerald-600 font-bold dark:text-emerald-400">+1 800-ONLINE-BAZAR</p>
            <p className="text-[10px] text-zinc-400">Toll-free 24/7</p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-xs dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Email Support</h3>
            <p className="text-xs text-emerald-600 font-bold dark:text-emerald-400">support@online-bazar.com</p>
            <p className="text-[10px] text-zinc-400">Response within 2 hours</p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-xs dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Seller Messaging</h3>
            <p className="text-xs text-emerald-600 font-bold dark:text-emerald-400">Direct Chat</p>
            <p className="text-[10px] text-zinc-400">Available on product pages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
