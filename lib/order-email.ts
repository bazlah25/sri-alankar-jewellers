import nodemailer, { type SendMailOptions } from "nodemailer";
import { resolve } from "node:path";
import { formatPrice } from "@/data/products";

type ConfirmationOrder = {
  id: string;
  customer: {
    email: string; firstName: string; lastName: string; phone: string;
    address: string; addressLine2: string; city: string; state: string; pincode: string;
  };
  items: { name: string; price: number; quantity: number; ring_size?: string; image?: string }[];
  subtotal: number;
  shipping: number;
  total: number;
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
}[character]!));

function confirmationHtml(order: ConfirmationOrder, trackingUrl: string, attachments: NonNullable<SendMailOptions["attachments"]>) {
  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const address = [order.customer.address, order.customer.addressLine2, order.customer.city, order.customer.state, order.customer.pincode].filter(Boolean).map(escapeHtml).join(", ");
  const rows = order.items.map((item, index) => {
    let imageSource = "";
    if (item.image?.startsWith("data:image/") && index < 8) {
      const image = item.image.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (image) {
        const cid = `saj-product-${index}@sri-alankar`;
        attachments.push({ filename: `product-${index + 1}.${image[1] === "image/png" ? "png" : image[1] === "image/webp" ? "webp" : "jpg"}`, content: Buffer.from(image[2], "base64"), contentType: image[1], cid, contentDisposition: "inline" });
        imageSource = `cid:${cid}`;
      }
    } else if (item.image && /^https:\/\/[^\s"'<>]+$/i.test(item.image)) imageSource = item.image;
    return `
    <tr>
      <td width="66" valign="top" style="padding:16px 10px 16px 0;border-bottom:1px solid #eee8dc">
        ${imageSource ? `<img src="${escapeHtml(imageSource)}" width="56" height="56" alt="${escapeHtml(item.name)}" style="display:block;width:56px;height:56px;object-fit:cover;border:1px solid #eee8dc">` : ""}
      </td>
      <td style="padding:16px 0;border-bottom:1px solid #eee8dc;color:#182642;font:14px Arial,sans-serif">
        <strong style="font-weight:600">${escapeHtml(item.name)}</strong>
        ${item.ring_size ? `<div style="margin-top:5px;color:#7b8190;font-size:12px">Ring size ${escapeHtml(item.ring_size)}</div>` : ""}
        <div style="margin-top:5px;color:#7b8190;font-size:12px">Qty ${item.quantity}</div>
      </td>
      <td align="right" style="padding:16px 0;border-bottom:1px solid #eee8dc;color:#182642;font:14px Arial,sans-serif;white-space:nowrap">${escapeHtml(formatPrice(item.price * item.quantity))}</td>
    </tr>`).join("");
  }).join("");

  return `<!doctype html><html><body style="margin:0;padding:0;background:#f5f1e8;font-family:Arial,sans-serif;color:#182642">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Your Sri Alankar Jewellers order is confirmed.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f1e8;padding:32px 12px"><tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf8;border:1px solid #e5dcc9">
        <tr><td align="center" style="padding:34px 28px 24px;border-bottom:1px solid #eee8dc">
          <img src="cid:saj-brand-logo" width="190" alt="Sri Alankar Jewellers" style="display:block;width:190px;max-width:100%;height:auto;margin:0 auto">
          <div style="margin-top:26px;font:10px Arial,sans-serif;letter-spacing:2px;color:#9b7a2e">ORDER CONFIRMED</div>
          <h1 style="margin:11px 0 8px;font:normal 32px Georgia,serif;color:#13213b">Thank you, ${escapeHtml(order.customer.firstName)}.</h1>
          <p style="margin:0;color:#687184;font:14px/1.6 Arial,sans-serif">Your order is in. We’ll get it ready with care.</p>
          <div style="display:inline-block;margin-top:18px;padding:10px 15px;border:1px solid #e5dcc9;color:#182642;font:12px Arial,sans-serif">ORDER #${orderNumber}</div>
        </td></tr>
        <tr><td style="padding:26px 28px 10px">
          <h2 style="margin:0 0 8px;font:normal 21px Georgia,serif;color:#13213b">Your order</h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;font:13px Arial,sans-serif;color:#687184">
            <tr><td style="padding:6px 0">Subtotal</td><td align="right" style="padding:6px 0;color:#182642">${escapeHtml(formatPrice(order.subtotal))}</td></tr>
            <tr><td style="padding:6px 0">Shipping</td><td align="right" style="padding:6px 0;color:#182642">${order.shipping ? escapeHtml(formatPrice(order.shipping)) : "Free"}</td></tr>
            <tr><td style="padding:13px 0;border-top:1px solid #e5dcc9;color:#13213b;font-weight:600">Total · Cash on delivery</td><td align="right" style="padding:13px 0;border-top:1px solid #e5dcc9;color:#13213b;font-weight:600">${escapeHtml(formatPrice(order.total))}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:14px 28px 28px">
          <h2 style="margin:0 0 10px;font:normal 21px Georgia,serif;color:#13213b">Delivering to</h2>
          <p style="margin:0;color:#687184;font:13px/1.7 Arial,sans-serif"><strong style="color:#182642">${escapeHtml(`${order.customer.firstName} ${order.customer.lastName}`)}</strong><br>${address}<br>${escapeHtml(order.customer.phone)}</p>
        </td></tr>
        <tr><td align="center" style="padding:20px 28px;background:#f7f4ec;border-top:1px solid #eee8dc;color:#747e8e;font:11px/1.7 Arial,sans-serif">
          <a href="${escapeHtml(trackingUrl)}" style="display:inline-block;margin:0 0 14px;padding:13px 21px;background:#0b1f4a;color:#fffdf8;text-decoration:none;font:600 11px Arial,sans-serif;letter-spacing:1px">TRACK YOUR ORDER</a><br>
          Need help with your order? Reply to this email.<br><span style="color:#182642">Sri Alankar Jewellers · Exclusive Jewels, Exclusive You.</span>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

export async function sendOrderConfirmationEmail(order: ConfirmationOrder) {
  const sender = "jewellerssrialankar@gmail.com";
  const account = process.env.SMTP_USER || sender;
  const password = process.env.SMTP_APP_PASSWORD;
  if (!password) return false;
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: account, pass: password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  try {
    const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "https://sri-alankar-jewellers.vercel.app").replace(/\/$/, "");
    const trackingLink = new URL("/track", siteOrigin.startsWith("http") ? siteOrigin : `https://${siteOrigin}`);
    trackingLink.searchParams.set("order", order.id);
    const attachments: NonNullable<SendMailOptions["attachments"]> = [{ filename: "sri-alankar-logo.png", path: resolve(process.cwd(), "public/sri-alankar-logo.png"), cid: "saj-brand-logo", contentDisposition: "inline" }];
    const html = confirmationHtml(order, trackingLink.toString(), attachments);
    const result = await transport.sendMail({
      from: `Sri Alankar Jewellers <${sender}>`,
      to: order.customer.email,
      replyTo: sender,
      subject: `Your Sri Alankar Jewellers order is confirmed · #${order.id.slice(0, 8).toUpperCase()}`,
      text: `Thank you, ${order.customer.firstName}. Your order #${order.id.slice(0, 8).toUpperCase()} is confirmed. Total: ${formatPrice(order.total)}. Payment: Cash on delivery.\n\nTrack your order: ${trackingLink.toString()}`,
      html,
      attachments,
    });
    return result.accepted.includes(order.customer.email) && !result.rejected.includes(order.customer.email);
  } catch (error) {
    console.error("Order confirmation email could not be sent.", error instanceof Error ? error.message : "Unknown mail error");
    return false;
  } finally {
    transport.close();
  }
}
