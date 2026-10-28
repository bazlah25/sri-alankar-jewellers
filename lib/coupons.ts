export type Coupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
};

export function couponDiscount(coupon: Coupon, subtotal: number, now = Date.now()) {
  const start = Date.parse(coupon.valid_from);
  const end = Date.parse(coupon.valid_to);
  if (!coupon.active || !Number.isFinite(start) || !Number.isFinite(end) || now < start || now > end) return null;
  if (coupon.discount_type === "percentage" && (coupon.discount_value < 1 || coupon.discount_value > 100)) return null;
  if (coupon.discount_type === "fixed" && coupon.discount_value < 1) return null;
  return Math.min(subtotal, coupon.discount_type === "percentage" ? Math.floor(subtotal * coupon.discount_value / 100) : coupon.discount_value);
}
