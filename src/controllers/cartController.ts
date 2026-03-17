import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "../utils/bodyParser";
import { addItem, getCart, updateQuantity, removeItem } from "../services/cartService";
import { CartItem } from "../types/cart";

export async function cartController(req: IncomingMessage, res: ServerResponse) {

  if (req.method === "GET") {
    const cart = getCart();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(cart));
    return;
  }

  if (req.method === "POST") {
    let body: { productId?: string; name?: string; price?: number; quantity?: number };
    try {
      body = JSON.parse(await parseBody(req));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON" }));
      return;
    }
    const { productId, name, price, quantity } = body;
    if (
      typeof productId !== "string" ||
      typeof name !== "string" ||
      typeof price !== "number" ||
      typeof quantity !== "number"
    ) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "productId, name, price, quantity required" }));
      return;
    }
    const item: CartItem = { productId, name, price, quantity };
    const cart = addItem(item);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(cart));
    return;
  }

  if (req.method === "PUT") {
    let body: { productId?: string; quantity?: number };
    try {
      body = JSON.parse(await parseBody(req));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON" }));
      return;
    }
    if (body.productId == null || body.quantity == null) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "productId and quantity required" }));
      return;
    }
    const cart = updateQuantity(body.productId, body.quantity);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(cart));
    return;
  }

  if (req.method === "DELETE") {
    let body: { productId?: string };
    try {
      body = JSON.parse(await parseBody(req));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON" }));
      return;
    }
    if (!body.productId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "productId required" }));
      return;
    }
    const cart = removeItem(body.productId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(cart));
    return;
  }

  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Method not allowed" }));
}