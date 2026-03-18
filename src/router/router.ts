import { IncomingMessage, ServerResponse } from "http";
import { loginController, logoutController, meController, registerController } from "../controllers/authController";
import { cartController } from "../controllers/cartController";
import { checkoutController } from "../controllers/checkoutController";
import { productController } from "../controllers/productController";
import {
  adminLoginController,
  adminLogoutController,
  adminProductsController,
} from "../controllers/adminController";
import { imagesController } from "../controllers/imagesController";

export async function router(req: IncomingMessage, res: ServerResponse) {
  const path = req.url?.split("?")[0];

  if (path?.startsWith("/images/")) {
    await imagesController(req, res);
    return;
  }

  if (path === "/admin/login") {
    await adminLoginController(req, res);
    return;
  }
  if (path === "/admin/logout") {
    await adminLogoutController(req, res);
    return;
  }
  if (path === "/admin/products") {
    await adminProductsController(req, res);
    return;
  }

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