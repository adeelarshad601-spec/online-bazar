"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  BookOpen,
  PackageCheck,
  CreditCard,
  Store,
  ShieldCheck,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function SellerHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("payout");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const helpTopics = [
    {
      icon: PackageCheck,
      title: "Order Fulfillment",
      desc: "Packing guidelines, dispatch timeframes, and tracking updates.",
      link: "/seller/orders",
    },
    {
      icon: CreditCard,
      title: "Payouts & Bank Info",
      desc: "Payout schedules, commission fees, and bank verification.",
      link: "/seller/payouts",
    },
    {
      icon: Store,
      title: "Shop & Listings",
      desc: "Optimizing product listings, upload limits, and SEO titles.",
      link: "/seller/products",
    },
    {
      icon: ShieldCheck,
      title: "Seller Protection",
      desc: "Fraud protection, buyer dispute resolution, and return policy.",
      link: "/seller/shop",
    },
  ];

  const sellerFaqs = [
    {
      q: "When do I receive payouts for completed seller orders?",
      a: "Payouts are automatically processed 48 hours after the customer receives the item and marks it as delivered. You can track pending and available balances on your Seller Payouts page.",
    },
    {
      q: "How do I list new products on Online-Bazar?",
      a: "Navigate to Products > Add New Product in your Seller Panel. Enter the product title, category, price, stock, images, and description. Once saved, your item is live instantly across Online-Bazar.",
    },
    {
      q: "What are the commission fees for selling on Online-Bazar?",
      a: "Online-Bazar charges 0% listing fees. A flat 5% platform commission is only applied upon successful order completion.",
    },
    {
      q: "How do I handle customer return requests?",
      a: "When a customer requests a return, you will receive an alert under Seller Orders. You can approve the return label, issue a replacement, or inspect the item once returned.",
    },
    {
      q: "Can I customize my seller shop storefront?",
      a: "Yes! Go to Seller Shop > Overview or Seller Settings > Personalization to customize your shop logo, cover banner, description, and custom social links.",
    },
    {
      q: "What should I do if an order package is lost in transit?",
      a: "Our Seller Protection policy covers insured courier shipments. Contact Seller Support immediately with the courier tracking ID for claim processing.",
    },
  ];

  const filteredFaqs = sellerFaqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setShowTicketModal(false);
      setTicketSubject("");
      setTicketMessage("");
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-4 sm:p-6 lg:p-8">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-zinc-950 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 mx-auto max-w-2xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold backdrop-blur-md text-teal-200">
            <HelpCircle className="h-4 w-4 text-emerald-400" />
            <span>Seller Support & Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How can we help your business today?
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/80">
            Find quick answers on payouts, order management, shop customization, and platform policies.
          </p>

          {/* Search Input Box */}
          <div className="relative pt-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g. payout, listing, returns)..."
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-3.5 pl-12 text-sm text-white placeholder-teal-100/60 backdrop-blur-md focus:border-white focus:bg-white/20 focus:outline-none"
            />
            <Search className="absolute left-4 top-6 h-5 w-5 text-teal-200" />
          </div>
        </div>
      </div>

      {/* Quick Topic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {helpTopics.map((topic, i) => {
          const Icon = topic.icon;
          return (
            <Link
              key={i}
              href={topic.link}
              className="group flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-950/60 dark:text-teal-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {topic.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {topic.desc}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>View Portal</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* FAQs Section */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-600" />
              <span>Frequently Asked Seller Questions</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Clear guidelines to manage your shop smoothly on Online-Bazar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTicketModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 shrink-0"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open Support Ticket</span>
          </button>
        </div>

        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <p className="py-8 text-center text-xs text-zinc-400">
              No matching help articles found for "{searchQuery}".
            </p>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50/60 dark:border-zinc-800/80 dark:bg-zinc-800/40 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-100/80 dark:hover:bg-zinc-800"
                  >
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-teal-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Direct Contact Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-teal-200 bg-teal-50 p-6 dark:border-teal-900/40 dark:bg-teal-950/30 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shrink-0">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Email Seller Desk</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">sellers@online-bazar.com</p>
            <p className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold mt-0.5">Response within 2 hours</p>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/30 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shrink-0">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Hotline Support</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">+1 800-ONLINE-BAZAR</p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">Mon–Sat, 9AM - 8PM</p>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Need Live Help?</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Chat directly with a seller manager</p>
          </div>
          <button
            type="button"
            onClick={() => setShowTicketModal(true)}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            Start Chat
          </button>
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                <span>Submit Seller Ticket</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {ticketSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Ticket Submitted Successfully!
                </h4>
                <p className="text-xs text-zinc-500">
                  Our seller manager will review your ticket and respond to your email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="payout">Payout & Earnings Inquiry</option>
                    <option value="orders">Order Dispatch / Logistics</option>
                    <option value="product">Product Verification & Listing</option>
                    <option value="account">Shop Account & Security</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Details
                  </label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Explain your question or problem in detail..."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:border-teal-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Ticket</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
