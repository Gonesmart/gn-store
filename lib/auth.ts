import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Reset your GN Store password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Reset your password</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset the password for your GN Store account.</p>
            <p style="margin: 24px 0;">
              <a href="${url}" style="background:#5DC600;color:#000;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
                Reset Password
              </a>
            </p>
            <p>This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
          </div>
        `,
      });
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
