"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Orders placed before 2 PM ship the same day and typically arrive within 1-3 business days depending on your location in Nigeria. Lagos orders often arrive next day.",
  },
  {
    q: "Are all products 100% authentic?",
    a: "Yes. Every product on GN Store is sourced directly from verified suppliers and brand-authorised distributors. We do not sell grey-market or counterfeit goods.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept debit/credit cards, bank transfers, and USSD payments through Paystack - Nigeria's most trusted payment gateway. All transactions are encrypted.",
  },
  {
    q: "What is your return policy?",
    a: "You have 7 days from delivery to return any item that is faulty, not as described, or damaged in transit. Items must be unused and in original packaging. Contact our support team to start a return.",
  },
  {
    q: "Do you deliver outside Lagos?",
    a: "Yes, we deliver nationwide across Nigeria. Delivery timelines and costs vary by state. You'll see the exact cost and estimated delivery window at checkout.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a confirmation email with a tracking link. You can also check your order status anytime from your account dashboard.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-24 dark:bg-[#0D0D0D] lg:py-32">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#5DC600]/30 bg-[#5DC600]/8 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5DC600]" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5DC600]">
              FAQ
            </span>
          </div>
          <h2 className="text-[clamp(26px,3.2vw,42px)] font-bold leading-[1.05] tracking-[-0.02em] text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none"
              >
                <span className="text-[15px] font-semibold text-gray-900 dark:text-white">
                  {faq.q}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors dark:bg-[#1A1A1A] dark:text-[#A3A3A3]">
                  {open === i ? <Minus size={13} /> : <Plus size={13} />}
                </span>
              </button>
              {open === i && (
                <p className="pb-6 text-[14px] leading-[1.8] text-gray-500 dark:text-[#A3A3A3]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
