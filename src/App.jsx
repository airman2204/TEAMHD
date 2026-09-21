import React, { useState } from 'react';
import RoleSwitcher from './components/RoleSwitcher';
import AthleteView from './components/AthleteView';
import CoachDashboard from './components/CoachDashboard';
import StoreAdmin from './components/StoreAdmin';
import CheckoutModal from './components/CheckoutModal';

import { 
  INITIAL_STUDENTS, 
  INITIAL_EXERCISE_LIBRARY, 
  INITIAL_PRODUCTS, 
  INITIAL_SCHEDULED_APPOINTMENTS,
  INITIAL_STUDENT_ROUTINES,
  INITIAL_ORDERS,
  INITIAL_FEEDBACKS
} from './mockData';

export default function App() {
  // Global Role: 'athlete' | 'coach' | 'store'
  const [activeRole, setActiveRole] = useState('athlete');

  // Shared Reactive State
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [exerciseLibrary, setExerciseLibrary] = useState(INITIAL_EXERCISE_LIBRARY);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [appointments, setAppointments] = useState(INITIAL_SCHEDULED_APPOINTMENTS);
  const [routines, setRoutines] = useState(INITIAL_STUDENT_ROUTINES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [feedbacks, setFeedbacks] = useState(INITIAL_FEEDBACKS);

  // Active athlete in PWA
  const [activeAthleteId, setActiveAthleteId] = useState("std-1");
  const activeAthlete = students.find((s) => s.id === activeAthleteId) || students[0];

  // Cart for Athlete
  const [cart, setCart] = useState([
    { ...INITIAL_PRODUCTS[0], qty: 1 }
  ]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Handlers for Athlete View
  const handleUpdateAthlete = (updatedAthlete) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedAthlete.id ? updatedAthlete : s))
    );
  };

  const handleUpdateRoutineExercise = (day, exerciseId, fieldsToUpdate) => {
    setRoutines((prev) => {
      const studentRoutines = { ...(prev[activeAthleteId] || {}) };
      const dayData = { ...(studentRoutines[day] || { exercises: [] }) };
      const updatedExercises = (dayData.exercises || []).map((ex) =>
        ex.id === exerciseId ? { ...ex, ...fieldsToUpdate } : ex
      );
      dayData.exercises = updatedExercises;
      studentRoutines[day] = dayData;
      return { ...prev, [activeAthleteId]: studentRoutines };
    });
  };

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, qty: newQty } : item))
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Complete Checkout Order (descuenta stock y agrega orden a Store)
  const handleCompleteOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Descontar stock
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const itemOrdered = newOrder.items.find((i) => i.productId === prod.id || i.productName === prod.name);
        if (itemOrdered) {
          const newStock = Math.max(0, prod.stock - itemOrdered.qty);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );
  };

  // Send feedback from Gym directly to Coach
  const handleSendFeedbackToCoach = (studentId, studentName, exercise, note) => {
    const newFb = {
      id: `fb-${Date.now()}`,
      studentId,
      studentName,
      date: "Recién reportado",
      exercise,
      note,
      severity: note.toLowerCase().includes('dolor') || note.toLowerCase().includes('molestia') ? 'alert' : 'normal'
    };
    setFeedbacks((prev) => [newFb, ...prev]);
  };

  // Handlers for Coach Dashboard
  const handleAddStudent = (newStudent) => {
    setStudents((prev) => [...prev, newStudent]);
    // Inicializar rutinas vacías para el nuevo alumno
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

  // Handlers for Store Admin
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (productId, fieldsToUpdate) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...fieldsToUpdate } : p))
    );
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Floating Role Switcher */}
      <RoleSwitcher
        activeRole={activeRole}
        onChangeRole={setActiveRole}
      />

      {/* Main Viewport depending on selected role */}
      <main className="flex-1 w-full pb-10">
        {activeRole === 'athlete' && (
          <AthleteView
            athlete={activeAthlete}
            onUpdateAthlete={handleUpdateAthlete}
            routines={routines[activeAthleteId] || {}}
            onUpdateRoutineExercise={handleUpdateRoutineExercise}
            appointments={appointments}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
            onSendFeedbackToCoach={handleSendFeedbackToCoach}
          />
        )}

        {activeRole === 'coach' && (
          <CoachDashboard
            students={students}
            onAddStudent={handleAddStudent}
            routines={routines}
            onSaveRoutineDay={handleSaveRoutineDay}
            exerciseLibrary={exerciseLibrary}
            products={products}
            feedbacks={feedbacks}
          />
        )}

        {activeRole === 'store' && (
          <StoreAdmin
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveCartItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        athlete={activeAthlete}
        onCompleteOrder={handleCompleteOrder}
      />



    </div>
  );
}
