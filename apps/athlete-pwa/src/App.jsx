import React, { useState } from 'react';
import AthleteView from './components/AthleteView';
import CheckoutModal from './components/CheckoutModal';
import { useTenantTheme } from './hooks/useTenantTheme';
import { 
  INITIAL_STUDENTS, 
  INITIAL_PRODUCTS, 
  INITIAL_SCHEDULED_APPOINTMENTS,
  INITIAL_STUDENT_ROUTINES
} from './mockData';
import { analyzeInjuryFeedback } from './services/athleteService';

export default function App() {
  const [athlete, setAthlete] = useState(INITIAL_STUDENTS[0]);
  const [routines, setRoutines] = useState(INITIAL_STUDENT_ROUTINES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [appointments, setAppointments] = useState(INITIAL_SCHEDULED_APPOINTMENTS);
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Hook de Marca Blanca (consume los colores del coach)
  const theme = useTenantTheme('team-hd');

  const handleUpdateAthlete = (updated) => {
    setAthlete(updated);
  };

  const handleUpdateRoutineExercise = (day, exerciseId, fields) => {
    setRoutines((prev) => {
      const studentRoutines = { ...(prev[athlete.id] || {}) };
      const dayData = { ...(studentRoutines[day] || { exercises: [] }) };
      dayData.exercises = (dayData.exercises || []).map((ex) =>
        ex.id === exerciseId ? { ...ex, ...fields } : ex
      );
      studentRoutines[day] = dayData;
      return { ...prev, [athlete.id]: studentRoutines };
    });
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

  const handleSendFeedbackToCoach = (athleteId, name, exercise, note) => {
    const triage = analyzeInjuryFeedback(note);
    console.log("Feedback enviado con Triage IA:", { athleteId, exercise, note, triage });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-md mx-auto">
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
