"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, Check, LogOut, PackagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useProductCatalog } from "@/components/ProductCatalogProvider";
import { formatPrice, type Product } from "@/data/products";
import StorefrontImageSettings from "@/components/StorefrontImageSettings";

const categories: Product["category"][] = ["Necklaces", "Earrings", "Rings", "Bracelets", "Photo Frames", "Pooja Essentials"];
type StoreOrder = { id: string; created_at: string; status: string; payment_method: string; customer: { firstName: string; lastName: string; email: string; phone: string; address: string; addressLine2?: string; city: string; state: string; pincode: string }; items: { product_id?: string; name: string; price: number; quantity: number; ring_size?: string; image?: string }[]; total: number };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    const source = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) { URL.revokeObjectURL(source); reject(new Error("Could not process this image.")); return; }
      context.fillStyle = "#fffdf8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(source);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };
    image.onerror = () => { URL.revokeObjectURL(source); reject(new Error("Could not read this image. Try a JPG, PNG, or WebP file.")); };
    image.src = source;
  });
}

function ProductImagesInput({ images, onChange, onError }: { images: string[]; onChange: (images: string[]) => void; onError: (message: string) => void }) {
  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (files.some(file => !file.type.startsWith("image/"))) { onError("Choose image files to upload."); return; }
    if (files.some(file => file.size > 12 * 1024 * 1024)) { onError("Each image must be smaller than 12 MB."); return; }
    try {
      const uploaded = await Promise.all(files.map(readImage));
      onChange([...images, ...uploaded]);
      onError("");
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "Could not process these images.");
    }
  };

  const removeImage = (index: number) => onChange(images.filter((_, imageIndex) => imageIndex !== index));

  return <div className="sa-admin-image-manager">
    <label className="sa-admin-upload">
      <div className="sa-admin-upload-prompt"><Plus size={25}/><strong>{images.length ? "Add another product photo" : "Add product photos"}</strong><span>{images.length ? `${images.length} ${images.length === 1 ? "photo" : "photos"} added · Select more images anytime` : "Select multiple images or add more anytime"}</span><span className="sa-admin-upload-button"><Plus size={15}/> {images.length ? "ADD ANOTHER PHOTO" : "CHOOSE PHOTOS"}</span></div>
      <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple onChange={handleFiles}/>
    </label>
    {images.length > 0 && <div className="sa-admin-image-thumbnails" aria-label="Product photo gallery">{images.map((src, index) => <div key={`${index}-${src.slice(0, 36)}`} className={`sa-admin-image-thumbnail ${index === 0 ? "cover" : ""}`}><Image src={src} alt={`Product photo ${index + 1}`} fill sizes="80px" unoptimized/><span>{index === 0 ? "COVER" : index + 1}</span><button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => removeImage(index)}><X size={13}/></button></div>)}</div>}
  </div>;
}

