import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, CheckCircle2, XCircle, Clock, Package, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Return Policy | GN Store",
  description:
    "GN Store return and refund policy - 7-day returns on eligible items, fast refund processing.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8 border-b border-gray-100 last:border-b-0 dark:border-[#2A2A2A]">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-[#A3A3A3]">
        {children}
      </div>
    </section>
  );
}

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5DC600]">
            Returns & Refunds
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Return policy
          </h1>
          <p className="mt-2 text-sm text-gray-400 dark:text-[#A3A3A3]">
            Last updated: June 2025
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        {/* Quick summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Clock, label: "Return window", value: "7 days" },
            { icon: Package, label: "Condition", value: "Unused" },
            { icon: RotateCcw, label: "Refund time", value: "3-7 days" },
            { icon: CheckCircle2, label: "Free returns", value: "On our error" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center dark:border-[#2A2A2A] dark:bg-[#1A1A1A]"
            >
              <Icon size={20} className="mx-auto mb-2 text-[#5DC600]" />
              <p className="text-xs text-gray-400 dark:text-[#A3A3A3]">{label}</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        <Section title="Overview">
          <p>
            We want you to be completely satisfied with every purchase from GN Store. If something
            isn&apos;t right, we will do our best to make it right. This policy explains how to
            return an item and what to expect during the refund process.
          </p>
          <p>
            Returns are accepted within <strong className="text-gray-900 dark:text-white">7 days</strong> of
            the delivery date, provided the item meets the conditions described below.
          </p>
        </Section>

        <Section title="What can be returned">
          <p>To be eligible for a return, items must:</p>
          <ul className="space-y-2 pl-1">
            {[
              "Be returned within 7 days of delivery",
              "Be in original, unused, and undamaged condition",
              "Include all original packaging, tags, and accessories",
              "Be accompanied by your order number or proof of purchase",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#5DC600]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Items that cannot be returned">
          <p>The following items are non-returnable:</p>
          <ul className="space-y-2 pl-1">
            {[
              "Cosmetics, skincare, and personal care items that have been opened or used",
              "Underwear, swimwear, and intimate apparel for hygiene reasons",
              "Digital downloads and software products",
              "Items marked as \"Final Sale\" at the time of purchase",
              "Items damaged through misuse, neglect, or normal wear and tear",
              "Perishable goods",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <XCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="How to start a return">
          <ol className="space-y-4">
            {[
              {
                step: "1",
                title: "Contact support",
                desc: 'Email hello@gonesmartsolutions.com or use our Contact Us page. Include your order number, the item(s) you want to return, and the reason.',
              },
              {
                step: "2",
                title: "Get return instructions",
                desc: "Our team will review your request within 24 hours and send you the return address and instructions. Do not send items back without approval - unapproved returns cannot be processed.",
              },
              {
                step: "3",
                title: "Pack and ship",
                desc: "Pack the item securely in its original packaging. Ship it using a trackable method and share the tracking number with us.",
              },
              {
                step: "4",
                title: "Receive your refund",
                desc: "Once we receive and inspect the item, we will process your refund within 3-5 business days. You will receive a confirmation email when the refund is issued.",
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBF5E9] text-xs font-bold text-[#2E7D00] dark:bg-[#5DC600]/10 dark:text-[#5DC600]">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Refunds">
          <p>
            Approved refunds are returned to the original payment method. Depending on your bank or
            card issuer, refunds may take an additional <strong className="text-gray-900 dark:text-white">3-7 business days</strong> to
            appear on your statement after we process them.
          </p>
          <p>
            If the return is due to our error (wrong item shipped, damaged on arrival), we will
            cover the return shipping cost and issue a full refund including original shipping fees.
          </p>
          <p>
            For other returns, the original shipping cost is non-refundable, and return shipping
            costs are the responsibility of the customer.
          </p>
        </Section>

        <Section title="Exchanges">
          <p>
            We do not process direct exchanges. If you would like a different size, color, or item,
            please return the original item for a refund and place a new order.
          </p>
        </Section>

        <Section title="Damaged or wrong items">
          <p>
            If you receive an item that is damaged in transit or different from what you ordered,
            contact us within 48 hours of delivery with photos of the item and packaging. We will
            arrange a free return and send a replacement or issue a full refund at no cost to you.
          </p>
        </Section>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-between dark:bg-[#1A1A1A]">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Ready to start a return?</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-[#A3A3A3]">
              Our team is here to help Mon-Fri, 9 AM - 6 PM WAT.
            </p>
          </div>
          <Link
            href="/contact"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#5DC600] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
          >
            Contact support <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
