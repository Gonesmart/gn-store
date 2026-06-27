import { resend, FROM_EMAIL, ADMIN_EMAIL } from "./resend";
import { orderConfirmationHtml, type OrderEmailData } from "@/emails/order-confirmation";
import { newOrderAdminHtml } from "@/emails/new-order-admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendOrderEmails(
  data: OrderEmailData & { orderId: string; customerEmail: string }
): Promise<void> {
  const orderUrl = `${APP_URL}/account/orders/${data.orderId}`;
  const adminOrderUrl = `${APP_URL}/admin/orders/${data.orderId}`;

  await Promise.allSettled([
    resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html: orderConfirmationHtml({ ...data, orderUrl }),
    }),
    ADMIN_EMAIL
      ? resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `New Order - ${data.orderNumber}`,
          html: newOrderAdminHtml({
            ...data,
            adminOrderUrl,
          }),
        })
      : Promise.resolve(),
  ]);
}
