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
  BarChart2,
  Zap,
  ArrowUpRight
} from 'lucide-react';

export default function ProgressView({ athlete, routines = {} }) {
  const todayKey = new Date().toISOString().split('T')[0];
  const storageKey = `athlete_habits_${athlete?.id || 'guest'}_${todayKey}`;

  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      calories: 540,
      caloriesTarget: 750,
      steps: 6420,
      stepsTarget: 10000,
      sleepHours: 7.2,
      sleepTarget: 8.0,
      waterMl: 2250,
      waterTargetMl: 3000,
      weightKg: athlete?.weight || 90,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(habits));
    } catch (e) {}
  }, [habits, storageKey]);

  // Modificadores rápidos
  const addWater = (amount) => setHabits(prev => ({ ...prev, waterMl: Math.max(0, prev.waterMl + amount) }));
  const addSteps = (amount) => setHabits(prev => ({ ...prev, steps: Math.max(0, prev.steps + amount) }));
  const addCalories = (amount) => setHabits(prev => ({ ...prev, calories: Math.max(0, prev.calories + amount) }));
  const addSleep = (amount) => setHabits(prev => ({ ...prev, sleepHours: Math.max(0, Math.min(14, +(prev.sleepHours + amount).toFixed(1))) }));

  // Porcentajes de progreso
  const calPercent = Math.min(100, Math.round((habits.calories / habits.caloriesTarget) * 100));
  const stepsPercent = Math.min(100, Math.round((habits.steps / habits.stepsTarget) * 100));
  const sleepPercent = Math.min(100, Math.round((habits.sleepHours / habits.sleepTarget) * 100));
  const waterPercent = Math.min(100, Math.round((habits.waterMl / habits.waterTargetMl) * 100));

  // Datos de fuerza por ejercicio
  const exercisesProgress = React.useMemo(() => {
    const list = [];
    Object.entries(routines).forEach(([day, routineDay]) => {
      (routineDay.exercises || []).forEach(ex => {
        const loggedWeight = ex.loggedWeight || ex.prescribedWeight || 0;
        const bestReps = (ex.setsLog && ex.setsLog.find(s => s.completed)?.actualReps) || 10;
        const estimated1RM = ex.estimated1RM || (loggedWeight > 0 ? Math.round(loggedWeight * (1 + bestReps / 30)) : 0);
        
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
            muscleGroup: ex.muscle_group || 'General'
          });
        }
      });
    });
    return list;
  }, [routines]);

  // Datos mock / calculados para el Workout Graph de la semana (L, M, X, J, V, S, D)
  const weeklyWorkoutData = [
    { day: 'Lun', intensity: 85, label: 'Push' },
    { day: 'Mar', intensity: 90, label: 'Pull' },
    { day: 'Mié', intensity: 65, label: 'Legs' },
    { day: 'Jue', intensity: 40, label: 'Cardio' },
    { day: 'Vie', intensity: 95, label: 'Upper' },
    { day: 'Sáb', intensity: 70, label: 'Lower' },
    { day: 'Dom', intensity: 20, label: 'Descanso' }
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* 1. SECCIÓN HEADER: TODAY'S RECORD (ESTILO FIT-TREK MINIMALISTA PREMIUM) */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Today's Record
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
            Métricas biométricas y recuperación
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-500/30">
          <Calendar className="w-3.5 h-3.5" />
          <span>Hoy</span>
        </div>
      </div>

      {/* 2. GRID 4 TARJETAS CIRCULARES (ESTILO EXACTO FIT-TREK SCREEN) */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* CARD 1: CALORÍAS */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
            {/* Indicador Circular de Progreso */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-orange-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${calPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[9px] font-black font-mono text-slate-700 dark:text-zinc-300">
                {calPercent}%
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Calorías Activas
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {habits.calories}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">/ {habits.caloriesTarget} kcal</span>
            </div>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={() => addCalories(-50)}
              className="flex-1 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 text-xs font-bold transition-all"
            >
              -50
            </button>
            <button
              onClick={() => addCalories(100)}
              className="flex-1 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              +100
            </button>
          </div>
        </div>

        {/* CARD 2: PASOS */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center font-bold">
              <Footprints className="w-5 h-5" />
            </div>
            {/* Indicador Circular */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${stepsPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[9px] font-black font-mono text-slate-700 dark:text-zinc-300">
                {stepsPercent}%
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Pasos Diarios
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {habits.steps.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">/ 10k</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={() => addSteps(-500)}
              className="flex-1 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 text-xs font-bold transition-all"
            >
              -500
            </button>
            <button
              onClick={() => addSteps(1000)}
              className="flex-1 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              +1,000
            </button>
          </div>
        </div>

        {/* CARD 3: SUEÑO */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center font-bold">
              <Moon className="w-5 h-5 fill-indigo-500/20" />
            </div>
            {/* Indicador Circular */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${sleepPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[9px] font-black font-mono text-slate-700 dark:text-zinc-300">
                {sleepPercent}%
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Horas de Sueño
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {habits.sleepHours}h
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">/ {habits.sleepTarget}h</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={() => addSleep(-0.5)}
              className="flex-1 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 text-xs font-bold transition-all"
            >
              -0.5h
            </button>
            <button
              onClick={() => addSleep(0.5)}
              className="flex-1 py-1 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              +0.5h
            </button>
          </div>
        </div>

        {/* CARD 4: AGUA */}
        <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-500 flex items-center justify-center font-bold">
              <Droplets className="w-5 h-5 fill-cyan-500/20" />
            </div>
            {/* Indicador Circular */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${waterPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[9px] font-black font-mono text-slate-700 dark:text-zinc-300">
                {waterPercent}%
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Agua Consumida
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {(habits.waterMl / 1000).toFixed(1)}L
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-bold">/ 3.0L</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={() => addWater(-250)}
              className="flex-1 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 text-xs font-bold transition-all"
            >
              -250
            </button>
            <button
              onClick={() => addWater(250)}
              className="flex-1 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-xs"
            >
              +250ml
            </button>
          </div>
        </div>

      </div>

      {/* 3. WORKOUT GRAPH (GRÁFICA SEMANAL ESTILO FIT-TREK SCREEN) */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-orange-500" />
              <span>Workout Graph</span>
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              Intensidad y consistencia semanal de entrenamientos
            </p>
          </div>
          <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-lg border border-orange-200/60 dark:border-orange-500/30">
            Esta Semana
          </span>
        </div>

        {/* Barras Semanales Verticales */}
        <div className="pt-4 pb-2 px-2 flex items-end justify-between gap-2 h-44">
          {weeklyWorkoutData.map((item, idx) => {
            const isToday = item.day === 'Mié'; // Ejemplo dinámico
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end gap-2 group cursor-pointer">
                {/* Porcentaje tooltip en hover */}
                <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-500 group-hover:text-orange-500 transition-colors">
                  {item.intensity}%
                </span>

                {/* Contenedor de la barra */}
                <div className="w-full max-w-[28px] bg-slate-100 dark:bg-zinc-800/80 rounded-2xl h-full flex items-end p-1 overflow-hidden transition-all group-hover:bg-orange-100/40">
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ease-out ${
                      isToday
                        ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-md shadow-orange-500/30'
                        : item.intensity > 70
                        ? 'bg-orange-500 dark:bg-orange-500/90'
                        : 'bg-slate-300 dark:bg-zinc-700'
                    }`}
                    style={{ height: `${item.intensity}%` }}
                  />
                </div>

                {/* Día */}
                <span className={`text-[10px] font-bold ${
                  isToday 
                    ? 'text-orange-600 dark:text-orange-400 font-black' 
                    : 'text-slate-500 dark:text-zinc-400'
                }`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SECCIÓN RÉCORDS DE FUERZA & 1RM */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              <span>Récords de Fuerza & 1RM</span>
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
              Fórmula Epley calculada en base a tus series efectivas
            </p>
          </div>
          <span className="text-xs font-mono font-black text-orange-600 dark:text-orange-400">
            {exercisesProgress.length} marcas
          </span>
        </div>

        {exercisesProgress.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1">
            <Dumbbell className="w-6 h-6 mx-auto text-slate-300 dark:text-zinc-600" />
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Sin registros completados hoy
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Al marcar tus series en la pestaña "Entreno", tus récords se actualizarán aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {exercisesProgress.slice(0, 6).map((ex, i) => (
              <div key={ex.id || i} className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center shrink-0 font-bold text-xs">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {ex.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Día {ex.day} • Carga: <strong className="text-slate-700 dark:text-zinc-300">{ex.loggedWeight} kg</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-200/60 dark:border-orange-500/20">
                    1RM: {ex.estimated1RM} kg
                  </span>
                  {ex.volumeKg > 0 && (
                    <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5 font-mono">
                      Vol: {ex.volumeKg} kg
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
