import { IncomingMessage, ServerResponse } from "http";
import { cartController } from "../controllers/cartController";
import { checkoutController } from "../controllers/checkoutController";
import { productController } from "../controllers/productController";
import { loginController, registerController } from "../controllers/authController";

export async function router(req: IncomingMessage, res: ServerResponse) {
  const path = req.url?.split("?")[0];

  if (path === "/products") {
    await productController(req, res);
    return;
  }

  if (path === "/cart") {
    await cartController(req, res);
    return;
  }

  if (path === "/checkout" && req.method === "POST") {
    await checkoutController(req, res);
    return;
  }

  if (path === "/login" && req.method === "POST") {
    await loginController(req, res);
    return;
  }

  if (path === "/register" && req.method === "POST") {
    await registerController(req, res);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
}