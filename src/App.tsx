/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Terminal, X, CheckCircle, Info } from 'lucide-react';

// Data & Types
import { INITIAL_KITS, DEFAULT_PROFILE, PURCHASED_KITS_MOCK } from './data';
import { Kit, UserProfile, ViewType } from './types';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartModal, InfoModal } from './components/Modals';

// Page Views
import HomeView from './components/HomeView';
import CatalogView from './components/CatalogView';
import SellView from './components/SellView';
import DetailsView from './components/DetailsView';
import ProfileView from './components/ProfileView';

export default function App() {
  // Navigation States
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedKitId, setSelectedKitId] = useState<string>('industrial-tension-vol1');

  // Master Sound Kits Lists (persisted in localStorage for functional completeness)
  const [kits, setKits] = useState<Kit[]>(() => {
    const saved = localStorage.getItem('sonic_lab_kits');
    return saved ? JSON.parse(saved) : INITIAL_KITS;
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sonic_lab_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  // Purchased inventory tracker
  const [purchasedKits, setPurchasedKits] = useState<Kit[]>(() => {
    const saved = localStorage.getItem('sonic_lab_purchased');
    if (saved) return JSON.parse(saved);

    // Default mock setup combined with physical details kit representation
    const defaultKits: Kit[] = [];
    PURCHASED_KITS_MOCK.forEach((mock) => {
      const match = INITIAL_KITS.find((k) => k.id === mock.id) || INITIAL_KITS[0];
      defaultKits.push({
        ...match,
        id: mock.id,
        title: mock.title,
        coverImage: mock.coverImage === 'waveform' ? 'waveform' : mock.coverImage,
        sampleRate: mock.format === 'WAV' ? '24-Bit WAV' : 'Serum Presets',
        bpm: mock.detail.includes('BPM') ? parseInt(mock.detail) : undefined,
        tags: [mock.format, mock.detail]
      });
    });
    return defaultKits;
  });

  // Cart State Management
  const [cart, setCart] = useState<Kit[]>(() => {
    const saved = localStorage.getItem('sonic_lab_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Interface open states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [infoTopic, setInfoTopic] = useState<string | null>(null);
  
  // Custom toast notification system
  const [notification, setNotification] = useState<string | null>(null);

  // Syncing state to local storage
  useEffect(() => {
    localStorage.setItem('sonic_lab_kits', JSON.stringify(kits));
  }, [kits]);

  useEffect(() => {
    localStorage.setItem('sonic_lab_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('sonic_lab_purchased', JSON.stringify(purchasedKits));
  }, [purchasedKits]);

  useEffect(() => {
    localStorage.setItem('sonic_lab_cart', JSON.stringify(cart));
  }, [cart]);

  // Dispatch live notification toasts
  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification((prev) => (prev === text ? null : prev));
    }, 4000);
  };

  // Add to Cart
  const handleAddToCart = (kitToAdd: Kit) => {
    const isAlreadyInCart = cart.some((k) => k.id === kitToAdd.id);
    if (isAlreadyInCart) {
      triggerNotification(`"${kitToAdd.title}" counts as already inside the cart!`);
      return;
    }
    setCart((prev) => [...prev, kitToAdd]);
    triggerNotification(`Added: "${kitToAdd.title}" successfully loaded in the Cart.`);
  };

  // Remove from Cart
  const handleRemoveFromCart = (kitId: string) => {
    setCart((prev) => prev.filter((k) => k.id !== kitId));
    triggerNotification('Sound asset removed from your cart selection');
  };

  // Express checkout
  const handleExpressBuy = (kit: Kit) => {
    const isAlreadyPurchased = purchasedKits.some((k) => k.title.toUpperCase() === kit.title.toUpperCase());
    if (isAlreadyPurchased) {
      setCurrentView('profile');
      triggerNotification(`"${kit.title}" is already loaded in your inventory dashboard.`);
      return;
    }
    // Express direct append
    setPurchasedKits((prev) => [kit, ...prev]);
    setCurrentView('profile');
    triggerNotification(`Success! Express checkout for "${kit.title}" cleared. Download is active!`);
  };

  // Bulk Cart Checkout simulation callback
  const handleCartCheckoutCompleted = (email: string) => {
    // Append all checkout items dynamically to the purchased kits list
    setPurchasedKits((prev) => {
      const uniqueNewKits = cart.filter(
        (cartKit) => !prev.some((pk) => pk.title.toUpperCase() === cartKit.title.toUpperCase())
      );
      return [...uniqueNewKits, ...prev];
    });
    setCart([]);
    triggerNotification(`Checkout Complete! All download credentials dispatched to: ${email}`);
  };

  // Post / Publish Custom Sound kit
  const handlePublishNewKit = (newKit: Kit) => {
    setKits((prev) => [newKit, ...prev]);
    triggerNotification(`MARCA REGISTRADA: Published "${newKit.title}" securely to active seller catalog.`);
  };

  // Navigation controller with visual screen refocusing
  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectKitDetails = (id: string) => {
    setSelectedKitId(id);
    handleNavigate('details');
  };

  // Fetching parameters
  const currentDetailsKit = kits.find((k) => k.id === selectedKitId) || kits[0];

  // Sounds published by the current active profile (Alexander Void)
  const creatorPublishedKits = kits.filter((k) => k.creator === 'ALEXANDER_VOID');

  return (
    <div className="bg-[#f9f9f9] text-[#111111] font-sans min-h-screen flex flex-col antialiased selection:bg-black selection:text-white">
      
      {/* Top sticky navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        onLogin={() => triggerNotification('Logged in securely as ALEXANDER_VOID (Sound Designer / Berlin)')}
      />

      {/* Main Container workspace with smooth transitions and margins */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-8 py-6 mb-16 relative">
        
        {/* Toast Notification Alert */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-5 py-3 border border-neutral-700 font-mono text-xs flex items-center gap-3 shadow-lg rounded-none max-w-md w-11/12 sm:w-auto"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div className="flex-grow leading-tight">{notification}</div>
              <button
                onClick={() => setNotification(null)}
                className="hover:bg-neutral-800 p-0.5 rounded shrink-0 cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content routing rendering through Framer Motion wrapper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView === 'details' ? `details-${selectedKitId}` : currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {/* View Switching */}
            {currentView === 'home' && (
              <HomeView
                kits={kits}
                onSelectKit={handleSelectKitDetails}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentView === 'catalog' && (
              <CatalogView
                kits={kits}
                onSelectKit={handleSelectKitDetails}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentView === 'sell' && (
              <SellView
                onPublish={handlePublishNewKit}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'details' && (
              <DetailsView
                kit={currentDetailsKit}
                onBack={() => handleNavigate('catalog')}
                onAddToCart={handleAddToCart}
                onBuyNow={handleExpressBuy}
                isInCart={cart.some((k) => k.id === currentDetailsKit.id)}
              />
            )}

            {currentView === 'profile' && (
              <ProfileView
                profile={profile}
                purchasedKits={purchasedKits}
                creatorKits={creatorPublishedKits}
                onUpdateProfile={(updated) => setProfile(updated)}
                onSelectKit={handleSelectKitDetails}
                onShowNotification={triggerNotification}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer layout */}
      <Footer
        onNavigate={handleNavigate}
        onOpenModal={(topic) => setInfoTopic(topic)}
      />

      {/* Cart checkout popup controller */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartKits={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckout={handleCartCheckoutCompleted}
      />

      {/* Informational dialogue cards controller */}
      <InfoModal
        isOpen={infoTopic !== null}
        title={infoTopic || ''}
        topic={infoTopic || ''}
        onClose={() => setInfoTopic(null)}
      />

    </div>
  );
}
