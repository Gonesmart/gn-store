import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | GN Store",
  description: "Terms and conditions for using GN Store (Gonesmart Solutions).",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8 border-b border-gray-100 last:border-b-0 dark:border-[#2A2A2A]">
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-[1.8] text-gray-600 dark:text-[#A3A3A3]">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5DC600]">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Terms of service
          </h1>
          <p className="mt-2 text-sm text-gray-400 dark:text-[#A3A3A3]">
            Last updated: June 2025
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        <Section title="Agreement to terms">
          <p>
            By accessing or using the GN Store website (gonesmartsolutions.com), operated by
            Gonesmart Solutions, you agree to be bound by these Terms of Service. If you do not
            agree to these terms, please do not use our website or services.
          </p>
          <p>
            We may update these terms at any time. Continued use of the site after changes
            constitutes your acceptance of the updated terms.
          </p>
        </Section>

        <Section title="Use of the site">
          <p>You agree to use GN Store only for lawful purposes and in a manner that does not infringe the rights of others. You must not:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Use the site to commit fraud or any unlawful activity</li>
            <li>Attempt to gain unauthorised access to any part of the site or its systems</li>
            <li>Scrape, crawl, or copy content from the site without our written permission</li>
            <li>Post or transmit harmful, offensive, or misleading content</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation with any person</li>
            <li>Use automated tools to place bulk or fraudulent orders</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate your account if you violate these terms.
          </p>
        </Section>

        <Section title="Account registration">
          <p>
            To access certain features (order history, wishlist, saved addresses), you must create
            an account. You are responsible for maintaining the confidentiality of your password and
            for all activity that occurs under your account.
          </p>
          <p>
            You must provide accurate and complete information when creating your account. You must
            update your information if it changes. You may not create multiple accounts or use
            another person&apos;s account without permission.
          </p>
          <p>
            Notify us immediately at hello@gonesmartsolutions.com if you suspect unauthorised use
            of your account.
          </p>
        </Section>

        <Section title="Products and pricing">
          <p>
            We make every effort to display product information, images, and prices accurately.
            However, errors may occasionally occur. We reserve the right to correct errors and to
            cancel orders placed at an incorrect price, even after an order has been confirmed. In
            such cases, we will notify you and provide a full refund.
          </p>
          <p>
            All prices are listed in Nigerian Naira (NGN) and are inclusive of applicable VAT where
            required. Prices are subject to change without notice.
          </p>
          <p>
            Product images are for illustrative purposes. Actual products may vary slightly from
            images due to photography lighting, screen calibration, or minor product updates.
          </p>
        </Section>

        <Section title="Orders and payment">
          <p>
            By placing an order, you make an offer to purchase the selected product(s) at the listed
            price. Your order is accepted when we send a confirmation email and charge your payment
            method.
          </p>
          <p>
            We reserve the right to decline any order at our discretion - for example, if a product
            is out of stock, if we suspect fraud, or if there is an error in the product listing.
          </p>
          <p>
            All payments are processed securely by Paystack. By making a payment, you also agree to
            Paystack&apos;s terms and privacy policy. We do not store your payment card details.
          </p>
        </Section>

        <Section title="Shipping and delivery">
          <p>
            Estimated delivery times are provided at checkout and in your order confirmation. These
            are estimates only and not guarantees. We are not responsible for delays caused by
            courier partners, natural disasters, public holidays, or events outside our control.
          </p>
          <p>
            Risk of loss and title for purchased items pass to you upon delivery to the carrier. If
            your package is lost or damaged in transit, contact us and we will work with the courier
            to resolve the issue.
          </p>
        </Section>

        <Section title="Returns and refunds">
          <p>
            Returns and refunds are governed by our{" "}
            <a href="/returns" className="font-medium text-[#5DC600] hover:text-[#4DAF00]">
              Return Policy
            </a>
            , which forms part of these Terms of Service.
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            All content on GN Store - including text, images, logos, product descriptions, and
            software - is the property of Gonesmart Solutions or our content suppliers and is
            protected by Nigerian and international copyright laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works from, or commercially
            exploit any content without our express written permission.
          </p>
        </Section>

        <Section title="User-generated content">
          <p>
            By submitting a product review, you grant Gonesmart Solutions a non-exclusive,
            royalty-free, perpetual licence to use, display, and moderate that content on our
            platform. You confirm that you own or have the right to submit the content and that it
            does not violate any third-party rights.
          </p>
          <p>
            We reserve the right to remove any review or content that is false, offensive,
            defamatory, or violates these terms.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the maximum extent permitted by Nigerian law, Gonesmart Solutions shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages arising from
            your use of the site or purchase of products - including loss of profits, data, or
            goodwill.
          </p>
          <p>
            Our total liability to you for any claim arising out of or relating to these terms or
            your use of the site shall not exceed the total amount you paid for the product(s) giving
            rise to the claim.
          </p>
        </Section>

        <Section title="Disclaimers">
          <p>
            The site and products are provided &quot;as is&quot; without warranties of any kind,
            express or implied, except as required by law. We do not warrant that the site will be
            error-free, uninterrupted, or free of viruses or other harmful components.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These Terms of Service are governed by the laws of the Federal Republic of Nigeria. Any
            disputes arising out of or relating to these terms shall be resolved in the courts of
            Lagos State, Nigeria.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For questions about these Terms of Service, contact us at{" "}
            <a
              href="mailto:hello@gonesmartsolutions.com"
              className="font-medium text-[#5DC600] hover:text-[#4DAF00]"
            >
              hello@gonesmartsolutions.com
            </a>{" "}
            or via our{" "}
            <a href="/contact" className="font-medium text-[#5DC600] hover:text-[#4DAF00]">
              Contact page
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
