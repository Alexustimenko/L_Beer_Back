import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "../utils/bodyParser";
import {
  clearAdminCookie,
  isAdminCredentials,
  createAdminSession,
  requireAdmin,
  setAdminCookie,
  destroyAdminSession,
} from "../utils/adminAuth";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  saveProductImage,
} from "../services/productService";
import { Product } from "../types/product";

export async function adminLoginController(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Method not allowed" }));
    return;
  }
  try {
    const raw = await parseBody(req);
    const body = JSON.parse(raw) as { email?: string; password?: string };
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");

    if (!isAdminCredentials(email, password)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid admin credentials" }));
      return;
    }

    const token = createAdminSession();
    setAdminCookie(res, token);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Admin logged in" }));
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Bad request" }));
  }
}

export async function adminLogoutController(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const { parseCookies } = await import("../utils/cookies");
  const cookies = parseCookies(req);
  const token = cookies.admin_token;
  if (token) destroyAdminSession(token);
  clearAdminCookie(res);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true }));
}

export async function adminProductsController(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (!requireAdmin(req, res)) return;

  const path = req.url?.split("?")[0] ?? "";
  const method = req.method;

  if (method === "GET" && path === "/admin/products") {
    const products = getProducts();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(products));
    return;
  }

  if (method === "POST" && path === "/admin/products") {
    try {
      const raw = await parseBody(req);
      const body = JSON.parse(raw) as Record<string, unknown>;
      const name = String(body.name ?? "").trim();
      const description = String(body.description ?? "").trim();
      const price = Number(body.price);
      const category = String(body.category ?? "").trim();
      const available = Boolean(body.available);
      const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : undefined;

      if (!name || Number.isNaN(price) || price < 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "name and valid price required" }));
        return;
      }

      const product = createProduct({
        name,
        description,
        price,
        category: category || "Cat 1",
        available,
      });
      if (imageBase64) {
        const imagePath = saveProductImage(product.id, imageBase64);
        updateProduct(product.id, { image: imagePath });
        product.image = imagePath;
      }
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(product));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Bad request" }));
    }
    return;
  }

  if (method === "PUT" && path === "/admin/products") {
    try {
      const raw = await parseBody(req);
      const body = JSON.parse(raw) as Record<string, unknown>;
      const id = Number(body.id);
      if (Number.isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "id required" }));
        return;
      }
      const data: Partial<Omit<Product, "id">> = {};
      if (body.name !== undefined) data.name = String(body.name).trim();
      if (body.description !== undefined) data.description = String(body.description).trim();
      if (body.price !== undefined) data.price = Number(body.price);
      if (body.category !== undefined) data.category = String(body.category).trim();
      if (body.available !== undefined) data.available = Boolean(body.available);
      const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : undefined;
      if (imageBase64) {
        data.image = saveProductImage(id, imageBase64);
      }

      const product = updateProduct(id, data);
      if (!product) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Product not found" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(product));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Bad request" }));
    }
    return;
  }

  if (method === "DELETE" && path.startsWith("/admin/products")) {
    const url = new URL(req.url ?? "/admin/products", "http://localhost");
    const idParam = url.searchParams.get("id");
    const id = idParam ? Number(idParam) : NaN;
    if (Number.isNaN(id)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "id query required" }));
      return;
    }
    const deleted = deleteProduct(id);
    if (!deleted) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Product not found" }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Method not allowed" }));
}
