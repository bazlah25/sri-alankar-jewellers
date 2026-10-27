# Connect Supabase

1. Create a Supabase project and run `migrations/202610270001_store_catalog_and_orders.sql` in the Supabase SQL Editor.
2. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the local `.env.local` and in the Vercel project's Production and Preview environment variables. Keep the secret key server-side; do not add a `NEXT_PUBLIC_` prefix or commit it.
3. Restart the local development server and redeploy Vercel after setting the variables.

The server seeds the built-in catalogue into `products` on first read. Admin uploads and edits are written to the database. Checkout currently stores Cash on Delivery orders and their customer, delivery, item, and price snapshots in `orders`. Online payment is not connected.
