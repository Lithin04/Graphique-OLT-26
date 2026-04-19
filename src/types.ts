export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  color?: string;
  material?: string;
  requiresSize?: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  image: string;
  items: string[];
  colorClass: string;
}

export interface CartItem {
  id: string; // Unique cart id to support identical products with diff sizes/properties
  product: Product;
  quantity: number;
  size?: string;
  bundleSizes?: {
    tee?: string;
    varsity?: string;
  };
}

export interface BundleModalProps {
  bundle: Bundle;
  onClose: () => void;
  onAddToCart: (item: Product | Bundle, size?: string) => void;
}
