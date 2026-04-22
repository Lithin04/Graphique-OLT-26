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
  X,
  Volume2
} from 'lucide-react';
import { useRef } from 'react';
import { PRODUCTS, BUNDLES } from './constants';
import { Product, CartItem, Bundle, BundleModalProps } from './types';
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
      {/* Vinyl Grooves Texture */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-radial-gradient(circle, transparent, transparent 2px, #382f1e 3px, #382f1e 4px)' }}></div>

      {/* Inner Label */}
      <div className={`${scaled ? 'w-20 h-20 md:w-28 md:h-28' : 'w-32 h-32 md:w-44 md:h-44'} rounded-full bg-secondary-container flex items-center justify-center border-[6px] border-on-surface z-10 relative`}>

        {/* Center Hole - Now handled before the text to ensure correct layering */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-background rounded-full border-2 border-on-surface z-20"></div>

        <div className="text-center flex flex-col items-center justify-center">
          {/* OLT - Pushed up slightly */}
          <span className="font-headline font-bold text-on-secondary-container text-[8px] md:text-[10px] tracking-[0.2em] uppercase block mb-0.5">
            OLT
          </span>

          {/* Divider line */}
          <div className="h-[1px] w-6 bg-on-secondary-container mb-4"></div>

          {/* 2026 - Pushed down to clear the center hole */}
          <span className={`font-headline font-extrabold text-on-secondary-container ${scaled ? 'text-sm md:text-lg' : 'text-lg md:text-2xl'} tracking-tighter mt-2 block`}>
            2026
          </span>
        </div>

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
const ProductModal = ({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: (p: Product, size?: string) => void }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("L");
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // We only update coordinates if zoomed in
    if (!isZoomed) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setMousePos({ x, y });
  };

  const toggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing the modal
    setIsZoomed(!isZoomed);

    // If we are zooming out, reset the view to center
    if (isZoomed) {
      setMousePos({ x: 50, y: 50 });
    }
  };

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
        <div
          className={`md:w-3/5 relative bg-black/10 flex items-center justify-center overflow-hidden h-64 md:h-auto select-none transition-colors duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          onMouseMove={handleMouseMove}
          onClick={toggleZoom}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={product.images[currentImg]}
              alt={product.name}
              style={{
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                transition: isZoomed ? 'transform 0.1s ease-out' : 'transform 0.4s ease-in-out'
              }}
              className={`w-full h-full object-contain pointer-events-none ${isZoomed ? 'scale-[2.5]' : 'scale-100'
                }`}
            />
          </AnimatePresence>

          {/* Navigation Arrows - Disabled while zoomed to prevent UI chaos */}
          {!isZoomed && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev - 1 + product.images.length) % product.images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev + 1) % product.images.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
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
              {product.requiresSize && (
                <div className="flex flex-col gap-2 border-b border-outline-variant/30 pb-4">
                  <span className="text-xs uppercase font-bold tracking-widest opacity-60">Size Selection</span>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL', '2XL'].map(sz => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-10 h-10 rounded-full font-headline text-sm border flex items-center justify-center transition-all ${selectedSize === sz ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/50 text-primary hover:border-primary'}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => { onAddToCart(product, product.requiresSize ? selectedSize : undefined); onClose(); }}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline text-lg uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg mt-auto"
          >
            Add to Cart
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BundleModal = ({ bundle, onClose, onAddToCart }: BundleModalProps) => {
  const containsTee = bundle.items.includes('tee-olt-26');
  const containsVarsity = bundle.items.includes('varsity-olt-26');
  const containsSlamBook = bundle.items.includes('slam-book-olt-26'); // Detection for Slam Book

  const [teeSize, setTeeSize] = useState<string>("L");
  const [varsitySize, setVarsitySize] = useState<string>("L");

  const handleAdd = () => {
    const sizeParts = [];
    if (containsTee) sizeParts.push(`Tee: ${teeSize}`);
    if (containsVarsity) sizeParts.push(`Varsity: ${varsitySize}`);
    if (containsSlamBook) sizeParts.push(`Slam Book`); // Adds text to the cart display

    const combinedSizeText = sizeParts.length > 0 ? sizeParts.join(" | ") : undefined;

    onAddToCart(bundle, combinedSizeText);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8"
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-surface-container-high border border-primary/20 rounded-3xl w-full max-w-lg p-8 shadow-2xl z-10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-20 text-on-surface-variant hover:text-primary transition-colors">
          <X className="w-6 h-6" />
        </button>

        <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary mb-2 block animate-pulse">
          Bundle
        </span>

        <h2 className="font-headline text-3xl text-primary font-bold tracking-tighter mb-2">
          {bundle.name}
        </h2>

        <div className="text-2xl font-headline text-primary mb-4">
          ₹{bundle.price}
        </div>

        <p className="font-body text-on-surface-variant mb-8 leading-relaxed">
          {bundle.description}
        </p>

        <div className="space-y-4 mb-8">
          {/* T-SHIRT SELECTION */}
          {containsTee && (
            <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/10">
              <label className="font-label text-xs uppercase tracking-widest text-primary block mb-3">T-Shirt Size</label>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setTeeSize(sz)}
                    className={`w-10 h-10 rounded-full font-headline text-sm border flex items-center justify-center transition-all ${teeSize === sz ? 'bg-primary text-on-primary border-primary shadow-lg' : 'border-outline-variant/30 text-primary hover:border-primary/60'
                      }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VARSITY SELECTION */}
          {containsVarsity && (
            <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/10">
              <label className="font-label text-xs uppercase tracking-widest text-secondary block mb-3">Varsity Jacket Size</label>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                  <button
                    key={sz}
                    onClick={() => setVarsitySize(sz)}
                    className={`w-10 h-10 rounded-full font-headline text-sm border flex items-center justify-center transition-all ${varsitySize === sz ? 'bg-secondary text-on-secondary border-secondary shadow-lg' : 'border-outline-variant/30 text-secondary hover:border-secondary/60'
                      }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SLAM BOOK INFO (STATIC) */}
          {containsSlamBook && (
            <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/10 flex items-center justify-between">
              <div>
                <span className="font-label text-xs uppercase tracking-widest text-primary block mb-3">Slam Book</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg mt-auto flex items-center justify-center gap-2"
        >
          Add Bundle to Cart
          <ChevronRight className="w-5 h-5" />
        </button>
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
  <nav className="bg-background/85 backdrop-blur-xl text-primary font-headline tracking-tight top-0 sticky shadow-[0_4px_24px_rgba(34,27,11,0.04)] z-50">
    {/* Use a container with max-width and better padding control */}
    <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-4">

      {/* Logo Section: Shrink text on mobile if needed */}
      <div className="flex items-center gap-2 md:gap-3 cursor-pointer flex-shrink-0" onClick={onLogoClick}>
        <img alt="Logo" className="h-6 md:h-8 w-auto mix-blend-multiply brightness-75" src="/assets/image.png" />
        <div className="text-base md:text-xl font-bold tracking-tighter text-primary uppercase">GRAPHIQUE</div>
      </div>

      {/* Action Section */}
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
        {user && (
          <button
            onClick={onOrdersClick}
            className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap"
          >
            History
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Curator</span>
              <span className="text-xs font-bold">{user.name.split(' ')[0]}</span>
            </div>
            <button onClick={onLogout} className="text-[9px] md:text-[10px] uppercase font-bold text-error border border-error/20 px-2 md:px-3 py-1 rounded-full hover:bg-error hover:text-white transition-all whitespace-nowrap">
              Exit
            </button>
          </div>
        ) : (
          <div className="scale-75 origin-right flex-shrink-0">
            <GoogleLogin
              onSuccess={onLogin}
              onError={() => console.log('Login Failed')}
              useOneTap
              shape="pill"
              theme="filled_blue"
            />
          </div>
        )}

        {/* Cart Button: Ensure it has room */}
        <button onClick={onCartClick} className="relative p-2 text-primary hover:scale-95 duration-200 flex-shrink-0">
          <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-on-primary text-[8px] md:text-[10px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="w-full py-16 px-10 flex flex-col items-center gap-8 bg-surface-container-high text-primary font-body text-sm tracking-normal">
    <div className="flex flex-col items-center gap-3">
      <img alt="Logo" className="h-12 w-auto mix-blend-multiply opacity-80" src="/assets/image.png" />
      <div className="font-headline font-bold italic text-primary text-3xl uppercase tracking-tighter">
        WITH ❤️ FROM GRAPHIQUE
      </div>
    </div>

    <div className="text-center opacity-70 max-w-md">
      <p className="font-headline italic text-lg mb-2">Made for the days we’ll look back on.</p>

      {/* Instagram Handle Added Here */}
      <a
        href="https://www.instagram.com/graphique.nitt/"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-4 text-primary font-bold hover:underline tracking-widest uppercase text-xs"
      >
        @graphiquenitt
      </a>

      <p>© 2020-2026 GRAPHIQUE.</p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.2em]">
        We were here. We made it count.
      </p>
    </div>
  </footer>
);

// --- Views ---

const IntroView = ({ onComplete }: { onComplete: () => void, key?: string }) => {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background flex items-center justify-center z-[100] px-6"
    >
      <GrainOverlay />
      <div className="w-full max-w-2xl flex flex-col items-center gap-12 text-center">
        <VinylRecord scaled />
        <div className="space-y-6 w-full flex flex-col items-center">
          <h1 className="font-headline text-4xl md:text-6xl font-bold text-primary tracking-tighter leading-tight uppercase">
            GRAPHIQUE
          </h1>
          <div className="w-48 md:w-64 h-1.5 bg-surface-container-highest rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
            />
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            onClick={onComplete}
            className="bg-primary text-on-primary px-10 py-4 rounded-full font-headline text-lg uppercase tracking-widest shadow-2xl hover:bg-primary/90 transition-all font-bold mt-4"
          >
            Enter Studio
          </motion.button>
        </div>
      </div>
    </motion.main>
  );
};

const StorefrontView = ({
  onAddToCart, onAddBundle, heroIndex, onHeroNext, onHeroPrev, setHeroIndex, onProductClick,
  isPlaying, setIsPlaying, currentSong, volume, setVolume, onSongChange,
  isMinimized, setIsMinimized
}: {
  onAddToCart: (p: Product) => void,
  onAddBundle: (b: Bundle) => void,
  heroIndex: number,
  onHeroNext: () => void,
  onHeroPrev: () => void,
  setHeroIndex: React.Dispatch<React.SetStateAction<number>>,
  onProductClick: (p: Product) => void,
  isPlaying: boolean,
  setIsPlaying: (b: boolean) => void,
  currentSong: number,
  volume: number,
  setVolume: (v: number) => void,
  onSongChange: (dir: 'next' | 'prev') => void,
  isMinimized: boolean,
  setIsMinimized: (b: boolean) => void,
  key?: string
}) => {
  const heroItems = [...PRODUCTS, ...BUNDLES];
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
          <h2 className="font-headline font-black text-primary/5 uppercase tracking-tighter text-[20vw] -rotate-12 italic whitespace-nowrap select-none">
            2026 OLT
          </h2>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center group">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, x: 20, rotate: -1 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -20, rotate: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="w-full h-full relative"
              >
                {/* Bundle Badge */}
                {'items' in heroItems[heroIndex] && (
                  <div className="absolute top-4 left-4 z-20 bg-primary text-on-primary px-4 py-1 rounded-full font-label text-[10px] tracking-[0.2em] uppercase shadow-lg">
                    Bundle
                  </div>
                )}

                <img
                  alt={heroItems[heroIndex].name}
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl cursor-pointer"
                  src={heroItems[heroIndex].image}
                  onClick={() => {
                    const item = heroItems[heroIndex];
                    // Use onAddBundle if it's a bundle, otherwise onProductClick
                    'items' in item ? onAddBundle(item as any) : onProductClick(item as any);
                  }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Float Arrows - Updated to use heroItems.length */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHeroIndex(prev => (prev - 1 + heroItems.length) % heroItems.length);
              }}
              className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 p-4 bg-background/50 backdrop-blur-xl rounded-full border border-outline-variant/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-on-primary shadow-xl z-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHeroIndex(prev => (prev + 1) % heroItems.length);
              }}
              className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 p-4 bg-background/50 backdrop-blur-xl rounded-full border border-outline-variant/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-on-primary shadow-xl z-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-12 text-center max-w-2xl min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${heroIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="space-y-4"
              >
                <h2 className="font-headline text-3xl md:text-5xl text-primary font-bold tracking-tighter uppercase">
                  {heroItems[heroIndex].name}
                </h2>
                <p className="font-body text-lg md:text-xl text-secondary tracking-wide italic leading-relaxed">
                  {heroItems[heroIndex].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Updated to heroItems length */}
          <div className="mt-8 flex gap-3 z-20">
            {heroItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ${idx === heroIndex ? 'bg-primary w-12' : 'bg-primary/20 w-4'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Limited Drop */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32 mt-12">
        <HorizontalScroller title="Class of 2026" subtitle="The official Graphique farewell collection.">
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
                onClick={() => product.requiresSize ? onProductClick(product) : onAddToCart(product)}
                className="mt-4 w-full py-3 border border-primary text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors inline-block text-center"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </HorizontalScroller>
      </section>
      {/* Bundles Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-32">
        <HorizontalScroller
          title="Bundles"
          subtitle="Get them bundled at a lower price."
        >
          {BUNDLES.map(bundle => (
            <div key={bundle.id} className="group flex-shrink-0 w-80 snap-start">
              <div
                className={`rounded-xl p-4 overflow-hidden cursor-pointer transition-all duration-300 shadow-sm group-hover:shadow-xl ${bundle.colorClass}`}
                onClick={() => onAddBundle(bundle)}
              >
                <img
                  alt={bundle.name}
                  className="w-full aspect-square object-cover rounded-lg group-hover:scale-105 transition-transform duration-700"
                  src={bundle.image}
                />
              </div>

              <div className="mt-4 flex justify-between items-start">
                <div className="cursor-pointer" onClick={() => onAddBundle(bundle)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-headline text-xl text-primary uppercase">{bundle.name}</h3>
                  </div>
                  {/* Minimalist Bundle Content Text */}
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-secondary/70">
                    {bundle.id === 'starter-olt' && "Tee + Slam Book"}
                    {bundle.id === 'the-duo-olt' && "Varsity + Slam Book"}
                    {bundle.id === 'full-archive-olt' && "Tee + Varsity + Slam Book "}
                  </p>
                </div>
                <span className="font-headline text-lg text-secondary">₹{bundle.price}</span>
              </div>

              <button
                onClick={() => onAddBundle(bundle)}
                className="mt-4 w-full py-3 border border-primary text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors inline-block text-center"
              >
                Select Bundle
              </button>
            </div>
          ))}
        </HorizontalScroller>
      </section>

      {/* Narrative Section */}
      <section className="bg-primary text-on-primary py-32 px-6 lg:px-8 mb-0 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-30"></div>
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-label text-xs uppercase tracking-[0.3em] opacity-70 mb-8 block">Sic Mundus Creatus Est.</span>
          <h2 className="font-headline text-4xl md:text-5xl italic leading-tight mb-10 uppercase tracking-tighter">Graphique</h2>
          <div className="grid md:grid-cols-2 gap-12 text-left">
            <p className="font-body text-xl opacity-90 leading-relaxed italic">
              Started with a few people who liked making things look better. Somehow turned into a full-blown design squad that runs on caffeine, chaos, and last-minute brilliance.
            </p>
            <p className="font-body text-xl opacity-90 leading-relaxed italic">
              We’ve messed up files, fixed them at 3AM, argued over fonts, and still managed to put out work we’re proud of. If you’ve seen something cool on campus lately… yeah, that was probably us.
            </p>
          </div>
          <div className="mt-16 flex justify-center items-center gap-6">
            <div className="w-24 h-[1px] bg-on-primary/30"></div>
            <span className="font-label text-xs uppercase tracking-widest opacity-60 italic">Graphique — OLT '26</span>
            <div className="w-24 h-[1px] bg-on-primary/30"></div>
          </div>
        </div>
      </section>

      {/* Radio Widget */}
      <div className="fixed bottom-8 left-8 z-50">
        <AnimatePresence mode="wait">
          {isMinimized ? (
            <motion.button
              key="minimized"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              onClick={() => setIsMinimized(false)}
              className="bg-background/90 backdrop-blur-md p-4 rounded-full shadow-2xl border border-outline-variant/20 text-primary hover:bg-primary hover:text-on-primary transition-all group"
            >
              <Radio className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
              {isPlaying && (
                <span className="absolute top-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-background/90 backdrop-blur-md p-4 rounded-xl shadow-[0_12px_32px_rgba(34,27,11,0.12)] border border-outline-variant/20 flex flex-col gap-3 w-72 relative"
            >
              <button
                onClick={() => setIsMinimized(true)}
                className="absolute -top-2 -right-2 bg-surface-container-highest rounded-full p-1 border border-outline-variant/20 text-primary hover:scale-110 transition-transform z-10"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
                <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center relative overflow-hidden">
                  <Radio className={`text-on-secondary-container w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label text-[10px] text-primary uppercase font-bold tracking-widest truncate">RADIO — OLT '26</p>
                  <p className="font-body text-xs text-on-surface truncate font-medium">
                    Side {currentSong + 1}: {currentSong === 0 ? "Woh Din" : "Mustafa Mustafa"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-2">
                <button onClick={() => onSongChange('prev')} className="text-secondary/70 hover:text-primary p-1">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="text-secondary hover:text-primary transition-colors">
                  {isPlaying ? <PauseCircle className="w-6 h-6" /> : <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center"><div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-primary border-b-[4px] border-b-transparent ml-0.5"></div></div>}
                </button>
                <button onClick={() => onSongChange('next')} className="text-secondary/70 hover:text-primary p-1">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 px-1">
                <Volume2 className="w-4 h-4 text-secondary/60" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
  formData: { phone: string, fullName: string, gender: string },
  setFormData: { setPhone: (s: string) => void, setFullName: (s: string) => void, setGender: (s: string) => void },
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
        <h1 className="font-headline text-4xl md:text-5xl text-primary font-extrabold tracking-tighter mb-4">CART</h1>
        <p className="font-body text-secondary text-lg uppercase tracking-widest">Review your selection before proceeding for payment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-12">
          {/* Cart Items */}
          <div className="space-y-6">
            {cart.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl p-12 text-center">
                <p className="text-on-surface-variant font-headline text-2xl">Your cart is empty.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="bg-surface-container-low rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-full sm:w-40 h-48 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover mix-blend-multiply opacity-90" src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="flex-grow space-y-2 text-center sm:text-left">
                    <h3 className="font-headline text-2xl text-on-surface">{item.product.name}</h3>
                    <p className="text-primary font-bold text-xl">₹{item.product.price}</p>
                    {item.size && (
                      <p className="text-secondary font-label text-[10px] uppercase tracking-widest mt-1">
                        Size: {item.size}
                      </p>
                    )}
                    {item.bundleSizes && (
                      <p className="text-secondary font-label text-[10px] uppercase tracking-widest mt-1 opacity-80">
                        {item.bundleSizes.tee && `Tee: ${item.bundleSizes.tee}`}
                        {item.bundleSizes.tee && item.bundleSizes.varsity && ' | '}
                        {item.bundleSizes.varsity && `Jacket: ${item.bundleSizes.varsity}`}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center bg-surface-container-highest rounded-full px-4 py-2 border border-outline-variant/20">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="text-primary font-bold px-2 hover:scale-110 transition-transform"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-headline text-lg">{String(item.quantity).padStart(2, '0')}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="text-primary font-bold px-2 hover:scale-110 transition-transform"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
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
              <h2 className="font-headline text-3xl text-on-surface mb-2">Shipping Details</h2>
              <p className="text-on-surface-variant font-body">Enter your details </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1">Full Name</label>
                <input
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40"
                  placeholder="Monkey D Luffy"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData.setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1">Roll No</label>
                <input className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/40" placeholder="112122065" type="text" />
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
              <div className="md:col-span-1 space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant px-1">
                  Gender
                </label>
                <select
                  className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/20 text-on-surface appearance-none"
                  value={formData.gender}
                  onChange={(e) => setFormData.setGender(e.target.value)}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
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
                <span className="text-on-surface-variant">Cart Items ({cart.length})</span>
                <span className="text-on-surface font-semibold">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-primary font-bold text-lg pt-4 border-t border-outline-variant/30">
                <span>TOTAL</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-4 mb-8 hidden">
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
    <h1 className="font-headline text-4xl md:text-5xl text-primary font-black tracking-tighter mb-6">ORDER CONFIRMED.</h1>
    <p className="font-body text-xl text-secondary max-w-md mx-auto mb-12 leading-relaxed">
      Your order has been confirmed. Follow <a href="https://www.instagram.com/graphique.nitt/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">@graphique.nitt</a> for further updates.
    </p>
    <button
      onClick={onReturn}
      className="bg-surface-container-highest text-primary px-10 py-4 rounded-full font-headline text-lg font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-lg"
    >
      Return to Home
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
        <h1 className="font-headline text-4xl md:text-5xl text-primary font-extrabold tracking-tighter mb-4">ARCHIVAL LOGS</h1>
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
  const [gender, setGender] = useState<string>(() => localStorage.getItem('userGender') || '');
  const [fullName, setFullName] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const songs = ['/assets/song1.mp3', '/assets/song2.mp3'];

  // Hero Slider State
  const [heroIndex, setHeroIndex] = useState(0);

  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Timer Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Audio Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(songs[currentSong]);
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    const handleEnded = () => {
      setCurrentSong(prev => (prev + 1) % songs.length);
    };

    audio.addEventListener('ended', handleEnded);

    // Explicit track change
    const expectedSrc = window.location.origin + songs[currentSong];
    if (audio.src !== expectedSrc && !audio.src.includes(songs[currentSong])) {
      audio.src = songs[currentSong];
      audio.load();
      if (isPlaying) {
        audio.play().catch(e => console.log("Playback interrupted"));
      }
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong]);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => {
        console.log("Autoplay blocked or interrupted");
        setIsPlaying(false);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  // Hero Auto-scroll
  useEffect(() => {
    const totalHeroItems = PRODUCTS.length + BUNDLES.length;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % totalHeroItems);
    }, 8000);
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

      const teeString = cart
        .map(i => {
          // If it's a bundle, the size string looks like "Tee: M | Varsity: L"
          // We search that string for the Tee size
          if (i.size && i.size.includes('Tee:')) {
            const match = i.size.match(/Tee:\s*([^\s|]+)/);
            return match ? `Size ${match[1]} (x${i.quantity})` : null;
          }
          // If it's a standalone Tee
          if (i.product.id === 'tee-olt-26' && i.size) {
            return `Size ${i.size} (x${i.quantity})`;
          }
          return null;
        })
        .filter(Boolean).join(', ');

      const varsityString = cart
        .map(i => {
          if (i.size && i.size.includes('Varsity:')) {
            const match = i.size.match(/Varsity:\s*([^\s|]+)/);
            return match ? `Size ${match[1]} (x${i.quantity})` : null;
          }
          if (i.product.id === 'varsity-olt-26' && i.size) {
            return `Size ${i.size} (x${i.quantity})`;
          }
          return null;
        })
        .filter(Boolean).join(', ');

      // For the bundle summary column, we just use the existing item.size string
      const bundleString = cart
        .filter(i => 'items' in i.product)
        .map(i => `${i.product.name} [${i.size}] (x${i.quantity})`)
        .join(' | ');

      try {
        await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: 'DRAFT',
            userName: fullName || user.name,
            userEmail: user.email,
            phone: phone || 'Pending',
            gender: gender || 'Not Specified',
            teeDetails: teeString,
            varsityDetails: varsityString,
            slamDetails: cart.filter(i => i.product.id === 'slam-book-olt-26' || (i.product as any).items?.includes('slam-book-olt-26')).map(i => `(x${i.quantity})`).join(', '),
            bundleDetails: bundleString,
            totalPrice: `₹${total}`,
            status: 'InCart'
          }),
        });
        setSyncStatus('saved');
      } catch (err) {
        setSyncStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [cart, phone, fullName, gender, user]);

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
      } else {
        setNotification("Login Failed: The server could not verify your identity.");
      }
    } catch (err) {
      console.error(err);
      setNotification("Login Loop Detected: Connection to auth server failed.");
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

  const addToCart = (product: Product, size?: string, bundleSizes?: { tee?: string, varsity?: string }) => {
    setCart(prev => {
      // Find item with exact same product ID AND same size constraints
      const existing = prev.find(item =>
        item.product.id === product.id &&
        item.size === size &&
        JSON.stringify(item.bundleSizes) === JSON.stringify(bundleSizes)
      );
      if (existing) {
        return prev.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item);
      }

      const newItemId = `${product.id}-${size || 'nosize'}-${Math.random().toString(36).substring(2, 6)}`;
      return [...prev, { id: newItemId, product, quantity: 1, size, bundleSizes }];
    });
    setNotification(`Added ${product.name} to cart`);
  };

  const addBundleToCart = (bundle: Bundle) => {
    setSelectedBundle(bundle);
  };
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setNotification("Your cart is empty");
      return;
    }
    if (!user) {
      setNotification("Please sign in to preserve items");
      return;
    }
    if (!phone || !gender || !fullName) {
      setNotification("Please fill in all Shipping details.");
      return;
    }

    const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    try {
      const orderResponse = await fetch(`${API_BASE}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const orderData = await orderResponse.json();

      if (!orderData.success) {
        setNotification("Failed to initialize secure payment.");
        return;
      }

      const options = {
        key: 'rzp_live_SeGSjBujn5Tfjv',
        amount: orderData.order.amount,
        currency: "INR",
        name: "Graphique NITT",
        description: "OLT '26 Archival Transaction",
        image: PRODUCTS[0]?.image || "",
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // Helper function to extract size from the combined string
            const extractSize = (str: string | undefined, type: string) => {
              if (!str) return null;
              const regex = new RegExp(`${type}:\\s*([^\\s|]+)`);
              const match = str.match(regex);
              return match ? match[1] : null;
            };

            const finalResponse = await fetch(`${API_BASE}/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.order.id,
                paymentId: response.razorpay_payment_id,
                userName: fullName,
                userEmail: user.email,
                phone,
                gender,

                // 1. T-Shirt Details (Regex extraction)
                teeDetails: cart
                  .map(i => {
                    const size = extractSize(i.size, 'Tee') || (i.product.id === 'tee-olt-26' ? i.size : null);
                    return size ? `Size ${size} (x${i.quantity})` : null;
                  })
                  .filter(Boolean).join(', '),

                // 2. Varsity Details (Regex extraction)
                varsityDetails: cart
                  .map(i => {
                    const size = extractSize(i.size, 'Varsity') || (i.product.id === 'varsity-olt-26' ? i.size : null);
                    return size ? `Size ${size} (x${i.quantity})` : null;
                  })
                  .filter(Boolean).join(', '),

                // 3. Slam Book Details
                slamDetails: cart
                  .filter(i => i.product.id === 'slam-book-olt-26' || (i.product as any).items?.includes('slam-book-olt-26'))
                  .map(i => `(x${i.quantity})`).join(', '),

                // 4. Bundle Summary (The full Column M entry)
                bundleDetails: cart
                  .filter(i => 'items' in i.product)
                  .map(i => `${i.product.name} [${i.size}] (x${i.quantity})`)
                  .join(' | '),

                totalPrice: `₹${total}`,
                status: 'PaymentDone'
              }),
            });

            const finalData = await finalResponse.json();
            if (finalData.success) {
              setView('success');
              setCart([]);
              localStorage.removeItem('cart');
            } else {
              setNotification(finalData.error || "Failed to finalize sync");
            }
          } catch (err) {
            setNotification("Server synchronization failed during payment completion");
          }
        },
        prefill: { name: fullName, email: user.email, contact: phone },
        theme: { color: "#E2AA45" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      setNotification("Failed to connect to the payment gateway.");
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col relative">
      <GrainOverlay />

      <AnimatePresence mode="wait">
        {view === 'intro' ? (
          <IntroView key="intro" onComplete={() => { setView('store'); setIsPlaying(true); }} />
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
                  volume={volume}
                  setVolume={setVolume}
                  onSongChange={(dir) => {
                    if (dir === 'next') {
                      setCurrentSong(prev => (prev + 1) % songs.length);
                    } else {
                      setCurrentSong(prev => (prev - 1 + songs.length) % songs.length);
                    }
                  }}
                  isMinimized={isMinimized}
                  setIsMinimized={setIsMinimized}
                />
              ) : view === 'vault' ? (
                <VaultView
                  key="vault"
                  cart={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  onCheckout={handleCheckout}
                  formData={{ phone, gender, fullName }}
                  setFormData={{ setPhone, setGender, setFullName }}
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
            <div className={`w-2 h-2 rounded-full ${syncStatus === 'syncing' ? 'bg-primary animate-pulse' :
              syncStatus === 'saved' ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface">
              {syncStatus === 'syncing' ? 'Server Syncing...' :
                syncStatus === 'saved' ? 'Cart Entry Updated' :
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
      <AnimatePresence>
        {selectedBundle && (
          <BundleModal
            bundle={selectedBundle}
            onClose={() => setSelectedBundle(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
