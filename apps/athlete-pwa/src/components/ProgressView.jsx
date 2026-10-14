import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Droplets, 
  Footprints, 
  Moon, 
  Flame, 
  Award, 
  ChevronRight, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Dumbbell, 
  Calendar,
  Sparkles,
  BarChart2
} from 'lucide-react';

export default function ProgressView({ athlete, routines = {} }) {
  // 1. Estados de hábitos diarios (persistidos en localStorage por día)
  const todayKey = new Date().toISOString().split('T')[0];
  const storageKey = `athlete_habits_${athlete?.id || 'guest'}_${todayKey}`;

  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      waterMl: 1500,
      waterTargetMl: 3000,
      steps: 6500,
      stepsTarget: 10000,
      sleepHours: 7.5,
      sleepTarget: 8.0,
      weightKg: athlete?.weight || 90,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(habits));
    } catch (e) {}
  }, [habits, storageKey]);

  // Actualizadores rápidos de hábitos
  const addWater = (amount) => {
    setHabits(prev => ({ ...prev, waterMl: Math.max(0, prev.waterMl + amount) }));
  };

  const addSteps = (amount) => {
    setHabits(prev => ({ ...prev, steps: Math.max(0, prev.steps + amount) }));
  };

  const setSleep = (hours) => {
    setHabits(prev => ({ ...prev, sleepHours: Math.max(0, Math.min(14, hours)) }));
  };

  // 2. Extraer ejercicios y su 1RM / Tonelaje de la rutina activa
  const exercisesProgress = React.useMemo(() => {
    const list = [];
    Object.entries(routines).forEach(([day, routineDay]) => {
      (routineDay.exercises || []).forEach(ex => {
        // Calcular 1RM estimado (Epley)
        const loggedWeight = ex.loggedWeight || ex.prescribedWeight || 0;
        const bestReps = (ex.setsLog && ex.setsLog.find(s => s.completed)?.actualReps) || 10;
        const estimated1RM = ex.estimated1RM || (loggedWeight > 0 ? Math.round(loggedWeight * (1 + bestReps / 30)) : 0);
        
        // Tonelaje acumulado (Peso x Reps de series completadas)
        let volumeKg = 0;
        if (ex.setsLog) {
          ex.setsLog.forEach(s => {
            if (s.completed) volumeKg += (s.actualWeight || 0) * (s.actualReps || 0);
          });
        }

        if (loggedWeight > 0 || ex.completed) {
          list.push({
            id: ex.id,
            name: ex.name,
            day,
            loggedWeight,
            estimated1RM,
            volumeKg,
            targetReps: ex.targetReps,
            targetSets: ex.targetSets,
            completed: ex.completed,
            muscleGroup: ex.muscle_group || 'General'
          });
        }
      });
    });
    return list;
  }, [routines]);

  // Tonelaje total semanal acumulado
  const totalWeeklyVolumeKg = exercisesProgress.reduce((acc, curr) => acc + curr.volumeKg, 0);

  // Porcentaje de cumplimiento de hábitos
  const waterPercent = Math.min(100, Math.round((habits.waterMl / habits.waterTargetMl) * 100));
  const stepsPercent = Math.min(100, Math.round((habits.steps / habits.stepsTarget) * 100));
  const sleepPercent = Math.min(100, Math.round((habits.sleepHours / habits.sleepTarget) * 100));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Banner Superior de Progreso & Sobrecarga */}
      <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl text-white shadow-md shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Rendimiento & Hábitos
            </span>
            <h3 className="text-base font-black tracking-tight">Centro de Progreso</h3>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Métricas Rápidas Semanales */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-black/20 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-emerald-100 font-bold block uppercase tracking-wider">
              Volumen Levantado
            </span>
            <span className="text-lg font-black font-mono">
              {totalWeeklyVolumeKg > 0 ? `${totalWeeklyVolumeKg.toLocaleString()} kg` : '-- kg'}
            </span>
            <span className="text-[9px] text-emerald-200 block mt-0.5">
              Acumulado de series completadas
            </span>
          </div>

          <div className="bg-black/20 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-emerald-100 font-bold block uppercase tracking-wider">
              Peso Corporal
            </span>
            <span className="text-lg font-black font-mono">
              {athlete?.weight ? `${athlete.weight} kg` : '90 kg'}
            </span>
            <span className="text-[9px] text-emerald-200 block mt-0.5">
              Meta: {athlete?.goal || 'Definición'}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: HÁBITOS DIARIOS (Agua, Pasos, Sueño) */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-4 shadow-2xs space-y-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Hábitos Diarios Clave</span>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">
                Hoy
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
              El 80% de tus resultados dependen de tu recuperación
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            {new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* 1. AGUA */}
        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200/70 dark:border-blue-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500 text-white shadow-xs">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Hidratación
                </span>
                <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300 font-bold">
                  {(habits.waterMl / 1000).toFixed(1)}L / {(habits.waterTargetMl / 1000).toFixed(1)}L ({waterPercent}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => addWater(-250)}
                className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => addWater(250)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>+250ml</span>
              </button>
            </div>
          </div>

          <div className="w-full bg-blue-200/60 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>

        {/* 2. PASOS DIARIOS */}
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Pasos Diarios (NEAT)
                </span>
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-bold">
                  {habits.steps.toLocaleString()} / {habits.stepsTarget.toLocaleString()} ({stepsPercent}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => addSteps(-500)}
                className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => addSteps(1000)}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>+1k</span>
              </button>
            </div>
          </div>

          <div className="w-full bg-amber-200/60 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stepsPercent}%` }}
            />
          </div>
        </div>

        {/* 3. SUEÑO Y DESCANSO */}
        <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Horas de Sueño
                </span>
                <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-bold">
                  {habits.sleepHours}h dormidas / Meta: {habits.sleepTarget}h ({sleepPercent}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSleep(habits.sleepHours - 0.5)}
                className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs hover:bg-slate-100"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => setSleep(habits.sleepHours + 0.5)}
                className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs hover:bg-indigo-500 shadow-xs"
              >
                +0.5
              </button>
            </div>
          </div>

          <div className="w-full bg-indigo-200/60 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${sleepPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ESTIMACIÓN DE 1RM & SOBRECARGA PROGRESIVA (Fitbod / Hevy) */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-4 shadow-2xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Récords de Fuerza & 1RM Estimado</span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
              Cálculo de fuerza máxima (Epley) derivado de tus series reales
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {exercisesProgress.length} ejercicios
          </span>
        </div>

        {exercisesProgress.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1">
            <Dumbbell className="w-6 h-6 mx-auto text-slate-400 dark:text-zinc-600" />
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Aún no has registrado series hoy
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Ve a la pestaña de "Entreno" y marca tus series completadas para ver aquí tus marcas de fuerza y récords.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {exercisesProgress.slice(0, 5).map((ex, i) => (
              <div 
                key={ex.id || i}
                className="p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {ex.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium">
                      {ex.day}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                    {ex.muscleGroup} • Peso: {ex.loggedWeight} kg
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg inline-block">
                    1RM: {ex.estimated1RM} kg
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 block mt-0.5">
                    Vol: {ex.volumeKg} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
