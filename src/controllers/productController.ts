import { IncomingMessage, ServerResponse } from "http";
import { getProducts } from "../services/productService";
import { Product } from "../types/product";

export async function productController(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Method not allowed" }));
    return;
  }

  const products = getProducts();

  const url = new URL(req.url ?? "/products", "http://localhost");
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const categoryRaw = (url.searchParams.get("category") ?? "").trim().toLowerCase();
  const availableParam = (url.searchParams.get("available") ?? "").trim().toLowerCase();
  const sort = (url.searchParams.get("sort") ?? "").trim().toLowerCase();

  let filtered: Product[] = products;

  if (q) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  if (categoryRaw) {
    const categories = categoryRaw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    filtered = filtered.filter(p => categories.includes(p.category.toLowerCase()));
  }

  if (availableParam === "true" || availableParam === "false") {
    const want = availableParam === "true";
    filtered = filtered.filter(p => p.available === want);
  }

  if (sort === "price_asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(filtered));
}
