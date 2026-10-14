import React, { useState } from 'react';
import { Activity, Zap, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';

// Mapeo anatómico de grupos musculares
const MUSCLE_DEFINITIONS = [
  { key: 'chest', label: 'Pecho / Pectoral', defaultRec: 100, icon: '🛡️', view: 'front' },
  { key: 'back', label: 'Espalda / Dorsales', defaultRec: 100, icon: '🦅', view: 'back' },
  { key: 'shoulders', label: 'Hombros (Deltoides)', defaultRec: 100, icon: '⚡', view: 'both' },
  { key: 'legs', label: 'Piernas / Cuádriceps', defaultRec: 100, icon: '🦵', view: 'both' },
  { key: 'arms', label: 'Bíceps / Tríceps', defaultRec: 100, icon: '💪', view: 'both' },
  { key: 'core', label: 'Abdomen / Core', defaultRec: 100, icon: '🔥', view: 'front' },
];

// Componente interactivo de silueta anatómica SVG (Frente y Espalda)
function BodyAnatomySvg({ recoveryMap, viewMode = 'front', onSelectMuscle, selectedMuscle }) {
  // Función para obtener color de llenado según el porcentaje de frescura
  const getColor = (muscleKey) => {
    const rec = recoveryMap[muscleKey]?.percentage ?? 100;
    if (rec <= 45) return '#ef4444'; // Rojo (Fatigado / Alto Impacto)
    if (rec <= 75) return '#f59e0b'; // Amarillo / Ámbar (Recuperándose)
    return '#10b981'; // Esmeralda / Verde (Listo / Fresco)
  };

  const getOpacity = (muscleKey) => {
    const isSel = selectedMuscle === muscleKey;
    if (selectedMuscle && !isSel) return 0.35;
    return 0.85;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        viewBox="0 0 200 320"
        className="w-48 h-64 max-w-full drop-shadow-md select-none transition-all"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Silueta base del cuerpo (Gris tenue / Background) */}
        <g fill="currentColor" className="text-slate-200 dark:text-zinc-800/80 transition-colors">
          {/* Cabeza y cuello */}
          <ellipse cx="100" cy="32" rx="14" ry="18" />
          <path d="M94 48 L106 48 L108 58 L92 58 Z" />
          {/* Contorno de cuerpo humano estilizado */}
          {viewMode === 'front' ? (
            <path d="M68 62 Q100 55 132 62 L144 95 L148 150 L140 180 L132 155 L132 120 L125 155 L124 210 L126 270 L120 305 L108 305 L106 215 L100 170 L94 215 L92 305 L80 305 L74 270 L76 210 L75 155 L68 120 L68 155 L60 180 L52 150 L56 95 Z" opacity="0.3" />
          ) : (
            <path d="M68 62 Q100 55 132 62 L144 95 L148 150 L140 180 L132 155 L132 120 L125 155 L124 210 L126 270 L120 305 L108 305 L106 215 L100 170 L94 215 L92 305 L80 305 L74 270 L76 210 L75 155 L68 120 L68 155 L60 180 L52 150 L56 95 Z" opacity="0.3" />
          )}
        </g>

        {/* GRUPOS MUSCULARES CLAVE ACTIVOS CON HEATMAP FITBOD */}
        {viewMode === 'front' ? (
          /* VISTA FRONTAL */
          <g>
            {/* Hombros (Deltoides anteriores y laterales) */}
            <g
              onClick={() => onSelectMuscle('shoulders')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <path
                d="M62 64 Q70 60 76 68 Q68 84 60 84 Q56 74 62 64 Z"
                fill={getColor('shoulders')}
                fillOpacity={getOpacity('shoulders')}
                stroke={selectedMuscle === 'shoulders' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              <path
                d="M138 64 Q130 60 124 68 Q132 84 140 84 Q144 74 138 64 Z"
                fill={getColor('shoulders')}
                fillOpacity={getOpacity('shoulders')}
                stroke={selectedMuscle === 'shoulders' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
            </g>

            {/* Pecho / Pectorales */}
            <g
              onClick={() => onSelectMuscle('chest')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              {/* Pectoral Izquierdo */}
              <path
                d="M75 70 Q98 68 98 92 Q78 96 72 82 Z"
                fill={getColor('chest')}
                fillOpacity={getOpacity('chest')}
                stroke={selectedMuscle === 'chest' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              {/* Pectoral Derecho */}
              <path
                d="M125 70 Q102 68 102 92 Q122 96 128 82 Z"
                fill={getColor('chest')}
                fillOpacity={getOpacity('chest')}
                stroke={selectedMuscle === 'chest' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
            </g>

            {/* Abdomen / Core */}
            <g
              onClick={() => onSelectMuscle('core')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              {/* Recto Abdominal y oblicuos */}
              <rect
                x="88"
                y="98"
                width="10"
                height="12"
                rx="2"
                fill={getColor('core')}
                fillOpacity={getOpacity('core')}
              />
              <rect
                x="102"
                y="98"
                width="10"
                height="12"
                rx="2"
                fill={getColor('core')}
                fillOpacity={getOpacity('core')}
              />
              <rect
                x="88"
                y="113"
                width="10"
                height="12"
                rx="2"
                fill={getColor('core')}
                fillOpacity={getOpacity('core')}
              />
              <rect
                x="102"
                y="113"
                width="10"
                height="12"
                rx="2"
                fill={getColor('core')}
                fillOpacity={getOpacity('core')}
              />
              <path
                d="M87 130 Q100 135 113 130 L110 144 Q100 148 90 144 Z"
                fill={getColor('core')}
                fillOpacity={getOpacity('core')}
                stroke={selectedMuscle === 'core' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
            </g>

            {/* Brazos (Bíceps y antebrazos) */}
            <g
              onClick={() => onSelectMuscle('arms')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <ellipse
                cx="57"
                cy="98"
                rx="6"
                ry="14"
                fill={getColor('arms')}
                fillOpacity={getOpacity('arms')}
                stroke={selectedMuscle === 'arms' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              <ellipse
                cx="143"
                cy="98"
                rx="6"
                ry="14"
                fill={getColor('arms')}
                fillOpacity={getOpacity('arms')}
                stroke={selectedMuscle === 'arms' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              {/* Antebrazos */}
              <path
                d="M51 116 L61 116 L58 144 L48 144 Z"
                fill={getColor('arms')}
                fillOpacity={getOpacity('arms')}
              />
              <path
                d="M149 116 L139 116 L142 144 L152 144 Z"
                fill={getColor('arms')}
                fillOpacity={getOpacity('arms')}
              />
            </g>

            {/* Piernas (Cuádriceps y tibiales) */}
            <g
              onClick={() => onSelectMuscle('legs')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              {/* Cuádriceps Izq */}
              <path
                d="M80 155 Q98 152 98 178 L96 220 Q84 220 78 185 Z"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
                stroke={selectedMuscle === 'legs' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              {/* Cuádriceps Der */}
              <path
                d="M120 155 Q102 152 102 178 L104 220 Q116 220 122 185 Z"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
                stroke={selectedMuscle === 'legs' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              {/* Pantorrillas / Espinillas */}
              <path
                d="M80 232 L94 232 L92 284 L82 284 Z"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
              />
              <path
                d="M120 232 L106 232 L108 284 L118 284 Z"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
              />
            </g>
          </g>
        ) : (
          /* VISTA POSTERIOR / ESPALDA */
          <g>
            {/* Trapecios y Espalda Alta */}
            <g
              onClick={() => onSelectMuscle('back')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <path
                d="M84 56 Q100 66 116 56 L124 74 Q100 86 76 74 Z"
                fill={getColor('back')}
                fillOpacity={getOpacity('back')}
              />
              {/* Dorsales anchos */}
              <path
                d="M74 76 Q98 88 98 126 L80 136 Q70 105 74 76 Z"
                fill={getColor('back')}
                fillOpacity={getOpacity('back')}
                stroke={selectedMuscle === 'back' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              <path
                d="M126 76 Q102 88 102 126 L120 136 Q130 105 126 76 Z"
                fill={getColor('back')}
                fillOpacity={getOpacity('back')}
                stroke={selectedMuscle === 'back' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              {/* Espalda baja / Lumbar */}
              <path
                d="M85 128 Q100 126 115 128 L112 146 Q100 148 88 146 Z"
                fill={getColor('back')}
                fillOpacity={getOpacity('back')}
              />
            </g>

            {/* Deltoides posteriores */}
            <g
              onClick={() => onSelectMuscle('shoulders')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <path
                d="M60 66 Q72 64 74 75 Q65 85 58 78 Z"
                fill={getColor('shoulders')}
                fillOpacity={getOpacity('shoulders')}
                stroke={selectedMuscle === 'shoulders' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              <path
                d="M140 66 Q128 64 126 75 Q135 85 142 78 Z"
                fill={getColor('shoulders')}
                fillOpacity={getOpacity('shoulders')}
                stroke={selectedMuscle === 'shoulders' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
            </g>

            {/* Tríceps posteriores */}
            <g
              onClick={() => onSelectMuscle('arms')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <ellipse
                cx="56"
                cy="96"
                rx="5"
                ry="13"
                fill={getColor('arms')}
                fillOpacity={getOpacity('arms')}
                stroke={selectedMuscle === 'arms' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              <ellipse
                cx="144"
                cy="96"
                rx="5"
                ry="13"
                fill={getColor('arms')}
                fillOpacity={getOpacity('arms')}
                stroke={selectedMuscle === 'arms' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
            </g>

            {/* Glúteos e Isquiotibiales (Piernas posteriores) */}
            <g
              onClick={() => onSelectMuscle('legs')}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              {/* Glúteos */}
              <ellipse
                cx="89"
                cy="162"
                rx="11"
                ry="12"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
                stroke={selectedMuscle === 'legs' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              <ellipse
                cx="111"
                cy="162"
                rx="11"
                ry="12"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
                stroke={selectedMuscle === 'legs' ? '#fff' : 'none'}
                strokeWidth="1.5"
              />
              {/* Femorales / Isquios */}
              <path
                d="M79 178 L97 178 L95 220 L81 220 Z"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
              />
              <path
                d="M121 178 L103 178 L105 220 L119 220 Z"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
              />
              {/* Gemelos / Pantorrillas */}
              <ellipse
                cx="88"
                cy="252"
                rx="8"
                ry="18"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
              />
              <ellipse
                cx="112"
                cy="252"
                rx="8"
                ry="18"
                fill={getColor('legs')}
                fillOpacity={getOpacity('legs')}
              />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function MuscleRecoveryMap({ routines = {}, activeDay = 'Lun' }) {
  const [viewMode, setViewMode] = useState('front'); // 'front' | 'back'
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  // Calcular frescura de los músculos basada en los ejercicios completados en la semana
  const { recoveryState, recoveryMap } = React.useMemo(() => {
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

    const map = {};
    const list = MUSCLE_DEFINITIONS.map((def) => {
      const fatigueHits = counts[def.key] || 0;
      // Cada ejercicio completado reduce la frescura en un 30% hasta un mínimo del 25%
      const calculatedRec = Math.max(25, Math.min(100, def.defaultRec - (fatigueHits * 30)));
      
      let statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
      let barColor = 'bg-emerald-500';
      let hexColor = '#10b981';
      let stateLabel = 'Listo para entrenar';

      if (calculatedRec <= 45) {
        statusColor = 'text-red-500 bg-red-500/10 border-red-500/30';
        barColor = 'bg-red-500';
        hexColor = '#ef4444';
        stateLabel = 'Fatigado • Descanso';
      } else if (calculatedRec <= 75) {
        statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        barColor = 'bg-amber-500';
        hexColor = '#f59e0b';
        stateLabel = 'Recuperándose';
      }

      const item = {
        ...def,
        fatigueHits,
        percentage: calculatedRec,
        statusColor,
        barColor,
        hexColor,
        stateLabel
      };
      map[def.key] = item;
      return item;
    });

    return { recoveryState: list, recoveryMap: map };
  }, [routines]);

  const activeSelected = selectedMuscle ? recoveryMap[selectedMuscle] : null;

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-4 transition-colors">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 border border-orange-200/60 dark:border-orange-500/20">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Impacto Anatómico & HeatMap</span>
              <span className="text-[10px] bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-black border border-orange-200/60 dark:border-orange-500/30">
                Fitbod 3D
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              Zonas corporales impactadas por tus ejercicios
            </p>
          </div>
        </div>

        {/* Selector Frente / Espalda */}
        <div className="flex bg-slate-100 dark:bg-zinc-800/90 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => { setViewMode('front'); setSelectedMuscle(null); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
              viewMode === 'front'
                ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => { setViewMode('back'); setSelectedMuscle(null); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
              viewMode === 'back'
                ? 'bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Espalda
          </button>
        </div>
      </div>

      {/* Layout Principal: Silueta Interactiva + Detalle de Músculo */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50/70 dark:bg-zinc-950/50 rounded-2xl p-3 border border-slate-200/60 dark:border-zinc-800/70">
        {/* Gráfico Anatómico SVG */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <BodyAnatomySvg
            recoveryMap={recoveryMap}
            viewMode={viewMode}
            onSelectMuscle={(key) => setSelectedMuscle(prev => prev === key ? null : key)}
            selectedMuscle={selectedMuscle}
          />
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-1">
            Toca una zona corporal para ver su estado
          </span>
        </div>

        {/* Panel Lateral: Detalle del músculo tocado o leyenda general */}
        <div className="md:col-span-7 space-y-2.5">
          {activeSelected ? (
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{activeSelected.icon}</span>
                  <span>{activeSelected.label}</span>
                </span>
                <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-lg border ${activeSelected.statusColor}`}>
                  {activeSelected.percentage}% Frescura
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${activeSelected.barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${activeSelected.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-500 dark:text-zinc-400">
                  Impactos en rutina: <strong className="text-slate-800 dark:text-zinc-200">{activeSelected.fatigueHits} ejerc.</strong>
                </span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {activeSelected.stateLabel}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white/70 dark:bg-zinc-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center">
              <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Semáforo de Fatiga Fitbod
              </p>
              <div className="flex items-center justify-center gap-3 mt-2 text-[10px] font-medium">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Listo (100%)
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> En Recuperación
                </span>
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Fatigado
                </span>
              </div>
            </div>
          )}

          {/* Mini Lista rápida de todos los grupos */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {recoveryState.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMuscle(m.key)}
                className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between gap-1 text-xs ${
                  selectedMuscle === m.key
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-600'
                    : 'bg-white dark:bg-zinc-900/80 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300'
                }`}
              >
                <div className="truncate">
                  <span className="font-bold text-[11px] text-slate-800 dark:text-zinc-200 block truncate">
                    {m.icon} {m.label.split(' / ')[0]}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono">
                    {m.percentage}%
                  </span>
                </div>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: m.hexColor }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
