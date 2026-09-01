"use client";

import { Send, RotateCcw, Headphones } from "lucide-react";

export default function SpecificationsSection() {
  const specs = [
    {
      id: 1,
      title: "Free Shipping",
      description: "Enjoy fast, free delivery on every order no conditions, just reliable doorstep.",
      icon: Send,
      bgColor: "bg-emerald-50/80 dark:bg-emerald-950/30",
      borderColor: "border-emerald-100 dark:border-emerald-900/40",
      badgeBg: "bg-emerald-500",
    },
    {
      id: 2,
      title: "7 Days Easy Return",
      description: "Change your mind? No worries. Return any item within 7 days hassle-free.",
      icon: RotateCcw,
      bgColor: "bg-amber-50/80 dark:bg-amber-950/30",
      borderColor: "border-amber-100 dark:border-amber-900/40",
      badgeBg: "bg-amber-500",
    },
    {
      id: 3,
      title: "24/7 Customer Support",
      description: "We're here for you. Get expert help with our round-the-clock customer support.",
      icon: Headphones,
      bgColor: "bg-indigo-50/80 dark:bg-indigo-950/30",
      borderColor: "border-indigo-100 dark:border-indigo-900/40",
      badgeBg: "bg-indigo-500",
    },
  ];

  return (
    <section className="py-12 space-y-8 text-center" id="our-specifications-section">
      <div className="mx-auto max-w-2xl space-y-2">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Our Specifications
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
          We offer top-tier service and convenience to ensure your shopping experience is smooth, secure and completely hassle-free.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 pt-4 sm:grid-cols-3">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.id}
              className={`relative flex flex-col items-center justify-center rounded-3xl border ${spec.borderColor} ${spec.bgColor} p-8 pt-10 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div
                className={`absolute -top-5 flex h-10 w-10 items-center justify-center rounded-xl ${spec.badgeBg} text-white shadow-md`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-white">
                {spec.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {spec.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
