"use server";

import { z } from "zod";
import { resend, FROM_EMAIL, ADMIN_EMAIL } from "@/lib/resend";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContact(
  data: z.infer<typeof schema>
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, subject, message } = parsed.data;
  const recipient = ADMIN_EMAIL || "hello@gonesmartsolutions.com";

  function esc(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const safeName = esc(name);
  const safeEmail = esc(email);
  const safeSubject = esc(subject);
  const safeMessage = esc(message);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      replyTo: email,
      subject: `[GN Store Contact] ${safeSubject}`,
      html: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f5f5f5;">
  <div style="background:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:#0D0D0D;padding:20px 28px;">
      <span style="font-size:18px;font-weight:900;color:#5DC600;">GN Store</span>
      <span style="font-size:12px;color:#888;margin-left:12px;">Contact Form</span>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 20px;font-size:18px;color:#1a1a1a;">New message from ${safeName}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:8px 0;font-size:13px;color:#999;width:80px;">From</td><td style="padding:8px 0;font-size:13px;color:#1a1a1a;">${safeName} &lt;${safeEmail}&gt;</td></tr>
        <tr><td style="padding:8px 0;font-size:13px;color:#999;">Subject</td><td style="padding:8px 0;font-size:13px;color:#1a1a1a;">${safeSubject}</td></tr>
      </table>
      <div style="background:#f8f8f8;border-radius:8px;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#444;white-space:pre-wrap;line-height:1.7;">${safeMessage}</p>
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:#999;">Reply directly to this email to respond to ${safeName}.</p>
    </div>
  </div>
</body>
</html>`,
    });

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to send your message. Please email us directly at hello@gonesmartsolutions.com",
    };
  }
}
