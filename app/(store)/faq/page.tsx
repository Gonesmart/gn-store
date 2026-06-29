"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type FAQ = { q: string; a: string };
type Category = { title: string; items: FAQ[] };

const FAQS: Category[] = [
  {
    title: "Shopping",
    items: [
      {
        q: "Do I need an account to shop?",
        a: "No. You can checkout as a guest using just your email address. However, creating an account lets you track orders, save addresses, maintain a wishlist, and view your full order history - we recommend it.",
      },
      {
        q: "Are all products on GN Store authentic?",
        a: "Yes. Every product listed on GN Store is sourced directly from verified suppliers. We do not sell counterfeit or grey-market goods. If you ever receive a product that doesn't match the listing, contact us immediately and we will make it right.",
      },
      {
        q: "How do I find a specific product?",
        a: "Use the search bar at the top of any page, or browse by category using the Shop menu. You can also filter by size, color, price range, and customer rating on the shop page.",
      },
      {
        q: "Can I save items for later?",
        a: "Yes - tap the heart icon on any product to add it to your Wishlist. You need to be signed in to use this feature. Access your wishlist any time from your account dashboard.",
      },
    ],
  },
  {
    title: "Orders",
    items: [
      {
        q: "How do I track my order?",
        a: "Go to Track Order (linked in the footer and your confirmation email) and enter your order number. Once your order ships, we will also send you a shipping confirmation with a tracking number.",
      },
      {
        q: "Can I cancel or change my order?",
        a: "You can request a cancellation within 2 hours of placing your order, before it enters the packing stage. After that, changes are no longer possible. To cancel, contact our support team immediately with your order number.",
      },
      {
        q: "I didn't receive a confirmation email - what do I do?",
        a: "Check your spam or promotions folder first. If it's not there, your email address may have been entered incorrectly. Contact us with your name and approximate order time and we will locate your order.",
      },
      {
        q: "What does each order status mean?",
        a: "Pending: received, awaiting payment confirmation. Processing: payment confirmed, being prepared for shipment. Shipped: on its way to you. Delivered: confirmed delivered. Cancelled: order was cancelled.",
      },
    ],
  },
  {
    title: "Shipping",
    items: [
      {
        q: "Which states do you deliver to?",
        a: "We deliver to all 36 states in Nigeria plus the FCT (Abuja). Delivery times vary by location - Lagos and Abuja are typically 1-2 business days, while other states take 2-5 business days.",
      },
      {
        q: "How much does shipping cost?",
        a: "Shipping fees are calculated at checkout based on your delivery state and order weight. We periodically offer free shipping promotions - follow us on social media to stay updated.",
      },
      {
        q: "Do you offer same-day delivery?",
        a: "Same-day delivery is available for select areas within Lagos for orders placed before 12:00 PM. This option appears at checkout if your address qualifies.",
      },
      {
        q: "What if my order is delayed?",
        a: "Delays can occasionally happen due to high order volumes, public holidays, or logistics partner issues. Use the Track Order tool to check your order status. If there has been no movement for more than 5 business days, please contact us.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is the return window?",
        a: "You have 7 days from the date of delivery to request a return for most items. Items must be unused, in original packaging, and accompanied by proof of purchase. See our full Return Policy for details.",
      },
      {
        q: "How do I start a return?",
        a: "Contact our support team via the Contact Us page or email hello@gonesmartsolutions.com with your order number and a description of the issue. We will send you return instructions within 24 hours.",
      },
      {
        q: "When will I receive my refund?",
        a: "Once we receive and inspect the returned item, we will process your refund within 3-5 business days. Refunds go back to the original payment method and may take a further 3-7 business days to appear on your statement.",
      },
      {
        q: "What items cannot be returned?",
        a: "Cosmetics and personal care items that have been opened cannot be returned for hygiene reasons. Digital products, sale items marked as final sale, and items damaged through misuse are also non-returnable.",
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all debit and credit cards (Visa, Mastercard, Verve), bank transfers, and USSD payments via Paystack - Nigeria's leading payment platform. All transactions are processed securely.",
      },
      {
        q: "Is it safe to pay on GN Store?",
        a: "Yes. All payments are processed by Paystack, which is PCI-DSS compliant. We never store your card details on our servers. Your financial information goes directly to Paystack's secure servers.",
      },
      {
        q: "Do you offer pay on delivery?",
        a: "Pay on delivery is not currently available. All orders must be paid for in full at checkout before we begin processing. This allows us to process orders faster and guarantee stock availability.",
      },
      {
        q: "My payment failed - what do I do?",
        a: "Failed payments do not charge your account. Try again using a different card or payment method. If the issue persists, contact your bank to ensure online transactions are enabled, or reach out to our support team.",
      },
    ],
  },
];

function AccordionItem({ q, a, isOpen, onToggle }: FAQ & { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0 dark:border-[#2A2A2A]">
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-0 py-5 text-left focus-visible:outline-none"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{q}</span>
        <ChevronDown
          size={16}
          className={`mt-0.5 shrink-0 text-gray-400 transition-transform duration-200 dark:text-[#A3A3A3] ${
            isOpen ? "rotate-180 text-[#5DC600] dark:text-[#5DC600]" : ""
          }`}
        />
      </button>
      {isOpen && (
        <p className="pb-5 text-sm leading-relaxed text-gray-500 dark:text-[#A3A3A3]">{a}</p>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
        <div className="mx-auto max-w-4xl px-4 py-12 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5DC600]">
            Help Center
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-[#A3A3A3]">
            Can&apos;t find an answer?{" "}
            <Link href="/contact" className="font-medium text-[#5DC600] hover:text-[#4DAF00]">
              Contact our support team.
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Category tabs */}
          <aside className="shrink-0 lg:w-48">
            <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {FAQS.map((cat, i) => (
                <button
                  key={cat.title}
                  onClick={() => {
                    setActiveCategory(i);
                    setOpenIdx(null);
                  }}
                  className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    activeCategory === i
                      ? "bg-[#EBF5E9] text-[#2E7D00] dark:bg-[#5DC600]/10 dark:text-[#5DC600]"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-[#A3A3A3] dark:hover:bg-[#1A1A1A] dark:hover:text-white"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Questions */}
          <div className="flex-1 min-w-0">
            <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
              {FAQS[activeCategory].title}
            </h2>
            <div className="mt-4">
              {FAQS[activeCategory].items.map((item, i) => (
                <AccordionItem
                  key={i}
                  q={item.q}
                  a={item.a}
                  isOpen={openIdx === i}
                  onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Still need help */}
        <div className="mt-16 rounded-2xl bg-gray-50 p-8 text-center dark:bg-[#1A1A1A]">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Still have questions?
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#A3A3A3]">
            Our team responds within 24 hours on business days.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center rounded-xl bg-[#5DC600] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#4DAF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5DC600]"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  );
}
