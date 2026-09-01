"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section className="py-12 text-center" id="newsletter-section">
      <div className="mx-auto max-w-2xl space-y-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Join Newsletter
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
          Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-6 py-3 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Thank you for subscribing to Online-Bazar!</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-md flex-col items-center gap-2 sm:flex-row"
          >
            <div className="relative w-full">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-xs font-medium text-zinc-900 shadow-xs focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full shrink-0 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 sm:w-auto"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
