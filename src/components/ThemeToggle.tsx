import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
  id?: string;
}

export default function ThemeToggle({
  showLabel = false,
  className = '',
  id = 'nav-theme-toggle',
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer focus:outline-none rounded border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 ${className}`}
      title={isDark ? 'Switch to Light Mode (localStorage)' : 'Switch to Dark Mode (localStorage)'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4.5 h-4.5 text-neutral-800 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>

      {showLabel && (
        <span className="font-mono text-xs uppercase font-bold tracking-wider ml-2">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
