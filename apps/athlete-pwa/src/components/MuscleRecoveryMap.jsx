import React, { useState, useMemo } from 'react';
import Model from 'react-body-highlighter';
import { Activity, RotateCw, Flame, Award, Dumbbell, ShieldCheck } from 'lucide-react';

export default function MuscleRecoveryMap({ routines = {}, activeDay = 'Lun' }) {
  const [modelType, setModelType] = useState('anterior'); // 'anterior' | 'posterior'
  const [selectedMuscleStat, setSelectedMuscleStat] = useState(null);

  // Mapear los ejercicios completados en la rutina activa a los músculos oficiales de la silueta médica
  const { exerciseData, totalHits, activeMusclesSummary } = useMemo(() => {
    const hitsCount = {};
    const exercisesFound = [];

    Object.values(routines).forEach((dayRoutine) => {
      (dayRoutine.exercises || []).forEach((ex) => {
        const isHit = ex.completed || (ex.setsLog && ex.setsLog.some(s => s.completed));
        if (isHit) {
          const name = (ex.name || '').toLowerCase();
          const muscle = (ex.muscle_group || '').toLowerCase();
          const targetMuscles = [];

          if (muscle.includes('pecho') || name.includes('press') || name.includes('pecho')) {
            targetMuscles.push('chest');
          }
          if (muscle.includes('abdomen') || muscle.includes('core') || name.includes('crunch')) {
            targetMuscles.push('abs', 'obliques');
          }
          if (muscle.includes('bíceps') || name.includes('curl')) {
            targetMuscles.push('biceps');
          }
          if (muscle.includes('tríceps') || name.includes('copa') || name.includes('fondos')) {
            targetMuscles.push('triceps');
          }
          if (muscle.includes('pierna') || name.includes('sentadilla') || name.includes('prensa')) {
            targetMuscles.push('quadriceps');
          }
          if (muscle.includes('femoral') || name.includes('peso muerto') || name.includes('isquio')) {
            targetMuscles.push('hamstring');
          }
          if (muscle.includes('glúteo') || name.includes('hip thrust')) {
            targetMuscles.push('gluteal');
          }
          if (muscle.includes('pantorrilla') || muscle.includes('gemelo') || name.includes('elevación')) {
            targetMuscles.push('calves');
          }
          if (muscle.includes('hombro') || name.includes('militar') || name.includes('lateral')) {
            targetMuscles.push('front-deltoids', 'back-deltoids');
          }
          if (muscle.includes('espalda') || name.includes('remo') || name.includes('jalón')) {
            targetMuscles.push('upper-back', 'lower-back', 'trapezius');
          }

          if (targetMuscles.length > 0) {
            targetMuscles.forEach(m => {
              hitsCount[m] = (hitsCount[m] || 0) + 1;
            });
            exercisesFound.push({
              name: ex.name,
              muscles: targetMuscles,
              frequency: 1
            });
          }
        }
      });
    });

    const total = Object.values(hitsCount).reduce((a, b) => a + b, 0);

    return {
      exerciseData: exercisesFound,
      totalHits: total,
      activeMusclesSummary: hitsCount
    };
  }, [routines]);

  // Si no hay ejercicios completados, silueta en estado limpio (gris elegante)
  // Paleta Fitbod: Naranja/Salmón (#ff725e / #f97316) para músculos entrenados
  const highlightedColors = ['#ff725e', '#f97316', '#ea580c'];

  const toggleView = () => {
    setModelType(prev => (prev === 'anterior' ? 'posterior' : 'anterior'));
  };

  const handleMuscleClick = (stat) => {
    if (stat && stat.muscle) {
      setSelectedMuscleStat(stat);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
      
      {/* 1. Header con Toggle de Frente / Espalda */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center font-bold border border-orange-200/60 dark:border-orange-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Mapa Muscular
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200/60 dark:border-orange-500/20">
                Fitbod HD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              Impacto muscular en tiempo real
            </p>
          </div>
        </div>

        {/* Botón Rotar Frente / Espalda */}
        <button
          type="button"
          onClick={toggleView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all border border-slate-200/60 dark:border-zinc-700"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{modelType === 'anterior' ? 'Ver Espalda' : 'Ver Frente'}</span>
        </button>
      </div>

      {/* 2. SILUETA VECTORIAL ANATÓMICA MÉDICA (react-body-highlighter) */}
      <div className="relative flex flex-col items-center justify-center py-2 bg-slate-50/70 dark:bg-zinc-950/50 rounded-3xl border border-slate-100 dark:border-zinc-800/80 min-h-[340px]">
        
        <Model
          data={exerciseData}
          type={modelType}
          bodyColor="#3f3f46" // Gris carbón anatómico moderno
          highlightedColors={highlightedColors}
          onClick={handleMuscleClick}
          style={{ width: '13rem', margin: '0 auto' }}
          svgStyle={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
        />

        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-2">
          {modelType === 'anterior' ? 'Vista Anterior (Frente)' : 'Vista Posterior (Espalda)'} • Toca un músculo para detalles
        </span>
      </div>

      {/* 3. Resumen y Leyenda de Recuperación */}
      {selectedMuscleStat ? (
        <div className="p-3 bg-orange-50/70 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <span className="font-black text-slate-900 dark:text-white capitalize block">
              Músculo: {selectedMuscleStat.muscle.replace('-', ' ')}
            </span>
            <span className="text-[10px] text-orange-700 dark:text-orange-300 font-medium">
              {selectedMuscleStat.data.exercises?.length > 0
                ? `Impactado por: ${selectedMuscleStat.data.exercises.join(', ')}`
                : 'Músculo completamente descansado'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMuscleStat(null)}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-700"
          >
            Cerrar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3f3f46] inline-block" /> Descansado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff725e] inline-block" /> Trabajado
            </span>
          </div>

          <span className="text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400">
            {totalHits > 0 ? `${totalHits} impactos registrados` : 'Listo para entrenar'}
          </span>
        </div>
      )}

    </div>
  );
}
