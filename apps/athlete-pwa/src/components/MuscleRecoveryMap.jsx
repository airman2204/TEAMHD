import React, { useState } from 'react';
import { Activity, Shield, Zap, Sparkles, ChevronRight, CheckCircle2, RotateCw } from 'lucide-react';

const MUSCLE_GROUPS = [
  { key: 'chest', label: 'Pectorales', category: 'Torso', icon: '🛡️', view: 'front' },
  { key: 'back', label: 'Espalda & Dorsales', category: 'Torso', icon: '🦅', view: 'back' },
  { key: 'shoulders', label: 'Hombros (Deltoides)', category: 'Superior', icon: '⚡', view: 'both' },
  { key: 'arms', label: 'Bíceps & Tríceps', category: 'Brazos', icon: '💪', view: 'both' },
  { key: 'core', label: 'Abdomen & Core', category: 'Core', icon: '🔥', view: 'front' },
  { key: 'quads', label: 'Cuádriceps & Piernas', category: 'Inferior', icon: '🦵', view: 'front' },
  { key: 'hamstrings', label: 'Femorales & Glúteos', category: 'Inferior', icon: '🍑', view: 'back' },
  { key: 'calves', label: 'Pantorrillas', category: 'Inferior', icon: '⚡', view: 'both' },
];

export default function MuscleRecoveryMap({ routines = {}, activeDay = 'Lun' }) {
  const [filterView, setFilterView] = useState('all'); // 'all' | 'front' | 'back'

  // Calcular frescura real basada en los ejercicios completados en la rutina activa
  const { musclesState, globalRecoveryScore, fatiguedCount } = React.useMemo(() => {
    const hits = {
      chest: 0,
      back: 0,
      shoulders: 0,
      arms: 0,
      core: 0,
      quads: 0,
      hamstrings: 0,
      calves: 0
    };

    Object.values(routines).forEach((dayRoutine) => {
      (dayRoutine.exercises || []).forEach((ex) => {
        const isHit = ex.completed || (ex.setsLog && ex.setsLog.some(s => s.completed));
        if (isHit) {
          const name = (ex.name || '').toLowerCase();
          const muscle = (ex.muscle_group || '').toLowerCase();

          if (muscle.includes('pecho') || name.includes('press') || name.includes('pecho')) hits.chest += 1;
          if (muscle.includes('espalda') || name.includes('remo') || name.includes('jalón')) hits.back += 1;
          if (muscle.includes('hombro') || name.includes('militar') || name.includes('lateral')) hits.shoulders += 1;
          if (muscle.includes('bíceps') || muscle.includes('tríceps') || name.includes('curl')) hits.arms += 1;
          if (muscle.includes('abdomen') || muscle.includes('core') || name.includes('crunch')) hits.core += 1;
          if (muscle.includes('pierna') || name.includes('sentadilla') || name.includes('prensa')) hits.quads += 1;
          if (muscle.includes('femoral') || muscle.includes('glúteo') || name.includes('peso muerto')) hits.hamstrings += 1;
          if (muscle.includes('gemelo') || muscle.includes('pantorrilla')) hits.calves += 1;
        }
      });
    });

    let totalScore = 0;
    let fatigued = 0;

    const list = MUSCLE_GROUPS.map((m) => {
      const fatigueHits = hits[m.key] || 0;
      // 100% fresco, reduce 30% por cada ejercicio completado hasta mínimo 25%
      const rec = Math.max(25, Math.min(100, 100 - (fatigueHits * 30)));
      totalScore += rec;

      let status = 'Fresco';
      let statusColor = 'text-emerald-600 dark:text-emerald-400';
      let barColor = 'bg-emerald-500';
      let badgeBg = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-500/20';

      if (rec <= 45) {
        status = 'Fatigado';
        statusColor = 'text-red-500 dark:text-red-400';
        barColor = 'bg-red-500';
        badgeBg = 'bg-red-50 dark:bg-red-950/50 border-red-200/80 dark:border-red-500/20';
        fatigued += 1;
      } else if (rec <= 75) {
        status = 'Recuperándose';
        statusColor = 'text-amber-500 dark:text-amber-400';
        barColor = 'bg-amber-500';
        badgeBg = 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-500/20';
      }

      return {
        ...m,
        percentage: rec,
        fatigueHits,
        status,
        statusColor,
        barColor,
        badgeBg
      };
    });

    const avgScore = Math.round(totalScore / MUSCLE_GROUPS.length);
    return { musclesState: list, globalRecoveryScore: avgScore, fatiguedCount: fatigued };
  }, [routines]);

  const filteredMuscles = musclesState.filter(m => {
    if (filterView === 'all') return true;
    return m.view === filterView || m.view === 'both';
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
      
      {/* 1. Header con Puntuación de Recuperación General */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center font-bold border border-orange-200/60 dark:border-orange-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Recuperación Muscular
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200/60 dark:border-orange-500/20">
                Fitbod Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              Disponibilidad calculada de tus grupos musculares
            </p>
          </div>
        </div>

        {/* Badge de Score General */}
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {globalRecoveryScore}%
            </span>
          </div>
          <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
            Frescura Total
          </span>
        </div>
      </div>

      {/* 2. Barra de Filtro de Vistas (Todos / Tren Anterior / Tren Posterior) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex bg-slate-100 dark:bg-zinc-800/90 p-1 rounded-2xl border border-slate-200/70 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setFilterView('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterView === 'all'
                ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            Todos ({musclesState.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterView('front')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterView === 'front'
                ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => setFilterView('back')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterView === 'back'
                ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-xs font-black'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            Espalda
          </button>
        </div>

        {/* Leyenda de Estado */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Listo
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Recuperando
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Fatigado
          </span>
        </div>
      </div>

      {/* 3. Grid Moderno de Músculos (Tarjetas Profesionales con Mini Barras de Carga) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {filteredMuscles.map((muscle) => (
          <div
            key={muscle.key}
            className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-2"
          >
            {/* Fila superior: Icono, Nombre y Badge de Porcentaje */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{muscle.icon}</span>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                    {muscle.label}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    {muscle.category} • {muscle.status}
                  </span>
                </div>
              </div>

              {/* Porcentaje en Pill */}
              <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-xl border ${muscle.badgeBg} ${muscle.statusColor}`}>
                {muscle.percentage}%
              </span>
            </div>

            {/* Fila inferior: Barra de Progreso Elegante */}
            <div className="w-full bg-slate-200/80 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${muscle.barColor} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${muscle.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
