export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  color?: string;
  material?: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  items: string[];
  colorClass: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
