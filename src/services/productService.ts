import * as fs from "fs";
import * as path from "path";
import { Product } from "../types/product";

const productsPath = path.join(__dirname, "../storage/products.json");
const imagesDir = path.join(__dirname, "../storage/images");

function readProducts(): Product[] {
  if (!fs.existsSync(productsPath)) {
    fs.writeFileSync(productsPath, "[]");
    return [];
  }
  const raw = fs.readFileSync(productsPath, "utf-8");
  try {
    const raw = fs.readFileSync(productsPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeProducts(products: Product[]): void {
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
}

export function getProducts(): Product[] {
  return readProducts();
}

export function createProduct(data: Omit<Product, "id">): Product {
  const products = readProducts();
  const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const product: Product = { id, ...data };
  products.push(product);
  writeProducts(products);
  return product;
}

export function updateProduct(id: number, data: Partial<Omit<Product, "id">>): Product | null {
  const products = readProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...data, id };
  writeProducts(products);
  return products[index];
}

export function deleteProduct(id: number): boolean {
  const products = readProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  writeProducts(filtered);
  return true;
}

/** Сохраняет base64-картинку (data URL или raw base64) и возвращает путь /images/filename */
export function saveProductImage(productId: number, imageBase64: string): string {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const buf = Buffer.from(base64Data, "base64");
  const ext = imageBase64.startsWith("data:image/png") ? "png" : "jpg";
  const filename = `${productId}.${ext}`;
  const filePath = path.join(imagesDir, filename);
  fs.writeFileSync(filePath, buf);
  return `/images/${filename}`;
}
