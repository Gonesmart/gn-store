export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: { productName: string; variantLabel: string; quantity: number; price: number }[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    phone: string;
  };
  orderUrl: string;
}

function ngn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function orderConfirmationHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">
          <strong>${item.productName}</strong><br/>
          <span style="color:#666;font-size:12px;">${item.variantLabel} &times; ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;text-align:right;font-weight:600;">
          ${ngn(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join("");

  const discountRow =
    data.discountAmount > 0
      ? `<tr>
          <td style="padding:6px 0;font-size:13px;color:#5DC600;">Discount</td>
          <td style="padding:6px 0;font-size:13px;color:#5DC600;text-align:right;">- ${ngn(data.discountAmount)}</td>
        </tr>`
      : "";

  const addr = data.shippingAddress;
  const addrLine = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(", ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmed - ${data.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0D0D0D;padding:28px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:900;color:#5DC600;letter-spacing:-0.5px;">GN Store</span>
              <br/>
              <span style="font-size:11px;color:#888;letter-spacing:0.1em;text-transform:uppercase;">Gonesmart Solutions</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">

              <!-- Checkmark + heading -->
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;width:56px;height:56px;background:#EBF5E9;border-radius:50%;line-height:56px;font-size:28px;text-align:center;">&#10003;</div>
                <h1 style="margin:16px 0 8px;font-size:22px;color:#1a1a1a;font-weight:900;">Order Confirmed!</h1>
                <p style="margin:0;font-size:14px;color:#666;">
                  Hi ${data.customerName}, your order has been received and is being prepared.
                </p>
              </div>

              <!-- Order number -->
              <div style="background:#f8f8f8;border-radius:8px;padding:16px 20px;margin-bottom:24px;text-align:center;">
                <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:4px;">Order Number</span>
                <span style="font-family:monospace;font-size:20px;font-weight:700;color:#5DC600;">${data.orderNumber}</span>
              </div>

              <!-- Items -->
              <h2 style="font-size:13px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Items Ordered</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>

              <!-- Price breakdown -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666;">Subtotal</td>
                  <td style="padding:6px 0;font-size:13px;color:#666;text-align:right;">${ngn(data.subtotal)}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666;">Shipping</td>
                  <td style="padding:6px 0;font-size:13px;color:#666;text-align:right;">${data.shippingAmount === 0 ? "Free" : ngn(data.shippingAmount)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#1a1a1a;border-top:2px solid #f0f0f0;">Total</td>
                  <td style="padding:12px 0 0;font-size:15px;font-weight:700;color:#5DC600;text-align:right;border-top:2px solid #f0f0f0;">${ngn(data.total)}</td>
                </tr>
              </table>

              <!-- Shipping address -->
              <div style="margin-top:28px;padding:16px 20px;border:1px solid #f0f0f0;border-radius:8px;">
                <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:8px;">Delivering to</span>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a1a;">${addr.fullName}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#666;">${addrLine}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#666;">${addr.city}, ${addr.state}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#999;">${addr.phone}</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-top:32px;">
                <a href="${data.orderUrl}" style="display:inline-block;background:#5DC600;color:#000;font-weight:700;font-size:14px;text-decoration:none;padding:14px 32px;border-radius:8px;">
                  View Your Order
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#999;">
                If you have questions about your order, reply to this email or contact us at
                <a href="mailto:hello@gonesmartsolutions.com" style="color:#5DC600;text-decoration:none;">hello@gonesmartsolutions.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#bbb;">&copy; ${new Date().getFullYear()} Gonesmart Solutions. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
