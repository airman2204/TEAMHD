import React, { useState, useEffect } from 'react';
import CoachDashboard from './components/CoachDashboard';
import CoachLogin from './components/CoachLogin';
import { supabase, supabaseAdmin, isSupabaseConfigured } from './lib/supabase';
import { INITIAL_PRODUCTS } from './mockData';
import { analyzeInjuryFeedback } from './services/athleteService';
import ThemeToggle from './components/ThemeToggle';
import { LogOut, ShieldCheck, User } from 'lucide-react';

const COACH_SESSION_KEY = 'coach_active_session_token';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [students, setStudents] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [routines, setRoutines] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [isDbConnected, setIsDbConnected] = useState(isSupabaseConfigured);

  // 1. GESTIÓN DE SESIÓN ÚNICA & PERSISTENCIA (Seguridad)
  useEffect(() => {
    async function verifyExistingSession() {
      if (!isSupabaseConfigured || !supabase) {
        setIsAuthChecking(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const localToken = localStorage.getItem(COACH_SESSION_KEY);
          const serverToken = session.user.user_metadata?.active_session_token;

          // Si el token del navegador no coincide con el último emitido en el servidor, se invalida
          if (serverToken && localToken && serverToken !== localToken) {
            console.warn('Sesión caducada por inicio de sesión en otro dispositivo.');
            await supabase.auth.signOut();
            localStorage.removeItem(COACH_SESSION_KEY);
            setCurrentUser(null);
          } else {
            setCurrentUser(session.user);
          }
        }
      } catch (err) {
        console.error('Error al verificar sesión:', err);
      } finally {
        setIsAuthChecking(false);
      }
    }

    verifyExistingSession();

    // Listener de cambios de auth
    const { data: authListener } = supabase?.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem(COACH_SESSION_KEY);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setCurrentUser(session.user);
      }
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  // 2. CARGA DE DATOS TRAS AUTENTICACIÓN
  useEffect(() => {
    if (!currentUser) return;

    async function loadCloudData() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        // Cargar alumnos reales de Supabase vinculados a este Coach
        const { data: athletesData, error: athError } = await supabase
          .from('athletes')
          .select('*')
          .order('created_at', { ascending: false });

        if (athletesData && !athError) {
          setStudents(athletesData.map(a => ({
            id: a.id,
            name: a.full_name,
            email: a.email || `${a.phone}@atleta.gym`,
            phone: a.phone,
            weight: a.weight_kg || 70,
            height: a.height_cm || 170,
            goal: a.goal || 'Hipertrofia',
            injuries: a.injuries_notes || 'Sin lesiones',
            status: a.is_active ? 'Activo' : 'Inactivo',
            avatar: a.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            coachNotes: 'Evaluación registrada en App Coach.'
          })));
        }

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

        // Cargar feedback y logs en vivo de Supabase (de la tabla workout_logs)
        const { data: logsData, error: logError } = await supabase
          .from('workout_logs')
          .select('*, routine_items(*, exercises(*)), athletes(*)')
          .not('feedback_notes', 'is', null)
          .neq('feedback_notes', '')
          .order('logged_at', { ascending: false })
          .limit(10);

        if (logsData && logsData.length > 0 && !logError) {
          setFeedbacks(logsData.map(l => {
            const triage = analyzeInjuryFeedback(l.feedback_notes || '');
            return {
              id: l.id,
              studentName: l.athletes?.full_name || 'Atleta en Gimnasio',
              date: new Date(l.logged_at).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              exercise: l.routine_items?.exercises?.name || 'Ejercicio',
              note: l.feedback_notes,
              severity: triage.severity === 'RIESGO_LESIÓN' ? 'alert' : triage.severity === 'FATIGA' ? 'warning' : 'success',
              badge: triage.badge,
              aiSuggestion: triage.suggestion
            };
          }));
        }
        // Cargar rutinas existentes con sus ejercicios desde Supabase
        const { data: routinesData, error: routError } = await supabase
          .from('routines')
          .select('*, routine_items(*, exercises(*))');

        if (routinesData && !routError) {
          const mappedRoutines = {};
          routinesData.forEach(r => {
            if (!mappedRoutines[r.athlete_id]) {
              mappedRoutines[r.athlete_id] = {};
            }
            mappedRoutines[r.athlete_id][r.day_of_week] = {
              id: r.id,
              dayTitle: r.session_title,
              supplementPrescription: r.supplementation_notes || '',
              exercises: (r.routine_items || [])
                .sort((a, b) => a.order_index - b.order_index)
                .map(item => ({
                  id: item.id,
                  exerciseId: item.exercise_id,
                  name: item.exercises?.name || 'Ejercicio',
                  series: `${item.target_sets}x${item.target_reps}`,
                  restSeconds: item.rest_seconds || 90,
                  prescribedWeight: item.target_weight_kg || 0,
                  loggedWeight: 0,
                  completed: false,
                  feedback: '',
                  videoUrl: item.exercises?.video_url || ''
                }))
            };
          });
          setRoutines(mappedRoutines);
        }

        setIsDbConnected(true);
      } catch (err) {
        console.warn('Error al cargar datos de Supabase:', err);
      }
    }

    loadCloudData();

    // Suscripción Realtime para escuchar cambios en los atletas en vivo
    let channel = null;
    if (supabase) {
      channel = supabase
        .channel('athletes_realtime_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'athletes' },
          (payload) => {
            console.log('Cambio detectado en atletas:', payload);
            if (payload.eventType === 'UPDATE' && payload.new) {
              setStudents(prev => prev.map(s => {
                if (s.id === payload.new.id) {
                  return {
                    ...s,
                    name: payload.new.full_name || s.name,
                    phone: payload.new.phone || s.phone,
                    weight: payload.new.weight_kg !== null ? payload.new.weight_kg : s.weight,
                    height: payload.new.height_cm !== null ? payload.new.height_cm : s.height,
                    goal: payload.new.goal || s.goal,
                    injuries: payload.new.injuries_notes || s.injuries,
                    status: payload.new.is_active ? 'Activo' : 'Inactivo',
                    avatar: payload.new.avatar_url || s.avatar
                  };
                }
                return s;
              }));
            } else if (payload.eventType === 'INSERT' && payload.new) {
              loadCloudData();
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser]);

  // LOGIN HANDLER: Garantiza 1 sola sesión activa
  const handleLogin = async (email, password, rememberMe) => {
    if (!supabase) throw new Error('Servicio de autenticación no inicializado.');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }

    // Generar nuevo token único de sesión (Single Device Login)
    const newSessionToken = `sess_coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Registrar en Supabase auth metadata el nuevo token activo
    await supabase.auth.updateUser({
      data: {
        active_session_token: newSessionToken,
        last_login_at: new Date().toISOString()
      }
    });

    // Guardar en el navegador actual
    localStorage.setItem(COACH_SESSION_KEY, newSessionToken);
    setCurrentUser(data.user);
  };

  // LOGOUT HANDLER
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(COACH_SESSION_KEY);
    setCurrentUser(null);
  };

  // DAR DE ALTA ALUMNO: Genera cuenta con contraseña temporal y la envía
  const handleAddStudent = async (newStudentForm) => {
    const tempPassword = `GymPass${Math.floor(1000 + Math.random() * 9000)}!`;
    const coachId = currentUser?.id || 'c3cf10eb-2358-4b0b-820b-b0d3413a56aa';
    let createdAuthId = null;

    // 1. Si está disponible supabaseAdmin, registrar auth user o enviar invitación oficial
    if (supabaseAdmin) {
      try {
        // Primero intentamos crear el usuario con la contraseña temporal
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: newStudentForm.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: 'athlete',
            name: newStudentForm.name,
            must_change_password: true,
            temp_password: tempPassword
          }
        });

        if (authUser?.user) {
          createdAuthId = authUser.user.id;
          
          // Además, enviamos invitación formal por correo de Supabase
          try {
            await supabaseAdmin.auth.admin.inviteUserByEmail(newStudentForm.email, {
              data: {
                role: 'athlete',
                name: newStudentForm.name,
                temp_password: tempPassword
              }
            });
            console.log('Invitación por correo despachada a Supabase Auth');
          } catch (invErr) {
            console.log('Invitación por correo opcional:', invErr);
          }
        } else if (authErr) {
          console.warn('Aviso auth al crear atleta:', authErr.message);
          throw new Error(authErr.message);
        }
      } catch (err) {
        console.warn('Fallo creación auth atleta:', err);
        throw err;
      }
    }

    const studentRecordId = createdAuthId || `std-${Date.now()}`;

    // 2. Guardar en base de datos tabla athletes
    if (supabase && createdAuthId) {
      try {
        await supabase.from('athletes').insert([
          {
            id: createdAuthId,
            coach_id: coachId,
            full_name: newStudentForm.name,
            phone: newStudentForm.phone,
            goal: newStudentForm.goal || 'Hipertrofia',
            injuries_notes: newStudentForm.injuries || 'Ninguna reportada',
            avatar_url: newStudentForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          }
        ]);
      } catch (e) {
        console.error('Error insertando atleta en Supabase:', e);
      }
    }

    const newStudent = {
      id: studentRecordId,
      name: newStudentForm.name,
      email: newStudentForm.email,
      phone: newStudentForm.phone,
      weight: newStudentForm.weight || 70,
      height: newStudentForm.height || 170,
      goal: newStudentForm.goal || 'Hipertrofia',
      injuries: newStudentForm.injuries || 'Ninguna reportada',
      status: 'Activo',
      avatar: newStudentForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      coachNotes: 'Evaluación inicial pendiente en App Coach.',
      tempPassword: tempPassword // Guardada para mostrarla en el modal
    };

    setStudents(prev => [newStudent, ...prev]);
    return newStudent;
  };

  const handleSaveRoutineDay = async (studentId, day, dayData) => {
    setRoutines((prev) => {
      const studentRoutines = { ...(prev[studentId] || {}) };
      studentRoutines[day] = dayData;
      return { ...prev, [studentId]: studentRoutines };
    });

    if (isSupabaseConfigured && supabase && !studentId.startsWith('std-')) {
      try {
        const { data: savedRoutine, error: routErr } = await supabase.from('routines').upsert({
          athlete_id: studentId,
          day_of_week: day,
          session_title: dayData.dayTitle,
          supplementation_notes: dayData.supplementPrescription
        }, { onConflict: 'athlete_id,day_of_week' }).select().single();

        if (savedRoutine && !routErr) {
          // Eliminar items antiguos de esta rutina para sobreescribir con los nuevos
          await supabase.from('routine_items').delete().eq('routine_id', savedRoutine.id);

          // Si hay ejercicios añadidos por el coach, insertarlos vinculados
          if (dayData.exercises && dayData.exercises.length > 0) {
            const itemsToInsert = dayData.exercises.map((ex, idx) => {
              // Buscar exercise_id en el catalogo real si ex.id es temporal
              const realEx = exerciseLibrary.find(e => e.name.toLowerCase() === ex.name.toLowerCase() || e.id === ex.exerciseId);
              const exerciseId = realEx ? realEx.id : ex.exerciseId || ex.id;

              return {
                routine_id: savedRoutine.id,
                exercise_id: exerciseId,
                target_sets: parseInt(ex.series?.split('x')[0]) || 4,
                target_reps: ex.series?.split('x')[1] || '10-12',
                target_weight_kg: parseFloat(ex.prescribedWeight) || 0,
                rest_seconds: parseInt(ex.restSeconds) || 90,
                order_index: idx
              };
            });

            await supabase.from('routine_items').insert(itemsToInsert);
          }
        }
      } catch (e) {
        console.error('Error al guardar rutina completa en Supabase:', e);
      }
    }
  };

  const handleSaveFullWeekRoutine = async (studentId, weekRoutine) => {
    setRoutines((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        ...weekRoutine
      }
    }));

    if (isSupabaseConfigured && supabase && !studentId.startsWith('std-')) {
      try {
        for (const [day, dayData] of Object.entries(weekRoutine)) {
          const { data: savedRoutine } = await supabase.from('routines').upsert({
            athlete_id: studentId,
            day_of_week: day,
            session_title: dayData.dayTitle,
            supplementation_notes: dayData.supplementPrescription
          }, { onConflict: 'athlete_id,day_of_week' }).select().single();

          if (savedRoutine) {
            await supabase.from('routine_items').delete().eq('routine_id', savedRoutine.id);

            if (dayData.exercises && dayData.exercises.length > 0) {
              const itemsToInsert = dayData.exercises.map((ex, idx) => {
                const realEx = exerciseLibrary.find(e => e.name.toLowerCase() === ex.name.toLowerCase() || e.id === ex.exerciseId);
                const exerciseId = realEx ? realEx.id : ex.exerciseId || ex.id;

                return {
                  routine_id: savedRoutine.id,
                  exercise_id: exerciseId,
                  target_sets: parseInt(ex.series?.split('x')[0]) || 4,
                  target_reps: ex.series?.split('x')[1] || '10-12',
                  target_weight_kg: parseFloat(ex.prescribedWeight) || 0,
                  rest_seconds: parseInt(ex.restSeconds) || 90,
                  order_index: idx
                };
              });

              await supabase.from('routine_items').insert(itemsToInsert);
            }
          }
        }
        console.log('Semana completa de entrenamiento persistida con éxito en Supabase');
      } catch (err) {
        console.error('Error al guardar semana completa en Supabase:', err);
      }
    }
  };

  // Pantalla de carga mientras se verifica la sesión en el navegador
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-3">Validando sesión de App Coach...</span>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar pantalla de Login
  if (!currentUser) {
    return <CoachLogin onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Coach Header Bar (Marca Blanca App Coach) */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-emerald-500/20">
            AC
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>APP COACH</span>
              <span className="text-slate-300 dark:text-zinc-700 font-normal">|</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">Marca Blanca Pro</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Panel Administrativo de Prescripción & Alertas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>{currentUser.email}</span>
          </div>

          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 dark:bg-zinc-900 dark:hover:bg-red-950/40 dark:text-zinc-400 dark:hover:text-red-400 border border-slate-200/80 dark:border-zinc-800 transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content: Coach Dashboard */}
      <main className="flex-1 w-full pb-10">
        <CoachDashboard
          students={students}
          onAddStudent={handleAddStudent}
          routines={routines}
          onSaveRoutineDay={handleSaveRoutineDay}
          onSaveFullWeekRoutine={handleSaveFullWeekRoutine}
          exerciseLibrary={exerciseLibrary}
          products={products}
          feedbacks={feedbacks}
        />
      </main>
    </div>
  );
}

