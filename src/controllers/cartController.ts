import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "../utils/bodyParser";
import { addItem, getCart, updateQuantity, removeItem } from "../services/cartService";

export async function cartController(req: IncomingMessage, res: ServerResponse) {

  if (req.method === "GET") {
    const cart = getCart();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(cart));
    return;
  }

  if (req.method === "POST") {
    const body = JSON.parse(await parseBody(req));
    const cart = addItem(body);

    res.writeHead(200);
    res.end(JSON.stringify(cart));
    return;
  }

  if (req.method === "PUT") {
    const body = JSON.parse(await parseBody(req));
    const cart = updateQuantity(body.productId, body.quantity);

    res.writeHead(200);
    res.end(JSON.stringify(cart));
    return;
  }

  if (req.method === "DELETE") {
    const body = JSON.parse(await parseBody(req));
    const cart = removeItem(body.productId);

    res.writeHead(200);
    res.end(JSON.stringify(cart));
    return;
  }

}