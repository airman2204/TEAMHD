import React, { useState } from 'react';
import CoachDashboard from './components/CoachDashboard';
import { 
  INITIAL_STUDENTS, 
  INITIAL_EXERCISE_LIBRARY, 
  INITIAL_PRODUCTS, 
  INITIAL_STUDENT_ROUTINES,
  INITIAL_FEEDBACKS
} from './mockData';
import { analyzeInjuryFeedback } from './services/athleteService';

export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [exerciseLibrary, setExerciseLibrary] = useState(INITIAL_EXERCISE_LIBRARY);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [routines, setRoutines] = useState(INITIAL_STUDENT_ROUTINES);
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACKS);

  const handleAddStudent = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
    setRoutines((prev) => ({
      ...prev,
      [newStudent.id]: {
        "Lun": { dayTitle: "Evaluación Inicial", supplementPrescription: "Creatina 5g", exercises: [] }
      }
    }));
  };

  const handleSaveRoutineDay = (studentId, day, dayData) => {
    setRoutines((prev) => {
      const studentRoutines = { ...(prev[studentId] || {}) };
      studentRoutines[day] = dayData;
      return { ...prev, [studentId]: studentRoutines };
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Coach Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-sm shadow-md shadow-amber-500/20">
            HD
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white flex items-center gap-1.5">
              <span>TEAM HD MUSCLE</span>
              <span className="text-zinc-600 font-normal">|</span>
              <span className="text-amber-400 font-semibold text-xs">Coach Web Desktop</span>
            </h1>
            <p className="text-[10px] text-zinc-400">Panel Central de Prescripción & Alertas en Vivo (Port 5173)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Realtime Live</span>
          </span>
        </div>
      </header>

      {/* Main Content: Coach Dashboard */}
      <main className="flex-1 w-full pb-10">
        <CoachDashboard
          students={students}
          onAddStudent={handleAddStudent}
          routines={routines}
          onSaveRoutineDay={handleSaveRoutineDay}
          exerciseLibrary={exerciseLibrary}
          products={products}
          feedbacks={feedbacks}
        />
      </main>
    </div>
  );
}
