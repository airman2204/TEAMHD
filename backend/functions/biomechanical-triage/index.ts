// Supabase Edge Function: biomechanical-triage
// Desplegable en Supabase CLI con: supabase functions deploy biomechanical-triage

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record } = await req.json(); // Payload del Database Webhook (workout_logs)
    const feedbackNotes = record?.feedback_notes;

    if (!feedbackNotes || feedbackNotes.trim().length === 0) {
      return new Response(JSON.stringify({ message: "No feedback text to triage" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obtener datos del atleta y coach
    const { data: athlete } = await supabaseClient
      .from('athletes')
      .select('coach_id, full_name')
      .eq('id', record.athlete_id)
      .single();

    if (!athlete) throw new Error("Athlete not found");

    // Análisis Biomecánico & Clasificación de Riesgo
    const text = feedbackNotes.toLowerCase();
    let severity = 'INFORMATIVA';
    let recommendation = 'Feedback muscular normal. Mantener progresión de carga programada.';
    let substitutions = [];

    if (text.includes('dolor agudo') || text.includes('punzada') || text.includes('crujido') || text.includes('desgarro')) {
      severity = 'RIESGO_ALTO';
      recommendation = 'Suspender ejercicio de inmediato. Evitar carga axial sobre articulación afectada.';
      substitutions = ['Polea cruzada con rango controlado', 'Isométricos en banco declinado'];
    } else if (text.includes('molestia') || text.includes('pellizco') || text.includes('hombro') || text.includes('rodilla') || text.includes('lumbar')) {
      severity = 'RIESGO_MEDIO';
      recommendation = 'Reducir carga un 20% y controlar tempo excéntrico (3s). Sustituir si el dolor persiste.';
      substitutions = ['Variante con mancuernas agarre neutro', 'Máquina convergente guiada'];
    } else if (text.includes('fatiga') || text.includes('fallo') || text.includes('pesado')) {
      severity = 'FATIGA';
      recommendation = 'Fatiga acumulada alta. Sugerir descanso de 120s entre series y verificar hidratación.';
    }

    // Insertar en triage_alerts (provoca evento Supabase Realtime en el Coach Dashboard)
    const { data: alertData, error: alertError } = await supabaseClient
      .from('triage_alerts')
      .insert([
        {
          coach_id: athlete.coach_id,
          athlete_id: record.athlete_id,
          exercise_name: record.exercise_name || "Ejercicio en sesión",
          raw_feedback: feedbackNotes,
          severity,
          ai_recommendation: recommendation,
          suggested_substitutions: substitutions
        }
      ]);

    if (alertError) throw alertError;

    return new Response(JSON.stringify({ success: true, severity, recommendation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
