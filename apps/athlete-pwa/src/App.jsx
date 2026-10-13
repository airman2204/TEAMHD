import React, { useState, useEffect } from 'react';
import AthleteView from './components/AthleteView';
import AthleteLogin from './components/AthleteLogin';
import ChangePasswordModal from './components/ChangePasswordModal';
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

const ATHLETE_SESSION_KEY = 'athlete_active_session_token';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const [athlete, setAthlete] = useState(null);
  const [routines, setRoutines] = useState(INITIAL_STUDENT_ROUTINES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [appointments, setAppointments] = useState(INITIAL_SCHEDULED_APPOINTMENTS);
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Hook de Marca Blanca
  const theme = useTenantTheme('app-gym');

  // 1. VERIFICAR SESIÓN ACTIVA Y CONTROL DE CONCURRENCIA (1 SESIÓN VIVA)
  useEffect(() => {
    let isMounted = true;

    async function verifyAthleteSession() {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) setIsAuthChecking(false);
        return;
      }

      // Timeout de seguridad: si Supabase tarda más de 2.5 segundos, pasar a login sin congelar la app
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Timeout de verificación de sesión alcanzado. Pasando a login.');
          setIsAuthChecking(false);
        }
      }, 2500);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeoutId);

        if (session && session.user && isMounted) {
          const localToken = localStorage.getItem(ATHLETE_SESSION_KEY);
          const serverToken = session.user.user_metadata?.active_session_token;

          if (serverToken && localToken && serverToken !== localToken) {
            console.warn('Sesión de atleta expirada: se inició sesión en otro dispositivo.');
            await supabase.auth.signOut();
            localStorage.removeItem(ATHLETE_SESSION_KEY);
            setCurrentUser(null);
            setAthlete(null);
          } else {
            setCurrentUser(session.user);
            setMustChangePassword(Boolean(session.user.user_metadata?.must_change_password));
            await loadAthleteProfile(session.user);
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Error verificando sesión de atleta:', err);
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    }

    verifyAthleteSession();

    const { data: authListener } = supabase?.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAthlete(null);
        localStorage.removeItem(ATHLETE_SESSION_KEY);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
        setMustChangePassword(Boolean(session.user.user_metadata?.must_change_password));
        await loadAthleteProfile(session.user);
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  // Cargar perfil del atleta desde Supabase
  const loadAthleteProfile = async (authUser) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data && !error) {
        setAthlete({
          id: data.id,
          name: data.full_name,
          email: authUser.email,
          phone: data.phone,
          weight: data.weight_kg || 70,
          height: data.height_cm || 170,
          goal: data.goal || 'Hipertrofia',
          injuries: data.injuries_notes || 'Sin lesiones',
          avatar: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          coachNotes: 'Prescripción activa en App Gym.'
        });

        // Cargar rutinas de este atleta
        const { data: routinesData } = await supabase
          .from('routines')
          .select('*')
          .eq('athlete_id', data.id);

        if (routinesData && routinesData.length > 0) {
          const mappedRoutines = {};
          routinesData.forEach(r => {
            mappedRoutines[r.day_of_week] = {
              dayTitle: r.session_title,
              supplementPrescription: r.supplementation_notes,
              exercises: []
            };
          });
          setRoutines(prev => ({ ...prev, [data.id]: mappedRoutines }));
        }
      } else {
        // Fallback perfil basado en Auth User
        setAthlete({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Atleta',
          email: authUser.email,
          phone: '+52 55 0000 0000',
          weight: 70,
          height: 170,
          goal: 'Hipertrofia',
          injuries: 'Sin lesiones',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          coachNotes: 'Plan en proceso.'
        });
      }
    } catch (e) {
      console.warn('Error cargando perfil:', e);
    }
  };

  // LOGIN HANDLER: Valida credenciales y fuerza 1 sola sesión activa
  const handleLogin = async (email, password, rememberMe) => {
    if (!supabase) throw new Error('Servicio de conexión no disponible.');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    // Token único de dispositivo
    const newSessionToken = `sess_athlete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await supabase.auth.updateUser({
      data: {
        active_session_token: newSessionToken,
        last_login_at: new Date().toISOString()
      }
    });

    localStorage.setItem(ATHLETE_SESSION_KEY, newSessionToken);
    setCurrentUser(data.user);
    setMustChangePassword(Boolean(data.user.user_metadata?.must_change_password));
    await loadAthleteProfile(data.user);
  };

  // LOGOUT HANDLER
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(ATHLETE_SESSION_KEY);
    setCurrentUser(null);
    setAthlete(null);
  };

  // CAMBIO DE CONTRASEÑA OBLIGATORIO O VOLUNTARIO
  const handlePasswordChanged = async (newPassword) => {
    if (!supabase) return;

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
      data: {
        must_change_password: false,
        password_updated_at: new Date().toISOString()
      }
    });

    if (error) {
      throw new Error(error.message || 'Error al cambiar contraseña.');
    }

    setMustChangePassword(false);
    setIsChangePasswordModalOpen(false);
  };

  const handleUpdateAthlete = (updated) => {
    setAthlete(updated);
  };

  const handleUpdateRoutineExercise = async (day, exerciseId, fields) => {
    if (!athlete) return;

    setRoutines((prev) => {
      const studentRoutines = { ...(prev[athlete.id] || {}) };
      const dayData = { ...(studentRoutines[day] || { exercises: [] }) };
      dayData.exercises = (dayData.exercises || []).map((ex) =>
        ex.id === exerciseId ? { ...ex, ...fields } : ex
      );
      studentRoutines[day] = dayData;
      return { ...prev, [athlete.id]: studentRoutines };
    });

    if (isSupabaseConfigured && supabase && (fields.completed !== undefined || fields.loggedWeight !== undefined)) {
      try {
        await logWorkoutSet({
          athleteId: athlete.id,
          routineItemId: exerciseId,
          actualWeight: fields.loggedWeight || 0,
          actualReps: 10,
          isCompleted: Boolean(fields.completed),
          feedbackNotes: fields.feedback || ''
        });
      } catch (err) {
        console.log('Log guardado');
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
    console.log("Orden procesada en App Gym:", order);
  };

  // Enviar feedback al Coach y guardar alerta en Supabase
  const handleSendFeedbackToCoach = async (athleteId, name, exercise, note) => {
    const triage = analyzeInjuryFeedback(note);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('coach_alerts').insert([
          {
            coach_id: 'c3cf10eb-2358-4b0b-820b-b0d3413a56aa',
            athlete_id: athleteId,
            exercise_name: exercise,
            feedback_text: note,
            severity: triage.severity === 'RIESGO_LESIÓN' ? 'alert' : 'normal',
            ai_triage_suggestion: triage.suggestion,
            is_read: false
          }
        ]);
      } catch (err) {
        console.log("Error insertando alerta:", err);
      }
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-3">Validando sesión de App Gym...</span>
      </div>
    );
  }

  // Si no ha iniciado sesión, mostrar pantalla de Login de Atleta
  if (!currentUser) {
    return <AthleteLogin onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      <main className="flex-1 w-full">
        {athlete && (
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
            onLogout={handleLogout}
            onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
          />
        )}
      </main>

      {/* Modal obligatorio para cambio de contraseña si es su primer ingreso */}
      {mustChangePassword && (
        <ChangePasswordModal
          required={true}
          onPasswordChanged={handlePasswordChanged}
        />
      )}

      {/* Modal voluntario para cambio de contraseña desde el perfil */}
      {isChangePasswordModalOpen && !mustChangePassword && (
        <ChangePasswordModal
          required={false}
          onPasswordChanged={handlePasswordChanged}
          onCancel={() => setIsChangePasswordModalOpen(false)}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveCartItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        athlete={athlete || INITIAL_STUDENTS[0]}
        onCompleteOrder={handleCompleteOrder}
      />
    </div>
  );
}

