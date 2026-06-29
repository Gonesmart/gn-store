"use client";

import { useState, useTransition } from "react";
import { Mail, Phone, MapPin, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { submitContact } from "@/actions/contact";

const SUBJECTS = [
  "Order issue",
  "Return or refund",
  "Product question",
  "Payment problem",
  "Account help",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitContact(form);
      if (res.success) {
        setSent(true);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
        <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5DC600]">
            Get in touch
          </p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-[#A3A3A3]">
            We typically respond within one business day.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact info */}
          <aside className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF5E9] dark:bg-[#5DC600]/10">
                  <Mail size={18} className="text-[#5DC600]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#A3A3A3]">
                    Email
                  </p>
                  <a
                    href="mailto:hello@gonesmartsolutions.com"
                    className="mt-0.5 block text-sm text-gray-700 hover:text-[#5DC600] dark:text-white"
                  >
                    hello@gonesmartsolutions.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF5E9] dark:bg-[#5DC600]/10">
                  <Phone size={18} className="text-[#5DC600]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#A3A3A3]">
                    Phone
                  </p>
                  <a
                    href="tel:+2348000000000"
                    className="mt-0.5 block text-sm text-gray-700 hover:text-[#5DC600] dark:text-white"
                  >
                    +234 800 000 0000
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF5E9] dark:bg-[#5DC600]/10">
                  <MapPin size={18} className="text-[#5DC600]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#A3A3A3]">
                    Location
                  </p>
                  <p className="mt-0.5 text-sm text-gray-700 dark:text-white">Lagos, Nigeria</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF5E9] dark:bg-[#5DC600]/10">
                  <Clock size={18} className="text-[#5DC600]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#A3A3A3]">
                    Support hours
                  </p>
                  <p className="mt-0.5 text-sm text-gray-700 dark:text-white">
                    Mon - Fri, 9 AM - 6 PM WAT
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[#A3A3A3]">
                    Sat, 10 AM - 3 PM WAT
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-2xl bg-gray-50 p-5 dark:bg-[#1A1A1A]">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Faster answers
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-[#A3A3A3]">
                Check our{" "}
                <a href="/faq" className="font-medium text-[#5DC600]">
                  FAQ page
                </a>{" "}
                for instant answers to common questions about orders, shipping, and returns.
              </p>
            </div>
          </aside>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF5E9] dark:bg-[#5DC600]/10">
                  <CheckCircle2 size={32} className="text-[#5DC600]" />
                </div>
                <h2 className="mt-5 text-xl font-black text-gray-900 dark:text-white">
                  Message sent
                </h2>
                <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-[#A3A3A3]">
                  We&apos;ve received your message and will get back to you within one business day.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="mt-6 text-sm font-semibold text-[#5DC600] hover:text-[#4DAF00]"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none focus:ring-2 focus:ring-[#5DC600]/20 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-[#4A4A4A]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none focus:ring-2 focus:ring-[#5DC600]/20 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-[#4A4A4A]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 focus:border-[#5DC600] focus:outline-none focus:ring-2 focus:ring-[#5DC600]/20 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white"
                  >
                    <option value="">Select a topic</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question in detail…"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5DC600] focus:outline-none focus:ring-2 focus:ring-[#5DC600]/20 dark:border-[#2A2A2A] dark:bg-[#1A1A1A] dark:text-white dark:placeholder:text-[#4A4A4A]"
                  />
                </div>

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5DC600] font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600] active:bg-[#3D9600] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
