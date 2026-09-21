import React from 'react';
import { Dumbbell, Users, Store, Shield } from 'lucide-react';

export default function RoleSwitcher({ activeRole, onChangeRole, stats }) {
  const roles = [
    {
      id: 'athlete',
      label: 'Atleta (Mobile PWA)',
      icon: Dumbbell,
      badge: 'Vista Celular',
      activeClass: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/30'
    },
    {
      id: 'coach',
      label: 'Coach Dashboard',
      icon: Users,
      badge: 'Team HD Muscle',
      activeClass: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-amber-500/30'
    },
    {
      id: 'store',
      label: 'Tienda Admin',
      icon: Store,
      badge: 'Strength Fit',
      activeClass: 'bg-gradient-to-r from-orange-500 to-red-500 text-black shadow-orange-500/30'
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-sm tracking-wider">
            <span className="text-amber-400">TEAM HD MUSCLE</span>
            <span className="text-zinc-600 font-normal">×</span>
            <span className="text-orange-500">STRENGTH FIT</span>
          </div>
          <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 font-mono">
            Prototipo Interactivo v2.0
          </span>
        </div>

        {/* Floating Pill Switcher */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-2xl border border-zinc-700/60 shadow-xl overflow-x-auto max-w-full">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onChangeRole(r.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  isActive
                    ? `${r.activeClass} shadow-md scale-102`
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black stroke-[2.5]' : 'text-zinc-400'}`} />
                <span>{r.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold hidden xs:inline-block ${
                  isActive ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {r.badge}
                </span>
              </button>
            );
          })}
        </div>



      </div>
    </header>
  );
}
