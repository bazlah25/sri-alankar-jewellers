import { products as baseProducts, type Product } from "@/data/products";
import { isDatabaseConfigured, supabaseRequest } from "@/lib/supabase-rest";

type ProductRow = { id: string; product: Product };

export async function getDatabaseCatalog(): Promise<Product[] | null> {
  if (!isDatabaseConfigured()) return null;
  let rows = await supabaseRequest<ProductRow[]>("products?select=id,product");
  const storedIds = new Set(rows.map(row => row.id));
  const missingBaseProducts = baseProducts.filter(product => !storedIds.has(product.id));
  if (missingBaseProducts.length) {
    await supabaseRequest("products?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify(missingBaseProducts.map(product => ({ id: product.id, product }))),
    });
    rows = [...rows, ...missingBaseProducts.map(product => ({ id: product.id, product }))];
  }
  const stored = new Map(rows.map(row => [row.id, row.product]));
  const baseIds = new Set(baseProducts.map(product => product.id));
  const merged = baseProducts.map(product => ({ ...product, ...(stored.get(product.id) || {}) }));
  for (const row of rows) if (!baseIds.has(row.id)) merged.push(row.product);
  return merged;
}
