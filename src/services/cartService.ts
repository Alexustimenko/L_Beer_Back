import * as fs from "fs";
import * as path from "path";
import { Cart, CartItem } from "../types/cart";

const cartPath = path.join(__dirname, "../storage/cart.json");

function readCart(): Cart {
  if (!fs.existsSync(cartPath)) {
    fs.writeFileSync(cartPath, JSON.stringify({ items: [] }, null, 2));
    return { items: [] };
  }
  const raw = fs.readFileSync(cartPath, "utf-8");
  const parsed = JSON.parse(raw || "{}");
  return Array.isArray(parsed?.items) ? parsed : { items: [] };
}

function writeCart(cart: Cart): void {
  fs.writeFileSync(cartPath, JSON.stringify(cart, null, 2));
}

export function getCart(): Cart {
  return readCart();
}

export function updateQuantity(productId: string, quantity: number): Cart {
  const cart = readCart();

  const item = cart.items.find(i => i.productId === productId);
  if (item) item.quantity = quantity;

  writeCart(cart);
  return cart;
}

export function removeItem(productId: string): Cart {
  const cart = readCart();

  cart.items = cart.items.filter(i => i.productId !== productId);

  writeCart(cart);
  return cart;
}

export function clearCart(): void {
  writeCart({ items: [] });
}

export function addItem(item: CartItem): Cart {
  const cart = readCart();

  const existing = cart.items.find(i => i.productId === item.productId);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push(item);
  }

  writeCart(cart);
  return cart;
}