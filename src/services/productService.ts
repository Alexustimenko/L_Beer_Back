import * as fs from "fs";
import * as path from "path";
import { Product } from "../types/product";

const productsPath = path.join(__dirname, "../storage/products.json");

function readProducts(): Product[] {
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

export function addProduct(data: Omit<Product, "id">): Product {
  const products = readProducts();

  const newProduct: Product = {
    id: Date.now().toString(),
    ...data
  };

  products.push(newProduct);
  writeProducts(products);

  return newProduct;
}

export function updateProduct(id: string, data: Partial<Omit<Product, "id">>): Product | null {
  const products = readProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) return null;

  products[index] = { ...products[index], ...data };
  writeProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const filtered = products.filter(p => p.id !== id);

  if (filtered.length === products.length) return false;

  writeProducts(filtered);
  return true;
}