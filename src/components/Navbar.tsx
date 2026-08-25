import { ViewType } from '../types';
import { ShoppingCart, User, Upload } from 'lucide-react';

interface NavbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  cartCount: number;
  onOpenCart: () => void;
  onLogin: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onLogin
}: NavbarProps) {
  return (
    <nav className="sticky top-0 w-full bg-background/95 backdrop-blur-md border-b border-outline-variant z-50 transition-all duration-200">
      <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-8 md:gap-12">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="font-sans text-xl md:text-2xl font-extrabold text-primary tracking-tighter uppercase focus:outline-none cursor-pointer hover:opacity-85 transition-opacity"
            id="nav-logo"
          >
            SONIC_LAB
          </button>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6 font-sans text-sm font-medium tracking-wide">
            <button
              onClick={() => onNavigate('catalog')}
              className={`py-1 border-b-2 transition-all duration-200 cursor-pointer ${
                currentView === 'catalog'
                  ? 'text-primary border-primary font-bold'
                  : 'text-neutral-500 border-transparent hover:text-primary hover:border-neutral-300'
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="py-1 border-b-2 border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300 cursor-pointer transition-all duration-200"
            >
              Drum Kits
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="py-1 border-b-2 border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300 cursor-pointer transition-all duration-200"
            >
              Sample Packs
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="py-1 border-b-2 border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300 cursor-pointer transition-all duration-200"
            >
              Serum Banks
            </button>
            <button
              onClick={() => onNavigate('sell')}
              className={`py-1 border-b-2 transition-all duration-200 cursor-pointer ${
                currentView === 'sell'
                  ? 'text-primary border-primary font-bold'
                  : 'text-neutral-500 border-transparent hover:text-primary hover:border-neutral-300'
              }`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Sell Button on Mobile / Tablet */}
          <button
            onClick={() => onNavigate('sell')}
            className="md:hidden p-2 text-neutral-600 hover:text-primary focus:outline-none"
            title="Vender som"
          >
            <Upload className="w-5 h-5" />
          </button>

          {/* Checkout Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-neutral-800 hover:text-primary hover:bg-neutral-100 transition-all cursor-pointer focus:outline-none flex items-center justify-center rounded"
            aria-label="Carrinho de compras"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-mono leading-none px-1.5 py-0.5 font-bold tracking-tighter">
                {cartCount}
              </span>
            )}
          </button>

          {/* Login Link */}
          <button
            onClick={onLogin}
            className="hidden sm:inline font-sans text-sm text-neutral-500 hover:text-primary cursor-pointer transition-colors"
          >
            Login
          </button>

          {/* Profile Switcher */}
          <button
            onClick={() => onNavigate('profile')}
            className={`font-sans text-sm cursor-pointer hover:underline transition-all duration-200 flex items-center gap-1.5 px-2.5 py-1.5 border border-transparent hover:border-black rounded ${
              currentView === 'profile'
                ? 'text-primary font-bold border-black bg-neutral-100'
                : 'text-neutral-800'
            }`}
          >
            <User className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline font-sans">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
