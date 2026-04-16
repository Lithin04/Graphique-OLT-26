/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Album, 
  AudioLines, 
  PauseCircle, 
  Radio, 
  Sparkles, 
  Layers, 
  Archive, 
  ScrollText,
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { useRef } from 'react';
import { PRODUCTS, BUNDLES } from './constants';
import { Product, CartItem, Bundle } from './types';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1071467950240-os0gsqd8scogivkfvnh9ckubj228ng1q.apps.googleusercontent.com';

// --- Components ---

const GrainOverlay = () => <div className="grain-overlay" />;

const VinylRecord = ({ spinning = true, scaled = false }: { spinning?: boolean, scaled?: boolean }) => (
  <div className="relative group">
    <motion.div 
      animate={spinning ? { rotate: 360 } : { rotate: 0 }}
      transition={spinning ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
      className={`${scaled ? 'w-48 h-48 md:w-64 md:h-64' : 'w-72 h-72 md:w-96 md:h-96'} rounded-full bg-on-surface flex items-center justify-center shadow-[0_12px_48px_rgba(34,27,11,0.15)] relative overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-radial-gradient(circle, transparent, transparent 2px, #382f1e 3px, #382f1e 4px)' }}></div>
      <div className={`${scaled ? 'w-20 h-20 md:w-28 md:h-28' : 'w-32 h-32 md:w-44 md:h-44'} rounded-full bg-secondary-container flex items-center justify-center border-[6px] border-on-surface z-10`}>
        <div className="text-center">
          <span className="font-headline font-bold text-on-secondary-container text-[8px] md:text-[10px] tracking-[0.2em] uppercase block mb-1">Side A</span>
          <div className="h-[1px] w-6 bg-on-secondary-container mx-auto mb-2"></div>
          <span className={`font-headline font-extrabold text-on-secondary-container ${scaled ? 'text-sm md:text-lg' : 'text-lg md:text-2xl'} tracking-tighter`}>1978</span>
        </div>
        <div className="absolute w-3 h-3 md:w-4 bg-background rounded-full border-2 border-on-surface"></div>
      </div>
    </motion.div>
    {!scaled && (
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-surface-container-high rounded-xl p-3 shadow-lg transform -rotate-12 border border-outline-variant/20 hidden md:block">
        <div className="w-full h-full rounded bg-surface-container-lowest flex items-center justify-center">
          <Album className="text-primary scale-125" />
        </div>
      </div>
    )}
  </div>
);

const HorizontalScroller = ({ children, title, subtitle, animate = false }: { children: React.ReactNode, title?: string, subtitle?: string, animate?: boolean }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/scroller">
      {title && (
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="font-headline text-4xl text-primary uppercase italic">{title}</h2>
            {subtitle && <p className="text-on-surface-variant mt-2 font-body">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-outline-variant/30 hover:bg-primary hover:text-on-primary transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-outline-variant/30 hover:bg-primary hover:text-on-primary transition-all z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {animate ? (
        <div className="overflow-hidden whitespace-nowrap py-4">
          <motion.div 
            className="flex gap-6 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {children}
            {children}
          </motion.div>
        </div>
      ) : (
        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-8 -mx-4 px-4 snap-x scroll-smooth"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const ProductModal = ({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: (p: Product) => void }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8"
    >
      <div className="absolute inset-0 bg-background/40 backdrop-blur-2xl" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-surface-container-highest/90 border border-outline-variant/30 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh] z-10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-20 p-2 bg-background/50 backdrop-blur-md rounded-full text-primary hover:scale-110 transition-transform">
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="md:w-3/5 relative bg-black/10 flex items-center justify-center overflow-hidden h-64 md:h-auto select-none">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentImg}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              src={product.images[currentImg]} 
              alt={product.name}
              className={`w-full h-full object-contain transition-transform duration-500 cursor-zoom-in ${isZoomed ? 'scale-150' : 'scale-100'}`}
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </AnimatePresence>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setCurrentImg(idx)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${idx === currentImg ? 'bg-primary w-6' : 'bg-primary/20'}`} 
              />
            ))}
          </div>

          <button onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev - 1 + product.images.length) % product.images.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev + 1) % product.images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Info Section */}
        <div className="md:w-2/5 p-8 flex flex-col h-full overflow-y-auto">
          <div className="flex-grow">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary mb-2 block">{product.category} — OLT '26</span>
            <h2 className="font-headline text-3xl text-primary font-bold tracking-tighter mb-4">{product.name}</h2>
            <p className="font-body text-primary/80 leading-relaxed mb-8 italic">
              {product.longDescription || product.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="text-xs uppercase font-bold tracking-widest opacity-60">Price</span>
                <span className="font-headline text-2xl text-primary">₹{product.price}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="text-xs uppercase font-bold tracking-widest opacity-60">Color</span>
                <span className="text-sm font-medium">{product.color}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="text-xs uppercase font-bold tracking-widest opacity-60">Material</span>
                <span className="text-sm font-medium">{product.material}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { onAddToCart(product); onClose(); }}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline text-lg uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg mt-auto"
          >
            Add to Ritual
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Header = ({ onCartClick, onLogoClick, onOrdersClick, cartCount, user, onLogin, onLogout }: { 
  onCartClick: () => void, 
  onLogoClick: () => void, 
  onOrdersClick: () => void,
  cartCount: number,
  user: any,
  onLogin: (cred: any) => void,
  onLogout: () => void
}) => (
  <nav className="bg-background/85 backdrop-blur-xl text-primary font-headline tracking-tight top-0 sticky shadow-[0_4px_24px_rgba(34,27,11,0.04)] flex justify-between items-center px-8 py-4 max-w-full z-50">
    <div className="flex items-center gap-3 cursor-pointer" onClick={onLogoClick}>
      <img alt="Logo" className="h-8 w-auto mix-blend-multiply brightness-75" src="/assets/image.png" />
      <div className="text-xl font-bold tracking-tighter text-primary uppercase">GRAPHIQUE</div>
    </div>
    <div className="hidden md:flex items-center gap-8">
    </div>
    <div className="flex items-center gap-4">
      {user && (
        <button 
          onClick={onOrdersClick}
          className="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity mr-4"
        >
          History
        </button>
      )}
      {user ? (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Curator</span>
            <span className="text-xs font-bold">{user.name}</span>
          </div>
          <button onClick={onLogout} className="text-[10px] uppercase font-bold text-error border border-error/20 px-3 py-1 rounded-full hover:bg-error hover:text-white transition-all">
            Exit
          </button>
        </div>
      ) : (
        <div className="scale-75 origin-right">
          <GoogleLogin 
            onSuccess={onLogin}
            onError={() => console.log('Login Failed')}
            useOneTap
            shape="pill"
            theme="filled_blue"
          />
        </div>
      )}
      <button onClick={onCartClick} className="relative p-2 text-primary hover:scale-95 duration-200">
        <ShoppingBag className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="w-full py-16 px-10 flex flex-col items-center gap-8 bg-surface-container-high text-primary font-body text-sm tracking-normal">
    <div className="flex flex-col items-center gap-3">
      <img alt="Logo" className="h-12 w-auto mix-blend-multiply opacity-80" src="/assets/image.png" />
      <div className="font-headline font-bold italic text-primary text-3xl uppercase tracking-tighter">GRAPHIQUE</div>
    </div>
    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
      {['The Vault', 'Sizing Guide', 'Shipping Rituals', 'Privacy'].map(link => (
        <a key={link} className="text-secondary hover:text-primary transition-opacity" href="#">{link}</a>
      ))}
    </div>
    <div className="text-center opacity-70 max-w-md">
      <p className="font-headline italic text-lg mb-2">Preserved in high-fidelity.</p>
      <p>© 1978-2024 THE ARCHIVIST STUDIO.</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.2em]">Safekeeping the legacy, one stitch at a time. Limited runs only.</p>
    </div>
  </footer>
);

