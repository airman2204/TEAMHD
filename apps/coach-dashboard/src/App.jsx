import React, { useState, useEffect } from 'react';
import CoachDashboard from './components/CoachDashboard';
import { supabase, isSupabaseConfigured } from './lib/supabase';
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
  const [isDbConnected, setIsDbConnected] = useState(isSupabaseConfigured);

  // 1. CARGA INICIAL DESDE SUPABASE
  useEffect(() => {
    async function loadCloudData() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        // Cargar catálogo de ejercicios desde Supabase
        const { data: exercisesData, error: exError } = await supabase
          .from('exercises')
          .select('*')
          .order('name');
        
        if (exercisesData && exercisesData.length > 0 && !exError) {
          setExerciseLibrary(exercisesData.map(e => ({
            id: e.id,
            name: e.name,
            target: e.muscle_group,
            videoUrl: e.video_url,
            tips: (e.form_cues || []).join('. ')
          })));
        }

        // Cargar alertas en vivo de Supabase
        const { data: alertsData, error: alError } = await supabase
          .from('triage_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (alertsData && alertsData.length > 0 && !alError) {
          setFeedbacks(alertsData.map(a => ({
            id: a.id,
            studentName: a.exercise_name || "Atleta en Gym",
            date: "Tiempo Real",
            exercise: a.exercise_name,
            note: a.raw_feedback,
            severity: a.severity === 'RIESGO_ALTO' ? 'alert' : a.severity === 'RIESGO_MEDIO' ? 'warning' : 'normal',
            badge: a.severity,
            aiSuggestion: a.ai_recommendation
          })));
        }

        setIsDbConnected(true);
      } catch (err) {
        console.warn('Usando caché híbrido con Supabase:', err);
      }
    }

    loadCloudData();

    // 2. ESCUCHAR ALERTAS DE TRIAGE EN TIEMPO REAL (SUPABASE REALTIME)
    if (supabase && isSupabaseConfigured) {
      const channel = supabase
        .channel('triage_alerts_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'triage_alerts' }, (payload) => {
          const newAlert = payload.new;
          setFeedbacks(prev => [
            {
              id: newAlert.id,
              studentName: "Atleta en vivo",
              date: "Recién llegado",
              exercise: newAlert.exercise_name,
              note: newAlert.raw_feedback,
              severity: newAlert.severity === 'RIESGO_ALTO' ? 'alert' : 'warning',
              badge: newAlert.severity,
              aiSuggestion: newAlert.ai_recommendation
            },
            ...prev
          ]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  const handleAddStudent = async (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
    setRoutines((prev) => ({
      ...prev,
      [newStudent.id]: {
        "Lun": { dayTitle: "Evaluación Inicial", supplementPrescription: "Creatina 5g", exercises: [] }
      }
    }));

    // Sincronizar en Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('athletes').insert([
          {
            id: newStudent.id.startsWith('std-') ? undefined : newStudent.id,
            coach_id: '00000000-0000-0000-0000-000000000000', // Coach default
            full_name: newStudent.name,
            phone: newStudent.phone,
            goal: newStudent.goal,
            injuries_notes: newStudent.injuries
          }
        ]);
      } catch (e) {
        console.log('Sincronizado localmente', e);
      }
    }
  };

  const handleSaveRoutineDay = async (studentId, day, dayData) => {
    setRoutines((prev) => {
      const studentRoutines = { ...(prev[studentId] || {}) };
      studentRoutines[day] = dayData;
      return { ...prev, [studentId]: studentRoutines };
    });

    // Sincronizar rutina en Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('routines').upsert({
          athlete_id: studentId.startsWith('std-') ? undefined : studentId,
          day_of_week: day,
          session_title: dayData.dayTitle,
          supplementation_notes: dayData.supplementPrescription
        }, { onConflict: 'athlete_id,day_of_week' });
      } catch (e) {
        console.log('Rutina guardada localmente y en caché', e);
      }
    }
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
          <span className="text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-2 shadow-sm shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400">Supabase Cloud: Conectado</span>
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
