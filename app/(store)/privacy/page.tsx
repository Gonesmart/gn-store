import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | GN Store",
  description: "How GN Store (Gonesmart Solutions) collects, uses, and protects your personal data.",
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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D]">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#0D0D0D]">
        <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5DC600]">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Privacy policy
          </h1>
          <p className="mt-2 text-sm text-gray-400 dark:text-[#A3A3A3]">
            Last updated: June 2025
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        <Section title="Introduction">
          <p>
            GN Store, operated by Gonesmart Solutions (&quot;we,&quot; &quot;our,&quot; or
            &quot;us&quot;), is committed to protecting your personal information. This Privacy
            Policy explains what data we collect, why we collect it, how we use it, and your rights
            regarding that data.
          </p>
          <p>
            By using our website at gonesmartsolutions.com, you agree to the practices described in
            this policy. If you do not agree, please do not use our services.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>We collect the following categories of personal information:</p>
          <div className="space-y-4">
            {[
              {
                title: "Account information",
                desc: "When you create an account: your name, email address, and password (stored as a secure hash - never in plain text).",
              },
              {
                title: "Order information",
                desc: "When you place an order: your delivery address, phone number, and the details of your purchase (items, quantities, prices). Payment details are processed by Paystack and are never stored on our servers.",
              },
              {
                title: "Usage data",
                desc: "We collect anonymised data about how you interact with our website, including pages visited, products viewed, and session duration. This is used solely to improve our service.",
              },
              {
                title: "Communications",
                desc: "If you contact us by email or through the contact form, we retain those messages to help us respond and improve our service.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-[#1A1A1A]">
                <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                <p className="mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="How we use your information">
          <p>We use your personal data to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Process and fulfil your orders and send order confirmations</li>
            <li>Create and manage your account</li>
            <li>Send transactional emails (order confirmation, shipping updates, password resets)</li>
            <li>Respond to your support inquiries</li>
            <li>Detect and prevent fraud or unauthorised account access</li>
            <li>Improve our website, product catalogue, and customer experience</li>
            <li>
              Send promotional emails if you have opted in (you can unsubscribe at any time)
            </li>
          </ul>
          <p>
            We do not sell your personal data to third parties for their own marketing purposes.
          </p>
        </Section>

        <Section title="Data sharing">
          <p>We share your data only with the following trusted service providers, and only to the extent necessary to operate our business:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Paystack</strong> - payment processing. Your card data goes directly to Paystack; we receive only a payment confirmation.
            </li>
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Resend</strong> - transactional email delivery (order confirmations, password resets).
            </li>
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Cloudinary</strong> - product image storage and delivery.
            </li>
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Neon / Vercel</strong> - secure cloud database and hosting infrastructure.
            </li>
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Logistics partners</strong> - your name and delivery address are shared with our courier partners solely for delivery purposes.
            </li>
          </ul>
          <p>
            We may also disclose your data when required by law, court order, or to protect the
            rights and safety of our users or the public.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            We use cookies and similar technologies to keep you signed in, remember your cart, and
            understand how our site is used. We do not use advertising or tracking cookies from
            third parties.
          </p>
          <p>
            You can disable cookies in your browser settings. Note that doing so may prevent some
            features (such as staying signed in or retaining your cart) from working correctly.
          </p>
        </Section>

        <Section title="Data retention">
          <p>
            We retain your account and order information for as long as your account is active or as
            needed to provide our services. If you delete your account, we will remove your personal
            data within 30 days, except where we are required by law to retain it (e.g., for tax or
            legal compliance purposes, typically 7 years).
          </p>
        </Section>

        <Section title="Your rights">
          <p>You have the right to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Access</strong> - request a copy of the personal data we hold about you
            </li>
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Correction</strong> - ask us to correct inaccurate data
            </li>
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Deletion</strong> - request that we delete your personal data
            </li>
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Portability</strong> - receive your data in a portable format
            </li>
            <li>
              <strong className="font-semibold text-gray-900 dark:text-white">Opt-out</strong> - unsubscribe from marketing emails at any time via the link in any email
            </li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a
              href="mailto:hello@gonesmartsolutions.com"
              className="font-medium text-[#5DC600] hover:text-[#4DAF00]"
            >
              hello@gonesmartsolutions.com
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        <Section title="Security">
          <p>
            We use industry-standard security measures including HTTPS encryption, secure
            password hashing, and access controls to protect your data. However, no method of
            transmission over the internet is 100% secure. We encourage you to use a strong,
            unique password for your account.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Our services are not directed to children under 13. We do not knowingly collect personal
            data from children. If you believe a child has provided us with their data, please
            contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the
            &quot;Last updated&quot; date at the top of this page. For significant changes, we will
            notify registered users by email.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about this policy? Contact us at{" "}
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
