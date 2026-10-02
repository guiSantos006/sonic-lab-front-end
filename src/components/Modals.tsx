import { Kit } from '../types';
import { X, Trash2, CheckCircle2, DollarSign } from 'lucide-react';
import React, { useState } from 'react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartKits: Kit[];
  onRemoveFromCart: (id: string) => void;
  onCheckout: (email: string) => void;
}

export function CartModal({
  isOpen,
  onClose,
  cartKits,
  onRemoveFromCart,
  onCheckout,
}: CartModalProps) {
  const [email, setEmail] = useState('');
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  if (!isOpen) return null;

  const total = cartKits.reduce((acc, item) => acc + item.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setHasCheckedOut(true);
    setTimeout(() => {
      onCheckout(email);
      setHasCheckedOut(false);
      setEmail('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-black dark:border-neutral-700 max-w-md w-full p-6 relative flex flex-col gap-6 rounded-none shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white cursor-pointer"
        >
          <X className="w-5 h-5 text-current" />
        </button>

        {hasCheckedOut ? (
          <div className="py-12 text-center flex flex-col items-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-bounce" />
            <h3 className="font-sans text-xl font-extrabold uppercase tracking-tight text-primary">
              Order Complete!
            </h3>
            <p className="font-sans text-sm text-neutral-500 dark:text-neutral-400 max-w-[280px]">
              Purchased sounds have been added directly to your **Profile Dashboard** list under "My Kits". Check your inbox for files!
            </p>
          </div>
        ) : (
          <>
            <div>
              <h2 className="font-sans text-xl font-extrabold uppercase tracking-tight text-primary">
                Shopping Cart
              </h2>
              <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mt-1">
                {cartKits.length} {cartKits.length === 1 ? 'asset' : 'assets'} ready
              </p>
            </div>

            {cartKits.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-sm">
                Your cart is empty. Add some packs in the Catalog!
              </div>
            ) : (
              <>
                {/* List items */}
                <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 pr-1">
                  {cartKits.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-10 h-10 object-cover border border-neutral-100 dark:border-neutral-800"
                        />
                        <div className="min-w-0">
                          <h4 className="font-sans text-xs font-bold truncate text-primary">
                            {item.title}
                          </h4>
                          <p className="font-sans text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            By {item.creator}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-1 text-primary">
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => onRemoveFromCart(item.id)}
                          className="text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 p-1 rounded transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total value */}
                <div className="border-t border-black dark:border-neutral-700 pt-4 flex justify-between items-center">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Grand Total:
                  </span>
                  <span className="font-mono text-lg font-extrabold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Checkout form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <label htmlFor="checkout-email" className="font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block">
                    Receive download link at:
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    placeholder="e.g. producer@soniclab.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:border-black dark:focus:border-white p-2.5 font-sans text-xs outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="w-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity font-mono text-xs font-bold py-3 uppercase tracking-widest mt-2 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    Complete checkout
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface InfoModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  topic: string;
}

export function InfoModal({ isOpen, title, onClose, topic }: InfoModalProps) {
  if (!isOpen) return null;

  const getContent = () => {
    switch (topic) {
      case 'Terms of Service':
        return `Welcome to SONIC_LAB. By using our website, you agree to comply with and be bound by the following brutalist standards. All kits purchased are licensed under royalty-free usage, granting you a non-exclusive license to use these assets in your musical work worldwide. Re-sale or distribution of individual audio files or presets as standalone resources is strictly prohibited.`;
      case 'Privacy Policy':
        return `Your privacy matters at SONIC_LAB. We collect your email address purely for the distribution of sound files and registration verification. We do not track or sell your browsing logs or purchase history. All transactions are handled securely through sandboxed mock checkout channels.`;
      case 'Contact Team':
        return `Get in touch with us! For partnerships, custom sample curation, or specific license requests: \n\nEmail: contact@soniclab.dev\nAddress: Sonic Lab Studios, Berlin, Germany.\nOur community is active 24/7.`;
      case 'System Support':
        return `Need help with your download? Make sure you have checked your spam directory or verified the email entered in the checkout form. System parameters:\n\nFormat compatibility: AI Studio Browser\nOutput formats: 24-Bit / 44.1kHz Stereo WAV, Serum presets, standard .ZIP files.\nReach out at support@soniclab.dev if you run into any extraction issues.`;
      default:
        return `This is a sample information page about the ${topic} in the SONIC_LAB applet ecosystem. All systems operational.`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-black dark:border-neutral-700 max-w-md w-full p-6 relative flex flex-col gap-4 rounded-none shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white cursor-pointer"
        >
          <X className="w-5 h-5 text-current" />
        </button>

        <h2 className="font-sans text-lg font-extrabold uppercase tracking-tight text-primary border-b border-neutral-100 dark:border-neutral-800 pb-2">
          {title}
        </h2>

        <p className="font-sans text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
          {getContent()}
        </p>

        <button
          onClick={onClose}
          className="mt-2 w-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity font-mono text-xs py-2.5 uppercase tracking-wider cursor-pointer"
        >
          Acknowledged
        </button>
      </div>
    </div>
  );
}