export default function AdminDashboard() {
  const pathname = usePathname();
  const adminSection = pathname === "/admin/images" ? "images" : pathname === "/admin/orders" ? "orders" : "products";
  const sectionCopy = {
    products: { title: "Products", description: "Add products, update prices, and keep your catalogue current." },
    images: { title: "Storefront images", description: "Manage desktop and mobile hero images across the storefront." },
    orders: { title: "Orders", description: "Review customer orders and update their delivery progress." },
  }[adminSection];
  const { products, customProducts, addProduct, updateProduct, removeProduct, loaded, databaseConfigured } = useProductCatalog();
  const [authState, setAuthState] = useState<"checking" | "signed-out" | "signed-in">("checking");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingRingSizes, setEditingRingSizes] = useState("");
  const [editError, setEditError] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [ringSizes, setRingSizes] = useState("");
  const [tryOnModelUrl, setTryOnModelUrl] = useState("");
  const [tryOnEnabled, setTryOnEnabled] = useState(false);
  const [category, setCategory] = useState<Product["category"]>("Necklaces");
  const [gender, setGender] = useState<Product["gender"]>("Unisex");
  const [images, setImages] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(response => { if (active) setAuthState(response.ok ? "signed-in" : "signed-out"); })
      .catch(() => { if (active) setAuthState("signed-out"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authState !== "signed-in" || adminSection !== "orders") return;
    fetch("/api/admin/orders", { cache: "no-store" })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Could not load orders.");
        setOrders(Array.isArray(result.orders) ? result.orders : []);
      })
      .catch(reason => setOrdersError(reason instanceof Error ? reason.message : "Could not load orders."));
  }, [authState, adminSection]);

  const visibleProducts = useMemo(() => products.filter(product =>
    [product.name, product.category, product.id].join(" ").toLowerCase().includes(search.toLowerCase().trim())
  ), [products, search]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const previous = orders.find(order => order.id === orderId)?.status;
    setOrders(current => current.map(order => order.id === orderId ? { ...order, status } : order));
    setOrdersError("");
    try {
      const response = await fetch("/api/admin/orders/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update order status.");
    } catch (reason) {
      if (previous) setOrders(current => current.map(order => order.id === orderId ? { ...order, status: previous } : order));
      setOrdersError(reason instanceof Error ? reason.message : "Could not update order status.");
    }
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!images.length) { setError("Upload at least one product image before adding this item."); return; }
    const productName = name.trim();
    const numericPrice = Number(price);
    if (!productName || !Number.isFinite(numericPrice) || numericPrice <= 0) { setError("Add a product name and a valid price."); return; }
    const baseId = slugify(productName) || "new-product";
    const id = products.some(product => product.id === baseId) ? `${baseId}-${Date.now().toString(36)}` : baseId;
    const product: Product = {
      id,
      name: productName,
      category,
      ...((category === "Rings" || category === "Bracelets") ? { gender } : {}),
      price: numericPrice,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(category === "Rings" && ringSizes.trim() ? { ringSizes: ringSizes.split(",").map(size => size.trim()).filter(Boolean) } : {}),
      ...(tryOnModelUrl.trim() ? { tryOnModelUrl: tryOnModelUrl.trim(), tryOn: tryOnEnabled } : {}),
      material: "925 Sterling Silver",
      style: "Classic",
      occasions: [],
      available: true,
      image: images[0],
      images,
      isNew: true,
      isBestseller: false,
      collectionSlugs: [],
    };
    try { await addProduct(product); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save this product."); return; }
    setName(""); setPrice(""); setDescription(""); setRingSizes(""); setTryOnModelUrl(""); setTryOnEnabled(false); setCategory("Necklaces"); setGender("Unisex");
    setImages([]); setNotice(`${productName} added to the catalogue.`);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setLoginError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const result = await response.json();
      if (!response.ok) { setLoginError(result.message || "Could not sign in."); return; }
      setPassword(""); setAuthState("signed-in");
    } catch { setLoginError("Could not reach the admin sign-in service."); }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setAuthState("signed-out"); setPassword(""); setEditingProduct(null);
  };

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProduct || !editingProduct.name.trim() || !Number.isFinite(editingProduct.price) || editingProduct.price <= 0) { setEditError("Add a product name and a valid price."); return; }
    const productImages = editingProduct.images?.length ? editingProduct.images : editingProduct.image ? [editingProduct.image] : [];
    if (!productImages.length) { setEditError("Keep at least one product photo."); return; }
    const sizes = editingRingSizes.split(",").map(size => size.trim()).filter(Boolean);
    try { await updateProduct(editingProduct.id, { ...editingProduct, image: productImages[0], images: productImages, name: editingProduct.name.trim(), ringSizes: editingProduct.category === "Rings" ? sizes : undefined }); } catch (reason) { setEditError(reason instanceof Error ? reason.message : "Could not update this product."); return; }
    setNotice(`${editingProduct.name} updated.`); setEditingProduct(null); setEditError("");
    window.setTimeout(() => setNotice(""), 3500);
  };

  if (authState !== "signed-in") return <main className="sa-admin-login-page">
    <section className="sa-admin-login-card">
      <Link href="/" className="sa-admin-login-logo" aria-label="Sri Alankar Jewellers home"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={260} height={100} priority/></Link>
      {authState === "checking" ? <p className="sa-admin-login-loading">Checking admin access…</p> : <>
        <span className="sa-eyebrow">STORE MANAGEMENT</span><h1>Admin sign in</h1><p className="sa-admin-login-copy">Sign in with your store admin credentials to manage the product catalogue.</p>
        <form className="sa-admin-login-form" onSubmit={handleLogin}><label>Username<input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required/></label>{loginError && <p role="alert">{loginError}</p>}<button type="submit">SIGN IN</button></form>
        <Link className="sa-admin-login-back" href="/">← Back to storefront</Link>
      </>}
    </section>
  </main>;

  return <main className="sa-page sa-admin-page">
    <header className="sa-admin-topbar"><Link href="/" aria-label="Sri Alankar Jewellers storefront"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={220} height={74} priority/></Link><span>ADMIN</span><nav className="sa-admin-nav" aria-label="Admin pages"><Link className={adminSection === "products" ? "active" : ""} href="/admin">Products</Link><Link className={adminSection === "images" ? "active" : ""} href="/admin/images">Storefront images</Link><Link className={adminSection === "orders" ? "active" : ""} href="/admin/orders">Orders</Link></nav><div><Link href="/">VIEW STOREFRONT <ArrowUpRight size={14}/></Link><button onClick={handleLogout}><LogOut size={14}/> SIGN OUT</button></div></header>
    <section className="sa-admin-shell">
      <header className="sa-admin-heading"><div><span className="sa-eyebrow">SRI ALANKAR JEWELLERS · STORE MANAGEMENT</span><h1>{sectionCopy.title}</h1><p>{sectionCopy.description}</p></div><span className="sa-admin-store-link">{databaseConfigured ? "CONNECTED DATABASE" : "LOCAL CATALOGUE"}</span></header>
      {loaded && !databaseConfigured && <p className="sa-admin-error" role="alert">Database isn’t configured on localhost. Add SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local, then restart the dev server. Vercel settings apply to the deployed site only.</p>}
      {adminSection === "products" && <div className="sa-admin-stats"><article><span>Catalogue items</span><strong>{products.length}</strong></article><article><span>Custom uploads</span><strong>{customProducts.length}</strong></article><article><span>Available now</span><strong>{products.filter(product => product.available).length}</strong></article></div>}
      {adminSection === "images" && <StorefrontImageSettings />}
      {adminSection === "products" && <div className="sa-admin-grid">
        <section className="sa-admin-panel sa-admin-form-panel"><div className="sa-admin-panel-heading"><span className="sa-admin-step-icon"><PackagePlus size={17}/></span><div><h2>Add a product</h2><p>Product details and images appear in the storefront catalogue.</p></div></div>
          <form className="sa-admin-form" onSubmit={submitProduct}>
            <ProductImagesInput images={images} onChange={setImages} onError={setError}/>
            <div className="sa-admin-fields"><label className="sa-admin-wide">Product name<input required maxLength={90} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Moonstone Pendant Necklace"/></label><label>Price (₹)<input type="number" min="1" step="1" required value={price} onChange={event => setPrice(event.target.value)} placeholder="2499"/></label><label>Category<select value={category} onChange={event => setCategory(event.target.value as Product["category"])}>{categories.map(value => <option key={value}>{value}</option>)}</select></label>{(category === "Rings" || category === "Bracelets") && <label>For<select value={gender} onChange={event => setGender(event.target.value as Product["gender"])}><option>Unisex</option><option>Male</option><option>Female</option></select></label>}{category === "Rings" && <label className="sa-admin-wide">Ring sizes<input value={ringSizes} onChange={event => setRingSizes(event.target.value)} placeholder="e.g. 6, 7, 8, 9"/><small>Enter available sizes separated by commas.</small></label>}<label className="sa-admin-wide">Product description<textarea rows={4} maxLength={1200} value={description} onChange={event => setDescription(event.target.value)} placeholder="Enter one description point per line."/><small>Each new line appears as a bullet under Product details.</small></label><label className="sa-admin-wide">3D model URL (.glb)<input type="url" value={tryOnModelUrl} onChange={event => setTryOnModelUrl(event.target.value)} placeholder="https://your-storage.example.com/product.glb"/><small>Host the GLB over HTTPS and allow cross-origin access.</small></label><label className="sa-admin-tryon-toggle"><input type="checkbox" checked={tryOnEnabled} disabled={!tryOnModelUrl.trim()} onChange={event => setTryOnEnabled(event.target.checked)}/><span>Enable on-device camera try-on</span></label></div>
            {error && <p className="sa-admin-error" role="alert">{error}</p>}
            <button className="sa-admin-submit" type="submit"><PackagePlus size={16}/> ADD TO CATALOGUE</button>
          </form>
        </section>
        <section className="sa-admin-panel sa-admin-inventory"><div className="sa-admin-inventory-heading"><div><h2>Catalogue</h2><p>{visibleProducts.length} products</p></div><label className="sa-admin-search"><Search size={15}/><input aria-label="Search catalogue" placeholder="Search products" value={search} onChange={event => setSearch(event.target.value)}/></label></div>
          {!loaded ? <div className="sa-admin-loading">Loading catalogue…</div> : visibleProducts.length ? <div className="sa-admin-product-list">{visibleProducts.map(product => <article className="sa-admin-product-row" key={product.id}><div className="sa-admin-product-thumb"><Image src={product.image} alt="" fill sizes="52px" unoptimized/></div><div className="sa-admin-product-info"><h3>{product.name}</h3><span>{product.category} · {formatPrice(product.price)}</span></div><span className={`sa-admin-stock ${product.available ? "in-stock" : "out-stock"}`}>{product.available ? "In stock" : "Sold out"}</span><div className="sa-admin-row-actions"><button className="sa-admin-edit" type="button" onClick={() => { setEditingProduct({ ...product }); setEditingRingSizes((product.ringSizes || []).join(", ")); setEditError(""); }}> <Pencil size={13}/> EDIT</button>{customProducts.some(item => item.id === product.id) ? <button className="sa-admin-delete" type="button" aria-label={`Remove ${product.name}`} onClick={async () => { try { await removeProduct(product.id); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not remove this product."); } }}><Trash2 size={15}/></button> : <span className="sa-admin-base-tag">STORE</span>}</div></article>)}</div> : <div className="sa-admin-empty"><p>No products match your search.</p></div>}
        </section>
      </div>}
      {adminSection === "orders" && <section className="sa-admin-panel sa-admin-orders"><div className="sa-admin-inventory-heading"><div><h2>Recent orders</h2><p>Latest orders saved in the store database</p></div><span className="sa-admin-base-tag">{orders.length} ORDERS</span></div>
        {ordersError && <p className="sa-admin-error" role="alert">{ordersError}</p>}{orders.length ? <div className="sa-admin-order-list">{orders.map(order => <article key={order.id} className="sa-admin-order-row"><div className="sa-admin-order-main"><strong>#{order.id.slice(0, 8).toUpperCase()} · {order.customer.firstName} {order.customer.lastName}</strong><span>{new Date(order.created_at).toLocaleString("en-IN")} · {order.payment_method.toUpperCase()}</span><label className="sa-admin-order-status">Order status<select value={order.status} onChange={event => void updateOrderStatus(order.id, event.target.value)}><option value="pending">Pending</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label><span>{order.customer.email} · {order.customer.phone}</span><span>{order.customer.address}{order.customer.addressLine2 ? `, ${order.customer.addressLine2}` : ""}, {order.customer.city}, {order.customer.state} {order.customer.pincode}</span><div className="sa-admin-order-items">{order.items.map((item, itemIndex) => { const productImage = item.image || products.find(product => product.id === item.product_id || product.name === item.name)?.image; return <div className="sa-admin-order-item" key={`${order.id}-${item.product_id || item.name}-${itemIndex}`}>{productImage ? <div className="sa-admin-order-item-image"><Image src={productImage} alt="" fill sizes="52px" unoptimized/></div> : <div className="sa-admin-order-item-image sa-admin-order-item-placeholder">No image</div>}<div className="sa-admin-order-item-info"><strong>{item.name}</strong><span>{item.ring_size ? `Size ${item.ring_size} · ` : ""}Qty {item.quantity}</span></div><strong className="sa-admin-order-item-price">{formatPrice(item.price * item.quantity)}</strong></div>; })}</div></div><strong>{formatPrice(order.total)}</strong></article>)}</div> : !ordersError && <p className="sa-admin-storage-note">No database orders yet. Orders will appear here after checkout is connected.</p>}
      </section>}
      {adminSection === "products" && <p className="sa-admin-storage-note">When Supabase is configured, product edits are shared through the store database. Without database settings, catalogue changes remain in this browser only.</p>}
    </section>
    {adminSection === "products" && editingProduct && <div className="sa-admin-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setEditingProduct(null); }}><section className="sa-admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-product-title"><header><div><span className="sa-eyebrow">CATALOGUE UPDATE</span><h2 id="edit-product-title">Edit product</h2></div><button type="button" aria-label="Close edit product" onClick={() => setEditingProduct(null)}><X size={19}/></button></header><form className="sa-admin-form" onSubmit={saveEdit}><ProductImagesInput images={editingProduct.images?.length ? editingProduct.images : editingProduct.image ? [editingProduct.image] : []} onChange={nextImages => setEditingProduct(current => current ? { ...current, image: nextImages[0] || "", images: nextImages } : current)} onError={setEditError}/><div className="sa-admin-fields"><label className="sa-admin-wide">Product name<input required maxLength={90} value={editingProduct.name} onChange={event => setEditingProduct(current => current ? { ...current, name: event.target.value } : current)}/></label><label>Price (₹)<input type="number" min="1" step="1" required value={editingProduct.price} onChange={event => setEditingProduct(current => current ? { ...current, price: Number(event.target.value) } : current)}/></label><label>Category<select value={editingProduct.category} onChange={event => setEditingProduct(current => current ? { ...current, category: event.target.value as Product["category"] } : current)}>{categories.map(value => <option key={value}>{value}</option>)}</select></label>{(editingProduct.category === "Rings" || editingProduct.category === "Bracelets") && <label>For<select value={editingProduct.gender || "Unisex"} onChange={event => setEditingProduct(current => current ? { ...current, gender: event.target.value as Product["gender"] } : current)}><option>Unisex</option><option>Male</option><option>Female</option></select></label>}{editingProduct.category === "Rings" && <label className="sa-admin-wide">Ring sizes<input value={editingRingSizes} onChange={event => setEditingRingSizes(event.target.value)} placeholder="e.g. 6, 7, 8, 9"/><small>Enter available sizes separated by commas.</small></label>}<label className="sa-admin-wide">Product description<textarea rows={4} maxLength={1200} value={editingProduct.description || ""} onChange={event => setEditingProduct(current => current ? { ...current, description: event.target.value } : current)} placeholder="Enter one description point per line."/><small>Each new line appears as a bullet under Product details.</small></label><label className="sa-admin-wide">3D model URL (.glb)<input type="url" value={editingProduct.tryOnModelUrl || ""} onChange={event => setEditingProduct(current => current ? { ...current, tryOnModelUrl: event.target.value, tryOn: event.target.value.trim() ? current.tryOn : false } : current)} placeholder="https://your-storage.example.com/product.glb"/><small>Host the GLB over HTTPS and allow cross-origin access.</small></label><label className="sa-admin-tryon-toggle"><input type="checkbox" checked={Boolean(editingProduct.tryOn)} disabled={!editingProduct.tryOnModelUrl?.trim()} onChange={event => setEditingProduct(current => current ? { ...current, tryOn: event.target.checked } : current)}/><span>Enable on-device camera try-on</span></label></div>{editError && <p className="sa-admin-error" role="alert">{editError}</p>}<button className="sa-admin-submit" type="submit"><Check size={15}/> SAVE CHANGES</button></form></section></div>}
    {notice && <div className="sa-admin-toast" role="status"><Check size={15}/>{notice}</div>}
  </main>;
}
