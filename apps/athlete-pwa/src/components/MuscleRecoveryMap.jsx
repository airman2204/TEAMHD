import React from 'react';
import { Activity, Zap, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

// Mapeo anatómico de grupos musculares con porcentajes y colores Fitbod
const MUSCLE_DEFINITIONS = [
  { key: 'chest', label: 'Pecho / Pectoral', defaultRec: 100, icon: '🛡️' },
  { key: 'back', label: 'Espalda / Dorsales', defaultRec: 100, icon: '🦅' },
  { key: 'shoulders', label: 'Hombros (Deltoides)', defaultRec: 100, icon: '⚡' },
  { key: 'legs', label: 'Piernas / Cuádriceps', defaultRec: 100, icon: '🦵' },
  { key: 'arms', label: 'Bíceps / Tríceps', defaultRec: 100, icon: '💪' },
  { key: 'core', label: 'Abdomen / Core', defaultRec: 100, icon: '🔥' },
];

export default function MuscleRecoveryMap({ routines = {}, activeDay = 'Lun' }) {
  // Calcular frescura de los músculos basada en los ejercicios completados en la semana
  const recoveryState = React.useMemo(() => {
    const counts = {
      chest: 0,
      back: 0,
      shoulders: 0,
      legs: 0,
      arms: 0,
      core: 0,
    };

    // Analizar rutinas completadas
    Object.values(routines).forEach((dayRoutine) => {
      (dayRoutine.exercises || []).forEach((ex) => {
        const name = (ex.name || '').toLowerCase();
        const muscle = (ex.muscle_group || '').toLowerCase();

        const isHit = ex.completed || (ex.setsLog && ex.setsLog.some(s => s.completed));
        if (isHit) {
          if (muscle.includes('pecho') || name.includes('press') || name.includes('pecho')) counts.chest += 1;
          if (muscle.includes('espalda') || name.includes('remo') || name.includes('jalón')) counts.back += 1;
          if (muscle.includes('hombro') || name.includes('militar') || name.includes('lateral')) counts.shoulders += 1;
          if (muscle.includes('pierna') || name.includes('sentadilla') || name.includes('prensa')) counts.legs += 1;
          if (muscle.includes('bíceps') || muscle.includes('tríceps') || name.includes('curl')) counts.arms += 1;
          if (muscle.includes('abdomen') || muscle.includes('core') || name.includes('crunch')) counts.core += 1;
        }
      });
    });

    return MUSCLE_DEFINITIONS.map((def) => {
      const fatigueHits = counts[def.key] || 0;
      // Cada ejercicio completado reduce la frescura en un 30% hasta un mínimo del 25%
      const calculatedRec = Math.max(25, Math.min(100, def.defaultRec - (fatigueHits * 30)));
      
      let statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      let barColor = 'bg-emerald-500';
      let stateLabel = 'Listo para entrenar';

      if (calculatedRec <= 45) {
        statusColor = 'text-red-500 bg-red-500/10 border-red-500/30';
        barColor = 'bg-red-500';
        stateLabel = 'Fatigado • Descanso';
      } else if (calculatedRec <= 75) {
        statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        barColor = 'bg-amber-500';
        stateLabel = 'Recuperándose';
      }

      return {
        ...def,
        percentage: calculatedRec,
        statusColor,
        barColor,
        stateLabel
      };
    });
  }, [routines]);

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-4 shadow-2xs space-y-3.5 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Recuperación Muscular Fitbod</span>
              <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md font-bold">
                IA HeatMap
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
              Frescura y disponibilidad de grupos musculares
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500">
            Día {activeDay}
          </span>
        </div>
      </div>

      {/* Grid de Músculos con barras de recuperación estilo Fitbod */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {recoveryState.map((m) => (
          <div 
            key={m.key}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800/80 flex flex-col justify-between gap-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{m.icon}</span>
              <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md border ${m.statusColor}`}>
                {m.percentage}%
              </span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate block">
                {m.label.split(' / ')[0]}
              </span>
              <span className="text-[9px] text-slate-400 dark:text-zinc-500 block leading-tight">
                {m.stateLabel}
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-0.5">
              <div 
                className={`h-full ${m.barColor} transition-all duration-500 rounded-full`}
                style={{ width: `${m.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
