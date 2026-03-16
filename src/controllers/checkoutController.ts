import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "../utils/bodyParser";
import * as fs from "fs";
import * as path from "path";
import { clearCart } from "../services/cartService";
import { CheckoutDTO } from "../types/cart";

const ordersPath = path.join(__dirname, "../storage/orders.json");

export async function checkoutController(req: IncomingMessage, res: ServerResponse) {

  const data: CheckoutDTO = JSON.parse(await parseBody(req));

  if (!data.address || !data.paymentMethod || !data.captchaToken) {
    res.writeHead(400);
    res.end(JSON.stringify({ message: "Invalid order data" }));
    return;
  }

  // простая проверка капчи
  if (data.captchaToken !== "iamhuman") {
    res.writeHead(403);
    res.end(JSON.stringify({ message: "Captcha failed" }));
    return;
  }

  const raw = fs.readFileSync(ordersPath, "utf-8");
  const orders = JSON.parse(raw);

  const order = {
    id: Date.now(),
    ...data
  };

  orders.push(order);

  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

  clearCart();

  res.writeHead(200);
  res.end(JSON.stringify({ message: "Order placed", order }));
}