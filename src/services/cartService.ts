import * as fs from "fs";
import * as path from "path";
import { Cart, CartItem } from "../types/cart";

type CartsStorage = Record<string, Cart>;

const cartsPath = path.join(__dirname, "../storage/carts.json");

function readCarts(): CartsStorage {
  if (!fs.existsSync(cartsPath)) {
    fs.writeFileSync(cartsPath, JSON.stringify({}, null, 2));
    return {};
  }
  const raw = fs.readFileSync(cartsPath, "utf-8");
  try {
    const parsed = JSON.parse(raw || "{}");
    return parsed && typeof parsed === "object" ? (parsed as CartsStorage) : {};
  } catch {
    return {};
  }
}

function writeCarts(carts: CartsStorage): void {
  fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));
}

function ensureCart(carts: CartsStorage, userId: string): Cart {
  const existing = carts[userId];
  if (existing && Array.isArray(existing.items)) return existing;
  const fresh: Cart = { items: [] };
  carts[userId] = fresh;
  return fresh;
}

export function getCart(userId: string): Cart {
  const carts = readCarts();
  const cart = ensureCart(carts, userId);
  writeCarts(carts);
  return cart;
}

export function updateQuantity(userId: string, productId: string, quantity: number): Cart {
  const carts = readCarts();
  const cart = ensureCart(carts, userId);

  const item = cart.items.find(i => i.productId === productId);
  if (item) item.quantity = quantity;

  writeCarts(carts);
  return cart;
}

export function removeItem(userId: string, productId: string): Cart {
  const carts = readCarts();
  const cart = ensureCart(carts, userId);

  cart.items = cart.items.filter(i => i.productId !== productId);

  writeCarts(carts);
  return cart;
}

export function clearCart(userId: string): void {
  const carts = readCarts();
  carts[userId] = { items: [] };
  writeCarts(carts);
}

export function addItem(userId: string, item: CartItem): Cart {
  const carts = readCarts();
  const cart = ensureCart(carts, userId);

  const existing = cart.items.find(i => i.productId === item.productId);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push(item);
  }

  writeCarts(carts);
  return cart;
}