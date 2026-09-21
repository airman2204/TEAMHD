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
  const handleCreateStudent = (e) => {
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

    onAddStudent(newStudent);
    setSelectedStudentId(newId);
    setIsNewStudentModalOpen(false);
    setMagicLinkNotice({
      name: newStudent.name,
      email: newStudent.email
    });
    setNewStudentForm({ name: "", phone: "", email: "" });
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
      
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">Team HD Muscle</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">Coach Portal Pro</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Panel de Control de Atletas & Rutinas</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewStudentModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Alumno</span>
          </button>
        </div>
      </div>

      {/* Magic Link Notice (Alerta Simulada) */}
      {magicLinkNotice && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/50 flex items-start justify-between shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-300">
                ¡Invitación enviada exitosamente con Magic Link!
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                Se ha despachado el correo de bienvenida y acceso inmediato a <strong>{magicLinkNotice.email}</strong> para el alumno <strong>{magicLinkNotice.name}</strong>.
              </p>
              <span className="text-[11px] font-mono text-zinc-400 block mt-1">
                Token link generado: https://teamhd.fit/access?token=magic_hd_{Date.now()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setMagicLinkNotice(null)}
            className="text-zinc-500 hover:text-zinc-300 p-1"
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
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                Alumnos Activos ({students.length})
              </h3>
            </div>

            <div className="space-y-2">
              {students.map((std) => {
                const isSelected = std.id === selectedStudentId;
                return (
                  <button
                    key={std.id}
                    onClick={() => setSelectedStudentId(std.id)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/30'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                        <img src={std.avatar} alt={std.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{std.name}</h4>
                        <span className="text-[11px] text-zinc-400 font-mono">{std.phone}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 rounded">
                            {std.goal}
                          </span>
                          <span className="text-[10px] text-zinc-500">{std.weight}kg</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Detailed Medical / Injury Badge */}
          {selectedStudent && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase text-orange-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Historial / Lesiones de {selectedStudent.name}
              </span>
              <p className="text-xs text-zinc-300 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 leading-relaxed">
                {selectedStudent.injuries || "Sin lesiones reportadas."}
              </p>
              <div className="text-[11px] text-zinc-400 flex justify-between">
                <span>Estatura: <strong>{selectedStudent.height} cm</strong></span>
                <span>Peso: <strong>{selectedStudent.weight} kg</strong></span>
              </div>
            </div>
          )}

          {/* Bandeja de Feedback & Alertas */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                Bandeja de Feedback & Alertas
              </h3>
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                Gym Live Feed
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                    fb.severity === 'alert'
                      ? 'bg-red-950/30 border-red-500/40 text-red-200'
                      : fb.severity === 'success'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1">
                      {fb.studentName}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{fb.date}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-400">
                    Ejercicio: {fb.exercise}
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    "{fb.note}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Routine Builder & WhatsApp Notification (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5">
            
            {/* Header: Student & Day Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Constructor de Rutina Personalizada
                </span>
                <h2 className="text-lg font-black text-white">
                  Rutina para: <span className="text-amber-400">{selectedStudent?.name}</span>
                </h2>
              </div>

              {/* Day Pills */}
              <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 overflow-x-auto">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedDay === d
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
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
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Enfoque del Día / Título de la Sesión
                </label>
                <input
                  type="text"
                  value={currentDayTitle}
                  onChange={(e) => setCurrentDayTitle(e.target.value)}
                  placeholder="Ej. Torso Fuerza, Pierna Cuádriceps..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Prescribir Suplemento vinculado a Strength Fit */}
              <div className="md:col-span-7">
                <label className="block text-xs font-semibold text-orange-400 mb-1 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5" />
                  Prescribir Suplemento (Strength Fit)
                </label>
                <div className="flex gap-2">
                  <select
                    value={currentSupplement}
                    onChange={(e) => setCurrentSupplement(e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-orange-500/40 rounded-xl text-xs font-medium text-zinc-200 focus:outline-none focus:border-orange-500"
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
            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  Buscador de Ejercicios (Biblioteca HD)
                </label>
                <span className="text-[10px] text-zinc-500">Haz clic en un ejercicio para agregarlo a la sesión</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar ejercicio por nombre o músculo (ej. Press, Pecho, Sentadilla...)"
                  value={exerciseSearchTerm}
                  onChange={(e) => setExerciseSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>

              {/* Search Results Pills */}
              {exerciseSearchTerm.trim() !== "" && (
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                  {filteredLibrary.length === 0 ? (
                    <span className="text-xs text-zinc-500 p-1">No se encontraron ejercicios</span>
                  ) : (
                    filteredLibrary.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleAddExerciseToRoutine(ex)}
                        className="px-2.5 py-1.5 bg-zinc-900 hover:bg-amber-500 hover:text-black text-zinc-300 border border-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all group"
                      >
                        <Plus className="w-3 h-3 text-amber-400 group-hover:text-black" />
                        <span>{ex.name}</span>
                        <span className="text-[10px] text-zinc-500 group-hover:text-zinc-900 font-sans">({ex.target})</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Routine Exercise Rows */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Ejercicios Asignados para {selectedDay} ({currentExercises.length})
                </h4>
                {currentExercises.length === 0 && (
                  <span className="text-xs text-zinc-500">Agrega ejercicios usando el buscador de arriba</span>
                )}
              </div>

              <div className="space-y-2">
                {currentExercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-zinc-800 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-[180px]">
                        <h5 className="text-xs font-bold text-white">{ex.name}</h5>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Series x Reps</span>
                        <input
                          type="text"
                          value={ex.series}
                          onChange={(e) => handleUpdateExerciseRow(ex.id, "series", e.target.value)}
                          className="w-24 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white text-center focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-500 block">Descanso (s)</span>
                        <input
                          type="number"
                          value={ex.restSeconds}
                          onChange={(e) => handleUpdateExerciseRow(ex.id, "restSeconds", parseInt(e.target.value) || 60)}
                          className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white text-center focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-zinc-500 block">Kg Sugeridos</span>
                        <input
                          type="number"
                          value={ex.prescribedWeight || 0}
                          onChange={(e) => handleUpdateExerciseRow(ex.id, "prescribedWeight", parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white text-center focus:border-amber-500"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveExercise(ex.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-3 md:mt-0"
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
            <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {saveSuccessNotice && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Rutina guardada en la PWA del alumno!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleSaveRoutine}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Guardar Rutina ({selectedDay})</span>
                </button>

                {showWaButton && (
                  <button
                    onClick={handleOpenWhatsApp}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 animate-pulse hover:scale-105 active:scale-95 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Alta Manual de Alumno</h3>
              </div>
              <button
                onClick={() => setIsNewStudentModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre Completo del Alumno *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Marco Antonio Solís"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Número de WhatsApp (con código de país) *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+52 55 1234 5678"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Correo Electrónico (para Magic Link) *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="alumno@fitness.com"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
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
