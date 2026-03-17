import { IncomingMessage, ServerResponse } from "http";
import { getProducts } from "../services/productService";

export async function productController(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Method not allowed" }));
    return;
  }

  const products = getProducts();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(products));
}
