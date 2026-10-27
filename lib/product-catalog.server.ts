import type { Product } from "@/data/products";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

type ProductRow = { id: string; product: Product };

export async function getDatabaseCatalog(): Promise<Product[] | null> {
  if (!isDatabaseConfigured()) return null;
  const rows = await supabaseRequest<ProductRow[]>("products?select=id,product");
  return rows.map(row => row.product);
}
