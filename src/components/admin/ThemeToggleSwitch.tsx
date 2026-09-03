import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

interface Props {
  showLabel?: boolean;
}

export default function ThemeToggleSwitch({ showLabel = false }: Props) {
  const { theme, toggleTheme, isDark } = useAdminTheme();

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
          isDark
            ? 'bg-slate-800 border-slate-700'
            : 'bg-emerald-500 border-emerald-400'
        }`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={`pointer-events-none inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
            isDark
              ? 'translate-x-7 bg-slate-950 text-amber-400'
              : 'translate-x-0 bg-white text-emerald-600'
          }`}
        >
          {isDark ? (
            <Moon className="h-3 w-3 fill-amber-400" />
          ) : (
            <Sun className="h-3 w-3 fill-emerald-500" />
          )}
        </span>
      </button>
    </div>
  );
}