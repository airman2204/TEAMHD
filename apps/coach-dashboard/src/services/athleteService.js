import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Invita un nuevo atleta mediante Magic Link (Sin contraseña)
 */
export async function inviteAthleteWithMagicLink({ email, fullName, phone, coachId }) {
  if (!isSupabaseConfigured) {
    console.warn('[Demo Mode] Supabase no configurado aún en .env.local. Simulando envío de Magic Link.');
    return {
      success: true,
      simulated: true,
      message: `Simulación: Magic Link generado y enviado a ${email}`
    };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        coach_id: coachId,
        role: 'athlete'
      },
      emailRedirectTo: `${window.location.origin}`
    }
  });

  if (error) {
    console.error('Error al invitar atleta con Magic Link:', error);
    throw error;
  }

  return { success: true, data };
}

/**
 * Guarda o actualiza un log de entrenamiento en la base de datos
 */
export async function logWorkoutSet({ athleteId, routineItemId, actualWeight, actualReps, isCompleted, feedbackNotes }) {
  if (!isSupabaseConfigured) {
    return { success: true, simulated: true };
  }

  const { data, error } = await supabase
    .from('workout_logs')
    .insert([
      {
        athlete_id: athleteId,
        routine_item_id: routineItemId,
        actual_weight_kg: actualWeight,
        actual_reps: actualReps,
        is_completed: isCompleted,
        feedback_notes: feedbackNotes
      }
    ]);

  if (error) throw error;
  return { success: true, data };
}

/**
 * Agente de Triage de Lesiones & Molestias en segundo plano
 * Evalúa el feedback del atleta, clasifica el riesgo y sugiere sustitutos
 */
export function analyzeInjuryFeedback(feedbackText) {
  if (!feedbackText) return { severity: 'normal', suggestion: null };

  const lower = feedbackText.toLowerCase();
  const highRiskKeywords = ['dolor agudo', 'crujido', 'pellizco', 'desgarro', 'hombro dislocado', 'no puedo apoyar', 'punzada'];
  const moderateRiskKeywords = ['molestia', 'dolor', 'tirón', 'codo', 'rodilla', 'manguito', 'lumbar', 'muñeca'];

  const isHighRisk = highRiskKeywords.some(kw => lower.includes(kw));
  const isModerateRisk = moderateRiskKeywords.some(kw => lower.includes(kw));

  if (isHighRisk) {
    return {
      severity: 'RIESGO_LESIÓN',
      badge: 'Alerta Crítica',
      suggestion: 'Suspender ejercicio inmediatamente. Sugerir cambio a máquina guiada o trabajo isométrico sin carga axial.'
    };
  }

  if (isModerateRisk) {
    return {
      severity: 'FATIGA',
      badge: 'Molestia Articular',
      suggestion: 'Monitorear rango de movimiento. Reducir carga 20% o sustituir con poleas para tensión constante.'
    };
  }

  return {
    severity: 'INFORMATIVA',
    badge: 'Progreso',
    suggestion: 'Feedback positivo / fatiga muscular regular. Mantener sobrecarga progresiva.'
  };
}
