import { IncomingMessage, ServerResponse } from "http";
import { loginController, logoutController, meController, registerController } from "../controllers/authController";
import { cartController } from "../controllers/cartController";
import { checkoutController } from "../controllers/checkoutController";
import { productController } from "../controllers/productController";

export async function router(req: IncomingMessage, res: ServerResponse) {

  const path = req.url?.split("?")[0];
  if (path === "/register") {
    await registerController(req, res);
    return;
  }

  if (path === "/login") {
    await loginController(req, res);
    return;
  }

  if (path === "/me") {
    await meController(req, res);
    return;
  }

  if (path === "/logout") {
    await logoutController(req, res);
    return;
  }

  if (path === "/products") {
    await productController(req, res);
    return;
  }

  if (path === "/cart") {
    await cartController(req, res);
    return;
  }

  if (path === "/checkout") {
    await checkoutController(req, res);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end("Not found");
}