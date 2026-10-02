import { ViewType } from '../types';

interface FooterProps {
  onNavigate: (view: ViewType) => void;
  onOpenModal: (topic: string) => void;
}

export default function Footer({ onNavigate, onOpenModal }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background/80 backdrop-blur-sm border-t border-outline-variant py-10 md:py-12 mt-auto relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 md:px-8 max-w-[1440px] mx-auto gap-6 font-mono text-xs">
        {/* Logo/Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="font-sans text-lg font-bold text-primary tracking-tighter uppercase cursor-pointer hover:opacity-85"
        >
          SONIC_LAB
        </button>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-neutral-500">
          <button
            onClick={() => onOpenModal('Terms of Service')}
            className="hover:text-primary underline cursor-pointer transition-colors"
          >
            Terms
          </button>
          <button
            onClick={() => onOpenModal('Privacy Policy')}
            className="hover:text-primary underline cursor-pointer transition-colors"
          >
            Privacy
          </button>
          <button
            onClick={() => onOpenModal('Contact Team')}
            className="hover:text-primary underline cursor-pointer transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => onOpenModal('System Support')}
            className="hover:text-primary underline cursor-pointer transition-colors"
          >
            Support
          </button>
        </div>

        {/* Copyright notice */}
        <span className="text-neutral-500 text-center md:text-right">
          © {currentYear} SONIC_LAB. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
