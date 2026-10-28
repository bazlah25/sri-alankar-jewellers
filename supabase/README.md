# Connect Supabase

1. Create a Supabase project and run `migrations/202610270001_store_catalog_and_orders.sql`, `migrations/202610270002_storefront_settings.sql`, `migrations/202610280001_order_tracking.sql`, and `migrations/202610280002_customer_accounts.sql` in the Supabase SQL Editor.
2. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the local `.env.local` and in the Vercel project's Production and Preview environment variables. Keep the secret key server-side; do not add a `NEXT_PUBLIC_` prefix or commit it.
3. Restart the local development server and redeploy Vercel after setting the variables.

The storefront reads only rows in `products`; it does not seed or append built-in demo products. Add catalogue items through `/admin`. Checkout stores Cash on Delivery orders and their customer, delivery, item, and price snapshots in `orders`. Online payment is not connected.

The admin storefront image section saves compressed desktop and mobile hero images in the `storefront_settings` table for the homepage, All Jewellery, New In, and each jewellery category page. Homepage category card images remain their own pictures.

Order tracking looks up a full order UUID or normalized checkout mobile number. The tracking migration adds and backfills the phone lookup field. Update order progress from the admin Orders section using Pending, Processing, Shipped, Delivered, or Cancelled.

Customer accounts use the `customer_accounts` table. Passwords are stored as salted scrypt hashes, and signed HTTP-only sessions use `CUSTOMER_SESSION_SECRET` (or the configured `SAJ_ADMIN_SESSION_SECRET` fallback). Customers can register, sign in, review their saved details and account-linked orders, and open the tracking page for an order.
