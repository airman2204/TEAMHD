import React, { useState } from 'react';
import { Activity, ShieldCheck, Flame, Dumbbell, Sparkles, ChevronRight } from 'lucide-react';

const MUSCLE_ZONES = [
  { key: 'chest', label: 'Pectorales', category: 'Pecho', pct: 100 },
  { key: 'abs', label: 'Abdomen & Core', category: 'Tronco', pct: 100 },
  { key: 'shoulders', label: 'Hombros', category: 'Deltoides', pct: 100 },
  { key: 'arms', label: 'Bíceps / Brazos', category: 'Brazos', pct: 100 },
  { key: 'quads', label: 'Cuádriceps', category: 'Piernas', pct: 100 },
  { key: 'back', label: 'Dorsales & Espalda', category: 'Espalda', pct: 100 },
];

export default function MuscleRecoveryMap({ routines = {}, activeDay = 'Lun' }) {
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  // Calcular impacto real basado en las series completadas
  const { recoveryList, totalImpacts, globalScore } = React.useMemo(() => {
    const hits = {
      chest: 0,
      abs: 0,
      shoulders: 0,
      arms: 0,
      quads: 0,
      back: 0
    };

    Object.values(routines).forEach((dayRoutine) => {
      (dayRoutine.exercises || []).forEach((ex) => {
        const isHit = ex.completed || (ex.setsLog && ex.setsLog.some(s => s.completed));
        if (isHit) {
          const name = (ex.name || '').toLowerCase();
          const muscle = (ex.muscle_group || '').toLowerCase();

          if (muscle.includes('pecho') || name.includes('press') || name.includes('pecho')) hits.chest += 1;
          if (muscle.includes('abdomen') || muscle.includes('core') || name.includes('crunch')) hits.abs += 1;
          if (muscle.includes('hombro') || name.includes('militar') || name.includes('lateral')) hits.shoulders += 1;
          if (muscle.includes('bíceps') || muscle.includes('tríceps') || name.includes('curl')) hits.arms += 1;
          if (muscle.includes('pierna') || name.includes('sentadilla') || name.includes('prensa')) hits.quads += 1;
          if (muscle.includes('espalda') || name.includes('remo') || name.includes('jalón')) hits.back += 1;
        }
      });
    });

    let sum = 0;
    let impactsCount = 0;

    const list = MUSCLE_ZONES.map(z => {
      const h = hits[z.key] || 0;
      impactsCount += h;
      const rec = Math.max(30, Math.min(100, 100 - (h * 30)));
      sum += rec;

      return {
        ...z,
        hits: h,
        percentage: rec,
        isFatigued: rec <= 70
      };
    });

    return {
      recoveryList: list,
      totalImpacts: impactsCount,
      globalScore: Math.round(sum / MUSCLE_ZONES.length)
    };
  }, [routines]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
      
      {/* 1. Header con Badge Fitbod Engine */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center font-bold border border-orange-200/60 dark:border-orange-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Mapa Anatómico
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200/60 dark:border-orange-500/20">
                Fitbod HD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              Zonas musculares y frescura neuromuscular
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
            {globalScore}%
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
            Frescura
          </span>
        </div>
      </div>

      {/* 2. SILUETA MUSCULAR HD PROFESIONAL (IMAGEN OFICIAL CON ILUMINACIÓN ÁMBAR) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#121316] border border-zinc-800/80 flex flex-col items-center justify-center p-3 sm:p-5 shadow-inner">
        
        {/* Glow de ambientación naranja/ámbar */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Imagen Anatómica HD Ultra-Clean */}
        <div className="relative max-w-[240px] sm:max-w-[270px] w-full flex items-center justify-center select-none">
          <img
            src="/anatomy-body.jpg"
            alt="Silueta Anatómica Muscular"
            className="w-full h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] rounded-2xl"
          />

          {/* Hotspots / Pills táctiles con porcentaje en las zonas clave */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Pectorales */}
            <div className="absolute top-[26%] left-1/2 -translate-x-1/2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setSelectedMuscle(recoveryList.find(r => r.key === 'chest'))}
                className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-orange-500/60 text-orange-400 font-mono text-[9px] font-black shadow-lg hover:scale-110 transition-transform flex items-center gap-1"
              >
                <span>Pecho</span>
                <span className="text-white">{recoveryList.find(r => r.key === 'chest')?.percentage}%</span>
              </button>
            </div>

            {/* Abdomen / Core */}
            <div className="absolute top-[38%] left-1/2 -translate-x-1/2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setSelectedMuscle(recoveryList.find(r => r.key === 'abs'))}
                className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-orange-500/60 text-orange-400 font-mono text-[9px] font-black shadow-lg hover:scale-110 transition-transform flex items-center gap-1"
              >
                <span>Core</span>
                <span className="text-white">{recoveryList.find(r => r.key === 'abs')?.percentage}%</span>
              </button>
            </div>

            {/* Bíceps / Brazos */}
            <div className="absolute top-[32%] left-[12%] pointer-events-auto">
              <button
                type="button"
                onClick={() => setSelectedMuscle(recoveryList.find(r => r.key === 'arms'))}
                className="px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-zinc-700 text-zinc-300 font-mono text-[9px] font-bold shadow-lg hover:scale-110 transition-transform"
              >
                Brazos {recoveryList.find(r => r.key === 'arms')?.percentage}%
              </button>
            </div>

            {/* Piernas / Cuádriceps */}
            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setSelectedMuscle(recoveryList.find(r => r.key === 'quads'))}
                className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-orange-500/60 text-orange-400 font-mono text-[9px] font-black shadow-lg hover:scale-110 transition-transform flex items-center gap-1"
              >
                <span>Piernas</span>
                <span className="text-white">{recoveryList.find(r => r.key === 'quads')?.percentage}%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subtítulo Guía */}
        <span className="text-[10px] text-zinc-400 font-medium mt-3">
          Toca cualquier zona para ver el desgaste neuromuscular
        </span>
      </div>

      {/* 3. Panel de Detalle o Lista de Músculos */}
      {selectedMuscle ? (
        <div className="p-3 bg-orange-50/70 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <span className="font-black text-slate-900 dark:text-white block">
              {selectedMuscle.label}
            </span>
            <span className="text-[10px] text-orange-700 dark:text-orange-300 font-medium">
              {selectedMuscle.hits > 0 ? `${selectedMuscle.hits} ejercicios realizados esta semana` : 'Músculo completamente fresco'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-orange-500 text-black">
              {selectedMuscle.percentage}%
            </span>
            <button
              type="button"
              onClick={() => setSelectedMuscle(null)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 pt-1">
          {recoveryList.map((m) => (
            <div
              key={m.key}
              onClick={() => setSelectedMuscle(m)}
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between cursor-pointer hover:border-orange-400 transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {m.label}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono">
                  {m.category}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg ${
                m.isFatigued
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}>
                {m.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
