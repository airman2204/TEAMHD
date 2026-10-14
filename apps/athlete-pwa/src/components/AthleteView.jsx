import React from 'react';
import { 
  Dumbbell, 
  User, 
  ShoppingBag, 
  Flame, 
  Calendar, 
  Video, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Pill, 
  ShieldAlert, 
  Plus, 
  Minus,
  ArrowRight,
  TrendingUp,
  MapPin,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  Award,
  RefreshCw,
  Calculator
} from 'lucide-react';
import RestTimer from './RestTimer';
import ExerciseModal from './ExerciseModal';
import ThemeToggle from './ThemeToggle';
import MuscleRecoveryMap from './MuscleRecoveryMap';
import ExerciseSwapModal from './ExerciseSwapModal';
import PlateCalculatorModal from './PlateCalculatorModal';
import ProgressView from './ProgressView';

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function AthleteView({
  athlete,
  onUpdateAthlete,
  routines,
  onUpdateRoutineExercise,
  onSaveWorkoutSession,
  appointments,
  products,
  cart,
  onAddToCart,
  onOpenCheckout,
  onSendFeedbackToCoach,
  onLogout,
  onOpenChangePassword
}) {
  const [activeTab, setActiveTab] = React.useState('workout'); // 'workout' | 'profile' | 'store'
  const [selectedDay, setSelectedDay] = React.useState('Lun');
  const [selectedExerciseForModal, setSelectedExerciseForModal] = React.useState(null);
  const [exerciseToSwap, setExerciseToSwap] = React.useState(null);
  const [plateCalculatorExercise, setPlateCalculatorExercise] = React.useState(null);

  // Mapear día activo de la rutina
  const currentRoutineDay = routines[selectedDay] || {
    dayTitle: "Descanso / Recuperación",
    supplementPrescription: "Mantén hidratación óptima.",
    exercises: []
  };

  const handleSelectAlternativeExercise = (alternative) => {
    if (!exerciseToSwap) return;
    onUpdateRoutineExercise(selectedDay, exerciseToSwap.id, {
      name: alternative.name,
      muscle_group: alternative.muscle_group,
      videoUrl: alternative.video_url
    });
    setExerciseToSwap(null);
  };

  // Sesión de entrenamiento activo (cronómetro global)
  const [isSessionActive, setIsSessionActive] = React.useState(false);
  const [sessionSeconds, setSessionSeconds] = React.useState(0);
  const [sessionSavedNotice, setSessionSavedNotice] = React.useState(null);

  // Reproductor de audio y AudioContext para enlazar reloj por Bluetooth (AVRCP)
  React.useEffect(() => {
    let interval = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Control de sesión de entrenamiento sin parpadeo en el notch de iOS
  const handleToggleSession = () => {
    setIsSessionActive(!isSessionActive);
  };

  const handleResetSession = () => {
    setIsSessionActive(false);
    setSessionSeconds(0);
  };

  const handleFinishAndSaveSession = () => {
    if (sessionSeconds === 0) return;
    setIsSessionActive(false);
    const completedCount = (currentRoutineDay.exercises || []).filter(e => e.completed).length;
    const totalCount = (currentRoutineDay.exercises || []).length;
    const formatted = formatTimer(sessionSeconds);

    if (onSaveWorkoutSession) {
      onSaveWorkoutSession({
        day: selectedDay,
        durationSeconds: sessionSeconds,
        durationFormatted: formatted,
        completedCount,
        totalExercises: totalCount
      });
    }

    setSessionSavedNotice(`¡Entrenamiento finalizado! Tiempo total guardado: ${formatted}`);
    setTimeout(() => setSessionSavedNotice(null), 5000);
  };

  // Liberar MediaSession para evitar parpadeos en el Notch / Dynamic Island de iOS
  React.useEffect(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = "none";
        navigator.mediaSession.metadata = null;
      } catch (e) {}
    }
  }, []);

  // Profile local state
  // Parse structured data if exists
  const initialData = React.useMemo(() => {
    let injuries = athlete.injuries || '';
    let experience = 'Intermedio (1-3 años)';
    let daysPerWeek = 4;
    let equipment = 'Gimnasio Comercial Completo';

    try {
      if (athlete.injuries && athlete.injuries.startsWith('{')) {
        const parsed = JSON.parse(athlete.injuries);
        injuries = parsed.injuries || '';
        experience = parsed.experience || experience;
        daysPerWeek = parsed.daysPerWeek || daysPerWeek;
        equipment = parsed.equipment || equipment;
      }
    } catch (e) {}

    return {
      weight: athlete.weight || '',
      height: athlete.height || '',
      goal: athlete.goal || '',
      injuries,
      experience,
      daysPerWeek,
      equipment
    };
  }, [athlete]);

  const [profileForm, setProfileForm] = React.useState(initialData);
  const [profileSavedToast, setProfileSavedToast] = React.useState(false);

  // Sync profileForm if athlete prop changes
  React.useEffect(() => {
    setProfileForm(initialData);
  }, [initialData]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const structuredNotes = JSON.stringify({
      injuries: profileForm.injuries || '',
      experience: profileForm.experience,
      daysPerWeek: parseInt(profileForm.daysPerWeek) || 4,
      equipment: profileForm.equipment
    });

    onUpdateAthlete({
      ...athlete,
      ...profileForm,
      weight: parseFloat(profileForm.weight) || athlete.weight,
      height: parseFloat(profileForm.height) || athlete.height,
      injuries: structuredNotes
    });
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 w-full relative pb-20 transition-colors">
      {/* Top Header App Brand Real (Sticky Mobile Header con soporte Dynamic Island / Notch) */}
      <header className="sticky top-0 z-30 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between shadow-2xs transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-xs shadow-md shadow-emerald-600/20">
              AG
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-slate-900 dark:text-white">APP GYM</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">|</span>
                <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400">Atleta</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Hola, <strong className="text-slate-800 dark:text-zinc-200">{athlete.name}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {cart.length > 0 && (
              <button
                onClick={onOpenCheckout}
                className="relative p-2 bg-emerald-50 dark:bg-orange-500/20 border border-emerald-200 dark:border-orange-500/40 rounded-xl text-emerald-700 dark:text-orange-400 hover:bg-emerald-100 dark:hover:bg-orange-500/30 transition-all"
                title="Ver carrito"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 dark:bg-orange-500 text-white dark:text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartItems}
                </span>
              </button>
            )}
            <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-amber-500/40 overflow-hidden bg-slate-100 dark:bg-zinc-800 shadow-2xs">
              <img src={athlete.avatar} alt={athlete.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Main Content Area (Mobile Viewport Responsivo) */}
        <div className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-28 space-y-4">
          
          {/* TAB 1: WORKOUT & RUTINA */}
          {activeTab === 'workout' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Upcoming Appointment Card (Mixta) */}
              {appointments && appointments.length > 0 && (
                <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-amber-500/30 shadow-xs relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-amber-400">
                        Próxima Asesoría 1 a 1
                      </span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      appointments[0].type === 'online' 
                        ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/40' 
                        : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40'
                    }`}>
                      {appointments[0].type === 'online' ? '🌐 En Línea' : '🏋️ Presencial'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{appointments[0].title}</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-1 mb-2 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                    {appointments[0].date}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      {appointments[0].location}
                    </span>

                    {appointments[0].type === 'online' ? (
                      <a
                        href={appointments[0].link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-102 active:scale-98"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Abrir Meet</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-transparent">
                        Check-in en Gym
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* CRONÓMETRO DE SESIÓN ACTIVA & TIEMPO TOTAL DE ENTRENAMIENTO */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-md relative overflow-hidden transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isSessionActive ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      <TimerIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 dark:text-zinc-500 block">
                        Entrenamiento en Vivo
                      </span>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white">
                        {isSessionActive ? 'Sesión en Curso' : 'Control de Tiempo Total'}
                      </h3>
                    </div>
                  </div>

                  {/* Reloj Digital Grande */}
                  <div className="flex items-baseline gap-1 bg-slate-100 dark:bg-zinc-950 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                    <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wider">
                      {formatTimer(sessionSeconds)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">min</span>
                  </div>
                </div>

                {/* Botones de Control de Sesión */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleToggleSession}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                      isSessionActive
                        ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {isSessionActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Pausar Sesión</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{sessionSeconds > 0 ? 'Reanudar Sesión' : 'Iniciar Entrenamiento'}</span>
                      </>
                    )}
                  </button>

                  {sessionSeconds > 0 && (
                    <>
                      <button
                        onClick={handleFinishAndSaveSession}
                        className="py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-600/20 shrink-0"
                        title="Finalizar y guardar tiempo total en base de datos"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Finalizar &</span> Guardar
                      </button>

                      <button
                        onClick={handleResetSession}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors shrink-0"
                        title="Reiniciar cronómetro"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Notificación de Guardado */}
                {sessionSavedNotice && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{sessionSavedNotice}</span>
                  </div>
                )}
              </div>

              {/* Day Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Plan Semanal Team HD
                  </h3>
                  <span className="text-[11px] text-emerald-700 dark:text-amber-400 font-bold">
                    {currentRoutineDay.exercises.filter(e => e.completed).length}/{currentRoutineDay.exercises.length} Listos
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 bg-white dark:bg-zinc-900/90 p-1.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs transition-colors">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDay === day;
                    const dayData = routines[day];
                    const hasExercises = dayData && dayData.exercises && dayData.exercises.length > 0;
                    const isFullyCompleted = hasExercises && dayData.exercises.every(e => e.completed);

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex flex-col items-center py-2 rounded-xl transition-all relative ${
                          isSelected
                            ? 'bg-emerald-600 text-white dark:bg-amber-500 dark:text-black font-black shadow-xs scale-102'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <span className="text-xs font-extrabold">{day}</span>
                        <div className="mt-1 flex items-center justify-center">
                          {isFullyCompleted ? (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white dark:bg-black' : 'bg-emerald-500'}`} />
                          ) : hasExercises ? (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white dark:bg-black' : 'bg-amber-500'}`} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Muscle Recovery Heat Map (Fitbod Engine) */}
              <MuscleRecoveryMap routines={routines} activeDay={selectedDay} />

              {/* Day Focus Header */}
              <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 rounded-2xl p-4 shadow-2xs transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-amber-500 tracking-wider">
                      Objetivo del Día ({selectedDay})
                    </span>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {currentRoutineDay.dayTitle}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono font-medium">
                    {currentRoutineDay.exercises.length} Ejercicios
                  </span>
                </div>

                {/* Supplement Prescribed Banner (Comentado temporalmente por solicitud del usuario)
                {currentRoutineDay.supplementPrescription && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-start gap-2 text-xs text-amber-900 dark:text-orange-300 bg-amber-50/70 dark:bg-orange-500/5 p-2.5 rounded-xl border border-amber-200 dark:border-orange-500/20">
                    <Pill className="w-4 h-4 text-amber-600 dark:text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-700 dark:text-orange-400">Prescripción de Suplementación: </span>
                      <span className="font-medium">{currentRoutineDay.supplementPrescription}</span>
                    </div>
                  </div>
                )}
                */}
              </div>

              {/* Exercises List */}
              <div className="space-y-3">
                {currentRoutineDay.exercises.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-white dark:bg-zinc-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
                    <Sparkles className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-400">Día de recuperación programado</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-600 mt-1">
                      Aprovecha para hidratarte, descansar y nutrirte según tu plan.
                    </p>
                  </div>
                ) : (
                  currentRoutineDay.exercises.map((ex, index) => (
                    <div
                      key={ex.id || index}
                      className={`p-4 rounded-3xl border transition-all ${
                        ex.completed
                          ? 'bg-emerald-50/50 dark:bg-zinc-950/70 border-emerald-300 dark:border-emerald-500/30 ring-1 ring-emerald-500/20'
                          : 'bg-white dark:bg-zinc-900/80 border-slate-200/90 dark:border-zinc-800 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Exercise Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 text-emerald-600 dark:text-amber-400 font-black text-xs mt-0.5">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className={`text-sm font-black ${ex.completed ? 'text-slate-400 dark:text-zinc-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                              {ex.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                              <span className="font-bold text-emerald-600 dark:text-amber-400/90">{ex.series}</span>
                              <span>•</span>
                              <span>Descanso: {ex.restSeconds}s</span>
                            </div>
                          </div>
                        </div>

                        {/* Video / Technique Button & Swap Button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setExerciseToSwap(ex)}
                            className="px-2 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-amber-200/80 dark:border-amber-800/60 transition-colors"
                            title="¿Máquina ocupada? Cambiar por ejercicio equivalente"
                          >
                            <RefreshCw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span className="hidden sm:inline">Cambiar</span>
                          </button>

                          <button
                            onClick={() => setSelectedExerciseForModal(ex)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-bold flex items-center gap-1.5 border border-slate-200/80 dark:border-zinc-700/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                          >
                            <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                            <span>Ver técnica</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Rest Timer */}
                      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                        <RestTimer initialSeconds={ex.restSeconds || 90} exerciseName={ex.name} />
                        
                        <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/40 transition-colors shrink-0">
                          <input
                            type="checkbox"
                            checked={!!ex.completed}
                            onChange={(e) => {
                              onUpdateRoutineExercise(selectedDay, ex.id, {
                                completed: e.target.checked
                              });
                            }}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${ex.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                            {ex.completed ? 'Completado ✓' : 'Marcar Listo'}
                          </span>
                        </label>
                      </div>

                      {/* Weight Log & Notes Input */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-1 gap-2.5">
                        
                        {/* DESGLOSE Y REGISTRO DETALLADO POR CADA SERIE PRESCRITA */}
                        {(() => {
                          const targetSetsCount = parseInt(ex.series?.split('x')[0]) || ex.targetSets || 4;
                          const targetRepsText = ex.series?.split('x')[1] || ex.targetReps || '10-12';
                          
                          // Construir o leer el array de series
                          const sets = ex.setsLog && ex.setsLog.length === targetSetsCount
                            ? ex.setsLog
                            : Array.from({ length: targetSetsCount }, (_, sIdx) => ({
                                setNumber: sIdx + 1,
                                prescribedWeight: ex.prescribedWeight || 0,
                                prescribedReps: targetRepsText,
                                actualWeight: ex.loggedWeight || ex.prescribedWeight || 0,
                                actualReps: parseInt(targetRepsText) || 10,
                                completed: false
                              }));

                          const handleUpdateSet = (setIndex, updatedFields) => {
                            const newSets = sets.map((s, idx) => idx === setIndex ? { ...s, ...updatedFields } : s);
                            const allDone = newSets.every(s => s.completed);
                            const latestWeight = newSets[setIndex].actualWeight || ex.loggedWeight;
                            const latestReps = newSets[setIndex].actualReps || 10;
                            
                            // Cálculo de 1RM Estimado según fórmula de Epley (Estilo Fitbod)
                            const estimated1RM = Math.round(latestWeight * (1 + latestReps / 30));

                            // Auto-Progresión Fitbod: si superó o igualó las reps meta con éxito en la última serie, sugerir aumento de +2.5kg para la siguiente sesión
                            let nextProgressionWeight = ex.prescribedWeight;
                            if (updatedFields.completed && latestReps >= (parseInt(targetRepsText) || 10)) {
                              nextProgressionWeight = latestWeight + 2.5;
                            }

                            onUpdateRoutineExercise(selectedDay, ex.id, {
                              setsLog: newSets,
                              completed: allDone,
                              loggedWeight: latestWeight,
                              estimated1RM,
                              suggestedNextWeight: nextProgressionWeight
                            });
                          };

                          // Calcular el 1RM estimado actual del ejercicio
                          const current1RM = ex.estimated1RM || (ex.loggedWeight ? Math.round(ex.loggedWeight * (1 + 10 / 30)) : 0);

                          return (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-zinc-300 px-1">
                                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                  <span>📋 Registro por Serie ({targetSetsCount} Series)</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  {current1RM > 0 && (
                                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md font-mono border border-blue-200/60 dark:border-blue-800/60" title="1RM Estimado (Fuerza Máxima)">
                                      1RM Est: {current1RM}kg
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                    Meta: {targetRepsText} reps
                                  </span>
                                </div>
                              </div>

                              {/* Tabla responsiva de series sin desbordamiento móvil */}
                              <div className="bg-slate-50/80 dark:bg-zinc-950/70 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden divide-y divide-slate-200/60 dark:divide-zinc-800/70">
                                {sets.map((set, sIdx) => (
                                  <div 
                                    key={sIdx}
                                    className={`px-2.5 py-2 flex items-center justify-between gap-1.5 transition-colors overflow-x-hidden ${
                                      set.completed ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                                    }`}
                                  >
                                    {/* Indicador de Serie */}
                                    <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black font-mono shrink-0 ${
                                        set.completed
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                                      }`}>
                                        S{set.setNumber}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setPlateCalculatorExercise({ name: ex.name, targetWeight: ex.prescribedWeight || 40 })}
                                        className="flex flex-col min-w-0 text-left hover:opacity-80 transition-opacity"
                                        title="Abrir calculadora de discos para este peso"
                                      >
                                        <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-zinc-500 leading-none flex items-center gap-0.5">
                                          <span>Meta</span>
                                          <Calculator className="w-2.5 h-2.5 text-blue-500" />
                                        </span>
                                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 font-mono leading-tight truncate underline decoration-dotted">
                                          {ex.prescribedWeight || 0}kg
                                        </span>
                                      </button>
                                    </div>

                                    {/* Inputs Peso Real y Reps Reales */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <div className="flex items-center gap-0.5">
                                        <input
                                          type="number"
                                          step="0.5"
                                          value={set.actualWeight !== undefined && set.actualWeight !== 0 ? set.actualWeight : ""}
                                          placeholder={ex.prescribedWeight ? `${ex.prescribedWeight}` : "0"}
                                          onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            handleUpdateSet(sIdx, { actualWeight: val });
                                          }}
                                          className="w-12 sm:w-14 px-1 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:border-emerald-500 shadow-2xs"
                                        />
                                        <span className="text-[9px] font-bold text-slate-400">kg</span>
                                      </div>

                                      <div className="flex items-center gap-0.5">
                                        <input
                                          type="number"
                                          value={set.actualReps !== undefined ? set.actualReps : ""}
                                          placeholder={parseInt(targetRepsText) || "10"}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            handleUpdateSet(sIdx, { actualReps: val });
                                          }}
                                          className="w-10 sm:w-12 px-1 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:border-emerald-500 shadow-2xs"
                                        />
                                        <span className="text-[9px] font-bold text-slate-400">reps</span>
                                      </div>

                                      {/* Check botón de la serie */}
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateSet(sIdx, { completed: !set.completed })}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                          set.completed
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-white dark:bg-zinc-800 text-slate-400 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
                                        }`}
                                        title={set.completed ? "Serie completada" : "Marcar serie lista"}
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Notas / Sensación para el coach (ej. molestia, RPE...)"
                            value={ex.feedback || ""}
                            onChange={(e) => {
                              onUpdateRoutineExercise(selectedDay, ex.id, {
                                feedback: e.target.value
                              });
                            }}
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:border-emerald-500 dark:focus:border-amber-500 rounded-xl text-xs text-slate-900 dark:text-zinc-300 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none transition-colors"
                          />
                          {ex.feedback && (
                            <button
                              onClick={() => {
                                onSendFeedbackToCoach(athlete.id, athlete.name, ex.name, ex.feedback);
                                alert("¡Feedback enviado al Coach Dashboard!");
                              }}
                              className="text-[10px] text-emerald-600 dark:text-amber-400 hover:underline flex items-center gap-1 pl-1 font-bold"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              Enviar como alerta prioritaria al coach
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & ONBOARDING */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 shadow-xs relative overflow-hidden transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 dark:border-amber-500 shadow-md">
                    <img src={athlete.avatar} alt={athlete.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{athlete.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{athlete.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-amber-500/10 text-emerald-700 dark:text-amber-400 border border-emerald-200/80 dark:border-amber-500/30 text-[10px] font-black rounded-full">
                      Plan Atleta Pro • Team HD
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Profile / Onboarding Form */}
              <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-xs transition-colors">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-amber-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Ficha Antropométrica & Salud
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Sincronizado en la Nube</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Peso Actual (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={profileForm.weight}
                      onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Estatura (cm)
                    </label>
                    <input
                      type="number"
                      required
                      value={profileForm.height}
                      onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                    Objetivo Principal
                  </label>
                  <select
                    value={profileForm.goal}
                    onChange={(e) => setProfileForm({ ...profileForm, goal: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                  >
                    <option value="Hipertrofia">Hipertrofia Muscular (Ganancia masa limpia)</option>
                    <option value="Definición">Definición / Pérdida de Grasa</option>
                    <option value="Fuerza / Powerlifting">Fuerza Máxima / Powerlifting</option>
                    <option value="Recomposición">Recomposición Corporal</option>
                  </select>
                </div>

                {/* Parámetros clave para el Constructor de Rutinas IA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Días Disponibles para Entrenar
                    </label>
                    <select
                      value={profileForm.daysPerWeek}
                      onChange={(e) => setProfileForm({ ...profileForm, daysPerWeek: parseInt(e.target.value) || 4 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                    >
                      <option value={3}>3 Días por semana (Full Body)</option>
                      <option value={4}>4 Días por semana (Torso / Pierna)</option>
                      <option value={5}>5 Días por semana (Push / Pull / Legs / Upper / Lower)</option>
                      <option value={6}>6 Días por semana (Push / Pull / Legs x2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                      Nivel de Experiencia
                    </label>
                    <select
                      value={profileForm.experience}
                      onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                    >
                      <option value="Principiante (0-1 años)">Principiante (0 - 1 años)</option>
                      <option value="Intermedio (1-3 años)">Intermedio (1 - 3 años)</option>
                      <option value="Avanzado (+3 años)">Avanzado (+3 años de entrenamiento serio)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                    Equipamiento & Lugar de Entrenamiento
                  </label>
                  <select
                    value={profileForm.equipment}
                    onChange={(e) => setProfileForm({ ...profileForm, equipment: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                  >
                    <option value="Gimnasio Comercial Completo">Gimnasio Comercial Completo (Máquinas, poleas y barras)</option>
                    <option value="Gimnasio en Casa (Mancuernas y banco)">Gimnasio en Casa (Mancuernas y banco)</option>
                    <option value="Peso Corporal / Calistenia">Peso Corporal / Calistenia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-700 dark:text-orange-400 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Lesiones previas o molestias articulares
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.injuries}
                    onChange={(e) => setProfileForm({ ...profileForm, injuries: e.target.value })}
                    placeholder="Describe cualquier molestia en hombro, rodilla, lumbar, etc..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 leading-relaxed font-medium transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-1 font-medium">
                    Esta información es visible inmediatamente para tu Coach para adaptar tus ejercicios.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-black font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 dark:shadow-amber-500/20 active:scale-98"
                >
                  Actualizar Ficha de Atleta
                </button>

                {profileSavedToast && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Ficha actualizada con éxito!
                  </div>
                )}
              </form>

              {/* Account Security & Actions */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 space-y-3 shadow-xs transition-colors">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                  Seguridad de la Cuenta
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onOpenChangePassword}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Cambiar Contraseña</span>
                  </button>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-red-200 dark:border-red-500/30"
                  >
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>

              {/* Coach Summary */}
              <div className="bg-white dark:bg-zinc-900/40 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 text-xs space-y-1 shadow-2xs transition-colors">
                <span className="font-bold text-slate-800 dark:text-zinc-300">Notas de tu Coach:</span>
                <p className="text-slate-600 dark:text-zinc-400 font-medium">{athlete.coachNotes}</p>
              </div>
            </div>
          )}

          {/* TAB 3: STORE (Strength Fit) */}
          {activeTab === 'store' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-white dark:from-orange-600/20 dark:via-zinc-900 dark:to-zinc-950 border border-orange-200 dark:border-orange-500/30 rounded-3xl shadow-xs transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-500">
                      Oficial Supplement Store
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Strength Fit Supplements</h3>
                  </div>
                  <span className="text-[11px] bg-orange-600 dark:bg-orange-500 text-white dark:text-black px-2.5 py-0.5 rounded-full font-black">
                    100% Calidad
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-medium">
                  Suplementación de grado farmacéutico vinculada a tu plan de entrenamiento.
                </p>
              </div>

              {/* Products Grid */}
              {products.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-8 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-zinc-200">
                    Catálogo en preparación
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                    Próximamente tu coach publicará suplementos y equipamiento oficial disponibles para entrega directa.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((prod) => {
                    const inCartItem = cart.find(c => c.id === prod.id);

                    return (
                      <div
                        key={prod.id}
                        className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-500/40 rounded-3xl p-3.5 flex gap-3.5 shadow-2xs transition-all"
                      >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-950 shrink-0 border border-slate-200 dark:border-zinc-800 relative">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                          {prod.stock < 15 && (
                            <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                              {prod.stock} disp.
                            </span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                                {prod.name}
                              </h4>
                              <span className="text-xs font-mono font-black text-orange-600 dark:text-orange-400 shrink-0">
                                ${prod.price} <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-sans">MXN</span>
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium line-clamp-1">{prod.flavor}</p>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 line-clamp-2">{prod.description}</p>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                              Stock: <strong className="text-slate-800 dark:text-zinc-200">{prod.stock} u.</strong>
                            </span>

                            <button
                              onClick={() => onAddToCart(prod)}
                              disabled={prod.stock <= 0}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                                prod.stock <= 0
                                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed'
                                  : inCartItem
                                  ? 'bg-orange-600 dark:bg-orange-500 text-white dark:text-black hover:bg-orange-500'
                                  : 'bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/40 hover:bg-orange-600 hover:text-white'
                              }`}
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>{inCartItem ? `En Carrito (${inCartItem.qty})` : 'Añadir'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Checkout Trigger if Cart has items */}
              {cart.length > 0 && (
                <div className="p-4 bg-white dark:bg-gradient-to-r dark:from-zinc-900 dark:to-zinc-950 border border-orange-300 dark:border-orange-500/40 rounded-3xl flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold">Subtotal ({totalCartItems} productos)</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      ${cart.reduce((acc, i) => acc + i.price * i.qty, 0)} MXN
                    </p>
                  </div>

                  <button
                    onClick={onOpenCheckout}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-98"
                  >
                    <span>Finalizar Pedido</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROGRESS & HABITS */}
          {activeTab === 'progress' && (
            <ProgressView
              athlete={athlete}
              routines={routines}
            />
          )}

        </div>

        {/* Bottom PWA Navigation Bar Nativa (Fixed Bottom) */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-zinc-800/80 px-4 flex items-center justify-around z-40 max-w-2xl mx-auto transition-colors shadow-lg">
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex flex-col items-center gap-1 py-1 transition-all ${
              activeTab === 'workout' ? 'text-emerald-600 dark:text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-bold">Entreno</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex flex-col items-center gap-1 py-1 transition-all ${
              activeTab === 'progress' ? 'text-emerald-600 dark:text-emerald-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold">Progreso</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 transition-all ${
              activeTab === 'profile' ? 'text-emerald-600 dark:text-amber-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex flex-col items-center gap-1 py-1 transition-all relative ${
              activeTab === 'store' ? 'text-orange-600 dark:text-orange-400 scale-105 font-black' : 'text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-bold">Tienda</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-orange-500" />
            )}
          </button>
        </nav>

      {/* Exercise Video/Technique Modal */}
      {selectedExerciseForModal && (
        <ExerciseModal
          exercise={selectedExerciseForModal}
          onClose={() => setSelectedExerciseForModal(null)}
        />
      )}

      {/* Exercise Swap / Alternative Modal (Fitbod Style) */}
      <ExerciseSwapModal
        isOpen={Boolean(exerciseToSwap)}
        onClose={() => setExerciseToSwap(null)}
        currentExercise={exerciseToSwap}
        onSelectAlternative={handleSelectAlternativeExercise}
      />

      {/* Plate Calculator Modal (Fitbod Style) */}
      <PlateCalculatorModal
        isOpen={Boolean(plateCalculatorExercise)}
        onClose={() => setPlateCalculatorExercise(null)}
        targetWeightKg={plateCalculatorExercise?.targetWeight || 60}
        exerciseName={plateCalculatorExercise?.name || 'Ejercicio'}
      />
    </div>
  );
}