// --- Views ---

const IntroView = ({ onComplete, key }: { onComplete: () => void, key?: string }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100] px-6"
    >
      <GrainOverlay />
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <VinylRecord scaled />
        <div className="text-center space-y-4">
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-primary tracking-tighter leading-tight">
            GRAPHIQUE
          </h1>
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 md:w-48 h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="h-full bg-primary rounded-full" 
              />
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
};

const StorefrontView = ({ 
  onAddToCart, onAddBundle, heroIndex, onHeroNext, onHeroPrev, setHeroIndex, onProductClick, 
  isPlaying, setIsPlaying, currentSong, key 
}: { 
  onAddToCart: (p: Product) => void, 
  onAddBundle: (b: Bundle) => void,
  heroIndex: number,
  onHeroNext: () => void,
  onHeroPrev: () => void,
  setHeroIndex: (i: number) => void,
  onProductClick: (p: Product) => void,
  isPlaying: boolean,
  setIsPlaying: (b: boolean) => void,
  currentSong: number,
  key?: string
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pb-24"
    >
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <h2 className="font-headline font-black text-primary/5 uppercase tracking-tighter text-[20vw] -rotate-12 italic whitespace-nowrap select-none">2026 OLT</h2>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={heroIndex}
                initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 3 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                alt={PRODUCTS[heroIndex].name}
                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl cursor-pointer" 
                src={PRODUCTS[heroIndex].image} 
                onClick={() => onProductClick(PRODUCTS[heroIndex])}
              />
            </AnimatePresence>

            {/* Float Arrows */}
            <button 
              onClick={(e) => { e.stopPropagation(); onHeroPrev(); }}
              className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 p-4 bg-background/50 backdrop-blur-xl rounded-full border border-outline-variant/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-on-primary shadow-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onHeroNext(); }}
              className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 p-4 bg-background/50 backdrop-blur-xl rounded-full border border-outline-variant/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-on-primary shadow-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-12 text-center max-w-2xl">
            <motion.div
              key={`text-${heroIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="font-headline text-4xl md:text-6xl text-primary font-bold tracking-tighter uppercase">{PRODUCTS[heroIndex].name}</h2>
              <p className="font-body text-xl text-secondary tracking-wide italic">{PRODUCTS[heroIndex].description}</p>
            </motion.div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {PRODUCTS.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === heroIndex ? 'bg-primary w-12' : 'bg-primary/20 w-4'}`} 
            />
          ))}
        </div>
      </section>

      {/* Limited Drop */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32 mt-12">
        <HorizontalScroller title="Class of 2026 Highlights" subtitle="The official Graphique NITT memorabilia collection." animate>
          {PRODUCTS.map(product => (
            <div key={product.id} className="group flex-shrink-0 w-80 snap-start">
              <div 
                className="bg-surface-container-high rounded-xl p-4 overflow-hidden cursor-pointer"
                onClick={() => onProductClick(product)}
              >
                <img 
                  alt={product.name} 
                  className="w-full aspect-square object-cover rounded-lg group-hover:scale-105 transition-transform duration-700" 
                  src={product.image} 
                />
              </div>
              <div className="mt-4 flex justify-between items-start">
                <div className="cursor-pointer" onClick={() => onProductClick(product)}>
                  <h3 className="font-headline text-xl text-primary uppercase">{product.name}</h3>
                  <p className="text-on-surface-variant text-sm mt-1">{product.description}</p>
                </div>
                <span className="font-headline text-lg text-secondary">₹{product.price}</span>
              </div>
              <button 
                onClick={() => onAddToCart(product)}
                className="mt-4 w-full py-3 border border-primary text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors inline-block text-center"
              >
                Add to Ritual
              </button>
            </div>
          ))}
        </HorizontalScroller>
      </section>

      {/* Narrative Section */}
      <section className="bg-primary text-on-primary py-32 px-6 lg:px-8 mb-32 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-30"></div>
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-label text-xs uppercase tracking-[0.3em] opacity-70 mb-8 block">Preserving the Frequency</span>
          <h2 className="font-headline text-5xl md:text-7xl italic leading-tight mb-10 uppercase tracking-tighter">THE STUDIO NEVER TRULY CLOSES.</h2>
          <div className="grid md:grid-cols-2 gap-12 text-left">
            <p className="font-body text-xl opacity-90 leading-relaxed italic">
              Graphique is not just a club at NITT; it was the hum of fluorescent lights at 2 AM, the smell of fresh ink on heavy cardstock, and the unspoken pact to create something that outlasted our time together. 
            </p>
            <p className="font-body text-xl opacity-90 leading-relaxed italic">
              As we turn the page for the Class of 2026, we offer these OLT artifacts—not as mere merchandise, but as containers for the legacy we built. Every stitch, every page, every fiber is meant to keep the light from fading.
            </p>
          </div>
          <div className="mt-16 flex justify-center items-center gap-6">
            <div className="w-24 h-[1px] bg-on-primary/30"></div>
            <span className="font-label text-xs uppercase tracking-widest opacity-60 italic">Established Graphique NITT — OLT '26</span>
            <div className="w-24 h-[1px] bg-on-primary/30"></div>
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
        <HorizontalScroller 
          title="The Collection Bundles" 
          subtitle="Curated sets for a complete archival experience."
          animate
        >
          {BUNDLES.map(bundle => (
            <div key={bundle.id} className={`flex-shrink-0 w-80 p-8 rounded-xl border border-outline-variant/20 snap-start hover:shadow-xl transition-all duration-300 ${bundle.colorClass}`}>
              <div className="bg-white/10 w-14 h-14 rounded-full flex items-center justify-center mb-8">
                {bundle.icon === 'auto_awesome' && <Sparkles className="w-8 h-8" />}
                {bundle.icon === 'layers' && <Layers className="w-8 h-8" />}
                {bundle.icon === 'inventory_2' && <Archive className="w-8 h-8" />}
              </div>
              <h3 className="font-headline text-2xl mb-3">{bundle.name}</h3>
              <p className="opacity-80 text-sm mb-8 leading-relaxed">{bundle.description}</p>
              <div className="flex justify-between items-end border-t border-current/20 pt-6">
                <span className="font-headline text-3xl">₹{bundle.price}</span>
                <button 
                  onClick={() => onAddBundle(bundle)}
                  className="text-xs font-bold uppercase tracking-widest border-b-2 border-current pb-1 hover:opacity-70 transition-opacity"
                >
                  Select Bundle
                </button>
              </div>
            </div>
          ))}
        </HorizontalScroller>
      </section>

      {/* Radio Widget */}
      <div className="fixed bottom-8 left-8 z-50">
        <div 
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-[0_12px_32px_rgba(34,27,11,0.12)] border border-outline-variant/20 flex items-center gap-4 w-72 group cursor-pointer transition-all hover:scale-105"
        >
          <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center relative overflow-hidden">
            <Radio className={`text-on-secondary-container w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label text-[10px] text-primary uppercase font-bold tracking-widest truncate">ARCHIVE RADIO — OLT '26</p>
            <p className="font-body text-xs text-on-surface truncate font-medium">
              Side {currentSong + 1}: {currentSong === 0 ? "Woh Din" : "Mustafa Mustafa"}
            </p>
            <div className="flex gap-1 mt-1">
              <div className={`h-1 w-1 bg-primary rounded-full transition-all ${isPlaying ? 'animate-bounce' : 'opacity-20'}`}></div>
              <div className={`h-1 w-1 bg-primary/40 rounded-full transition-all ${isPlaying ? 'animate-bounce delay-75' : 'opacity-20'}`}></div>
              <div className={`h-1 w-1 bg-primary/20 rounded-full transition-all ${isPlaying ? 'animate-bounce delay-150' : 'opacity-20'}`}></div>
            </div>
          </div>
          <button className="text-secondary hover:text-primary transition-colors">
            {isPlaying ? <PauseCircle className="w-6 h-6" /> : <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center"><div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-primary border-b-[4px] border-b-transparent ml-0.5"></div></div>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const VaultView = ({ 
  cart, 
  onUpdateQuantity, 
  onRemove,
  onCheckout,
  formData,
  setFormData,
  userEmail,
  key
}: { 
  cart: CartItem[], 
  onUpdateQuantity: (id: string, delta: number) => void,
  onRemove: (id: string) => void,
  onCheckout: () => void,
  formData: { phone: string, address: string, fullName: string },
  setFormData: { setPhone: (s: string) => void, setAddress: (s: string) => void, setFullName: (s: string) => void },
  key?: string,
  userEmail?: string
}) => {
  const total = useMemo(() => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cart]);

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-12 lg:py-20"
    >
      <div className="mb-12">
        <h1 className="font-headline text-5xl md:text-7xl text-primary font-extrabold tracking-tighter mb-4">YOUR VAULT</h1>
        <p className="font-body text-secondary text-lg uppercase tracking-widest">Review your selection before preserving history.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-12">
          {/* Cart Items */}
          <div className="space-y-6">
            {cart.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl p-12 text-center">
                <p className="text-on-surface-variant font-headline text-2xl">Your vault is empty.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="bg-surface-container-low rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-full sm:w-40 h-48 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover mix-blend-multiply opacity-90" src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="flex-grow space-y-2 text-center sm:text-left">
                    <h3 className="font-headline text-2xl text-on-surface">{item.product.name}</h3>
                    <p className="text-on-surface-variant font-medium">{item.product.color} / {item.product.material}</p>
                    <p className="text-primary font-bold text-xl">₹{item.product.price}</p>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant/20">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="text-primary font-bold px-2 hover:scale-110 transition-transform"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-headline text-lg">{String(item.quantity).padStart(2, '0')}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="text-primary font-bold px-2 hover:scale-110 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.product.id)}
                      className="text-on-surface-variant hover:text-error transition-colors flex items-center gap-2 text-xs font-label uppercase tracking-widest"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form */}
          <div className="bg-surface-container-high rounded-xl p-8 space-y-8">
            <div>
              <h2 className="font-headline text-3xl text-on-surface mb-2">Preservation Registry</h2>
              <p className="text-on-surface-variant font-body">Input your archival credentials for the database.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1">Full Name</label>
                <input 
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40" 
                  placeholder="John Doe" 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData.setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1">College ID / Archive ID</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40" placeholder="ARCH-7890-X" type="text" />
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg p-4 opacity-60 text-on-surface cursor-not-allowed" value={userEmail} disabled type="email" />
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1">Phone Number</label>
                <input 
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40" 
                  placeholder="+91 99999 99999" 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData.setPhone(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1">Delivery Address</label>
                <textarea 
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40" 
                  placeholder="Street, City, State, ZIP" 
                  rows={3} 
                  value={formData.address}
                  onChange={(e) => setFormData.setAddress(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:col-span-4 sticky top-28">
          <div className="bg-surface-container-highest rounded-xl p-8 shadow-[0_12px_32px_rgba(34,27,11,0.06)] border border-outline-variant/10">
            <h2 className="font-headline text-3xl text-on-surface mb-8 border-b border-outline-variant/30 pb-4">ORDER SUMMARY</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between font-body">
                <span className="text-on-surface-variant">Archival Items ({cart.length})</span>
                <span className="text-on-surface font-semibold">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body">
                <span className="text-on-surface-variant">Shipping Rituals</span>
                <span className="text-on-surface font-semibold">FREE</span>
              </div>
              <div className="flex justify-between font-body text-primary font-bold text-lg pt-4 border-t border-outline-variant/30">
                <span>TOTAL</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">Vault Access Code</label>
              <div className="flex gap-2">
                <input className="flex-grow bg-surface-container-low border-none rounded-lg px-4 text-xs tracking-widest uppercase focus:ring-1 focus:ring-primary/20" placeholder="DISCOUNT" type="text" />
                <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg font-label text-xs uppercase tracking-widest hover:brightness-110 transition-all">Apply</button>
              </div>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-primary text-on-primary py-5 rounded-full font-headline text-xl uppercase tracking-tighter shadow-lg hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 transition-all flex items-center justify-center gap-3"
            >
              PROCEED TO PAYMENT
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant/60 text-[10px] font-label uppercase tracking-widest">
              <Lock className="w-3 h-3" />
              Encrypted End-to-End Archival Transaction
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {['High Fidelity', '7-Day Preservation', 'Eco-Ink Packaging'].map(chip => (
              <span key={chip} className="bg-primary-fixed-dim text-on-primary-fixed px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-wider">{chip}</span>
            ))}
          </div>
        </aside>
      </div>
    </motion.main>
  );
};

const SuccessView = ({ onReturn, key }: { onReturn: () => void, key?: string }) => (
  <motion.main 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center"
  >
    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-8 shadow-2xl">
      <Lock className="text-on-primary w-10 h-10" />
    </div>
    <h1 className="font-headline text-5xl md:text-7xl text-primary font-black tracking-tighter mb-6">VAULT SEALED.</h1>
    <p className="font-body text-xl text-secondary max-w-md mx-auto mb-12 leading-relaxed">
      Your artifacts have been registered in the preservation database. A confirmation ritual has been sent to your email.
    </p>
    <button 
      onClick={onReturn}
      className="bg-surface-container-highest text-primary px-10 py-4 rounded-full font-headline text-lg font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-lg"
    >
      Return to Archive
    </button>
  </motion.main>
);

const OrdersView = ({ orders, onReturn, key }: { orders: any[], onReturn: () => void, key?: string }) => (
  <motion.main 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="max-w-4xl mx-auto px-6 py-12 lg:py-20"
  >
    <div className="mb-12 flex justify-between items-end">
      <div>
        <h1 className="font-headline text-5xl text-primary font-extrabold tracking-tighter mb-4">ARCHIVAL LOGS</h1>
        <p className="font-body text-secondary text-lg uppercase tracking-widest">Your history in the preservation database.</p>
      </div>
      <button 
        onClick={onReturn}
        className="text-xs font-bold uppercase tracking-widest border-b border-primary pb-1"
      >
        Back to Store
      </button>
    </div>

    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-12 text-center">
          <p className="text-on-surface-variant font-headline text-2xl">No artifacts found in the log.</p>
        </div>
      ) : (
        orders.map((order, idx) => (
          <div key={idx} className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary block mb-1">{order.status || 'Verified'}</span>
                <h3 className="font-headline text-xl text-on-surface">{order['order id'] || 'ID-UNKNOWN'}</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest ml-1">{new Date(order.timestamp).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-headline text-2xl text-primary">{order['total price']}</p>
              </div>
            </div>
            <div className="border-t border-outline-variant/10 pt-4">
              <p className="text-sm font-body text-on-surface-variant italic">Artifacts: {order.items}</p>
            </div>
          </div>
        ))
      )}
    </div>
  </motion.main>
);

// --- Main App ---

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const [view, setView] = useState<'intro' | 'store' | 'vault' | 'success' | 'orders'>('intro');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const songs = ['/assets/song1.mp3', '/assets/song2.mp3'];

  // Hero Slider State
  const [heroIndex, setHeroIndex] = useState(0);

  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Audio Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(songs[currentSong]);
      audioRef.current.onended = () => {
        setCurrentSong(prev => (prev + 1) % songs.length);
      };
    } else {
      audioRef.current.src = songs[currentSong];
      if (isPlaying) audioRef.current.play().catch(e => console.log("Autoplay blocked"));
    }
    
    return () => {
      audioRef.current?.pause();
    };
  }, [currentSong]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.log("Autoplay blocked"));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  // Hero Auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % PRODUCTS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  // Sync Draft Order (Debounced)
  useEffect(() => {
    if (!user || cart.length === 0) return;

    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
      const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      try {
        const response = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: 'DRAFT', // Placeholder for drafts
            userName: fullName || user.name,
            userEmail: user.email,
            phone,
            items: cart.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
            totalPrice: `₹${total}`,
            status: 'InCart'
          }),
        });
        const data = await response.json();
        if (data.success) {
          setSyncStatus('saved');
          setSyncError(null);
          setTimeout(() => setSyncStatus('idle'), 3000);
        } else {
          setSyncStatus('error');
          setSyncError(data.details || data.error || 'Unknown server error');
        }
      } catch (err: any) {
        console.error('Draft Sync Failed', err);
        setSyncStatus('error');
        setSyncError(err.message || 'Network connection failed');
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [cart, phone, fullName, user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE}/orders`);
      const data = await response.json();
      if (data.success) {
        // Filter orders by current user email
        const userOrders = data.orders.filter((o: any) => o['user email'] === user.email);
        setOrders(userOrders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (credentialResponse: any) => {
    try {
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setNotification(`Welcome back, ${data.user.given_name}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
    setNotification("Archival session ended");
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setNotification(`Added ${product.name} to ritual`);
  };

  const addBundleToCart = (bundle: Bundle) => {
    bundle.items.forEach(productId => {
      const product = PRODUCTS.find(p => p.id === productId);
      if (product) {
        addToCart(product);
      }
    });
    setNotification(`Added ${bundle.name} to ritual`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setNotification("Your vault is empty");
      return;
    }
    if (!user) {
      setNotification("Please sign in to preserve artifacts");
      return;
    }

    const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          userName: fullName || user.name,
          userEmail: user.email,
          phone,
          items: cart.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
          totalPrice: `₹${total}`,
          status: 'PaymentDone'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setView('success');
        setCart([]);
        localStorage.removeItem('cart');
      } else {
        setNotification(data.error || "Failed to sync with archival database");
      }
    } catch (err) {
      setNotification("Archive synchronization failed");
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col relative">
      <GrainOverlay />
      
      <AnimatePresence mode="wait">
        {view === 'intro' ? (
          <IntroView key="intro" onComplete={() => setView('store')} />
        ) : (
          <div key="content" className="flex-grow flex flex-col">
            <Header 
              onCartClick={() => setView('vault')} 
              onLogoClick={() => setView('store')} 
              onOrdersClick={() => { fetchOrders(); setView('orders'); }}
              cartCount={cartCount}
              user={user}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
            
            <AnimatePresence mode="wait">
              {view === 'store' ? (
                <StorefrontView 
                  key="store" 
                  onAddToCart={addToCart} 
                  onAddBundle={addBundleToCart}
                  heroIndex={heroIndex}
                  onHeroNext={() => setHeroIndex(prev => (prev + 1) % PRODUCTS.length)}
                  onHeroPrev={() => setHeroIndex(prev => (prev - 1 + PRODUCTS.length) % PRODUCTS.length)}
                  setHeroIndex={setHeroIndex}
                  onProductClick={setSelectedProduct}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  currentSong={currentSong}
                />
              ) : view === 'vault' ? (
                <VaultView 
                  key="vault" 
                  cart={cart} 
                  onUpdateQuantity={updateQuantity} 
                  onRemove={removeFromCart} 
                  onCheckout={handleCheckout}
                  formData={{ phone, address, fullName }}
                  setFormData={{ setPhone, setAddress, setFullName }}
                  userEmail={user?.email}
                />
              ) : view === 'orders' ? (
                <OrdersView key="orders" orders={orders} onReturn={() => setView('store')} />
              ) : (
                <SuccessView key="success" onReturn={() => setView('store')} />
              )}
            </AnimatePresence>
            
            <Footer />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {syncStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-surface-container-highest px-4 py-3 rounded-full border border-primary/20 shadow-2xl backdrop-blur-xl"
          >
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'syncing' ? 'bg-primary animate-pulse' : 
              syncStatus === 'saved' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface">
              {syncStatus === 'syncing' ? 'Archive Syncing...' : 
               syncStatus === 'saved' ? 'Vault Entry Updated' : 
               `Sync Error: ${syncError || 'Check Console'}`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none border-[24px] border-surface-container-low/10 z-[60]"></div>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[100] bg-primary text-on-primary px-6 py-3 rounded-full shadow-2xl font-headline text-sm uppercase tracking-widest flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
