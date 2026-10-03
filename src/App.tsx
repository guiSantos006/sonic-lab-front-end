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
import { clearAuthToken } from './utils/authService';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SonarGrid from './components/SonarGrid';
import { CartModal, InfoModal } from './components/Modals';

// Page Views
import HomeView from './components/HomeView';
import CatalogView from './components/CatalogView';
import SellView from './components/SellView';
import DetailsView from './components/DetailsView';
import ProfileView from './components/ProfileView';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';

export default function App() {
  // Navigation States
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedKitId, setSelectedKitId] = useState<string>('industrial-tension-vol1');
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);

  // Floating Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const token = localStorage.getItem('sonic_lab_token');
      const saved = localStorage.getItem('sonic_lab_auth');
      return Boolean(token && saved === 'true');
    } catch {
      return false;
    }
  });

  // Master Sound Kits Lists (persisted in localStorage for functional completeness)
  const [kits, setKits] = useState<Kit[]>(() => {
    const saved = localStorage.getItem('sonic_lab_kits');
    return saved ? JSON.parse(saved) : INITIAL_KITS;
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('sonic_lab_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed.name !== 'ALEXANDER_VOID') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  // Purchased inventory tracker
  const [purchasedKits, setPurchasedKits] = useState<Kit[]>(() => {
    try {
      const saved = localStorage.getItem('sonic_lab_purchased');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
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

  // Clear obsolete mock profiles if present
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('sonic_lab_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed?.name === 'ALEXANDER_VOID') {
          localStorage.removeItem('sonic_lab_profile');
          localStorage.removeItem('sonic_lab_auth');
          localStorage.removeItem('sonic_lab_purchased');
          setProfile(DEFAULT_PROFILE);
          setIsLoggedIn(false);
          setPurchasedKits([]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

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

  useEffect(() => {
    localStorage.setItem('sonic_lab_auth', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  // Dispatch live notification toasts
  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => {
      setNotification((prev) => (prev === text ? null : prev));
    }, 4000);
  };

  // Login handler
  const handleLoginSuccess = (userData: Partial<UserProfile> & { email?: string; token?: string }) => {
    setProfile((prev) => ({
      ...prev,
      name: userData.name || prev.name,
      role: userData.role || prev.role,
      location: userData.location || prev.location,
      bio: userData.bio || prev.bio,
      avatar: userData.avatar || prev.avatar,
      email: userData.email || prev.email,
      token: userData.token || prev.token,
    }));
    setIsLoggedIn(true);
    triggerNotification('Logado com Êxito');
    setIsAuthModalOpen(false);
  };

  // Logout handler
  const handleLogout = () => {
    clearAuthToken();
    setIsLoggedIn(false);
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('sonic_lab_auth');
    localStorage.removeItem('sonic_lab_profile');
    triggerNotification('Sessão encerrada com sucesso. Você está em modo visitante.');
    handleNavigate('home');
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
    if (view === 'login' || view === 'register') {
      setAuthModalMode(view === 'register' ? 'register' : 'login');
      setIsAuthModalOpen(true);
      return;
    }
    setLoginSuccessNotice(null);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when user registers a new account successfully
  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setLoginSuccessNotice('Conta criada com sucesso! Faça login com seu e-mail e senha.');
    setAuthModalMode('login');
    triggerNotification('Conta criada com sucesso! Faça login para continuar.');
  };

  const handleSelectKitDetails = (id: string) => {
    setSelectedKitId(id);
    handleNavigate('details');
  };

  // Fetching parameters
  const currentDetailsKit = kits.find((k) => k.id === selectedKitId) || kits[0];

  // Sounds published by the current active profile
  const creatorPublishedKits = kits.filter(
    (k) => k.creator && profile.name && k.creator.toUpperCase() === profile.name.toUpperCase()
  );

  return (
    <div className="bg-background text-on-background font-sans min-h-screen flex flex-col antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200 relative">
      
      {/* Background SonarGrid field with ultra-fine minimalist dots */}
      <div
        id="app-sonar-grid-bg"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <SonarGrid
          id="global-sonar-grid"
          spacing={24}
          dotRadius={0.65}
          baseOpacity={0.12}
          trackCursor={true}
          cursorRadius={90}
          cursorDecay={0.05}
          listenWindowMove={true}
          pingEvery={0}
          speed={220}
          ringWidth={50}
          amplitude={0.8}
          interactive={true}
          listenWindowClicks={true}
          seedPing={false}
          className="w-full h-full"
        />
        {/* Subtle radial wash overlay to keep typography sharp and legible while letting waves glide underneath */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_35%,transparent_0%,var(--color-background)_100%)] opacity-60"
        />
      </div>

      {/* Main Site Container */}
      <div id="main-app-content" className="relative z-10 flex flex-col flex-grow min-h-screen">
        {/* Toast Notification Alert */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1e222b] text-white px-5 py-3 border border-white/20 font-mono text-xs flex items-center gap-3 shadow-2xl rounded-none max-w-md w-11/12 sm:w-auto"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
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

        {/* Top sticky navbar */}
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          cartCount={cart.length}
          onOpenCart={() => setIsCartOpen(true)}
          onLogin={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          isLoggedIn={isLoggedIn}
          userName={profile.name}
          onLogout={handleLogout}
        />

        {/* Main Container workspace with smooth transitions and margins */}
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-8 py-6 mb-16 relative z-10">
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
                  creatorName={profile.name}
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

        {/* Modal flutuante de Login e Cadastro sobre a tela principal com fundo incolor e blur opaco */}
        <AnimatePresence>
          {isAuthModalOpen && (
            <motion.div
              id="auth-floating-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            >
              {/* Fundo incolor e com blur para deixar o fundo opaco */}
              <div
                id="auth-floating-backdrop"
                className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md transition-all cursor-pointer"
                onClick={() => setIsAuthModalOpen(false)}
                aria-hidden="true"
              />

              {/* Janela flutuante */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-[900px] my-auto"
              >
                {authModalMode === 'login' ? (
                  <LoginView
                    onLoginSuccess={handleLoginSuccess}
                    onNavigate={(view) => {
                      if (view === 'register') {
                        setAuthModalMode('register');
                      } else {
                        setIsAuthModalOpen(false);
                        handleNavigate(view);
                      }
                    }}
                    onClose={() => setIsAuthModalOpen(false)}
                    currentProfile={profile}
                    isAlreadyLoggedIn={isLoggedIn}
                    onLogout={handleLogout}
                    initialEmail={registeredEmail}
                    initialSuccessMessage={loginSuccessNotice}
                    isModal={true}
                  />
                ) : (
                  <RegisterView
                    onRegisterSuccess={handleRegisterSuccess}
                    onNavigate={(view) => {
                      if (view === 'login') {
                        setAuthModalMode('login');
                      } else {
                        setIsAuthModalOpen(false);
                        handleNavigate(view);
                      }
                    }}
                    onClose={() => setIsAuthModalOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                    isModal={true}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
