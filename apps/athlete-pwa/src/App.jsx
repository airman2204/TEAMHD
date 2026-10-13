import React, { useState, useEffect } from 'react';
import AthleteView from './components/AthleteView';
import CheckoutModal from './components/CheckoutModal';
import { useTenantTheme } from './hooks/useTenantTheme';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { 
  INITIAL_STUDENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_SCHEDULED_APPOINTMENTS,
  INITIAL_STUDENT_ROUTINES
} from './mockData';
import { analyzeInjuryFeedback, logWorkoutSet } from './services/athleteService';

export default function App() {
  const [athlete, setAthlete] = useState(INITIAL_STUDENTS[0]);
  const [routines, setRoutines] = useState(INITIAL_STUDENT_ROUTINES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [appointments, setAppointments] = useState(INITIAL_SCHEDULED_APPOINTMENTS);
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Hook de Marca Blanca (consume los colores del coach)
  const theme = useTenantTheme('team-hd');

  // Cargar ejercicios de Supabase al iniciar
  useEffect(() => {
    async function loadCloudExercises() {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase.from('exercises').select('*');
        if (data && data.length > 0 && !error) {
          console.log(`[PWA] ${data.length} ejercicios sincronizados desde Supabase`);
        }
      } catch (e) {
        console.warn('[PWA] Cache local activo');
      }
    }
    loadCloudExercises();
  }, []);

  const handleUpdateAthlete = (updated) => {
    setAthlete(updated);
  };

  const handleUpdateRoutineExercise = async (day, exerciseId, fields) => {
    setRoutines((prev) => {
      const studentRoutines = { ...(prev[athlete.id] || {}) };
      const dayData = { ...(studentRoutines[day] || { exercises: [] }) };
      dayData.exercises = (dayData.exercises || []).map((ex) =>
        ex.id === exerciseId ? { ...ex, ...fields } : ex
      );
      studentRoutines[day] = dayData;
      return { ...prev, [athlete.id]: studentRoutines };
    });

    // Si completó o guardó kilos, guardar log en Supabase
    if (isSupabaseConfigured && supabase && (fields.completed !== undefined || fields.loggedWeight !== undefined)) {
      try {
        await logWorkoutSet({
          athleteId: '00000000-0000-0000-0000-000000000001',
          routineItemId: '00000000-0000-0000-0000-000000000001',
          actualWeight: fields.loggedWeight || 0,
          actualReps: 10,
          isCompleted: Boolean(fields.completed),
          feedbackNotes: fields.feedback || ''
        });
      } catch (err) {
        console.log('Log local guardado');
      }
    }
  };

  const handleAddToCart = (prod) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === prod.id);
      if (existing) {
        return prev.map((i) => i.id === prod.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...prod, qty: 1 }];
    });
  };

  const handleUpdateCartQty = (id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const handleRemoveCartItem = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => setCart([]);

  const handleCompleteOrder = (order) => {
    console.log("Orden procesada en Athlete PWA:", order);
  };

  // Enviar feedback al Coach y guardar alerta de Triage en Supabase Realtime
  const handleSendFeedbackToCoach = async (athleteId, name, exercise, note) => {
    const triage = analyzeInjuryFeedback(note);
    console.log("Feedback enviado con Triage IA:", { athleteId, exercise, note, triage });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('triage_alerts').insert([
          {
            coach_id: '00000000-0000-0000-0000-000000000000',
            athlete_id: '00000000-0000-0000-0000-000000000001',
            exercise_name: exercise,
            raw_feedback: note,
            severity: triage.severity === 'RIESGO_LESIÓN' ? 'RIESGO_ALTO' : triage.severity === 'FATIGA' ? 'FATIGA' : 'INFORMATIVA',
            ai_recommendation: triage.suggestion,
            is_reviewed: false
          }
        ]);
        console.log("✅ Alerta de Triage enviada a Supabase Realtime para el Coach");
      } catch (err) {
        console.log("Error insertando alerta en Supabase:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 w-full">
        <AthleteView
          athlete={athlete}
          onUpdateAthlete={handleUpdateAthlete}
          routines={routines[athlete.id] || {}}
          onUpdateRoutineExercise={handleUpdateRoutineExercise}
          appointments={appointments}
          products={products}
          cart={cart}
          onAddToCart={handleAddToCart}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onSendFeedbackToCoach={handleSendFeedbackToCoach}
        />
      </main>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveCartItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        athlete={athlete}
        onCompleteOrder={handleCompleteOrder}
      />
    </div>
  );
}
