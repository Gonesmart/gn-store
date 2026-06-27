import type { OrderEmailData } from "./order-confirmation";

function ngn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function newOrderAdminHtml(
  data: OrderEmailData & { customerEmail: string; adminOrderUrl: string }
): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#1a1a1a;">
          ${item.productName} <span style="color:#999;">(${item.variantLabel}) &times; ${item.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#1a1a1a;text-align:right;font-weight:600;">
          ${ngn(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const addr = data.shippingAddress;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>New Order - ${data.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0D0D0D;padding:24px 32px;">
              <span style="font-size:18px;font-weight:900;color:#5DC600;">GN Store</span>
              <span style="font-size:13px;color:#666;float:right;line-height:1.4;">Admin Alert</span>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#EBF5E9;padding:16px 32px;border-bottom:3px solid #5DC600;">
              <p style="margin:0;font-size:16px;font-weight:700;color:#2E7D00;">
                &#128722; New Order Received
              </p>
              <p style="margin:4px 0 0;font-size:13px;color:#555;">
                A new paid order requires your attention.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">

              <!-- Order number + total -->
              <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
                <div>
                  <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;display:block;">Order Number</span>
                  <span style="font-family:monospace;font-size:18px;font-weight:700;color:#5DC600;">${data.orderNumber}</span>
                </div>
                <div style="text-align:right;">
                  <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;display:block;">Total Paid</span>
                  <span style="font-size:18px;font-weight:700;color:#1a1a1a;">${ngn(data.total)}</span>
                </div>
              </div>

              <!-- Customer info -->
              <div style="background:#f8f8f8;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:8px;">Customer</span>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">${data.customerName}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#555;">${data.customerEmail}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#555;">${data.shippingAddress.phone}</p>
              </div>

              <!-- Items -->
              <h2 style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Items</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
                <tr>
                  <td style="padding:10px 0 0;font-size:14px;font-weight:700;color:#1a1a1a;border-top:2px solid #f0f0f0;">Total</td>
                  <td style="padding:10px 0 0;font-size:14px;font-weight:700;color:#5DC600;text-align:right;border-top:2px solid #f0f0f0;">${ngn(data.total)}</td>
                </tr>
              </table>

              <!-- Delivery address -->
              <div style="margin-top:24px;padding:14px 18px;border:1px solid #e8e8e8;border-radius:8px;">
                <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:6px;">Ship to</span>
                <p style="margin:0;font-size:13px;color:#444;">${addr.fullName}, ${addr.addressLine1}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}, ${addr.city}, ${addr.state}</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-top:28px;">
                <a href="${data.adminOrderUrl}" style="display:inline-block;background:#5DC600;color:#000;font-weight:700;font-size:14px;text-decoration:none;padding:13px 28px;border-radius:8px;">
                  Manage Order
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:11px;color:#bbb;">GN Store Admin &mdash; This is an automated notification.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
