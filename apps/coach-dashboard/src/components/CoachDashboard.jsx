import React from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Plus, 
  Trash2, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  Send, 
  ExternalLink,
  Sparkles,
  ClipboardList,
  Phone,
  Mail,
  X,
  Dumbbell
} from 'lucide-react';

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CoachDashboard({
  students,
  onAddStudent,
  routines,
  onSaveRoutineDay,
  exerciseLibrary,
  products,
  feedbacks
}) {
  const [selectedStudentId, setSelectedStudentId] = React.useState(students[0]?.id || "std-1");
  const [selectedDay, setSelectedDay] = React.useState("Lun");
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = React.useState(false);
  const [newStudentForm, setNewStudentForm] = React.useState({
    name: "",
    phone: "",
    email: ""
  });
  const [magicLinkNotice, setMagicLinkNotice] = React.useState(null);

  // Routine builder temporary edit state
  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentRoutineData = (routines[selectedStudentId] && routines[selectedStudentId][selectedDay]) || {
    dayTitle: "Nueva Sesión",
    supplementPrescription: "",
    exercises: []
  };

  const [currentDayTitle, setCurrentDayTitle] = React.useState(studentRoutineData.dayTitle);
  const [currentSupplement, setCurrentSupplement] = React.useState(studentRoutineData.supplementPrescription || "");
  const [currentExercises, setCurrentExercises] = React.useState(studentRoutineData.exercises || []);
  const [exerciseSearchTerm, setExerciseSearchTerm] = React.useState("");
  const [showWaButton, setShowWaButton] = React.useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = React.useState(false);

  // Sync state when student or day changes
  React.useEffect(() => {
    const routineData = (routines[selectedStudentId] && routines[selectedStudentId][selectedDay]) || {
      dayTitle: `Sesión de ${selectedDay}`,
      supplementPrescription: "",
      exercises: []
    };
    setCurrentDayTitle(routineData.dayTitle || `Sesión de ${selectedDay}`);
    setCurrentSupplement(routineData.supplementPrescription || "");
    setCurrentExercises(routineData.exercises || []);
    setShowWaButton(false);
    setSaveSuccessNotice(false);
  }, [selectedStudentId, selectedDay, routines]);

  // Handle Add Student Submit
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.email) return;

    const newId = `std-${Date.now()}`;
    const newStudent = {
      id: newId,
      name: newStudentForm.name,
      email: newStudentForm.email,
      phone: newStudentForm.phone || "+52 55 0000 0000",
      weight: 70,
      height: 170,
      goal: "Hipertrofia",
      injuries: "Ninguna reportada",
      status: "Activo",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      coachNotes: "Alumno nuevo, requiere evaluación inicial."
    };

    const created = await onAddStudent(newStudentForm);
    if (created) {
      setSelectedStudentId(created.id);
      setIsNewStudentModalOpen(false);
      setMagicLinkNotice({
        name: created.name,
        email: created.email,
        tempPassword: created.tempPassword
      });
      setNewStudentForm({ name: "", phone: "", email: "" });
    }
  };

  // Add exercise to builder
  const handleAddExerciseToRoutine = (exTemplate) => {
    const newEx = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: exTemplate.name,
      series: "4x10-12",
      restSeconds: 90,
      prescribedWeight: 50,
      loggedWeight: 0,
      completed: false,
      feedback: "",
      videoUrl: exTemplate.videoUrl
    };
    setCurrentExercises([...currentExercises, newEx]);
    setExerciseSearchTerm("");
  };

  const handleRemoveExercise = (exId) => {
    setCurrentExercises(currentExercises.filter((e) => e.id !== exId));
  };

  const handleUpdateExerciseRow = (exId, field, value) => {
    setCurrentExercises(
      currentExercises.map((e) => (e.id === exId ? { ...e, [field]: value } : e))
    );
  };

  // Save Routine
  const handleSaveRoutine = () => {
    onSaveRoutineDay(selectedStudentId, selectedDay, {
      dayTitle: currentDayTitle,
      supplementPrescription: currentSupplement,
      exercises: currentExercises
    });
    setSaveSuccessNotice(true);
    setShowWaButton(true);
    setTimeout(() => setSaveSuccessNotice(false), 3500);
  };

  // Open WhatsApp with pre-filled message
  const handleOpenWhatsApp = () => {
    const phoneClean = selectedStudent.phone ? selectedStudent.phone.replace(/[^0-9]/g, '') : "5215500000000";
    const exerciseSummary = currentExercises.map((e) => `• ${e.name} (${e.series})`).join('%0A');
    const msg = `¡Hola ${selectedStudent.name}! 🏋️‍♂️ Tu Coach Dave de Team HD Muscle acaba de actualizar tu rutina para el día *${selectedDay}* (*${currentDayTitle}*):%0A%0A${exerciseSummary}%0A%0A*Suplementación prescrita:* ${currentSupplement || "Sin suplementación específica"}%0A%0APuedes entrar a tu PWA para registrar tus pesos y descansos. ¡A darle con todo! 🔥`;

    window.open(`https://wa.me/${phoneClean}?text=${msg}`, '_blank');
  };

  const filteredLibrary = exerciseLibrary.filter(ex => 
    ex.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
    ex.target.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Banner / Header Moderno */}
      <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">App Coach</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold">Marca Blanca</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">Gestión de Atletas & Prescripción</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewStudentModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:scale-102 active:scale-98 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Alumno</span>
          </button>
        </div>
      </div>

      {/* Student Welcome / Temp Password Notice */}
      {magicLinkNotice && (
        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/50 flex items-start justify-between shadow-xs animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300">
                ¡Alumno dado de alta y credenciales generadas!
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1">
                El alumno <strong>{magicLinkNotice.name}</strong> puede acceder de inmediato a <strong>App Gym</strong> con su correo: <strong>{magicLinkNotice.email}</strong>
              </p>
              {magicLinkNotice.tempPassword && (
                <div className="mt-2.5 p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">Contraseña temporal asignada:</span>
                    <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 select-all tracking-wider">
                      {magicLinkNotice.tempPassword}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                      El alumno deberá cambiar esta contraseña al ingresar por primera vez.
                    </span>
                  </div>

                  {magicLinkNotice.phone && (
                    <a
                      href={`https://wa.me/${magicLinkNotice.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `¡Hola ${magicLinkNotice.name}! Bienvenido a App Gym 🏋️‍♂️.\n\nTus accesos para entrar a tu plan de entrenamiento son:\n🔗 Enlace: https://teamhd-athlete.vercel.app\n📧 Correo: ${magicLinkNotice.email}\n🔑 Contraseña temporal: ${magicLinkNotice.tempPassword}\n\nPor seguridad, el sistema te pedirá cambiar tu contraseña al ingresar.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Enviar accesos por WhatsApp</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setMagicLinkNotice(null)}
            className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Left (Students & Feedback), Right (Routine Builder) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Student Selector & Feedback Inbox (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Students List */}
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                Alumnos Activos ({students.length})
              </h3>
            </div>

            <div className="space-y-2">
              {students.length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-500 space-y-2.5">
                  <p>Aún no hay alumnos dados de alta.</p>
                  <button
                    onClick={() => setIsNewStudentModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 border border-emerald-200 dark:border-amber-500/30 rounded-xl text-xs font-bold transition-all shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Dar de Alta Primer Alumno</span>
                  </button>
                </div>
              ) : (
                students.map((std) => {
                  const isSelected = std.id === selectedStudentId;
                  return (
                    <button
                      key={std.id}
                      onClick={() => setSelectedStudentId(std.id)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-amber-500/15 border-emerald-500/80 dark:border-amber-500/60 ring-1 ring-emerald-500/30 dark:ring-amber-500/30 shadow-xs'
                          : 'bg-slate-50/60 dark:bg-zinc-950/60 border-slate-200/80 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0">
                          <img src={std.avatar} alt={std.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{std.name}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{std.phone}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-emerald-700 dark:text-amber-400 font-semibold bg-emerald-100 dark:bg-amber-500/10 px-1.5 rounded">
                              {std.goal}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-zinc-500">{std.weight}kg</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-amber-400 animate-ping" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Student Detailed Medical / Injury Badge */}
          {selectedStudent && (
            <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3 transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Historial / Lesiones de {selectedStudent.name}
              </span>
              <p className="text-xs text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 leading-relaxed font-medium">
                {selectedStudent.injuries || "Sin lesiones reportadas."}
              </p>
              <div className="text-xs text-slate-500 dark:text-zinc-400 flex justify-between px-1">
                <span>Estatura: <strong className="text-slate-800 dark:text-zinc-200">{selectedStudent.height} cm</strong></span>
                <span>Peso: <strong className="text-slate-800 dark:text-zinc-200">{selectedStudent.weight} kg</strong></span>
              </div>
            </div>
          )}

          {/* Bandeja de Feedback & Alertas */}
          <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3.5 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
                Bandeja de Feedback & Alertas
              </h3>
              <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Gym Live Feed
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {feedbacks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 dark:text-zinc-500">
                  Sin reportes de triage pendientes.
                </div>
              ) : (
                feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                      fb.severity === 'alert'
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/40 text-red-900 dark:text-red-200'
                        : fb.severity === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/40 text-amber-900 dark:text-amber-200'
                        : fb.severity === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        {fb.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{fb.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-amber-400">
                        Ejercicio: {fb.exercise}
                      </span>
                      {fb.badge && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          fb.severity === 'alert' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-300 dark:border-red-500/30' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                        }`}>
                          🤖 {fb.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
                      "{fb.note}"
                    </p>
                    {fb.aiSuggestion && (
                      <div className="mt-2 p-2.5 bg-white/80 dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-zinc-700/60 text-[11px] text-slate-700 dark:text-zinc-300 flex items-start gap-2 shadow-2xs">
                        <span className="text-xs">💡</span>
                        <div>
                          <strong className="text-amber-600 dark:text-amber-400 block font-bold text-[10px] uppercase">
                            Sugerencia del Agente de Triage:
                          </strong>
                          <span>{fb.aiSuggestion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Routine Builder & WhatsApp Notification (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6 transition-colors">
            
            {/* Header: Student & Day Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-amber-400">
                  Constructor de Rutina Personalizada
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  Rutina para: <span className="text-emerald-600 dark:text-amber-400">{selectedStudent?.name || "Selecciona un alumno"}</span>
                </h2>
              </div>

              {/* Day Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-x-auto">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                      selectedDay === d
                        ? 'bg-emerald-600 text-white dark:bg-amber-500 dark:text-black shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Title & Supplement Prescription Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1.5">
                  Enfoque del Día / Título de la Sesión
                </label>
                <input
                  type="text"
                  value={currentDayTitle}
                  onChange={(e) => setCurrentDayTitle(e.target.value)}
                  placeholder="Ej. Torso Fuerza, Pierna Cuádriceps..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Prescribir Suplemento vinculado a Strength Fit */}
              <div className="md:col-span-7">
                <label className="block text-xs font-bold text-amber-600 dark:text-orange-400 mb-1.5 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" />
                  Prescribir Suplemento (Strength Fit)
                </label>
                <div className="flex gap-2">
                  <select
                    value={currentSupplement}
                    onChange={(e) => setCurrentSupplement(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-amber-300 dark:border-orange-500/40 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 dark:focus:border-orange-500 transition-colors"
                  >
                    <option value="">-- Selecciona o personaliza suplementación --</option>
                    <option value="Creatina Creapure® 5g + Proteína Isolate 1 scoop post-entreno">
                      Creatina Creapure® 5g + Proteína Isolate 1 scoop post-entreno
                    </option>
                    <option value="Pre-Workout Blood Fire HD 1 scoop 20 min antes">
                      Pre-Workout Blood Fire HD 1 scoop 20 min antes
                    </option>
                    <option value="Intra-Workout EAA 1 scoop con 750ml de agua durante el entreno">
                      Intra-Workout EAA 1 scoop con 750ml de agua durante el entreno
                    </option>
                    <option value="Creatina Creapure® 5g en ayunas (Día descanso)">
                      Creatina Creapure® 5g en ayunas (Día descanso)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Exercise Library Search & Add */}
            <div className="bg-slate-50 dark:bg-zinc-950/70 border border-slate-200/90 dark:border-zinc-800/80 rounded-2xl p-4 space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
                  Buscador de Ejercicios (Biblioteca HD)
                </label>
                <span className="text-[10px] text-slate-500 dark:text-zinc-500">Haz clic en un ejercicio para agregarlo a la sesión</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar ejercicio por nombre o músculo (ej. Press, Pecho, Sentadilla...)"
                  value={exerciseSearchTerm}
                  onChange={(e) => setExerciseSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 shadow-2xs transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-3" />
              </div>

              {/* Search Results Pills */}
              {exerciseSearchTerm.trim() !== "" && (
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                  {filteredLibrary.length === 0 ? (
                    <span className="text-xs text-slate-400 dark:text-zinc-500 p-1">No se encontraron ejercicios</span>
                  ) : (
                    filteredLibrary.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleAddExerciseToRoutine(ex)}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-amber-500 dark:hover:text-black text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs group"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400 group-hover:text-inherit" />
                        <span>{ex.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 group-hover:text-inherit font-sans">({ex.target})</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Routine Exercise Rows */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Ejercicios Asignados para {selectedDay} ({currentExercises.length})
                </h4>
                {currentExercises.length === 0 && (
                  <span className="text-xs text-slate-400 dark:text-zinc-500">Agrega ejercicios usando el buscador de arriba</span>
                )}
              </div>

              <div className="space-y-2.5">
                {currentExercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="p-3.5 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200/90 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-amber-400 text-xs font-black flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-zinc-700">
                        {idx + 1}
                      </span>
                      <div className="min-w-[180px]">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{ex.name}</h5>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-500 block">Series x Reps</span>
                        <input
                          type="text"
                          value={ex.series}
                          onChange={(e) => handleUpdateExerciseRow(ex.id, "series", e.target.value)}
                          className="w-24 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white text-center font-bold focus:border-emerald-500 dark:focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-500 block">Descanso (s)</span>
                        <input
                          type="number"
                          value={ex.restSeconds}
                          onChange={(e) => handleUpdateExerciseRow(ex.id, "restSeconds", parseInt(e.target.value) || 60)}
                          className="w-16 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white text-center font-bold focus:border-emerald-500 dark:focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-500 block">Kg Sugeridos</span>
                        <input
                          type="number"
                          value={ex.prescribedWeight || 0}
                          onChange={(e) => handleUpdateExerciseRow(ex.id, "prescribedWeight", parseFloat(e.target.value) || 0)}
                          className="w-16 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white text-center font-bold focus:border-emerald-500 dark:focus:border-amber-500"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveExercise(ex.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors mt-3 md:mt-0"
                        title="Eliminar ejercicio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Guardar Rutina + Notificar por WhatsApp */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {saveSuccessNotice && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Rutina guardada en la PWA del alumno!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveRoutine}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-black font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 dark:shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Guardar Rutina ({selectedDay})</span>
                </button>

                {showWaButton && (
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 animate-pulse hover:scale-102 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Avisar por WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal: Nuevo Alumno */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-amber-500/20 text-emerald-600 dark:text-amber-400 border border-emerald-200/60 dark:border-amber-500/30">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Alta Manual de Alumno</h3>
              </div>
              <button
                onClick={() => setIsNewStudentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Nombre Completo del Alumno *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Marco Antonio Solís"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Número de WhatsApp (con código de país) *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+52 55 1234 5678"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Correo Electrónico (para Magic Link) *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="alumno@fitness.com"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 dark:focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 dark:shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Guardar y Enviar Magic Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
