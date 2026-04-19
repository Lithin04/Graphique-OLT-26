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
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7iEh2pHrNYxsbrsEZXC8rlaCchPwAHCgmKniw3nqUjsjuxjMBweDf5nx6DstHLemQ8-i-St3RfxFG8qxLxALFBGuzN7eBHkBRjOyvoDsrW4E3VvTIZuCu36dnunhpevnksPFoAHOWVbeI5FxFpePNVH6TzNQin4AiQzKVf0iNNU7sibyk8vDT-45sO1be8yteMEp_Kl-EBVT_oC64o9HkawuB0YMelom4Bet-oWovwsjjkdynRKUJTv8guZWqm6BgxTwo6gqxvfc",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7iEh2pHrNYxsbrsEZXC8rlaCchPwAHCgmKniw3nqUjsjuxjMBweDf5nx6DstHLemQ8-i-St3RfxFG8qxLxALFBGuzN7eBHkBRjOyvoDsrW4E3VvTIZuCu36dnunhpevnksPFoAHOWVbeI5FxFpePNVH6TzNQin4AiQzKVf0iNNU7sibyk8vDT-45sO1be8yteMEp_Kl-EBVT_oC64o9HkawuB0YMelom4Bet-oWovwsjjkdynRKUJTv8guZWqm6BgxTwo6gqxvfc",
      "https://picsum.photos/seed/jacket1/800/1000",
      "https://picsum.photos/seed/jacket2/800/1000"
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
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsyPLs2877CE5dchioDT5QoZjKYdbmtWWIvPEOWd1JBaEvy2cc2o2PL3fmAdzVF_XMeTY-HfY2kv2qKKfOFB6I0creTq9tXGA-00PyvEKiv6nB7OrhDtmSVgB1sh3wYldnTRcSghywMu_ScBcszX_FzuWb0EDMpsoJjbBKNCrj0ACl992u1DvPFRZuW0-ztBv-7z__cmQil0QIPd50QT9Qp97yRCUx3AW_6bmVe3k3a6BRt8X6AN0kxxzL0qvlid1fJ6UfF9xZXhY",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAsyPLs2877CE5dchioDT5QoZjKYdbmtWWIvPEOWd1JBaEvy2cc2o2PL3fmAdzVF_XMeTY-HfY2kv2qKKfOFB6I0creTq9tXGA-00PyvEKiv6nB7OrhDtmSVgB1sh3wYldnTRcSghywMu_ScBcszX_FzuWb0EDMpsoJjbBKNCrj0ACl992u1DvPFRZuW0-ztBv-7z__cmQil0QIPd50QT9Qp97yRCUx3AW_6bmVe3k3a6BRt8X6AN0kxxzL0qvlid1fJ6UfF9xZXhY",
      "https://picsum.photos/seed/book1/800/1000",
      "https://picsum.photos/seed/book2/800/1000"
    ],
    category: "Archive",
    color: "Yellow",
  }
];

export const BUNDLES: Bundle[] = [
  {
    id: 'starter-olt',
    name: "The OLT Starter Set",
    description: "Begin your personal archive. Includes the OLT Vintage Tee and the Keepsake Slam Book.",
    price: 1,
    icon: "auto_awesome",
    items: ['tee-olt-26', 'slam-book-olt-26'],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6rt8B1zH8u-0QbL06iGe4gfUub035ZS05Q7o-_gc6Sd2QW0GR--saLomw428AjmPDoBKDPSc0tvjMl4peXWLm_WyrEiHFP_j_vqTDnYBolPV6O_20gzfqtnvwiB9FWhx84NGnsgkeXQNDEm8mF-7AGodHIU3eiNjkMicgJIZukdACP4KMN9KSE9Nak8np2REGpU7zXsrJCSzOvDudyEwHM1CFS_pGaS1GCkpYheFBVFAYwjOvdStLETD_azBaQxqM_BmIMklYDdY",
    colorClass: "bg-surface-container-low"
  },
  {
    id: 'the-duo-olt',
    name: "The OLT Uniform",
    description: "The complete studio uniform. Pair the OLT Heritage Varsity Jacket with the Vintage T-Shirt.",
    price: 1,
    icon: "layers",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7iEh2pHrNYxsbrsEZXC8rlaCchPwAHCgmKniw3nqUjsjuxjMBweDf5nx6DstHLemQ8-i-St3RfxFG8qxLxALFBGuzN7eBHkBRjOyvoDsrW4E3VvTIZuCu36dnunhpevnksPFoAHOWVbeI5FxFpePNVH6TzNQin4AiQzKVf0iNNU7sibyk8vDT-45sO1be8yteMEp_Kl-EBVT_oC64o9HkawuB0YMelom4Bet-oWovwsjjkdynRKUJTv8guZWqm6BgxTwo6gqxvfc",
    items: ['tee-olt-26', 'varsity-olt-26'],
    colorClass: "bg-surface-container-high"
  },
  {
    id: 'full-archive-olt',
    name: "The OLT Master Archive",
    description: "Total preservation. Includes the Varsity Jacket, Vintage Tee, and Slam Book with a collection discount.",
    price: 1,
    icon: "inventory_2",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7iEh2pHrNYxsbrsEZXC8rlaCchPwAHCgmKniw3nqUjsjuxjMBweDf5nx6DstHLemQ8-i-St3RfxFG8qxLxALFBGuzN7eBHkBRjOyvoDsrW4E3VvTIZuCu36dnunhpevnksPFoAHOWVbeI5FxFpePNVH6TzNQin4AiQzKVf0iNNU7sibyk8vDT-45sO1be8yteMEp_Kl-EBVT_oC64o9HkawuB0YMelom4Bet-oWovwsjjkdynRKUJTv8guZWqm6BgxTwo6gqxvfc",
    items: ['tee-olt-26', 'varsity-olt-26', 'slam-book-olt-26'],
    colorClass: "bg-primary text-on-primary"
  }
];
