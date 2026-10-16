import { useState } from 'react';
import { ViewType } from '../types';
import { ShoppingBag, User, LogOut, Menu, X, ArrowUpRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  cartCount: number;
  onOpenCart: () => void;
  onLogin?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  isLoggedIn = false,
  userName,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: ViewType) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant/60 bg-background/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-6 lg:gap-10">
          <button
            id="nav-logo"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            aria-label="SONIC_LAB Home"
          >
            <div className="w-2 h-2 rounded-full bg-primary shrink-0 transition-transform group-hover:scale-125" />
            <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-primary uppercase select-none">
              SONIC_LAB
            </span>
          </button>

          {/* Minimalist Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
            <button
              id="nav-link-browse"
              onClick={() => handleNavClick('catalog')}
              className={`transition-colors py-1 cursor-pointer select-none ${
                currentView === 'catalog'
                  ? 'text-primary font-bold border-b border-primary'
                  : 'text-neutral-500 hover:text-primary'
              }`}
            >
              Catálogo
            </button>
            <button
              id="nav-link-drumkits"
              onClick={() => handleNavClick('catalog')}
              className="text-neutral-500 hover:text-primary transition-colors py-1 cursor-pointer select-none"
            >
              Drum Kits
            </button>
            <button
              id="nav-link-samples"
              onClick={() => handleNavClick('catalog')}
              className="text-neutral-500 hover:text-primary transition-colors py-1 cursor-pointer select-none"
            >
              Samples
            </button>
            <button
              id="nav-link-serum"
              onClick={() => handleNavClick('catalog')}
              className="text-neutral-500 hover:text-primary transition-colors py-1 cursor-pointer select-none"
            >
              Presets
            </button>
            <button
              id="nav-link-sell"
              onClick={() => handleNavClick('sell')}
              className={`transition-colors py-1 px-2.5 font-bold cursor-pointer select-none flex items-center gap-1.5 border ${
                currentView === 'sell'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-outline-variant/80 hover:border-primary text-neutral-700 dark:text-neutral-200 hover:text-primary'
              }`}
            >
              <span>+ Publicar Kit</span>
              <ArrowUpRight className="w-3 h-3 opacity-70" />
            </button>
          </nav>
        </div>

        {/* Minimalist Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle id="nav-theme-toggle" className="p-2" />

          {/* Minimal Cart Button */}
          <button
            id="nav-btn-cart"
            onClick={onOpenCart}
            className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors cursor-pointer"
            title="Carrinho"
            aria-label="Carrinho de compras"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-mono font-bold flex items-center justify-center tabular-nums leading-none">
                {cartCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="h-4 w-[1px] bg-outline-variant/60 mx-1 hidden sm:block" />

          {/* Auth State Controls */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                id="nav-btn-profile"
                onClick={() => handleNavClick('profile')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  currentView === 'profile'
                    ? 'text-primary font-bold'
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-primary'
                }`}
                title="Meu Perfil"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate hidden sm:inline">
                  {userName || 'Produtor'}
                </span>
              </button>

              {onLogout && (
                <button
                  id="nav-btn-logout"
                  onClick={onLogout}
                  className="p-2 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                  title="Sair da conta"
                  aria-label="Sair"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <button
                id="nav-btn-login"
                onClick={() => handleNavClick('login')}
                className={`px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  currentView === 'login'
                    ? 'border-primary bg-primary text-on-primary font-bold'
                    : 'border-outline-variant text-neutral-700 dark:text-neutral-300 hover:border-primary hover:text-primary'
                }`}
              >
                Entrar
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            id="nav-mobile-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/60 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3 font-mono text-xs uppercase tracking-wider animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => handleNavClick('catalog')}
            className="w-full text-left py-2 text-neutral-700 dark:text-neutral-300 hover:text-primary flex items-center justify-between"
          >
            <span>Catálogo Completo</span>
            <span className="text-neutral-400">&rarr;</span>
          </button>
          <button
            onClick={() => handleNavClick('sell')}
            className="w-full text-left py-2 font-bold text-neutral-800 dark:text-neutral-100 hover:text-primary flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5 text-primary">
              <span>+ Publicar SoundKit</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          {isLoggedIn ? (
            <button
              onClick={() => handleNavClick('profile')}
              className="w-full text-left py-2 text-neutral-700 dark:text-neutral-300 hover:text-primary flex items-center justify-between"
            >
              <span>Meu Perfil ({userName || 'Produtor'})</span>
              <User className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-2.5 border border-primary bg-primary text-on-primary text-center font-mono text-xs uppercase tracking-wider font-bold"
              >
                Entrar
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
