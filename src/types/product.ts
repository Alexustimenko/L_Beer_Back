export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image?: string; // путь вида /images/xxx.jpg
}
