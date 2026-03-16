import { IncomingMessage, ServerResponse } from "http";
import { cartController } from "../controllers/cartController";
import { checkoutController } from "../controllers/checkoutController";

export async function router(req: IncomingMessage, res: ServerResponse) {

  if (req.url === "/cart") {
    await cartController(req, res);
    return;
  }

  if (req.url === "/checkout" && req.method === "POST") {
    await checkoutController(req, res);
    return;
  }

  res.writeHead(404);
  res.end();
}