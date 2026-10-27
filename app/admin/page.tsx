"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowUpRight, Check, ImagePlus, LogOut, PackagePlus, Pencil, Search, Trash2, Upload, X } from "lucide-react";
import { useProductCatalog } from "@/components/ProductCatalogProvider";
import { formatPrice, type Product } from "@/data/products";

const categories: Product["category"][] = ["Necklaces", "Earrings", "Rings", "Bracelets", "Anklets", "Sets"];
const materials: Product["material"][] = ["925 Sterling Silver", "Silver Plated"];
const occasions = ["Everyday", "Celebration", "Gifting"];

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

export default function AdminPage() {
  const { products, customProducts, addProduct, updateProduct, removeProduct, loaded } = useProductCatalog();
  const [authState, setAuthState] = useState<"checking" | "signed-out" | "signed-in">("checking");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editError, setEditError] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Necklaces");
  const [material, setMaterial] = useState<Product["material"]>("925 Sterling Silver");
  const [style, setStyle] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(["Everyday"]);
  const [available, setAvailable] = useState(true);
  const [isNew, setIsNew] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(response => { if (active) setAuthState(response.ok ? "signed-in" : "signed-out"); })
      .catch(() => { if (active) setAuthState("signed-out"); });
    return () => { active = false; };
  }, []);

  const visibleProducts = useMemo(() => products.filter(product =>
    [product.name, product.category, product.id].join(" ").toLowerCase().includes(search.toLowerCase().trim())
  ), [products, search]);

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file to upload."); return; }
    if (file.size > 12 * 1024 * 1024) { setError("Please choose an image smaller than 12 MB."); return; }
    try {
      setImage(await readImage(file));
      setImageName(file.name);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not process this image.");
    }
  };

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!image) { setError("Upload a product image before adding this item."); return; }
    const productName = name.trim();
    const numericPrice = Number(price);
    if (!productName || !Number.isFinite(numericPrice) || numericPrice <= 0) { setError("Add a product name and a valid price."); return; }
    const baseId = slugify(productName) || "new-product";
    const id = products.some(product => product.id === baseId) ? `${baseId}-${Date.now().toString(36)}` : baseId;
    const product: Product = {
      id,
      name: productName,
      category,
      price: numericPrice,
      material,
      style: style.trim() || "Classic",
      occasions: selectedOccasions,
      available,
      image,
      isNew,
      isBestseller,
      collectionSlugs: selectedOccasions.includes("Gifting") ? ["gifting-edit"] : [],
    };
    addProduct(product);
    setName(""); setPrice(""); setCategory("Necklaces"); setMaterial("925 Sterling Silver");
    setStyle(""); setSelectedOccasions(["Everyday"]); setAvailable(true); setIsNew(true); setIsBestseller(false);
    setImage(""); setImageName(""); setNotice(`${productName} added to the catalogue.`);
    const input = document.getElementById("product-image-upload") as HTMLInputElement | null;
    if (input) input.value = "";
    window.setTimeout(() => setNotice(""), 3500);
  };

  const toggleOccasion = (value: string) => setSelectedOccasions(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);

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

  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProduct || !editingProduct.name.trim() || !Number.isFinite(editingProduct.price) || editingProduct.price <= 0) { setEditError("Add a product name and a valid price."); return; }
    const collectionSlugs = editingProduct.occasions.includes("Gifting")
      ? Array.from(new Set([...editingProduct.collectionSlugs.filter(slug => slug !== "gifting-edit"), "gifting-edit"]))
      : editingProduct.collectionSlugs.filter(slug => slug !== "gifting-edit");
    updateProduct(editingProduct.id, { ...editingProduct, name: editingProduct.name.trim(), collectionSlugs });
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
    <header className="sa-admin-topbar"><Link href="/" aria-label="Sri Alankar Jewellers storefront"><Image src="/sri-alankar-logo.png" alt="Sri Alankar Jewellers" width={220} height={74} priority/></Link><span>ADMIN</span><div><Link href="/">VIEW STOREFRONT <ArrowUpRight size={14}/></Link><button onClick={handleLogout}><LogOut size={14}/> SIGN OUT</button></div></header>
    <section className="sa-admin-shell">
      <header className="sa-admin-heading"><div><span className="sa-eyebrow">SRI ALANKAR JEWELLERS · STORE MANAGEMENT</span><h1>Product admin</h1><p>Add products, update prices, and keep your catalogue current.</p></div><span className="sa-admin-store-link">LOCAL CATALOGUE</span></header>
      <div className="sa-admin-stats"><article><span>Catalogue items</span><strong>{products.length}</strong></article><article><span>Custom uploads</span><strong>{customProducts.length}</strong></article><article><span>Available now</span><strong>{products.filter(product => product.available).length}</strong></article></div>
      <div className="sa-admin-grid">
        <section className="sa-admin-panel sa-admin-form-panel"><div className="sa-admin-panel-heading"><span className="sa-admin-step-icon"><PackagePlus size={17}/></span><div><h2>Add a product</h2><p>Product details and images appear in the storefront catalogue.</p></div></div>
          <form className="sa-admin-form" onSubmit={submitProduct}>
            <label className="sa-admin-upload" htmlFor="product-image-upload">{image ? <div className="sa-admin-image-preview"><Image src={image} alt="Uploaded product preview" fill sizes="220px" unoptimized/></div> : <div className="sa-admin-upload-prompt"><ImagePlus size={25}/><strong>Upload product image</strong><span>JPG, PNG, or WebP · up to 12 MB</span><span className="sa-admin-upload-button"><Upload size={14}/> CHOOSE IMAGE</span></div>}<input id="product-image-upload" type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={handleImage}/></label>
            {imageName && <p className="sa-admin-file-name"><Check size={13}/>{imageName}</p>}
            <div className="sa-admin-fields"><label className="sa-admin-wide">Product name<input required maxLength={90} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Moonstone Pendant Necklace"/></label><label>Price (₹)<input type="number" min="1" step="1" required value={price} onChange={event => setPrice(event.target.value)} placeholder="2499"/></label><label>Category<select value={category} onChange={event => setCategory(event.target.value as Product["category"])}>{categories.map(value => <option key={value}>{value}</option>)}</select></label><label className="sa-admin-wide">Material<select value={material} onChange={event => setMaterial(event.target.value as Product["material"])}>{materials.map(value => <option key={value}>{value}</option>)}</select></label><label className="sa-admin-wide">Style<input maxLength={60} value={style} onChange={event => setStyle(event.target.value)} placeholder="e.g. Minimal, Floral, Statement"/></label></div>
            <fieldset className="sa-admin-checks"><legend>Occasions</legend>{occasions.map(value => <label key={value}><input type="checkbox" checked={selectedOccasions.includes(value)} onChange={() => toggleOccasion(value)}/><span>{value}</span></label>)}</fieldset>
            <fieldset className="sa-admin-checks sa-admin-flags"><legend>Store settings</legend><label><input type="checkbox" checked={available} onChange={event => setAvailable(event.target.checked)}/><span>In stock</span></label><label><input type="checkbox" checked={isNew} onChange={event => setIsNew(event.target.checked)}/><span>Show in New In</span></label><label><input type="checkbox" checked={isBestseller} onChange={event => setIsBestseller(event.target.checked)}/><span>Bestseller</span></label></fieldset>
            {error && <p className="sa-admin-error" role="alert">{error}</p>}
            <button className="sa-admin-submit" type="submit"><PackagePlus size={16}/> ADD TO CATALOGUE</button>
          </form>
        </section>
        <section className="sa-admin-panel sa-admin-inventory"><div className="sa-admin-inventory-heading"><div><h2>Catalogue</h2><p>{visibleProducts.length} products</p></div><label className="sa-admin-search"><Search size={15}/><input aria-label="Search catalogue" placeholder="Search products" value={search} onChange={event => setSearch(event.target.value)}/></label></div>
          {!loaded ? <div className="sa-admin-loading">Loading catalogue…</div> : visibleProducts.length ? <div className="sa-admin-product-list">{visibleProducts.map(product => <article className="sa-admin-product-row" key={product.id}><div className="sa-admin-product-thumb"><Image src={product.image} alt="" fill sizes="52px" unoptimized/></div><div className="sa-admin-product-info"><h3>{product.name}</h3><span>{product.category} · {formatPrice(product.price)}</span></div><span className={`sa-admin-stock ${product.available ? "in-stock" : "out-stock"}`}>{product.available ? "In stock" : "Sold out"}</span><div className="sa-admin-row-actions"><button className="sa-admin-edit" type="button" onClick={() => { setEditingProduct({ ...product }); setEditError(""); }}> <Pencil size={13}/> EDIT</button>{customProducts.some(item => item.id === product.id) ? <button className="sa-admin-delete" type="button" aria-label={`Remove ${product.name}`} onClick={() => removeProduct(product.id)}><Trash2 size={15}/></button> : <span className="sa-admin-base-tag">STORE</span>}</div></article>)}</div> : <div className="sa-admin-empty"><p>No products match your search.</p></div>}
        </section>
      </div>
      <p className="sa-admin-storage-note">Demo admin: uploads are saved in local storage in this browser only. Connect a product database and staff sign-in before using it as a live store admin.</p>
    </section>
    {editingProduct && <div className="sa-admin-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setEditingProduct(null); }}><section className="sa-admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-product-title"><header><div><span className="sa-eyebrow">CATALOGUE UPDATE</span><h2 id="edit-product-title">Edit product</h2></div><button type="button" aria-label="Close edit product" onClick={() => setEditingProduct(null)}><X size={19}/></button></header><form className="sa-admin-form" onSubmit={saveEdit}><label className="sa-admin-edit-image">{editingProduct.image ? <Image src={editingProduct.image} alt="Product preview" fill sizes="180px" unoptimized/> : <ImagePlus size={22}/>}<span>CHANGE IMAGE</span><input type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 12 * 1024 * 1024) { setEditError("Choose an image smaller than 12 MB."); return; } try { const updatedImage = await readImage(file); setEditingProduct(current => current ? { ...current, image: updatedImage } : current); setEditError(""); } catch { setEditError("Could not process this image."); } }}/></label><div className="sa-admin-fields"><label className="sa-admin-wide">Product name<input required maxLength={90} value={editingProduct.name} onChange={event => setEditingProduct(current => current ? { ...current, name: event.target.value } : current)}/></label><label>Price (₹)<input type="number" min="1" step="1" required value={editingProduct.price} onChange={event => setEditingProduct(current => current ? { ...current, price: Number(event.target.value) } : current)}/></label><label>Category<select value={editingProduct.category} onChange={event => setEditingProduct(current => current ? { ...current, category: event.target.value as Product["category"] } : current)}>{categories.map(value => <option key={value}>{value}</option>)}</select></label><label className="sa-admin-wide">Material<select value={editingProduct.material} onChange={event => setEditingProduct(current => current ? { ...current, material: event.target.value as Product["material"] } : current)}>{materials.map(value => <option key={value}>{value}</option>)}</select></label><label className="sa-admin-wide">Style<input maxLength={60} value={editingProduct.style} onChange={event => setEditingProduct(current => current ? { ...current, style: event.target.value } : current)}/></label></div><fieldset className="sa-admin-checks"><legend>Occasions</legend>{occasions.map(value => <label key={value}><input type="checkbox" checked={editingProduct.occasions.includes(value)} onChange={event => setEditingProduct(current => current ? { ...current, occasions: event.target.checked ? [...current.occasions, value] : current.occasions.filter(item => item !== value) } : current)}/><span>{value}</span></label>)}</fieldset><fieldset className="sa-admin-checks sa-admin-flags"><legend>Store settings</legend><label><input type="checkbox" checked={editingProduct.available} onChange={event => setEditingProduct(current => current ? { ...current, available: event.target.checked } : current)}/><span>In stock</span></label><label><input type="checkbox" checked={Boolean(editingProduct.isNew)} onChange={event => setEditingProduct(current => current ? { ...current, isNew: event.target.checked } : current)}/><span>Show in New In</span></label><label><input type="checkbox" checked={Boolean(editingProduct.isBestseller)} onChange={event => setEditingProduct(current => current ? { ...current, isBestseller: event.target.checked } : current)}/><span>Bestseller</span></label></fieldset>{editError && <p className="sa-admin-error" role="alert">{editError}</p>}<button className="sa-admin-submit" type="submit"><Check size={15}/> SAVE CHANGES</button></form></section></div>}
    {notice && <div className="sa-admin-toast" role="status"><Check size={15}/>{notice}</div>}
  </main>;
}
