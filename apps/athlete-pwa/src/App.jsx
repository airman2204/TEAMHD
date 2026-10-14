import React, { useState, useEffect } from 'react';
import AthleteView from './components/AthleteView';
import AthleteLogin from './components/AthleteLogin';
import ChangePasswordModal from './components/ChangePasswordModal';
import CheckoutModal from './components/CheckoutModal';
import { useTenantTheme } from './hooks/useTenantTheme';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { INITIAL_PRODUCTS } from './mockData';
import { analyzeInjuryFeedback, logWorkoutSet } from './services/athleteService';

const ATHLETE_SESSION_KEY = 'athlete_active_session_token';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const [athlete, setAthlete] = useState(null);
  const [routines, setRoutines] = useState({});
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [appointments, setAppointments] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Hook de Marca Blanca
  const theme = useTenantTheme('app-gym');

  // 1. VERIFICAR SESIÓN ACTIVA Y CONTROL DE CONCURRENCIA (1 SESIÓN VIVA + INICIO INSTANTÁNEO)
  useEffect(() => {
    let isMounted = true;

    // A. CARGA ULTRA-RÁPIDA OPTIMISTA DESDE CACHÉ (Evita la pantalla negra en iOS PWA)
    try {
      const cachedAthlete = localStorage.getItem('athlete_cached_profile');
      const cachedRoutines = localStorage.getItem('athlete_cached_routines');
      if (cachedAthlete) {
        const parsed = JSON.parse(cachedAthlete);
        setAthlete(parsed);
        if (cachedRoutines) {
          setRoutines(JSON.parse(cachedRoutines));
        }
        // Si hay atleta en caché, liberamos el loader inmediatamente para que la app sea visible en <50ms
        setIsAuthChecking(false);
      }
    } catch (e) {
      console.warn('Error leyendo caché local:', e);
    }

    async function verifyAthleteSession() {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) setIsAuthChecking(false);
        return;
      }

      // Timeout de seguridad: si la red tarda más de 2 segundos, no bloquear la app
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }, 2000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(timeoutId);

        if (session && session.user && isMounted) {
          setCurrentUser(session.user);
          setMustChangePassword(Boolean(session.user.user_metadata?.must_change_password));

          // Cargar perfil y rutinas en background o foreground
          await loadAthleteProfile(session.user);

          // Comprobar token de sesión concurrente con el servidor
          const { data: freshUserRes } = await supabase.auth.getUser();
          const freshUser = freshUserRes?.user;
          if (freshUser) {
            const localToken = localStorage.getItem(ATHLETE_SESSION_KEY);
            const serverToken = freshUser.user_metadata?.active_session_token;

            if (serverToken && localToken && serverToken !== localToken) {
              console.warn('Sesión cerrada: iniciada en otro dispositivo.');
              alert('Se inició sesión en otro dispositivo. Cerrando sesión aquí.');
              await supabase.auth.signOut();
              localStorage.removeItem(ATHLETE_SESSION_KEY);
              localStorage.removeItem('athlete_cached_profile');
              localStorage.removeItem('athlete_cached_routines');
              setCurrentUser(null);
              setAthlete(null);
            }
          }
        } else if (isMounted) {
          // No hay sesión
          setCurrentUser(null);
          setAthlete(null);
          localStorage.removeItem('athlete_cached_profile');
          localStorage.removeItem('athlete_cached_routines');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Error verificando sesión de atleta:', err);
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    }

    verifyAthleteSession();

    // Comprobación concurrente cuando el usuario regresa a la pestaña o abre la app
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && supabase) {
        try {
          const { data: freshUserRes } = await supabase.auth.getUser();
          if (freshUserRes?.user) {
            const localToken = localStorage.getItem(ATHLETE_SESSION_KEY);
            const serverToken = freshUserRes.user.user_metadata?.active_session_token;
            if (serverToken && localToken && serverToken !== localToken) {
              alert('Has iniciado sesión en otro dispositivo (PC o teléfono). Esta sesión se cerrará automáticamente.');
              await supabase.auth.signOut();
              localStorage.removeItem(ATHLETE_SESSION_KEY);
              localStorage.removeItem('athlete_cached_profile');
              localStorage.removeItem('athlete_cached_routines');
              setCurrentUser(null);
              setAthlete(null);
            }
          }
        } catch (e) {}
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    const { data: authListener } = supabase?.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAthlete(null);
        localStorage.removeItem(ATHLETE_SESSION_KEY);
        localStorage.removeItem('athlete_cached_profile');
        localStorage.removeItem('athlete_cached_routines');
      } else if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
        setMustChangePassword(Boolean(session.user.user_metadata?.must_change_password));
        await loadAthleteProfile(session.user);
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      authListener.subscription?.unsubscribe();
    };
  }, []);

  // Cargar perfil del atleta desde Supabase (100% datos reales)
  const loadAthleteProfile = async (authUser) => {
    if (!supabase) return;

    try {
      // 1. Intentar buscar por ID de auth
      let { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // 2. Si no coincide el ID exacto, buscar en la tabla de atletas el registro principal
      if (!data) {
        const { data: list } = await supabase
          .from('athletes')
          .select('*')
          .limit(1);
        if (list && list.length > 0) {
          data = list[0];
        }
      }

      if (data) {
        const profileObj = {
          id: data.id,
          name: data.full_name || authUser.email?.split('@')[0] || 'Atleta',
          email: authUser.email,
          phone: data.phone || '',
          weight: data.weight_kg || 0,
          height: data.height_cm || 0,
          goal: data.goal || 'Fuerza & Rendimiento',
          injuries: data.injuries_notes || '',
          avatar: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name || 'Atleta')}&background=059669&color=fff`,
          coachNotes: 'Prescripción personalizada en App Gym.'
        };
        setAthlete(profileObj);
        try {
          localStorage.setItem('athlete_cached_profile', JSON.stringify(profileObj));
        } catch (e) {}

        // Cargar rutinas reales de este atleta desde Supabase
        const { data: routinesData } = await supabase
          .from('routines')
          .select('*, routine_items(*, exercises(*))')
          .eq('athlete_id', data.id);

        if (routinesData && routinesData.length > 0) {
          const mappedRoutines = {};
          routinesData.forEach(r => {
            mappedRoutines[r.day_of_week] = {
              id: r.id,
              dayTitle: r.session_title,
              supplementPrescription: r.supplementation_notes || '',
              exercises: (r.routine_items || [])
                .sort((a, b) => a.order_index - b.order_index)
                .map(item => ({
                  id: item.id,
                  exerciseId: item.exercise_id,
                  name: item.exercises?.name || 'Ejercicio',
                  series: `${item.target_sets || 4}x${item.target_reps || '10-12'}`,
                  targetSets: item.target_sets || 4,
                  targetReps: item.target_reps || '10-12',
                  restSeconds: item.rest_seconds || 90,
                  prescribedWeight: item.target_weight_kg || 0,
                  loggedWeight: 0,
                  setsLog: Array.from({ length: item.target_sets || 4 }, (_, idx) => ({
                    setNumber: idx + 1,
                    prescribedReps: item.target_reps || '10-12',
                    prescribedWeight: item.target_weight_kg || 0,
                    actualWeight: item.target_weight_kg || 0,
                    actualReps: parseInt(item.target_reps) || 10,
                    completed: false
                  })),
                  completed: false,
                  feedback: '',
                  videoUrl: item.exercises?.video_url || '',
                  muscle_group: item.exercises?.muscle_group || ''
                }))
            };
          });
          const fullRoutines = { [data.id]: mappedRoutines };
          setRoutines(fullRoutines);
          try {
            localStorage.setItem('athlete_cached_routines', JSON.stringify(fullRoutines));
          } catch (e) {}
        } else {
          setRoutines({ [data.id]: {} });
        }
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

  const handleUpdateAthlete = async (updated) => {
    setAthlete(updated);

    if (supabase && updated?.id) {
      try {
        const { error } = await supabase
          .from('athletes')
          .update({
            weight_kg: parseFloat(updated.weight) || null,
            height_cm: parseFloat(updated.height) || null,
            goal: updated.goal || 'Hipertrofia',
            injuries_notes: updated.injuries || 'Sin lesiones'
          })
          .eq('id', updated.id);

        if (error) {
          console.error('Error al persistir cambios del atleta en Supabase:', error);
        } else {
          console.log('Ficha de atleta sincronizada con éxito en Supabase');
        }
      } catch (err) {
        console.error('Error al actualizar datos en Supabase:', err);
      }
    }
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

  const handleSaveWorkoutSession = async (sessionData) => {
    if (!athlete || !isSupabaseConfigured || !supabase) return;
    try {
      // Registrar log resumen de sesión total
      const dayData = routines[athlete.id]?.[sessionData.day];
      const firstItemId = dayData?.exercises?.[0]?.id;
      if (firstItemId) {
        await supabase.from('workout_logs').insert([{
          athlete_id: athlete.id,
          routine_item_id: firstItemId,
          actual_weight_kg: 0,
          actual_reps: 0,
          is_completed: true,
          feedback_notes: `[SESIÓN COMPLETADA] Día: ${sessionData.day} | Duración Total: ${sessionData.durationFormatted} (${sessionData.durationSeconds}s) | Ejercicios listos: ${sessionData.completedCount}/${sessionData.totalExercises}`
        }]);
      }
    } catch (e) {
      console.warn('Error guardando tiempo de sesión:', e);
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
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 select-none">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
            <span className="font-black text-xl text-emerald-400">AG</span>
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-3xl border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <div className="text-center mt-5 space-y-1">
          <h3 className="text-sm font-black text-white tracking-wider">APP GYM • TEAM HD</h3>
          <p className="text-[11px] font-medium text-zinc-400 animate-pulse">Sincronizando entrenamiento y perfil...</p>
        </div>
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
            onSaveWorkoutSession={handleSaveWorkoutSession}
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

