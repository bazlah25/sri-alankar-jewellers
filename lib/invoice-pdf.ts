import { readFileSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";
import { resolve } from "node:path";

type InvoiceOrder = {
  id: string;
  created_at: string;
  status?: string;
  customer: {
    firstName: string; lastName: string; email: string; phone: string;
    address: string; addressLine2?: string; city: string; state: string; pincode: string;
  };
  items: { product_id?: string; name: string; price: number; quantity: number; ring_size?: string; image?: string }[];
  subtotal: number; shipping: number; discount?: number; couponCode?: string; total: number;
  payment_method?: string;
};

const PAGE_W = 595;
const PAGE_H = 842;
const NAVY = "0.043 0.122 0.290";
const GOLD = "0.647 0.478 0.176";
const MUTED = "0.400 0.443 0.514";
const BORDER = "0.890 0.859 0.800";
const PALE = "0.965 0.953 0.922";

function printable(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/₹/g, "INR ").replace(/[–—]/g, "-").replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[·•]/g, " | ")
    .replace(/[^\x20-\x7E]/g, "?");
}

function literal(value: string) {
  return `(${printable(value).replace(/([\\()])/g, "\\$1")})`;
}

function money(value: number) {
  return `INR ${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function wrap(value: string, limit: number) {
  const words = printable(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > limit && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function invoiceDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(value));
}

let cachedLogo: { width: number; height: number; rgb: Buffer; alpha: Buffer } | undefined;

function getLogoPixels() {
  if (cachedLogo) return cachedLogo;
  const png = readFileSync(resolve(process.cwd(), "public/sri-alankar-logo.png"));
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const imageData: Buffer[] = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    if (type === "IHDR") {
      width = png.readUInt32BE(dataStart);
      height = png.readUInt32BE(dataStart + 4);
      bitDepth = png[dataStart + 8];
      colorType = png[dataStart + 9];
      interlace = png[dataStart + 12];
    } else if (type === "IDAT") imageData.push(png.subarray(dataStart, dataStart + length));
    else if (type === "IEND") break;
    offset = dataStart + length + 4;
  }
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) throw new Error("The invoice logo must be a non-interlaced RGBA PNG.");
  const source = inflateSync(Buffer.concat(imageData));
  const stride = width * 4;
  const pixels = Buffer.alloc(height * stride);
  const paeth = (a: number, b: number, c: number) => {
    const p = a + b - c;
    const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let row = 0; row < height; row += 1) {
    const filter = source[row * (stride + 1)];
    const sourceStart = row * (stride + 1) + 1;
    const rowStart = row * stride;
    for (let column = 0; column < stride; column += 1) {
      const raw = source[sourceStart + column];
      const left = column >= 4 ? pixels[rowStart + column - 4] : 0;
      const up = row > 0 ? pixels[rowStart + column - stride] : 0;
      const upperLeft = row > 0 && column >= 4 ? pixels[rowStart + column - stride - 4] : 0;
      const predictor = filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : filter === 4 ? paeth(left, up, upperLeft) : 0;
      pixels[rowStart + column] = (raw + predictor) & 255;
    }
  }
  const rgb = Buffer.alloc(width * height * 3);
  const alpha = Buffer.alloc(width * height);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    rgb[pixel * 3] = pixels[pixel * 4];
    rgb[pixel * 3 + 1] = pixels[pixel * 4 + 1];
    rgb[pixel * 3 + 2] = pixels[pixel * 4 + 2];
    alpha[pixel] = pixels[pixel * 4 + 3];
  }
  cachedLogo = { width, height, rgb: deflateSync(rgb), alpha: deflateSync(alpha) };
  return cachedLogo;
}

function streamObject(dictionary: string, data: Buffer) {
  return Buffer.concat([Buffer.from(`${dictionary}\nstream\n`, "ascii"), data, Buffer.from("\nendstream", "ascii")]);
}

function jpegFromDataUrl(value?: string) {
  const match = value?.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const data = Buffer.from(match[1], "base64");
  let width = 0;
  let height = 0;
  for (let offset = 2; offset + 9 < data.length;) {
    if (data[offset] !== 0xff) { offset += 1; continue; }
    while (data[offset] === 0xff) offset += 1;
    const marker = data[offset++];
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > data.length) break;
    const length = data.readUInt16BE(offset);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      height = data.readUInt16BE(offset + 3);
      width = data.readUInt16BE(offset + 5);
      break;
    }
    offset += length;
  }
  return width && height ? { width, height, data } : null;
}

export function createInvoicePdf(order: InvoiceOrder) {
  const pages: string[][] = [[]];
  const productImages = order.items.map((item, index) => index < 12 ? jpegFromDataUrl(item.image) : null);
  let pageIndex = 0;
  let y = 0;
  let rowsOnPage = 0;
  const page = () => pages[pageIndex];
  const text = (x: number, top: number, size: number, value: string, color = NAVY, bold = false) => {
    page().push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${color} rg 1 0 0 1 ${x} ${PAGE_H - top - size} Tm ${literal(value)} Tj ET`);
  };
  const rect = (x: number, top: number, width: number, height: number, color: string) => {
    page().push(`${color} rg ${x} ${PAGE_H - top - height} ${width} ${height} re f`);
  };
  const line = (x1: number, top1: number, x2: number, top2: number, color = BORDER, width = 1) => {
    page().push(`${color} RG ${width} w ${x1} ${PAGE_H - top1} m ${x2} ${PAGE_H - top2} l S`);
  };
  const outlineRect = (x: number, top: number, width: number, height: number, color = GOLD) => {
    page().push(`${color} RG 0.65 w ${x} ${PAGE_H - top - height} ${width} ${height} re S`);
  };
  const circle = (centerX: number, top: number, radius: number) => {
    const centerY = PAGE_H - top - radius;
    const curve = radius * 0.55228475;
    page().push(`q ${GOLD} RG 0.65 w ${centerX + radius} ${centerY} m ${centerX + radius} ${centerY + curve} ${centerX + curve} ${centerY + radius} ${centerX} ${centerY + radius} c ${centerX - curve} ${centerY + radius} ${centerX - radius} ${centerY + curve} ${centerX - radius} ${centerY} c ${centerX - radius} ${centerY - curve} ${centerX - curve} ${centerY - radius} ${centerX} ${centerY - radius} c ${centerX + curve} ${centerY - radius} ${centerX + radius} ${centerY - curve} ${centerX + radius} ${centerY} c S Q`);
  };
  const image = (name: string, x: number, top: number, width: number, height: number) => {
    page().push(`q ${width} 0 0 ${height} ${x} ${PAGE_H - top - height} cm /${name} Do Q`);
  };
  const contactIcon = (kind: "mail" | "phone" | "address", x: number, top: number) => {
    if (kind === "mail") {
      outlineRect(x, top + 2, 10, 7);
      line(x + 1, top + 3, x + 5, top + 6, GOLD, 0.65);
      line(x + 5, top + 6, x + 9, top + 3, GOLD, 0.65);
    } else if (kind === "phone") {
      line(x + 1, top + 1, x + 2.5, top + 0.5, GOLD, 1.1);
      line(x + 2.5, top + 0.5, x + 4, top + 2, GOLD, 1.1);
      line(x + 4, top + 2, x + 3, top + 3.5, GOLD, 1.1);
      line(x + 3, top + 3.5, x + 6.5, top + 7, GOLD, 1.1);
      line(x + 6.5, top + 7, x + 8, top + 6, GOLD, 1.1);
      line(x + 8, top + 6, x + 9.5, top + 7.5, GOLD, 1.1);
      line(x + 9.5, top + 7.5, x + 9, top + 9, GOLD, 1.1);
      line(x + 9, top + 9, x + 7, top + 9, GOLD, 1.1);
      line(x + 7, top + 9, x + 4, top + 7, GOLD, 1.1);
      line(x + 4, top + 7, x + 1.5, top + 4, GOLD, 1.1);
      line(x + 1.5, top + 4, x + 1, top + 1, GOLD, 1.1);
    } else {
      circle(x + 5, top + 1, 4);
      line(x + 2.5, top + 8, x + 5, top + 12, GOLD, 0.8);
      line(x + 5, top + 12, x + 7.5, top + 8, GOLD, 0.8);
      circle(x + 5, top + 3, 1.1);
    }
  };
  const drawHeader = (first: boolean) => {
    rect(0, 0, PAGE_W, first ? 146 : 99, PALE);
    if (first) {
      image("Logo", 38, 28, 228, 76);
      text(370, 35, 21, "I N V O I C E", NAVY, true);
      line(397, 72, 513, 72, GOLD, 1.1);
      rect(451, 69, 7, 7, GOLD);
      text(360, 89, 10, "Thank you for your order!", GOLD, true);
      text(361, 106, 8, "We appreciate your trust in Sri Alankar Jewellers.", MUTED);
      line(35, 146, 560, 146, GOLD, 0.8);
    } else {
      image("Logo", 38, 13, 180, 60);
      text(423, 30, 11, "ORDER INVOICE", NAVY, true);
      text(423, 48, 8, `ORDER #${order.id.slice(0, 8).toUpperCase()}`, GOLD, true);
      line(35, 99, 560, 99, GOLD, 0.8);
    }
  };
  const drawTableHeading = () => {
    rect(35, y, 525, 30, PALE);
    text(48, y + 10, 11, "Order Items", NAVY, true);
    y += 37;
    rect(35, y, 525, 25, PALE);
    text(48, y + 8, 7, "PRODUCT", NAVY, true);
    text(132, y + 8, 7, "PRODUCT NAME", NAVY, true);
    text(343, y + 8, 7, "PRICE", NAVY, true);
    text(426, y + 8, 7, "QTY", NAVY, true);
    text(484, y + 8, 7, "TOTAL", NAVY, true);
    y += 25;
  };
  const addItemPage = () => {
    pages.push([]); pageIndex += 1; rowsOnPage = 0;
    drawHeader(false); y = 113; drawTableHeading();
  };
  const drawOrderDetails = () => {
    const row = (label: string, value: string, index: number) => {
      const rowY = 164 + index * 17;
      text(42, rowY, 8, label, MUTED);
      text(141, rowY, 9, value, NAVY, index === 0);
    };
    row("Order Number", `#${order.id.slice(0, 8).toUpperCase()}`, 0);
    row("Order Date", invoiceDate(order.created_at), 1);
    row("Payment Method", order.payment_method === "cod" || !order.payment_method ? "Cash on Delivery" : order.payment_method, 2);
    row("Order Status", !order.status || order.status === "pending" ? "Confirmed" : order.status[0].toUpperCase() + order.status.slice(1), 3);
    line(310, 160, 310, 231, GOLD, 0.8);
    text(330, 162, 11, "Customer Details", NAVY, true);
    text(330, 180, 9, `${order.customer.firstName} ${order.customer.lastName}`, NAVY, true);
    text(330, 196, 8, order.customer.email, MUTED);
    text(330, 211, 8, order.customer.phone, MUTED);
  };

  drawHeader(true);
  drawOrderDetails();
  y = 244;
  drawTableHeading();

  order.items.forEach((item, index) => {
    const productName = wrap(item.name, 29);
    const detailLines = [...productName, ...(item.ring_size ? [`Size: ${item.ring_size}`] : [])];
    const rowHeight = Math.max(66, detailLines.length > 2 ? 72 : 66);
    if ((pageIndex === 0 && rowsOnPage >= 3) || (pageIndex > 0 && y + rowHeight > 635)) addItemPage();
    const rowY = y;
    if (productImages[index]) {
      rect(47, rowY + 5, 67, 56, PALE);
      const embedded = productImages[index]!;
      const fit = Math.min(61 / embedded.width, 50 / embedded.height);
      const width = embedded.width * fit;
      const height = embedded.height * fit;
      const imageName = `Product${index}`;
      image(imageName, 50 + (61 - width) / 2, rowY + 8 + (50 - height) / 2, width, height);
    } else rect(47, rowY + 5, 67, 56, PALE);
    detailLines.forEach((detail, detailIndex) => text(132, rowY + 13 + detailIndex * 12, detailIndex === 0 ? 9 : 7, detail, detailIndex === 0 ? NAVY : MUTED, detailIndex === 0));
    text(343, rowY + 27, 8, money(item.price), NAVY);
    text(431, rowY + 27, 8, String(item.quantity), NAVY);
    text(482, rowY + 27, 8, money(item.price * item.quantity), NAVY, true);
    line(35, rowY + rowHeight, 560, rowY + rowHeight, BORDER, 0.65);
    y += rowHeight;
    rowsOnPage += 1;
  });

  if (y + 225 > 740) { pages.push([]); pageIndex += 1; drawHeader(false); y = 121; }
  const summaryY = y + 16;
  rect(35, summaryY, 275, 82, PALE);
  text(54, summaryY + 14, 8, "A NOTE FROM US", GOLD, true);
  text(54, summaryY + 31, 8, "Thank you for choosing Sri Alankar Jewellers.", NAVY);
  text(54, summaryY + 46, 8, "We hope your new jewellery brings joy to your", NAVY);
  text(54, summaryY + 60, 8, "special moments.", NAVY);

  const totalsX = 340;
  const right = 550;
  let totalY = summaryY + 1;
  const totalRow = (label: string, value: string, color = NAVY, bold = false) => {
    text(totalsX, totalY, 9, label, color, bold);
    text(right - printable(value).length * 4.7, totalY, 9, value, color, bold);
    totalY += 19;
  };
  totalRow("Subtotal", money(order.subtotal));
  if (order.discount) totalRow(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `- ${money(order.discount)}`, "0.220 0.420 0.325");
  totalRow("Shipping", order.shipping ? money(order.shipping) : "Free");
  line(totalsX, totalY - 4, 560, totalY - 4, GOLD, 0.8);
  rect(totalsX - 6, totalY + 1, 226, 27, PALE);
  totalRow("Total (INR)", money(order.total), NAVY, true);

  const addressY = Math.max(summaryY + 100, totalY + 14);
  line(35, addressY, 560, addressY, BORDER, 0.7);
  text(48, addressY + 14, 10, "Shipping Address", NAVY, true);
  text(334, addressY + 14, 10, "Need Help?", NAVY, true);
  line(310, addressY + 9, 310, addressY + 122, GOLD, 0.7);
  const addressLines = [
    `${order.customer.firstName} ${order.customer.lastName}`,
    ...wrap(order.customer.address, 32),
    ...(order.customer.addressLine2 ? wrap(order.customer.addressLine2, 32) : []),
    ...wrap(`${order.customer.city}, ${order.customer.state} ${order.customer.pincode}`, 32),
    order.customer.phone,
  ];
  addressLines.slice(0, 5).forEach((addressLine, index) => text(48, addressY + 31 + index * 11, 7.5, addressLine, MUTED));
  text(334, addressY + 32, 8, "For order support, reply to your confirmation email.", MUTED);
  contactIcon("mail", 334, addressY + 46);
  text(349, addressY + 48, 8, "jewellerssrialankar@gmail.com", NAVY);
  contactIcon("phone", 334, addressY + 59);
  text(349, addressY + 62, 8, "+91 99550 67766", NAVY);
  contactIcon("address", 334, addressY + 85);
  wrap("Sri Alankar Jewellers, Gandhi Bazaar, Near Anjaneya Temple, Opposite Lalitha Bakery, Hassan - 573201", 48)
    .slice(0, 3).forEach((contactLine, index) => text(349, addressY + 87 + index * 8, 7, contactLine, MUTED));

  const footerY = 755;
  rect(0, footerY, PAGE_W, PAGE_H - footerY, PALE);
  line(35, footerY, 560, footerY, GOLD, 0.7);
  const footerItems = ["925 Sterling Silver", "Secure Delivery", "Crafted with Care", "Elegant Designs"];
  footerItems.forEach((label, index) => {
    const center = 100 + index * 132;
    circle(center, footerY + 11, 10);
    line(center - 4, footerY + 21, center, footerY + 16, GOLD, 0.65);
    line(center, footerY + 16, center + 4, footerY + 21, GOLD, 0.65);
    line(center + 4, footerY + 21, center, footerY + 26, GOLD, 0.65);
    line(center, footerY + 26, center - 4, footerY + 21, GOLD, 0.65);
    text(center - label.length * 1.75, footerY + 38, 7, label, NAVY);
  });
  line(56, footerY + 57, 539, footerY + 57, BORDER, 0.55);
  text(183, footerY + 66, 7, "SRI ALANKAR JEWELLERS  ·  EXCLUSIVE JEWELS, EXCLUSIVE YOU", GOLD, true);

  const objectList: (string | Buffer)[] = [];
  objectList[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objectList[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>";
  objectList[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>";
  const logo = getLogoPixels();
  objectList[5] = streamObject(`<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask 6 0 R /Length ${logo.rgb.length} >>`, logo.rgb);
  objectList[6] = streamObject(`<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${logo.alpha.length} >>`, logo.alpha);
  const itemImageRefs = new Map<string, number>();
  let nextImageId = 7;
  order.items.forEach((_, index) => {
    const photo = productImages[index];
    if (!photo) return;
    itemImageRefs.set(`Product${index}`, nextImageId);
    objectList[nextImageId] = streamObject(`<< /Type /XObject /Subtype /Image /Width ${photo.width} /Height ${photo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${photo.data.length} >>`, photo.data);
    nextImageId += 1;
  });
  const pageIds: number[] = [];
  pages.forEach(commands => {
    const pageId = objectList.length;
    const streamId = pageId + 1;
    pageIds.push(pageId);
    const stream = commands.join("\n");
    const xobjects = [`/Logo 5 0 R`, ...[...itemImageRefs.entries()].map(([name, id]) => `/${name} ${id} 0 R`)].join(" ");
    objectList[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${xobjects} >> >> /Contents ${streamId} 0 R >>`;
    objectList[streamId] = `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`;
  });
  pages.forEach((commands, index) => {
    const streamId = pageIds[index] + 1;
    const stream = [...commands, `BT /F1 7 Tf ${MUTED} rg 1 0 0 1 480 12 Tm ${literal(`PAGE ${index + 1} OF ${pages.length}`)} Tj ET`].join("\n");
    objectList[streamId] = `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`;
  });
  objectList[2] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n", "ascii")];
  let byteOffset = chunks[0].length;
  const offsets = [0];
  for (let id = 1; id < objectList.length; id += 1) {
    offsets[id] = byteOffset;
    const header = Buffer.from(`${id} 0 obj\n`, "ascii");
    const objectBody = objectList[id];
    const body = typeof objectBody === "string" ? Buffer.from(objectBody, "ascii") : objectBody;
    const footer = Buffer.from("\nendobj\n", "ascii");
    chunks.push(header, body, footer);
    byteOffset += header.length + body.length + footer.length;
  }
  const xrefOffset = byteOffset;
  let xref = `xref\n0 ${objectList.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objectList.length; id += 1) xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  xref += `trailer\n<< /Size ${objectList.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(Buffer.from(xref, "ascii"));
  return Buffer.concat(chunks);
}
