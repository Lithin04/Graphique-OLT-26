import { Product, Bundle } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'tee-olt-26',
    name: "One Last Time '26 Vintage Tee",
    description: "Graphique Studio Heavyweight Cotton",
    longDescription: "A timeless artifact for the Class of 2026. Crafted from 240GSM heavyweight studio cotton with a relaxed archival fit. Features 'One Last Time' screen-printed branding in vintage-fade ink.",
    price: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6rt8B1zH8u-0QbL06iGe4gfUub035ZS05Q7o-_gc6Sd2QW0GR--saLomw428AjmPDoBKDPSc0tvjMl4peXWLm_WyrEiHFP_j_vqTDnYBolPV6O_20gzfqtnvwiB9FWhx84NGnsgkeXQNDEm8mF-7AGodHIU3eiNjkMicgJIZukdACP4KMN9KSE9Nak8np2REGpU7zXsrJCSzOvDudyEwHM1CFS_pGaS1GCkpYheFBVFAYwjOvdStLETD_azBaQxqM_BmIMklYDdY",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA6rt8B1zH8u-0QbL06iGe4gfUub035ZS05Q7o-_gc6Sd2QW0GR--saLomw428AjmPDoBKDPSc0tvjMl4peXWLm_WyrEiHFP_j_vqTDnYBolPV6O_20gzfqtnvwiB9FWhx84NGnsgkeXQNDEm8mF-7AGodHIU3eiNjkMicgJIZukdACP4KMN9KSE9Nak8np2REGpU7zXsrJCSzOvDudyEwHM1CFS_pGaS1GCkpYheFBVFAYwjOvdStLETD_azBaQxqM_BmIMklYDdY",
      "https://picsum.photos/seed/tee1/800/1000",
      "https://picsum.photos/seed/tee2/800/1000"
    ],
    category: "Apparel",
    color: "Bone White",
    material: "240GSM Organic Cotton",
    requiresSize: true
  },
  {
    id: 'varsity-olt-26',
    name: "OLT Heritage Varsity Jacket",
    description: "Archive Wool & Chenille Embroidery",
    longDescription: "The ultimate keepsake for the Class of 2026. Features premium wool blend construction with genuine leather-feel sleeves. Detailed with 'Graphique NITT' chenille patches and OLT heritage embroidery on the back.",
    price: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7iEh2pHrNYxsbrsEZXC8rlaCchPwAHCgmKniw3nqUjsjuxjMBweDf5nx6DstHLemQ8-i-St3RfxFG8qxLxALFBGuzN7eBHkBRjOyvoDsrW4E3VvTIZuCu36dnunhpevnksPFoAHOWVbeI5FxFpePNVH6TzNQin4AiQzKVf0iNNU7sibyk8vDT-45sO1be8yteMEp_Kl-EBVT_oC64o9HkawuB0YMelom4Bet-oWovwsjjkdynRKUJTv8guZWqm6BgxTwo6gqxvfc",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7iEh2pHrNYxsbrsEZXC8rlaCchPwAHCgmKniw3nqUjsjuxjMBweDf5nx6DstHLemQ8-i-St3RfxFG8qxLxALFBGuzN7eBHkBRjOyvoDsrW4E3VvTIZuCu36dnunhpevnksPFoAHOWVbeI5FxFpePNVH6TzNQin4AiQzKVf0iNNU7sibyk8vDT-45sO1be8yteMEp_Kl-EBVT_oC64o9HkawuB0YMelom4Bet-oWovwsjjkdynRKUJTv8guZWqm6BgxTwo6gqxvfc",
      "https://picsum.photos/seed/jacket1/800/1000",
      "https://picsum.photos/seed/jacket2/800/1000"
    ],
    category: "Apparel",
    color: "Mustard & Bone",
    material: "Wool Blend, Lined",
    requiresSize: true
  },
  {
    id: 'slam-book-olt-26',
    name: "One Last Time Slam Book",
    description: "Linen-Bound Memories for 2026",
    longDescription: "A vessel for the words that matter. Linen-bound keepsake specifically designed for the Class of 2026. Features prompt-based archival pages to preserve your college journey and friend's last messages.",
    price: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsyPLs2877CE5dchioDT5QoZjKYdbmtWWIvPEOWd1JBaEvy2cc2o2PL3fmAdzVF_XMeTY-HfY2kv2qKKfOFB6I0creTq9tXGA-00PyvEKiv6nB7OrhDtmSVgB1sh3wYldnTRcSghywMu_ScBcszX_FzuWb0EDMpsoJjbBKNCrj0ACl992u1DvPFRZuW0-ztBv-7z__cmQil0QIPd50QT9Qp97yRCUx3AW_6bmVe3k3a6BRt8X6AN0kxxzL0qvlid1fJ6UfF9xZXhY",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAsyPLs2877CE5dchioDT5QoZjKYdbmtWWIvPEOWd1JBaEvy2cc2o2PL3fmAdzVF_XMeTY-HfY2kv2qKKfOFB6I0creTq9tXGA-00PyvEKiv6nB7OrhDtmSVgB1sh3wYldnTRcSghywMu_ScBcszX_FzuWb0EDMpsoJjbBKNCrj0ACl992u1DvPFRZuW0-ztBv-7z__cmQil0QIPd50QT9Qp97yRCUx3AW_6bmVe3k3a6BRt8X6AN0kxxzL0qvlid1fJ6UfF9xZXhY",
      "https://picsum.photos/seed/book1/800/1000",
      "https://picsum.photos/seed/book2/800/1000"
    ],
    category: "Archive",
    color: "Studio Linen",
    material: "Acid-free 300GSM Paper"
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
    colorClass: "bg-surface-container-low"
  },
  {
    id: 'the-duo-olt',
    name: "The OLT Uniform",
    description: "The complete studio uniform. Pair the OLT Heritage Varsity Jacket with the Vintage T-Shirt.",
    price: 1,
    icon: "layers",
    items: ['tee-olt-26', 'varsity-olt-26'],
    colorClass: "bg-surface-container-high"
  },
  {
    id: 'full-archive-olt',
    name: "The OLT Master Archive",
    description: "Total preservation. Includes the Varsity Jacket, Vintage Tee, and Slam Book with a collection discount.",
    price: 1,
    icon: "inventory_2",
    items: ['tee-olt-26', 'varsity-olt-26', 'slam-book-olt-26'],
    colorClass: "bg-primary text-on-primary"
  }
];
