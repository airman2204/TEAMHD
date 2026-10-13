import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Revisar preferencia guardada o clase actual en html
    const savedTheme = localStorage.getItem('teamhd_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('teamhd_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('teamhd_theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-xl transition-all flex items-center justify-center border shadow-xs ${
        isDark 
          ? 'bg-zinc-900 border-zinc-700/80 text-amber-400 hover:bg-zinc-800' 
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-slate-100'
      } ${className}`}
      title={isDark ? "Cambiar a modo Claro (Apple Fitness / Whoop)" : "Cambiar a modo Oscuro"}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-600" />}
    </button>
  );
}
