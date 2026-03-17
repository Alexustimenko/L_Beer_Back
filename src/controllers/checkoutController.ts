import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "../utils/bodyParser";
import * as fs from "fs";
import * as path from "path";
import { clearCart } from "../services/cartService";
import { CheckoutDTO } from "../types/cart";

const ordersPath = path.join(__dirname, "../storage/orders.json");

export async function checkoutController(req: IncomingMessage, res: ServerResponse) {

  let data: CheckoutDTO;
  try {
    data = JSON.parse(await parseBody(req));
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid JSON" }));
    return;
  }

  if (!data.address || !data.paymentMethod || !data.captchaToken) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid order data" }));
    return;
  }

  // простая проверка капчи
  if (data.captchaToken !== "iamhuman") {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Captcha failed" }));
    return;
  }

  if (!fs.existsSync(ordersPath)) {
    fs.writeFileSync(ordersPath, "[]");
  }
  const raw = fs.readFileSync(ordersPath, "utf-8");
  let orders: unknown[];
  try {
    orders = JSON.parse(raw || "[]");
  } catch {
    orders = [];
  }
  if (!Array.isArray(orders)) orders = [];

  const order = {
    id: Date.now(),
    ...data
  };

  orders.push(order);

  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

  clearCart();

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Order placed", order }));
}