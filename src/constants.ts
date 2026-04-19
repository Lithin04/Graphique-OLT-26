import { Product, Bundle } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'tee-olt-26',
    name: "olt tee",
    description: "Oversized Tshirt",
    longDescription: "",
    price: 389,
    image: "assets/back_tee.png",
    images: [
      "assets/back_tee.png",
      "assets/front_tee.png",
      "assets/tee_size.jpeg"
    ],
    category: "Apparel",
    color: "Off White",
    requiresSize: true
  },
  {
    id: 'varsity-olt-26',
    name: "Legacy Jacket",
    description: "Varsity Jacket",
    longDescription: "",
    price: 899,
    image: "assets/back_jacket.png",
    images: [
      "assets/back_jacket.png",
      "assets/front_jacket.png",
      "assets/jacket_size.jpeg"
    ],
    category: "Apparel",
    color: "Burgundy",
    requiresSize: true
  },
  {
    id: 'slam-book-olt-26',
    name: "Final Draft",
    description: "Slam Book",
    longDescription: "",
    price: 250,
    image: "assets/slam_back.png",
    images: [
      "assets/slam_back.png",
      "assets/slam_front.png",
      "assets/slam_size.png"
    ],
    category: "Archive",
    color: "Yellow",
  }
];

export const BUNDLES: Bundle[] = [
  {
    id: 'starter-olt',
    name: "Starter Kit",
    description: "Begin your personal archive. Includes the Oversized Tshirt and the Slam Book.",
    price: 1,
    icon: "auto_awesome",
    items: ['tee-olt-26', 'slam-book-olt-26'],
    image: "assets/c1.png",
    colorClass: "bg-surface-container-low"
  },
  {
    id: 'the-duo-olt',
    name: "The Duo",
    description: "The complete studio uniform. Pair the Varsity Jacket with the Slam Book.",
    price: 1,
    icon: "layers",
    image: "assets/c2.png",
    items: ['tee-olt-26', 'varsity-olt-26'],
    colorClass: "bg-surface-container-low"
  },
  {
    id: 'full-archive-olt',
    name: "Master Collection",
    description: "Total preservation. Includes the Varsity Jacket, Oversized Tshirt, and Slam Book with a collection discount.",
    price: 1,
    icon: "inventory_2",
    image: "assets/c3.png",
    items: ['tee-olt-26', 'varsity-olt-26', 'slam-book-olt-26'],
    colorClass: "bg-surface-container-low"
  }
];
