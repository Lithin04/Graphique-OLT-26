import { Product, Bundle } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'tee-24',
    name: "Class of '24 Tee",
    description: "Heavyweight Studio Cotton",
    price: 2499,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6rt8B1zH8u-0QbL06iGe4gfUub035ZS05Q7o-_gc6Sd2QW0GR--saLomw428AjmPDoBKDPSc0tvjMl4peXWLm_WyrEiHFP_j_vqTDnYBolPV6O_20gzfqtnvwiB9FWhx84NGnsgkeXQNDEm8mF-7AGodHIU3eiNjkMicgJIZukdACP4KMN9KSE9Nak8np2REGpU7zXsrJCSzOvDudyEwHM1CFS_pGaS1GCkpYheFBVFAYwjOvdStLETD_azBaQxqM_BmIMklYDdY",
    category: "Apparel",
    color: "Bone White",
    material: "Heavyweight Cotton"
  },
  {
    id: 'jacket-heritage',
    name: "Heritage Jacket",
    description: "Wool & Chenille Archive",
    price: 5800,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7iEh2pHrNYxsbrsEZXC8rlaCchPwAHCgmKniw3nqUjsjuxjMBweDf5nx6DstHLemQ8-i-St3RfxFG8qxLxALFBGuzN7eBHkBRjOyvoDsrW4E3VvTIZuCu36dnunhpevnksPFoAHOWVbeI5FxFpePNVH6TzNQin4AiQzKVf0iNNU7sibyk8vDT-45sO1be8yteMEp_Kl-EBVT_oC64o9HkawuB0YMelom4Bet-oWovwsjjkdynRKUJTv8guZWqm6BgxTwo6gqxvfc",
    category: "Apparel",
    color: "Toasted Mustard",
    material: "Lined Interior"
  },
  {
    id: 'slam-book',
    name: "Keepsake Slam Book",
    description: "Linen-Bound Memories",
    price: 3200,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsyPLs2877CE5dchioDT5QoZjKYdbmtWWIvPEOWd1JBaEvy2cc2o2PL3fmAdzVF_XMeTY-HfY2kv2qKKfOFB6I0creTq9tXGA-00PyvEKiv6nB7OrhDtmSVgB1sh3wYldnTRcSghywMu_ScBcszX_FzuWb0EDMpsoJjbBKNCrj0ACl992u1DvPFRZuW0-ztBv-7z__cmQil0QIPd50QT9Qp97yRCUx3AW_6bmVe3k3a6BRt8X6AN0kxxzL0qvlid1fJ6UfF9xZXhY",
    category: "Archive",
    color: "Linen",
    material: "Acid-free Paper"
  }
];

export const BUNDLES: Bundle[] = [
  {
    id: 'starter-set',
    name: "The Starter Set",
    description: "Essential memories. Includes the Vintage Tee and the Keepsake Slam Book to begin your personal archive.",
    price: 7500,
    icon: "auto_awesome",
    items: ['tee-24', 'slam-book'],
    colorClass: "bg-surface-container-low"
  },
  {
    id: 'the-duo',
    name: "The Duo",
    description: "The studio uniform. Pair the Heritage Varsity Jacket with the Class of '24 Vintage T-Shirt for the full uniform.",
    price: 21000,
    icon: "layers",
    items: ['tee-24', 'jacket-heritage'],
    colorClass: "bg-surface-container-high"
  },
  {
    id: 'full-archive',
    name: "The Full Archive",
    description: "The complete ritual. All three primary highlights plus an exclusive Graphique studio print for the mantle.",
    price: 24500,
    icon: "inventory_2",
    items: ['tee-24', 'jacket-heritage', 'slam-book'],
    colorClass: "bg-primary text-on-primary"
  }
];
