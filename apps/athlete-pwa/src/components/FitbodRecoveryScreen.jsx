import React, { useState } from 'react';
import { RotateCw, Flame, Award, Dumbbell, ShieldCheck } from 'lucide-react';

// Mapeo anatómico HD Fitbod
const MUSCLE_DEFINITIONS = [
  { key: 'chest', label: 'Pectorales', defaultRec: 100, view: 'front' },
  { key: 'abs', label: 'Abdominales & Core', defaultRec: 100, view: 'front' },
  { key: 'biceps', label: 'Bíceps', defaultRec: 100, view: 'front' },
  { key: 'quads', label: 'Cuádriceps', defaultRec: 100, view: 'front' },
  { key: 'calves', label: 'Gemelos / Pantorrillas', defaultRec: 100, view: 'both' },
  { key: 'shoulders', label: 'Deltoides (Hombros)', defaultRec: 100, view: 'both' },
  { key: 'triceps', label: 'Tríceps', defaultRec: 100, view: 'back' },
  { key: 'back', label: 'Dorsales & Espalda', defaultRec: 100, view: 'back' },
  { key: 'traps', label: 'Trapecios', defaultRec: 100, view: 'back' },
  { key: 'glutes', label: 'Glúteos', defaultRec: 100, view: 'back' },
  { key: 'hamstrings', label: 'Femorales / Isquios', defaultRec: 100, view: 'back' },
];

