# SAJ Silver Jewellery Storefront

A responsive Next.js starter homepage inspired by the supplied jewellery website screenshot.

## Included
- Announcement bar and responsive navigation
- Hero banner
- Shopping benefits
- Category cards
- Signature product grid
- Interactive wishlist buttons
- Demo cart counter and toast messages
- Brand story and gift banner
- Newsletter form demo
- Responsive mobile layout
- Optional on-device camera try-on for products with a hosted GLB model

## Requirements
- Node.js 18.17 or newer
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Project structure
```text
saj-silver-store/
├── app/
│   ├── globals.css   # All styling and responsive rules
│   ├── layout.tsx    # Root layout and page metadata
│   └── page.tsx      # Homepage components and demo interactions
├── package.json
├── next.config.mjs
├── tsconfig.json
└── README.md
```

## Before launching
1. Replace the SAJ placeholder brand name if needed.
2. Replace the sample Unsplash images with your own licensed product and campaign images.
3. Confirm product materials and claims (for example, 925 sterling silver) before publishing.
4. Connect real product data, inventory, payments, checkout, customer accounts, shipping, returns and email marketing.
5. The cart, wishlist, search and newsletter interactions in this starter are demos, not a production ecommerce backend.
6. To enable camera try-on, host each product's `.glb` model on HTTPS with cross-origin access, then enter its URL in `/admin` and enable camera try-on. Use a model centered around its jewelry anchor (ring, wrist, or necklace).
7. Try-on uses MediaPipe landmarks and Three.js in the browser. Camera frames are processed on the shopper's device and are not uploaded. The tracking runtime and public landmark models are downloaded from Google and jsDelivr; camera access requires HTTPS (localhost is supported for development).
8. For production, use an optimized image pipeline and configure any remote image domains as needed if you remove `unoptimized`.
9. To send order confirmation emails from `jewellerssrialankar@gmail.com`, set `SMTP_USER=jewellerssrialankar@gmail.com` and `SMTP_APP_PASSWORD` in `.env.local`, then add the same server-only variables to the Vercel project. By default, each order email is also BCC'd to `jewellerssrialankar@gmail.com`; set `ORDER_NOTIFICATION_EMAIL` to change the store inbox. Set `NEXT_PUBLIC_SITE_URL` to the public storefront URL for order tracking links. Use a Google App Password for SMTP. When the mail credentials are absent or Gmail cannot send, the order remains saved and checkout shows that email confirmation was unavailable.
10. Run `supabase/migrations/202610280001_order_tracking.sql` in Supabase to enable mobile-number order lookup. Customers can also track with their full order ID. Update order status in `/admin`.
