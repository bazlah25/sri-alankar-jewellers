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
6. Add the virtual try-on feature separately using an AR provider or a custom face/ear-tracking implementation. This starter does not activate the camera.
7. For production, use an optimized image pipeline and configure any remote image domains as needed if you remove `unoptimized`.
