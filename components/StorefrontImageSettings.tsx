"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { Check, ImagePlus, LoaderCircle, X } from "lucide-react";
import { useStorefrontImages } from "@/components/StorefrontImages";

const fields = [
  { key: "home", title: "Main page hero", note: "Homepage banner image." },
  { key: "all-jewellery", title: "All Jewellery hero", note: "All products page banner." },
  { key: "new-in", title: "New In hero", note: "New arrivals page banner." },
  { key: "category:necklaces", title: "Necklaces hero", note: "Necklaces category banner." },
  { key: "category:earrings", title: "Earrings hero", note: "Earrings category banner." },
  { key: "category:rings", title: "Rings hero", note: "Rings category banner." },
  { key: "category:bracelets", title: "Bracelets hero", note: "Bracelets category banner." },
  { key: "category:photo-frames", title: "Photo Frames hero", note: "Photo frames collection page banner." },
  { key: "category:pooja-essentials", title: "Pooja Essentials hero", note: "Pooja essentials collection page banner." },
];
const devices = [
  { key: "desktop" as const, title: "Desktop" },
  { key: "mobile" as const, title: "Mobile" },
];

function savedImage(value: { desktop?: string; mobile?: string } | string | undefined, device: "desktop" | "mobile") {
  if (typeof value === "string") return device === "desktop" ? value : "";
  return value?.[device] || "";
}

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      URL.revokeObjectURL(source);
      if (!context) return reject(new Error("Could not process this image."));
      context.fillStyle = "#fffdf8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    image.onerror = () => { URL.revokeObjectURL(source); reject(new Error("Could not read this image.")); };
    image.src = source;
  });
}

export default function StorefrontImageSettings() {
  const { images, updateImage } = useStorefrontImages();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectImage = async (key: string, device: "desktop" | "mobile", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    if (file.size > 12 * 1024 * 1024) { setError("Choose an image smaller than 12 MB."); return; }
    const slot = `${key}:${device}`;
    setBusy(slot); setError(""); setMessage("");
    try {
      const image = await compressImage(file);
      if (image.length > 4_000_000) throw new Error("This image is still too large after compression. Choose a smaller image.");
      await updateImage(key, device, image);
      setMessage(`${device === "desktop" ? "Desktop" : "Mobile"} image saved and now live on the storefront.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this image.");
    } finally { setBusy(""); }
  };

  const removeImage = async (key: string, device: "desktop" | "mobile") => {
    setBusy(`${key}:${device}`); setError(""); setMessage("");
    try { await updateImage(key, device, ""); setMessage(`${device === "desktop" ? "Desktop" : "Mobile"} image removed.`); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not restore the default image."); }
    finally { setBusy(""); }
  };

  return <section className="sa-admin-panel sa-admin-storefront-images">
    <div className="sa-admin-panel-heading"><span className="sa-admin-step-icon"><ImagePlus size={17}/></span><div><h2>Storefront images</h2><p>Upload desktop and mobile banners, plus images for Photo Frames and Pooja Essentials.</p></div></div>
    <div className="sa-admin-hero-image-grid">{fields.map(field => <article className="sa-admin-hero-image-card" key={field.key}>
      <header className="sa-admin-hero-image-title"><strong>{field.title}</strong><span>{field.note}</span></header>
      <div className="sa-admin-hero-image-devices">{devices.map(device => {
        const image = savedImage(images[field.key], device.key);
        const slot = `${field.key}:${device.key}`;
        return <div className="sa-admin-hero-image-device" key={device.key}>
          <div className={`sa-admin-hero-image-preview ${device.key}`}>{image ? <Image src={image} alt={`${field.title} ${device.title} preview`} fill sizes="300px" unoptimized/> : <div><ImagePlus size={19}/><span>No image set</span></div>}{busy === slot && <span className="sa-admin-image-busy"><LoaderCircle size={17}/> Saving…</span>}</div>
          <div className="sa-admin-hero-image-copy"><strong>{device.title}</strong><label className="sa-admin-hero-image-upload">{image ? "REPLACE" : "UPLOAD"}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" disabled={Boolean(busy)} onChange={event => void selectImage(field.key, device.key, event)}/></label>{image && <button className="sa-admin-hero-image-remove" type="button" aria-label={`Remove ${device.title.toLowerCase()} image for ${field.title}`} disabled={Boolean(busy)} onClick={() => void removeImage(field.key, device.key)}><X size={14}/></button>}</div>
        </div>;
      })}</div>
    </article>)}</div>
    {error && <p className="sa-admin-error" role="alert">{error}</p>}{message && <p className="sa-admin-image-success" role="status"><Check size={14}/>{message}</p>}
    <p className="sa-admin-image-help">Images are compressed in your browser and saved in the connected Supabase database. If only one version is set, it is used on both screen sizes.</p>
  </section>;
}
