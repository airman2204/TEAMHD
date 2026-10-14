import React, { useState, useMemo } from 'react';
import { Activity, RotateCw, Dumbbell, Award, Flame, CheckCircle2 } from 'lucide-react';
import { anteriorData, posteriorData, MuscleType } from './anatomyData';

export default function MuscleRecoveryMap({ routines = {}, activeDay = 'Lun' }) {
  const [viewMode, setViewMode] = useState('anterior'); // 'anterior' | 'posterior'
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  // Mapeo amigable de nombres en español
  const MUSCLE_NAMES = {
    [MuscleType.CHEST]: 'Pectorales',
    [MuscleType.ABS]: 'Abdominales',
    [MuscleType.OBLIQUES]: 'Oblicuos',
    [MuscleType.BICEPS]: 'Bíceps',
    [MuscleType.TRICEPS]: 'Tríceps',
    [MuscleType.FOREARM]: 'Antebrazos',
    [MuscleType.FRONT_DELTOIDS]: 'Hombros Frontales',
    [MuscleType.BACK_DELTOIDS]: 'Hombros Posteriores',
    [MuscleType.UPPER_BACK]: 'Espalda Alta',
    [MuscleType.LOWER_BACK]: 'Espalda Baja / Lumbar',
    [MuscleType.TRAPEZIUS]: 'Trapecios',
    [MuscleType.QUADRICEPS]: 'Cuádriceps',
    [MuscleType.HAMSTRING]: 'Femorales / Isquios',
    [MuscleType.GLUTEAL]: 'Glúteos',
    [MuscleType.CALVES]: 'Pantorrillas / Gemelos',
    [MuscleType.ABDUCTORS]: 'Aductores',
    [MuscleType.NECK]: 'Cuello'
  };

  // Calcular impacto real basado en las series completadas
  const { hitsByMuscle, totalWorkedMuscles, exercisesByMuscle } = useMemo(() => {
    const hits = {};
    const exMap = {};

    Object.values(routines).forEach((dayRoutine) => {
      (dayRoutine.exercises || []).forEach((ex) => {
        const isHit = ex.completed || (ex.setsLog && ex.setsLog.some(s => s.completed));
        if (isHit) {
          const name = (ex.name || '').toLowerCase();
          const muscle = (ex.muscle_group || '').toLowerCase();
          const targetMuscles = [];

          if (muscle.includes('pecho') || name.includes('press') || name.includes('pecho')) {
            targetMuscles.push(MuscleType.CHEST);
          }
          if (muscle.includes('abdomen') || muscle.includes('core') || name.includes('crunch')) {
            targetMuscles.push(MuscleType.ABS, MuscleType.OBLIQUES);
          }
          if (muscle.includes('bíceps') || name.includes('curl')) {
            targetMuscles.push(MuscleType.BICEPS);
          }
          if (muscle.includes('tríceps') || name.includes('copa') || name.includes('fondos')) {
            targetMuscles.push(MuscleType.TRICEPS);
          }
          if (muscle.includes('pierna') || name.includes('sentadilla') || name.includes('prensa')) {
            targetMuscles.push(MuscleType.QUADRICEPS);
          }
          if (muscle.includes('femoral') || name.includes('peso muerto') || name.includes('isquio')) {
            targetMuscles.push(MuscleType.HAMSTRING);
          }
          if (muscle.includes('glúteo') || name.includes('hip thrust')) {
            targetMuscles.push(MuscleType.GLUTEAL);
          }
          if (muscle.includes('pantorrilla') || muscle.includes('gemelo') || name.includes('elevación')) {
            targetMuscles.push(MuscleType.CALVES);
          }
          if (muscle.includes('hombro') || name.includes('militar') || name.includes('lateral')) {
            targetMuscles.push(MuscleType.FRONT_DELTOIDS, MuscleType.BACK_DELTOIDS);
          }
          if (muscle.includes('espalda') || name.includes('remo') || name.includes('jalón')) {
            targetMuscles.push(MuscleType.UPPER_BACK, MuscleType.LOWER_BACK, MuscleType.TRAPEZIUS);
          }

          targetMuscles.forEach(m => {
            hits[m] = (hits[m] || 0) + 1;
            if (!exMap[m]) exMap[m] = [];
            if (!exMap[m].includes(ex.name)) exMap[m].push(ex.name);
          });
        }
      });
    });

    const workedCount = Object.keys(hits).length;
    return { hitsByMuscle: hits, totalWorkedMuscles: workedCount, exercisesByMuscle: exMap };
  }, [routines]);

  const currentDataset = viewMode === 'anterior' ? anteriorData : posteriorData;

  // Total de grupos musculares frescos (16 grupos principales - trabajados)
  const freshCount = Math.max(0, 16 - totalWorkedMuscles);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 transition-colors">
      
      {/* 1. Header con Métricas Superiores Estilo Fitbod */}
      <div className="flex items-center justify-between px-1">
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
                Fitbod Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              Toca cada músculo individual para ver su estado
            </p>
          </div>
        </div>

        {/* Botón Rotar Frente / Espalda */}
        <button
          type="button"
          onClick={() => {
            setViewMode(prev => (prev === 'anterior' ? 'posterior' : 'anterior'));
            setSelectedMuscle(null);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 hover:bg-orange-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-orange-600 dark:text-orange-400 text-xs font-black transition-all border border-orange-200/80 dark:border-zinc-700 shadow-xs"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{viewMode === 'anterior' ? 'Ver Espalda' : 'Ver Frente'}</span>
        </button>
      </div>

      {/* 2. CONTENEDOR FITBOD DARK CON SILUETA MUSCULAR INTERACTIVA */}
      <div className="relative rounded-3xl overflow-hidden bg-[#18191c] border border-zinc-800 flex flex-col items-center justify-center p-4 sm:p-6 shadow-inner min-h-[380px]">
        
        {/* Glow de ambientación en el fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Métricas flotantes discretas */}
        <div className="w-full flex items-center justify-between text-center px-4 mb-2 z-10">
          <div>
            <span className="text-2xl font-black font-mono text-white block">
              0
            </span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
              Días de descanso
            </span>
          </div>

          <div>
            <span className="text-2xl font-black font-mono text-orange-400 block">
              {freshCount}
            </span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider">
              Músculos frescos
            </span>
          </div>
        </div>

        {/* SVG INTERACTIVO VECTORIAL EXACTO DE FITBOD CON CONTORNO ILUMINADO */}
        <div className="relative w-48 sm:w-56 h-[320px] sm:h-[350px] flex items-center justify-center select-none z-10">
          <svg
            viewBox="0 0 100 200"
            className="w-full h-full drop-shadow-[0_0_12px_rgba(255,114,94,0.2)] transition-all"
          >
            {/* Filtro de resplandor para el músculo seleccionado */}
            <defs>
              <filter id="muscleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {currentDataset.map((group, gIdx) => {
              const hits = hitsByMuscle[group.muscle] || 0;
              const isWorked = hits > 0;
              const isSelected = selectedMuscle === group.muscle;

              // Fitbod Colors: Salmón brillante (#ff725e) si está trabajado, carbón (#2d3139) si está fresco
              let fillColor = isWorked ? '#ff725e' : '#2d3139';
              if (isSelected) {
                fillColor = '#f97316'; // Resaltado al tocar
              }

              return group.svgPoints.map((points, pIdx) => (
                <polygon
                  key={`${gIdx}-${pIdx}`}
                  points={points}
                  onClick={() => setSelectedMuscle(group.muscle)}
                  className="cursor-pointer transition-all duration-300 hover:opacity-85"
                  fill={fillColor}
                  stroke={isSelected ? '#ffffff' : '#18191c'}
                  strokeWidth={isSelected ? '0.8' : '0.4'}
                  strokeLinejoin="round"
                  filter={isSelected ? 'url(#muscleGlow)' : undefined}
                />
              ));
            })}
          </svg>
        </div>

        {/* Indicador de vista */}
        <span className="text-[10px] text-zinc-400 font-medium mt-1 z-10">
          {viewMode === 'anterior' ? 'Vista Anterior (Frente)' : 'Vista Posterior (Espalda)'} • Toca para inspeccionar
        </span>
      </div>

      {/* 3. Panel de Detalle al interactuar con cualquier músculo */}
      {selectedMuscle ? (
        <div className="p-3.5 bg-orange-50 dark:bg-orange-950/40 rounded-2xl border border-orange-200 dark:border-orange-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 dark:text-white text-sm">
                {MUSCLE_NAMES[selectedMuscle] || selectedMuscle}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                hitsByMuscle[selectedMuscle] > 0
                  ? 'bg-orange-500 text-black font-black'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}>
                {hitsByMuscle[selectedMuscle] > 0 ? 'Trabajado esta semana' : 'Listo / 100% Recuperado'}
              </span>
            </div>
            
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {exercisesByMuscle[selectedMuscle]?.length > 0
                ? `Estimulado por: ${exercisesByMuscle[selectedMuscle].join(', ')}`
                : 'No se registran impactos de fatiga en tu rutina actual.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMuscle(null)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-bold text-slate-600 dark:text-zinc-300 hover:text-slate-900"
          >
            Cerrar
          </button>
        </div>
      ) : (
        /* Leyenda Fitbod */
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2d3139] inline-block border border-zinc-600" /> Descansado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff725e] inline-block" /> Trabajado en rutina
            </span>
          </div>

          <span className="text-[11px] font-mono font-bold text-orange-600 dark:text-orange-400">
            {totalWorkedMuscles > 0 ? `${totalWorkedMuscles} grupos activos` : 'Cuerpo fresco'}
          </span>
        </div>
      )}

    </div>
  );
}
