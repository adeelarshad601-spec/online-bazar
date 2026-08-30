"use client";

import Link from "next/link";
import { Check, X, ChevronLeft, Zap } from "lucide-react";

export default function UpgradePage() {
  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "Forever",
      description: "Perfect for getting started",
      features: [
        { name: "Up to 50 products", included: true },
        { name: "Basic product listing", included: true },
        { name: "Standard customer support", included: true },
        { name: "1 shop", included: true },
        { name: "Analytics dashboard", included: false },
        { name: "Advanced marketing tools", included: false },
        { name: "Priority support", included: false },
        { name: "Unlimited products", included: false },
        { name: "API access", included: false },
      ],
      buttonText: "Current Plan",
      buttonVariant: "secondary",
      isActive: true,
    },
    {
      name: "Premium Plan",
      price: "$29",
      period: "Per month",
      description: "For growing businesses",
      features: [
        { name: "Up to 50 products", included: true },
        { name: "Basic product listing", included: true },
        { name: "Standard customer support", included: true },
        { name: "1 shop", included: true },
        { name: "Analytics dashboard", included: true },
        { name: "Advanced marketing tools", included: true },
        { name: "Priority support", included: true },
        { name: "Unlimited products", included: true },
        { name: "API access", included: true },
      ],
      buttonText: "Upgrade Now",
      buttonVariant: "primary",
      isActive: false,
      badge: "Popular",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <Link
              href="/seller/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mb-4 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Choose Your Plan
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Select the perfect plan for your business and start selling
            </p>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border transition-all ${
                plan.isActive
                  ? "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800/50"
                  : "border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-6">
                  <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    <Zap className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    {plan.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {plan.buttonVariant === "primary" ? (
                    <button
                      type="button"
                      className="w-full px-4 py-3 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition shadow-lg hover:shadow-xl"
                    >
                      {plan.buttonText}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-zinc-300 text-zinc-700 font-bold text-sm dark:border-zinc-600 dark:text-zinc-300 cursor-default opacity-75"
                    >
                      {plan.buttonText}
                    </button>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-200 dark:border-zinc-700 mb-8" />

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                    Features included
                  </p>
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-zinc-300 dark:text-zinc-700 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included
                              ? "text-zinc-900 dark:text-white font-medium"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20 p-6">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <span className="font-bold">Need help choosing?</span> Both plans give you access to all essential features. Premium is ideal if you want advanced analytics, unlimited products, and priority support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
