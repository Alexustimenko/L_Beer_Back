export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  volume: string;
  category: string;
  available: boolean;
  image?: string; // путь вида /images/xxx.jpg
}