export default function FitbodRecoveryScreen({ routines = {}, onStartWorkout }) {
  const [viewMode, setViewMode] = useState('front'); // 'front' | 'back'
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  // Calcular impacto muscular real según los ejercicios completados en la rutina activa
  const { recoveryMap, freshCount, fatiguedCount } = React.useMemo(() => {
    const hits = {};
    MUSCLE_DEFINITIONS.forEach(m => { hits[m.key] = 0; });

    Object.values(routines).forEach((dayRoutine) => {
      (dayRoutine.exercises || []).forEach((ex) => {
        const isHit = ex.completed || (ex.setsLog && ex.setsLog.some(s => s.completed));
        if (isHit) {
          const name = (ex.name || '').toLowerCase();
          const muscle = (ex.muscle_group || '').toLowerCase();

          if (muscle.includes('pecho') || name.includes('press') || name.includes('pecho')) hits.chest += 1;
          if (muscle.includes('abdomen') || muscle.includes('core') || name.includes('crunch')) hits.abs += 1;
          if (muscle.includes('bíceps') || name.includes('curl')) hits.biceps += 1;
          if (muscle.includes('tríceps') || name.includes('copa') || name.includes('fondos')) hits.triceps += 1;
          if (muscle.includes('pierna') || name.includes('sentadilla') || name.includes('prensa')) hits.quads += 1;
          if (muscle.includes('femoral') || name.includes('peso muerto') || name.includes('curl femoral')) hits.hamstrings += 1;
          if (muscle.includes('glúteo') || name.includes('hip thrust')) hits.glutes += 1;
          if (muscle.includes('pantorrilla') || muscle.includes('gemelo') || name.includes('elevación')) hits.calves += 1;
          if (muscle.includes('hombro') || name.includes('militar') || name.includes('lateral')) hits.shoulders += 1;
          if (muscle.includes('espalda') || name.includes('remo') || name.includes('jalón')) {
            hits.back += 1;
            hits.traps += 1;
          }
        }
      });
    });

    const map = {};
    let fresh = 0;
    let fatigued = 0;

    MUSCLE_DEFINITIONS.forEach((def) => {
      const fatigueHits = hits[def.key] || 0;
      // Cada ejercicio completado reduce frescura en 35% hasta min 20%
      const rec = Math.max(20, Math.min(100, def.defaultRec - (fatigueHits * 35)));
      const isFatigued = rec <= 70;
      if (isFatigued) fatigued += 1;
      else fresh += 1;

      map[def.key] = {
        ...def,
        fatigueHits,
        percentage: rec,
        isFatigued
      };
    });

    return { recoveryMap: map, freshCount: fresh, fatiguedCount: fatigued };
  }, [routines]);

  // Color de fibra muscular Fitbod (Salmón/Naranja para impactado, Gris anatómico para descansado)
  const getFill = (muscleKey) => {
    const isFatigued = recoveryMap[muscleKey]?.isFatigued;
    // Si está fatigado o trabajado: #ff725e (Salmón Fitbod exacto)
    if (isFatigued) return '#ff725e';
    // Si está descansado/fresco: Gris carbón suave según Dark o Light mode
    return 'currentColor';
  };

  const activeMuscleData = selectedMuscle ? recoveryMap[selectedMuscle] : null;

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-140px)] w-full max-w-md mx-auto py-2 px-4 relative select-none animate-in fade-in duration-300">
      
      {/* 1. MÉTRICAS SUPERIORES FITBOD (0 DÍAS / N MÚSCULOS FRESCOS) */}
      <div className="w-full flex items-center justify-between px-2 pt-1 text-center">
        {/* Izquierda: Días desde el último entreno */}
        <div className="flex flex-col items-center">
          <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
            0
          </span>
          <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 dark:text-zinc-500 mt-1 max-w-[110px] leading-tight">
            DAYS SINCE YOUR LAST WORKOUT
          </span>
        </div>

        {/* Derecha: Grupos musculares frescos */}
        <div className="flex flex-col items-center">
          <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
            {freshCount}
          </span>
          <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 dark:text-zinc-500 mt-1 max-w-[110px] leading-tight">
            FRESH MUSCLE GROUPS
          </span>
        </div>
      </div>

      {/* 2. SILUETA ANATÓMICA FITBOD CON PAQUETES MUSCULARES HD */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center my-2">
        
        {/* SVG Anatómico con iluminación / glow exterior */}
        <svg
          viewBox="0 0 320 540"
          className="w-full h-[400px] sm:h-[440px] max-w-[310px] drop-shadow-[0_0_15px_rgba(255,114,94,0.15)] transition-all duration-300"
        >
          <defs>
            <filter id="fitbodGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Silueta exterior / Resplandor tenue */}
          <g filter="url(#fitbodGlow)" className="text-slate-300 dark:text-zinc-700/60 transition-colors">
            {/* Contorno exterior del cuerpo */}
            <path
              d="M160 30 C172 30 180 42 180 58 C180 72 173 82 168 86 L175 96 L205 106 L245 150 L275 220 L278 275 L265 285 L255 240 L240 185 L225 210 L220 280 L220 370 L212 470 L214 505 L190 515 L182 460 L170 380 L160 300 L150 380 L138 460 L130 515 L106 505 L108 470 L100 370 L100 210 L85 185 L70 240 L60 285 L47 275 L50 220 L80 150 L120 106 L150 96 L155 86 C150 82 143 72 143 58 C143 42 150 30 160 30 Z"
              fill="#22252a"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
            />
          </g>

          {/* VISTA FRONTAL FITBOD */}
          {viewMode === 'front' ? (
            <g className="text-[#3a3f47]">
              {/* Cabeza / Cuello sombreado */}
              <ellipse cx="160" cy="58" rx="16" ry="22" fill="#1b1d22" stroke="#444953" strokeWidth="1" />
              <path d="M152 78 L168 78 L170 96 L150 96 Z" fill="#1b1d22" />

              {/* Trapecios y hombros */}
              <g onClick={() => setSelectedMuscle('shoulders')} className="cursor-pointer">
                <path d="M116 108 Q135 100 148 108 L142 135 Q120 142 108 130 Z" fill={getFill('shoulders')} stroke="#1b1d22" strokeWidth="1.5" />
                <path d="M204 108 Q185 100 172 108 L178 135 Q200 142 212 130 Z" fill={getFill('shoulders')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* PECTORALES (Separación anatómica izquierda y derecha) */}
              <g onClick={() => setSelectedMuscle('chest')} className="cursor-pointer">
                <path d="M118 132 Q158 128 158 165 Q124 175 114 152 Z" fill={getFill('chest')} stroke="#1b1d22" strokeWidth="1.5" />
                <path d="M202 132 Q162 128 162 165 Q196 175 206 152 Z" fill={getFill('chest')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* BÍCEPS */}
              <g onClick={() => setSelectedMuscle('biceps')} className="cursor-pointer">
                <ellipse cx="98" cy="170" rx="11" ry="22" fill={getFill('biceps')} stroke="#1b1d22" strokeWidth="1.5" />
                <ellipse cx="222" cy="170" rx="11" ry="22" fill={getFill('biceps')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* ABDOMINALES (Six-Pack simétrico y oblicuos) */}
              <g onClick={() => setSelectedMuscle('abs')} className="cursor-pointer">
                <path d="M142 172 L158 172 L158 192 L142 192 Z" fill={getFill('abs')} stroke="#1b1d22" strokeWidth="1.5" />
                <path d="M162 172 L178 172 L178 192 L162 192 Z" fill={getFill('abs')} stroke="#1b1d22" strokeWidth="1.5" />
                
                <path d="M142 196 L158 196 L158 218 L142 218 Z" fill={getFill('abs')} stroke="#1b1d22" strokeWidth="1.5" />
                <path d="M162 196 L178 196 L178 218 L162 218 Z" fill={getFill('abs')} stroke="#1b1d22" strokeWidth="1.5" />

                <path d="M144 222 L158 222 L158 248 L146 244 Z" fill={getFill('abs')} stroke="#1b1d22" strokeWidth="1.5" />
                <path d="M162 222 L176 222 L174 244 L162 248 Z" fill={getFill('abs')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* CUÁDRICEPS (Vasto interno, externo y recto femoral) */}
              <g onClick={() => setSelectedMuscle('quads')} className="cursor-pointer">
                {/* Cuádriceps Izquierdo */}
                <path d="M126 265 Q156 260 155 310 L152 360 Q130 365 120 310 Z" fill={getFill('quads')} stroke="#1b1d22" strokeWidth="1.5" />
                {/* Cuádriceps Derecho */}
                <path d="M194 265 Q164 260 165 310 L168 360 Q190 365 200 310 Z" fill={getFill('quads')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* PANTORRILLAS / GEMELOS */}
              <g onClick={() => setSelectedMuscle('calves')} className="cursor-pointer">
                <path d="M125 385 Q150 380 148 435 L144 475 Q125 470 122 430 Z" fill={getFill('calves')} stroke="#1b1d22" strokeWidth="1.5" />
                <path d="M195 385 Q170 380 172 435 L176 475 Q195 470 198 430 Z" fill={getFill('calves')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>
            </g>
          ) : (
            /* VISTA POSTERIOR / ESPALDA FITBOD */
            <g className="text-[#3a3f47]">
              {/* Nuca y cabeza posterior */}
              <ellipse cx="160" cy="58" rx="16" ry="22" fill="#1b1d22" stroke="#444953" strokeWidth="1" />

              {/* TRAPECIOS */}
              <g onClick={() => setSelectedMuscle('traps')} className="cursor-pointer">
                <path d="M136 96 Q160 114 184 96 L195 125 Q160 142 125 125 Z" fill={getFill('traps')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* DORSALES (Espalda V-Taper) */}
              <g onClick={() => setSelectedMuscle('back')} className="cursor-pointer">
                <path d="M124 130 Q158 145 158 205 L136 215 Q115 175 124 130 Z" fill={getFill('back')} stroke="#1b1d22" strokeWidth="1.5" />
                <path d="M196 130 Q162 145 162 205 L184 215 Q205 175 196 130 Z" fill={getFill('back')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* TRÍCEPS */}
              <g onClick={() => setSelectedMuscle('triceps')} className="cursor-pointer">
                <ellipse cx="96" cy="165" rx="10" ry="20" fill={getFill('triceps')} stroke="#1b1d22" strokeWidth="1.5" />
                <ellipse cx="224" cy="165" rx="10" ry="20" fill={getFill('triceps')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* GLÚTEOS */}
              <g onClick={() => setSelectedMuscle('glutes')} className="cursor-pointer">
                <ellipse cx="144" cy="272" rx="17" ry="22" fill={getFill('glutes')} stroke="#1b1d22" strokeWidth="1.5" />
                <ellipse cx="176" cy="272" rx="17" ry="22" fill={getFill('glutes')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* ISQUIOTIBIALES / FEMORALES */}
              <g onClick={() => setSelectedMuscle('hamstrings')} className="cursor-pointer">
                <path d="M127 302 Q154 298 152 355 L148 375 Q125 375 122 340 Z" fill={getFill('hamstrings')} stroke="#1b1d22" strokeWidth="1.5" />
                <path d="M193 302 Q166 298 168 355 L172 375 Q195 375 198 340 Z" fill={getFill('hamstrings')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>

              {/* GEMELOS POSTERIORES */}
              <g onClick={() => setSelectedMuscle('calves')} className="cursor-pointer">
                <ellipse cx="134" cy="425" rx="12" ry="26" fill={getFill('calves')} stroke="#1b1d22" strokeWidth="1.5" />
                <ellipse cx="186" cy="425" rx="12" ry="26" fill={getFill('calves')} stroke="#1b1d22" strokeWidth="1.5" />
              </g>
            </g>
          )}
        </svg>

        {/* BOTÓN INFERIOR IZQUIERDO FITBOD: ROTAR FRENTE / ESPALDA */}
        <button
          type="button"
          onClick={() => {
            setViewMode(prev => prev === 'front' ? 'back' : 'front');
            setSelectedMuscle(null);
          }}
          className="absolute bottom-2 left-2 p-3 rounded-full bg-white/10 hover:bg-white/20 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 backdrop-blur-md border border-white/20 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 shadow-md transition-all active:scale-95 flex items-center justify-center"
          title="Girar cuerpo (Frente / Espalda)"
        >
          <RotateCw className="w-5 h-5 transition-transform duration-500" />
        </button>

        {/* BOTÓN FLOTANTE INFERIOR DERECHO FITBOD: START WORKOUT */}
        <button
          type="button"
          onClick={onStartWorkout}
          className="absolute bottom-1 right-1 w-20 h-20 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-black flex flex-col items-center justify-center shadow-lg shadow-orange-500/30 border-2 border-white/20 transition-all hover:scale-105 active:scale-95 leading-tight text-center"
        >
          <span className="text-[10px] tracking-tight uppercase font-extrabold">START</span>
          <span className="text-[10px] tracking-tight uppercase font-extrabold">WORKOUT</span>
        </button>
      </div>

      {/* 3. CARD INFORMATIVA INFERIOR SI TOCA UN MÚSCULO */}
      {activeMuscleData && (
        <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 shadow-md flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              {activeMuscleData.label}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              {activeMuscleData.isFatigued ? 'Fatigado por ejercicios recientes' : 'Completamente fresco para entrenar'}
            </span>
          </div>

          <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg ${
            activeMuscleData.isFatigued
              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}>
            {activeMuscleData.percentage}% Frescura
          </span>
        </div>
      )}

    </div>
  );
}
