import React from 'react';
import { RefreshCw, Dumbbell, X, Check, Sparkles } from 'lucide-react';

// Catálogo de ejercicios alternativos de la base de datos de Team HD
const EXERCISE_ALTERNATIVES = [
  {
    id: '2df755fa-6e9c-429b-9c5d-27ceeff5da0d',
    name: 'Press de Hombro Alterno en Polea',
    muscle_group: 'Hombros (Deltoides)',
    equipment: 'Poleas / Cables',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Cable_Shoulder_Press/0.jpg'
  },
  {
    id: 'd20779e9-d870-44c4-9229-fbf36cbc98d5',
    name: 'Elevación Lateral Alterna de Deltoides',
    muscle_group: 'Hombros (Deltoides)',
    equipment: 'Mancuernas',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Deltoid_Raise/0.jpg'
  },
  {
    id: '79610686-1e1a-492b-a211-505c2bcd094b',
    name: 'Press Militar Alternado con Kettlebell',
    muscle_group: 'Hombros (Deltoides)',
    equipment: 'Kettlebells / Mancuernas',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Kettlebell_Press/0.jpg'
  },
  {
    id: 'a32c8dcb-1e40-4766-a59e-8f6cbb1ed9e9',
    name: 'Press en Suelo Alterno con Mancuernas',
    muscle_group: 'Pecho / Pectoral',
    equipment: 'Mancuernas y Suelo',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Floor_Press/0.jpg'
  },
  {
    id: '845501ca-a2cb-4e5a-b306-c23dad02b1e1',
    name: 'Curl Martillo Alternado con Mancuernas',
    muscle_group: 'Bíceps',
    equipment: 'Mancuernas',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Hammer_Curl/0.jpg'
  },
  {
    id: '57b85424-f474-409a-a35a-43c8a6803ea7',
    name: 'Curl Alternado en Banco Inclinado',
    muscle_group: 'Bíceps',
    equipment: 'Mancuernas y Banco',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg'
  },
  {
    id: '563a9ae9-c06e-43b7-b0ba-0ac4ea1093e2',
    name: 'Remo Alternado con Kettlebell',
    muscle_group: 'Espalda Media',
    equipment: 'Kettlebells / Mancuerna',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Kettlebell_Row/0.jpg'
  },
  {
    id: '970bb869-0eeb-4a1e-8625-b1b8be2706ff',
    name: 'Remo Renegado Alternado con Mancuernas',
    muscle_group: 'Espalda Media',
    equipment: 'Mancuernas',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternating_Renegade_Row/0.jpg'
  },
  {
    id: '86f1246b-09b9-47ba-abd3-212cb677dc16',
    name: 'Crunch Abdominal en Máquina',
    muscle_group: 'Abdomen / Core',
    equipment: 'Máquina Selectorizada',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg'
  },
  {
    id: '2997c1da-fb2e-4723-a62c-25c59039387e',
    name: 'Rueda Abdominal (Ab Wheel)',
    muscle_group: 'Abdomen / Core',
    equipment: 'Rueda Abdominal / Tapete',
    video_url: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg'
  }
];

export default function ExerciseSwapModal({ isOpen, onClose, currentExercise, onSelectAlternative }) {
  if (!isOpen || !currentExercise) return null;

  // Filtrar ejercicios que trabajen el mismo grupo muscular o similares
  const currentMuscle = (currentExercise.muscle_group || '').toLowerCase();
  const currentName = (currentExercise.name || '').toLowerCase();

  const alternatives = EXERCISE_ALTERNATIVES.filter((ex) => {
    if (ex.name === currentExercise.name) return false;
    const m = ex.muscle_group.toLowerCase();
    if (currentMuscle && (m.includes(currentMuscle) || currentMuscle.includes(m))) return true;
    if (currentName.includes('hombro') && m.includes('hombro')) return true;
    if (currentName.includes('curl') && m.includes('bíceps')) return true;
    if (currentName.includes('remo') && m.includes('espalda')) return true;
    if (currentName.includes('ab') && m.includes('abdomen')) return true;
    return true; // mostrar opciones relevantes
  }).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              <RefreshCw className="w-4 h-4 animate-spin-reverse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>¿Máquina u objeto ocupado?</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Sustitución inteligente Fitbod con mismo estímulo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ejercicio Actual Prescrito */}
        <div className="p-3.5 bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
              Reemplazando ejercicio actual:
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {currentExercise.name}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {currentExercise.series}
          </span>
        </div>

        {/* Lista de Alternativas */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
            Alternativas biomécanicas recomendadas:
          </span>

          {alternatives.map((alt) => (
            <div
              key={alt.id}
              onClick={() => {
                onSelectAlternative(alt);
                onClose();
              }}
              className="p-3 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500/60 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-101 active:scale-99 group shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-zinc-700/50">
                  <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {alt.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{alt.muscle_group}</span>
                    <span>•</span>
                    <span className="truncate">{alt.equipment}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all"
              >
                <span>Elegir</span>
                <Check className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
