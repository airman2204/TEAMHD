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
  MessageSquare
} from 'lucide-react';
import RestTimer from './RestTimer';
import ExerciseModal from './ExerciseModal';

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function AthleteView({
  athlete,
  onUpdateAthlete,
  routines,
  onUpdateRoutineExercise,
  appointments,
  products,
  cart,
  onAddToCart,
  onOpenCheckout,
  onSendFeedbackToCoach
}) {
  const [activeTab, setActiveTab] = React.useState('workout'); // 'workout' | 'profile' | 'store'
  const [selectedDay, setSelectedDay] = React.useState('Lun');
  const [selectedExerciseForModal, setSelectedExerciseForModal] = React.useState(null);

  // Profile local state
  const [profileForm, setProfileForm] = React.useState({
    weight: athlete.weight,
    height: athlete.height,
    goal: athlete.goal,
    injuries: athlete.injuries
  });
  const [profileSavedToast, setProfileSavedToast] = React.useState(false);

  // Sync profileForm if athlete prop changes
  React.useEffect(() => {
    setProfileForm({
      weight: athlete.weight,
      height: athlete.height,
      goal: athlete.goal,
      injuries: athlete.injuries
    });
  }, [athlete]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateAthlete({
      ...athlete,
      ...profileForm,
      weight: parseFloat(profileForm.weight) || athlete.weight,
      height: parseFloat(profileForm.height) || athlete.height
    });
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  const currentRoutineDay = routines[selectedDay] || {
    dayTitle: "Descanso / Recuperación",
    supplementPrescription: "Mantén hidratación óptima.",
    exercises: []
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="flex justify-center items-start min-h-screen py-4 px-2 sm:px-4">
      {/* Phone Mockup Frame */}
      <div className="w-full max-w-[420px] bg-zinc-950 border-4 border-zinc-800/90 rounded-[44px] shadow-2xl overflow-hidden relative flex flex-col min-h-[850px] ring-1 ring-zinc-700/50">
        
        {/* Dynamic Island / Notch */}
        <div className="h-7 bg-black w-full flex items-center justify-center relative pt-1 z-30 select-none">
          <div className="w-24 h-4 bg-zinc-900 rounded-full flex items-center justify-between px-2">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
          <span className="absolute left-6 top-1 text-[11px] font-semibold text-zinc-400">9:41</span>
          <div className="absolute right-6 top-1 flex items-center gap-1 text-[11px] text-zinc-400">
            <span>5G</span>
            <div className="w-4 h-2 border border-zinc-400 rounded-xs p-0.5 flex">
              <div className="h-full w-3 bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* Top Header App Brand */}
        <div className="px-4 py-3 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800/80 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-sm shadow-md shadow-amber-500/20">
              HD
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-white">TEAM HD</span>
                <span className="text-[10px] text-zinc-500 font-semibold">×</span>
                <span className="text-xs font-black tracking-wider text-orange-500">STRENGTH FIT</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Atleta: <strong className="text-zinc-200">{athlete.name}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={onOpenCheckout}
                className="relative p-2 bg-orange-500/20 border border-orange-500/40 rounded-xl text-orange-400 hover:bg-orange-500/30 transition-all"
                title="Ver carrito"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-black text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              </button>
            )}
            <div className="w-8 h-8 rounded-full border border-amber-500/40 overflow-hidden bg-zinc-800">
              <img src={athlete.avatar} alt={athlete.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-4">
          
          {/* TAB 1: WORKOUT & RUTINA */}
          {activeTab === 'workout' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Upcoming Appointment Card (Mixta) */}
              {appointments && appointments.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/80 border border-amber-500/30 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Próxima Asesoría 1 a 1
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      appointments[0].type === 'online' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {appointments[0].type === 'online' ? '🌐 En Línea' : '🏋️ Presencial'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{appointments[0].title}</h4>
                  <p className="text-xs text-zinc-300 flex items-center gap-1 mb-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {appointments[0].date}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {appointments[0].location}
                    </span>

                    {appointments[0].type === 'online' ? (
                      <a
                        href={appointments[0].link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-105"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Abrir Meet</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                        Check-in en Gym
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Day Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Plan Semanal Team HD
                  </h3>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {currentRoutineDay.exercises.filter(e => e.completed).length}/{currentRoutineDay.exercises.length} Listos
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDay === day;
                    const dayData = routines[day];
                    const hasExercises = dayData && dayData.exercises && dayData.exercises.length > 0;
                    const isFullyCompleted = hasExercises && dayData.exercises.every(e => e.completed);

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex flex-col items-center py-2 rounded-lg transition-all relative ${
                          isSelected
                            ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20 scale-102'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                        }`}
                      >
                        <span className="text-xs font-bold">{day}</span>
                        <div className="mt-1 flex items-center justify-center">
                          {isFullyCompleted ? (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-emerald-400'}`} />
                          ) : hasExercises ? (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-amber-400'}`} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Focus Header */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-amber-500 tracking-wider">
                      Objetivo del Día ({selectedDay})
                    </span>
                    <h2 className="text-sm font-bold text-white mt-0.5">
                      {currentRoutineDay.dayTitle}
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">
                    {currentRoutineDay.exercises.length} Ejercicios
                  </span>
                </div>

                {/* Supplement Prescribed Banner */}
                {currentRoutineDay.supplementPrescription && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-start gap-2 text-xs text-orange-300 bg-orange-500/5 p-2 rounded-lg border border-orange-500/20">
                    <Pill className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-orange-400">Prescripción de Suplementación: </span>
                      <span>{currentRoutineDay.supplementPrescription}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Exercises List */}
              <div className="space-y-3">
                {currentRoutineDay.exercises.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                    <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-zinc-400">Día de recuperación programado</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Aprovecha para hidratarte, descansar y nutrirte según tu plan.
                    </p>
                  </div>
                ) : (
                  currentRoutineDay.exercises.map((ex, index) => (
                    <div
                      key={ex.id || index}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        ex.completed
                          ? 'bg-zinc-950/70 border-emerald-500/30 ring-1 ring-emerald-500/20'
                          : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Exercise Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-zinc-800 text-amber-400 font-black text-xs mt-0.5">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className={`text-sm font-bold ${ex.completed ? 'text-zinc-400 line-through' : 'text-white'}`}>
                              {ex.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                              <span className="font-medium text-amber-400/90">{ex.series}</span>
                              <span>•</span>
                              <span>Descanso: {ex.restSeconds}s</span>
                            </div>
                          </div>
                        </div>

                        {/* Video / Technique Button */}
                        <button
                          onClick={() => setSelectedExerciseForModal(ex)}
                          className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold flex items-center gap-1 border border-zinc-700/50 hover:text-white transition-colors"
                        >
                          <Video className="w-3 h-3 text-amber-400" />
                          <span>Ver técnica</span>
                        </button>
                      </div>

                      {/* Interactive Rest Timer */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <RestTimer initialSeconds={ex.restSeconds || 90} />
                        
                        <label className="flex items-center gap-2 cursor-pointer select-none bg-zinc-800/60 px-2.5 py-1.5 rounded-lg border border-zinc-700/40 hover:bg-zinc-800">
                          <input
                            type="checkbox"
                            checked={!!ex.completed}
                            onChange={(e) => {
                              onUpdateRoutineExercise(selectedDay, ex.id, {
                                completed: e.target.checked
                              });
                            }}
                            className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${ex.completed ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {ex.completed ? 'Completado ✓' : 'Marcar Listo'}
                          </span>
                        </label>
                      </div>

                      {/* Weight Log & Notes Input */}
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between gap-3 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800">
                          <span className="text-[11px] font-semibold text-zinc-400">
                            Peso real levantado:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.5"
                              value={ex.loggedWeight !== undefined ? ex.loggedWeight : ""}
                              placeholder={ex.prescribedWeight ? `${ex.prescribedWeight}` : "0"}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                onUpdateRoutineExercise(selectedDay, ex.id, {
                                  loggedWeight: val
                                });
                              }}
                              className="w-20 px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-xs font-bold text-zinc-400">kg</span>
                          </div>
                        </div>

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
                            className="w-full px-3 py-1.5 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none transition-colors"
                          />
                          {ex.feedback && (
                            <button
                              onClick={() => {
                                onSendFeedbackToCoach(athlete.id, athlete.name, ex.name, ex.feedback);
                                alert("¡Feedback enviado al Coach Dashboard!");
                              }}
                              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 pl-1"
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
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-lg">
                    <img src={athlete.avatar} alt={athlete.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{athlete.name}</h3>
                    <p className="text-xs text-zinc-400">{athlete.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded-full">
                      Plan Atleta Pro • Team HD
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Profile / Onboarding Form */}
              <form onSubmit={handleSaveProfile} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Ficha Antropométrica & Salud
                  </h4>
                  <span className="text-[10px] text-zinc-500">Guardado en estado</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Peso Actual (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={profileForm.weight}
                      onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Estatura (cm)
                    </label>
                    <input
                      type="number"
                      required
                      value={profileForm.height}
                      onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Objetivo Principal
                  </label>
                  <select
                    value={profileForm.goal}
                    onChange={(e) => setProfileForm({ ...profileForm, goal: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Hipertrofia">Hipertrofia Muscular (Ganancia masa limpia)</option>
                    <option value="Definición">Definición / Pérdida de Grasa</option>
                    <option value="Fuerza / Powerlifting">Fuerza Máxima / Powerlifting</option>
                    <option value="Recomposición">Recomposición Corporal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-orange-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Lesiones previas o molestias articulares
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={profileForm.injuries}
                    onChange={(e) => setProfileForm({ ...profileForm, injuries: e.target.value })}
                    placeholder="Describe cualquier molestia en hombro, rodilla, lumbar, etc..."
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Esta información es visible inmediatamente para tu Coach para adaptar tus ejercicios.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-98"
                >
                  Actualizar Ficha de Atleta
                </button>

                {profileSavedToast && (
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Ficha actualizada con éxito!
                  </div>
                )}
              </form>

              {/* Coach Summary */}
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
                <span className="font-bold text-zinc-300">Notas del Coach Dave:</span>
                <p className="text-zinc-400">{athlete.coachNotes}</p>
              </div>
            </div>
          )}

          {/* TAB 3: STORE (Strength Fit) */}
          {activeTab === 'store' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-3 bg-gradient-to-r from-orange-600/20 via-zinc-900 to-zinc-950 border border-orange-500/30 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">
                      Oficial Supplement Store
                    </span>
                    <h3 className="text-sm font-bold text-white">Strength Fit Supplements</h3>
                  </div>
                  <span className="text-[11px] bg-orange-500 text-black px-2 py-0.5 rounded-full font-black">
                    100% Calidad
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Suplementación de grado farmacéutico vinculada a tu plan de entrenamiento.
                </p>
              </div>

              {/* Products Grid */}
              <div className="space-y-3">
                {products.map((prod) => {
                  const inCartItem = cart.find(c => c.id === prod.id);

                  return (
                    <div
                      key={prod.id}
                      className="bg-zinc-900/80 border border-zinc-800 hover:border-orange-500/40 rounded-2xl p-3 flex gap-3 transition-all"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800 relative">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        {prod.stock < 15 && (
                          <span className="absolute top-1 left-1 bg-red-500/90 text-white text-[9px] font-bold px-1 rounded">
                            {prod.stock} disp.
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-white leading-snug">
                              {prod.name}
                            </h4>
                            <span className="text-xs font-mono font-black text-orange-400 shrink-0">
                              ${prod.price} <span className="text-[9px] text-zinc-500 font-sans">MXN</span>
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{prod.flavor}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{prod.description}</p>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400 font-medium">
                            Stock: <strong className="text-zinc-200">{prod.stock} u.</strong>
                          </span>

                          <button
                            onClick={() => onAddToCart(prod)}
                            disabled={prod.stock <= 0}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              prod.stock <= 0
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : inCartItem
                                ? 'bg-orange-500 text-black hover:bg-orange-400'
                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500 hover:text-black'
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

              {/* Quick Checkout Trigger if Cart has items */}
              {cart.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-orange-500/40 rounded-2xl flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Subtotal ({totalCartItems} productos)</span>
                    <p className="text-sm font-black text-white">
                      ${cart.reduce((acc, i) => acc + i.price * i.qty, 0)} MXN
                    </p>
                  </div>

                  <button
                    onClick={onOpenCheckout}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                  >
                    <span>Finalizar Pedido</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Bottom PWA Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-18 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-6 flex items-center justify-around z-30">
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex flex-col items-center gap-1 py-1 transition-all ${
              activeTab === 'workout' ? 'text-amber-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[10px] font-bold">Entreno</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-1 transition-all ${
              activeTab === 'profile' ? 'text-amber-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex flex-col items-center gap-1 py-1 transition-all relative ${
              activeTab === 'store' ? 'text-orange-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px] font-bold">Tienda</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-orange-500" />
            )}
          </button>
        </div>

        {/* Mobile Home Indicator bar */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-700 rounded-full z-40 pointer-events-none" />
      </div>

      {/* Exercise Video/Technique Modal */}
      {selectedExerciseForModal && (
        <ExerciseModal
          exercise={selectedExerciseForModal}
          onClose={() => setSelectedExerciseForModal(null)}
        />
      )}
    </div>
  );
}
