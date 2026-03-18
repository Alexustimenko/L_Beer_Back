import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "../utils/bodyParser";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../services/productService";

export async function productController(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "GET") {
    const products = getProducts();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(products));
    return;
  }

  if (req.method === "POST") {
    const body = JSON.parse(await parseBody(req));

    if (!body.title || !body.price || !body.image || !body.volume || !body.category) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Все поля обязательны" }));
      return;
    }

    if (Number(body.price) <= 0) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Цена должна быть больше 0" }));
      return;
    }

    const product = addProduct({
      title: body.title,
      price: Number(body.price),
      image: body.image,
      volume: body.volume,
      category: body.category
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(product));
    return;
  }

  if (req.method === "PUT") {
    const body = JSON.parse(await parseBody(req));

    if (!body.id) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "id обязателен" }));
      return;
    }

    if (body.price !== undefined && Number(body.price) <= 0) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Цена должна быть больше 0" }));
      return;
    }

    const updated = updateProduct(body.id, {
      title: body.title,
      price: body.price !== undefined ? Number(body.price) : undefined,
      image: body.image,
      volume: body.volume,
      category: body.category
    });

    if (!updated) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Товар не найден" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(updated));
    return;
  }

  if (req.method === "DELETE") {
    const body = JSON.parse(await parseBody(req));

    if (!body.id) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "id обязателен" }));
      return;
    }

    const ok = deleteProduct(body.id);

    if (!ok) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Товар не найден" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Товар удален" }));
    return;
  }

  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Method not allowed" }));
}