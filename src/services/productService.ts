import * as fs from "fs";
import * as path from "path";
import { Product } from "../types/product";

const productsPath = path.join(__dirname, "../storage/products.json");

function readProducts(): Product[] {
  if (!fs.existsSync(productsPath)) {
    return [];
  }
  const raw = fs.readFileSync(productsPath, "utf-8");
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getProducts(): Product[] {
  return readProducts();
}
