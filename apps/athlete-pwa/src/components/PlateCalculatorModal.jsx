import React from 'react';
import { Calculator, X, Dumbbell, Info } from 'lucide-react';

// Discos estándar de gimnasio en kg
const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export function calculatePlates(targetWeightKg, barWeightKg = 20) {
  if (targetWeightKg <= barWeightKg) {
    return {
      barWeight: barWeightKg,
      perSideWeight: 0,
      platesPerSide: [],
      remainder: 0,
    };
  }

  const weightToDistribute = targetWeightKg - barWeightKg;
  let weightPerSide = weightToDistribute / 2;
  const platesPerSide = [];

  for (const plate of AVAILABLE_PLATES) {
    while (weightPerSide >= plate) {
      platesPerSide.push(plate);
      weightPerSide -= plate;
    }
  }

  return {
    barWeight: barWeightKg,
    perSideWeight: (targetWeightKg - barWeightKg) / 2,
    platesPerSide,
    remainder: Math.round(weightPerSide * 2 * 10) / 10, // peso no alcanzable con discos estándar
  };
}

export default function PlateCalculatorModal({ isOpen, onClose, targetWeightKg = 60, exerciseName = 'Ejercicio con barra' }) {
  const [barWeight, setBarWeight] = React.useState(20); // 20kg barra olímpica estándar, 15kg olímpica chica o 10kg EZ
  const [customWeight, setCustomWeight] = React.useState(targetWeightKg);

  React.useEffect(() => {
    setCustomWeight(targetWeightKg);
  }, [targetWeightKg]);

  if (!isOpen) return null;

  const result = calculatePlates(customWeight, barWeight);

  // Colores visuales clásicos de discos de levantamiento
  const getPlateBadge = (plate) => {
    switch (plate) {
      case 25:
        return 'bg-red-600 text-white border-red-700 shadow-red-500/20';
      case 20:
        return 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20';
      case 15:
        return 'bg-amber-500 text-black border-amber-600 shadow-amber-500/20';
      case 10:
        return 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-500/20';
      case 5:
        return 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-600';
      case 2.5:
        return 'bg-zinc-700 text-white border-zinc-600';
      default:
        return 'bg-zinc-400 text-black border-zinc-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Calculadora de Discos Fitbod
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[220px]">
                {exerciseName}
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

        {/* Peso meta y selector de barra */}
        <div className="p-4 space-y-4">
          <div className="bg-slate-50 dark:bg-zinc-950/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block">
                Peso Total Objetivo
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <input
                  type="number"
                  step="2.5"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
                  className="text-2xl font-black font-mono bg-transparent w-24 text-slate-900 dark:text-white focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-400 font-mono">kg</span>
              </div>
            </div>

            {/* Selector de Barra */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 block mb-1">
                Tipo de Barra
              </span>
              <div className="inline-flex rounded-xl p-0.5 bg-slate-200/70 dark:bg-zinc-800 border border-slate-300/60 dark:border-zinc-700">
                <button
                  onClick={() => setBarWeight(20)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${barWeight === 20 ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-zinc-400'}`}
                >
                  20kg (Olímpica)
                </button>
                <button
                  onClick={() => setBarWeight(15)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${barWeight === 15 ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-zinc-400'}`}
                >
                  15kg
                </button>
                <button
                  onClick={() => setBarWeight(10)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${barWeight === 10 ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-zinc-400'}`}
                >
                  10kg (EZ)
                </button>
              </div>
            </div>
          </div>

          {/* Gráfico visual de la barra con los discos */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[140px] space-y-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Distribución por cada lado: <strong className="text-emerald-400">{result.perSideWeight} kg / lado</strong>
            </span>

            {/* Representación visual de barra y discos */}
            <div className="flex items-center justify-center w-full overflow-x-auto py-2">
              {/* Lado izquierdo */}
              <div className="flex items-center gap-1 flex-row-reverse">
                {result.platesPerSide.map((plate, idx) => (
                  <div
                    key={`left-${idx}`}
                    className={`h-16 w-3 sm:w-4 rounded-sm border flex items-center justify-center font-mono font-black text-[9px] shadow-sm ${getPlateBadge(plate)}`}
                    title={`${plate} kg`}
                  />
                ))}
              </div>

              {/* Centro de la barra */}
              <div className="h-3 w-16 bg-zinc-400 border-y border-zinc-300 relative flex items-center justify-center">
                <span className="text-[8px] font-black text-black bg-zinc-300 px-1 rounded-xs">
                  {barWeight}kg
                </span>
              </div>

              {/* Lado derecho */}
              <div className="flex items-center gap-1">
                {result.platesPerSide.map((plate, idx) => (
                  <div
                    key={`right-${idx}`}
                    className={`h-16 w-3 sm:w-4 rounded-sm border flex items-center justify-center font-mono font-black text-[9px] shadow-sm ${getPlateBadge(plate)}`}
                    title={`${plate} kg`}
                  />
                ))}
              </div>
            </div>

            {/* Lista textual de discos para cargar sin equivocarse */}
            <div className="text-center pt-1">
              {result.platesPerSide.length > 0 ? (
                <p className="text-xs font-bold text-zinc-200">
                  Carga por lado:{' '}
                  <span className="text-emerald-400">
                    {result.platesPerSide.map((p) => `${p}kg`).join(' + ')}
                  </span>
                </p>
              ) : (
                <p className="text-xs font-bold text-zinc-400">
                  Solo usa la barra sola sin discos ({barWeight} kg)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
