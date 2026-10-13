/**
 * AI Routine Planner & Generator
 * Genera periodizaciones semanales completas de entrenamiento basadas en:
 * - Objetivos (Hipertrofia, Definición, Fuerza/Powerlifting, Recomposición)
 * - Frecuencia de días disponibles (3, 4, 5, 6 días)
 * - Nivel de experiencia (Principiante, Intermedio, Avanzado)
 * - Equipamiento disponible (Gym comercial, Mancuernas, Casa)
 * - Filtro preventivo de lesiones y dolores articulares
 */

// Ejercicios de alto riesgo para ciertas lesiones
const INJURY_CONTRAINDICATIONS = {
  lumbar: ['deadlift', 'squat', 'peso muerto', 'sentadilla con barra', 'good morning', 'buenos dias', 'bent over', 'remo con barra'],
  hombro: ['overhead press', 'press militar', 'behind the neck', 'tras nuca', 'upright row', 'remo al cuello', 'dips', 'fondos'],
  rodilla: ['leg extension', 'extension de piernas', 'jump squat', 'sissy squat', 'deep squat', 'sentadilla profunda'],
  codo: ['skull crusher', 'press frances', 'tricep extension', 'copa a dos manos', 'chin up']
};

/**
 * Normaliza las notas del alumno (detecta JSON o texto plano)
 */
export function parseAthleteNotes(rawNotes) {
  if (!rawNotes) {
    return {
      injuries: '',
      experience: 'Intermedio (1-3 años)',
      daysPerWeek: 4,
      equipment: 'Gimnasio Comercial Completo',
      sessionDuration: 60
    };
  }

  try {
    const parsed = JSON.parse(rawNotes);
    if (typeof parsed === 'object' && parsed !== null) {
      return {
        injuries: parsed.injuries || '',
        experience: parsed.experience || 'Intermedio (1-3 años)',
        daysPerWeek: parseInt(parsed.daysPerWeek) || 4,
        equipment: parsed.equipment || 'Gimnasio Comercial Completo',
        sessionDuration: parseInt(parsed.sessionDuration) || 60
      };
    }
  } catch (e) {
    // Es texto plano tradicional de lesiones
  }

  return {
    injuries: String(rawNotes),
    experience: 'Intermedio (1-3 años)',
    daysPerWeek: 4,
    equipment: 'Gimnasio Comercial Completo',
    sessionDuration: 60
  };
}

/**
 * Determina el split de entrenamiento según los días disponibles
 */
function getSplitStructure(daysCount) {
  const splits = {
    3: [
      { day: 'Lun', title: 'Fullbody A (Torso / Pierna Enfático)', muscles: ['Pecho / Pectoral', 'Espalda (Dorsales)', 'Cuádriceps', 'Abdomen / Core'] },
      { day: 'Mié', title: 'Fullbody B (Cadena Posterior & Hombro)', muscles: ['Espalda Media', 'Hombros (Deltoides)', 'Isquiosurales (Femoral)', 'Glúteos'] },
      { day: 'Vie', title: 'Fullbody C (Hipertrofia Global & Brazos)', muscles: ['Pecho / Pectoral', 'Espalda (Dorsales)', 'Bíceps', 'Tríceps', 'Cuádriceps'] }
    ],
    4: [
      { day: 'Lun', title: 'Torso A (Fuerza & Empuje)', muscles: ['Pecho / Pectoral', 'Espalda (Dorsales)', 'Hombros (Deltoides)', 'Tríceps'] },
      { day: 'Mar', title: 'Pierna A (Cuádriceps & Core)', muscles: ['Cuádriceps', 'Aductores', 'Pantorrillas / Gemelos', 'Abdomen / Core'] },
      { day: 'Jue', title: 'Torso B (Tracción & Volumen)', muscles: ['Espalda Media', 'Pecho / Pectoral', 'Hombros (Deltoides)', 'Bíceps'] },
      { day: 'Vie', title: 'Pierna B (Cadena Posterior & Glúteo)', muscles: ['Isquiosurales (Femoral)', 'Glúteos', 'Pantorrillas / Gemelos', 'Abdomen / Core'] }
    ],
    5: [
      { day: 'Lun', title: 'Push (Pecho, Hombro anterior/lateral & Tríceps)', muscles: ['Pecho / Pectoral', 'Hombros (Deltoides)', 'Tríceps'] },
      { day: 'Mar', title: 'Pull (Espalda, Deltoides posterior & Bíceps)', muscles: ['Espalda (Dorsales)', 'Espalda Media', 'Bíceps', 'Trapecios'] },
      { day: 'Mié', title: 'Legs (Cuádriceps, Isquios & Pantorrillas)', muscles: ['Cuádriceps', 'Isquiosurales (Femoral)', 'Glúteos', 'Pantorrillas / Gemelos'] },
      { day: 'Vie', title: 'Upper Body (Torso Hipertrofia Mixta)', muscles: ['Pecho / Pectoral', 'Espalda (Dorsales)', 'Hombros (Deltoides)', 'Bíceps', 'Tríceps'] },
      { day: 'Sáb', title: 'Lower Body & Core (Pierna Cadena Posterior & Abdomen)', muscles: ['Cuádriceps', 'Isquiosurales (Femoral)', 'Glúteos', 'Abdomen / Core'] }
    ],
    6: [
      { day: 'Lun', title: 'Push A (Pecho pesado, Hombro & Tríceps)', muscles: ['Pecho / Pectoral', 'Hombros (Deltoides)', 'Tríceps'] },
      { day: 'Mar', title: 'Pull A (Dorsales pesados & Bíceps)', muscles: ['Espalda (Dorsales)', 'Espalda Media', 'Bíceps'] },
      { day: 'Mié', title: 'Legs A (Enfoque Cuádriceps & Gemelos)', muscles: ['Cuádriceps', 'Aductores', 'Pantorrillas / Gemelos', 'Abdomen / Core'] },
      { day: 'Jue', title: 'Push B (Hombro lateral pesado, Pecho & Tríceps)', muscles: ['Pecho / Pectoral', 'Hombros (Deltoides)', 'Tríceps'] },
      { day: 'Vie', title: 'Pull B (Espalda media/alta & Bíceps)', muscles: ['Espalda Media', 'Espalda (Dorsales)', 'Bíceps', 'Trapecios'] },
      { day: 'Sáb', title: 'Legs B (Enfoque Isquios & Glúteos)', muscles: ['Isquiosurales (Femoral)', 'Glúteos', 'Pantorrillas / Gemelos', 'Abdomen / Core'] }
    ]
  };

  return splits[daysCount] || splits[4];
}

/**
 * Determina prescripción de series, repeticiones y descansos según objetivo y experiencia
 */
function getPrescriptionScheme(goal, experience) {
  const g = (goal || '').toLowerCase();
  const isExp = (experience || '').toLowerCase().includes('avanzado');

  if (g.includes('fuerza') || g.includes('powerlifting')) {
    return {
      compoundSeries: isExp ? '5x3-5' : '4x5',
      accessorySeries: '3x6-8',
      restCompound: 180,
      restAccessory: 120,
      supplement: 'Creatina Monohidrato 5g pre-entreno + Electrolitos intra-entreno para sostener potencia neuromuscular.'
    };
  }

  if (g.includes('definición') || g.includes('grasa')) {
    return {
      compoundSeries: '4x8-10',
      accessorySeries: '4x12-15',
      restCompound: 75,
      restAccessory: 60,
      supplement: 'Proteína Whey Isolate 30g post-entreno + Cafeína 200mg 30 min antes de la sesión para preservar masa magra en déficit.'
    };
  }

  if (g.includes('recomposición')) {
    return {
      compoundSeries: '4x6-8',
      accessorySeries: '3x10-12',
      restCompound: 90,
      restAccessory: 75,
      supplement: 'Creatina 5g diaria + Multivitamínico con Omega 3 para optimizar partición de nutrientes y recuperación muscular.'
    };
  }

  // Por defecto: Hipertrofia
  return {
    compoundSeries: isExp ? '4x8-10' : '3x10-12',
    accessorySeries: '4x10-12',
    restCompound: 90,
    restAccessory: 60,
    supplement: 'Creatina Monohidrato 5g + Proteína Whey 35g después del entrenamiento para maximizar síntesis proteica.'
  };
}

/**
 * Filtra ejercicios seguros descartando los que colisionen con las lesiones reportadas
 */
function isExerciseSafeForInjuries(exercise, injuriesText) {
  if (!injuriesText) return true;
  const injuryLower = injuriesText.toLowerCase();
  const nameLower = (exercise.name || '').toLowerCase();

  // Si tiene lesión en espalda baja / lumbar / hernias
  if (injuryLower.includes('lumbar') || injuryLower.includes('espalda baja') || injuryLower.includes('hernia') || injuryLower.includes('disco')) {
    if (exercise.muscle_group === 'Espalda Baja (Lumbar)') return false;
    if (INJURY_CONTRAINDICATIONS.lumbar.some(kw => nameLower.includes(kw))) return false;
  }

  // Si tiene lesión o molestia en hombro / manguito rotador
  if (injuryLower.includes('hombro') || injuryLower.includes('manguito') || injuryLower.includes('clavicula')) {
    if (INJURY_CONTRAINDICATIONS.hombro.some(kw => nameLower.includes(kw))) return false;
  }

  // Si tiene lesión en rodilla / menisco / ligamentos
  if (injuryLower.includes('rodilla') || injuryLower.includes('menisco') || injuryLower.includes('ligamento cruzado')) {
    if (INJURY_CONTRAINDICATIONS.rodilla.some(kw => nameLower.includes(kw))) return false;
  }

  // Si tiene lesión en codo / epicondilitis
  if (injuryLower.includes('codo') || injuryLower.includes('epicondilitis') || injuryLower.includes('tendinitis')) {
    if (INJURY_CONTRAINDICATIONS.codo.some(kw => nameLower.includes(kw))) return false;
  }

  return true;
}

/**
 * GENERADOR PRINCIPAL: Produce la semana completa de entrenamiento
 * @param {Object} athlete Ficha del alumno con objetivo, peso, estatura, lesiones
 * @param {Array} exerciseCatalog Catálogo completo de 150 ejercicios reales de Supabase
 * @returns {Object} Diccionario mapeado por día (Lun, Mar, Mié, etc.) con sus ejercicios seleccionados
 */
export function generateFullWeekRoutine(athlete, exerciseCatalog) {
  if (!athlete || !exerciseCatalog || exerciseCatalog.length === 0) {
    throw new Error('Se requiere la ficha del atleta y el catálogo de ejercicios de la base de datos.');
  }

  const profile = parseAthleteNotes(athlete.injuries || athlete.injuries_notes);
  const scheme = getPrescriptionScheme(athlete.goal, profile.experience);
  const splitDays = getSplitStructure(profile.daysPerWeek);

  // Filtrar catálogo quitando ejercicios contraindicados por sus lesiones
  const safeCatalog = exerciseCatalog.filter(ex => isExerciseSafeForInjuries(ex, profile.injuries));
  const safeLibrary = safeCatalog.length >= 20 ? safeCatalog : exerciseCatalog;

  const ALL_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const weekRoutine = {};

  // Inicializar días de descanso
  ALL_DAYS.forEach(day => {
    weekRoutine[day] = {
      dayTitle: "Descanso Activo / Recuperación",
      supplementPrescription: "Hidratación óptima (mínimo 3L de agua) + aporte de micronutrientes.",
      exercises: []
    };
  });

  const usedExerciseIds = new Set();

  // Generar cada día del split
  splitDays.forEach(session => {
    const dayExercises = [];

    // Por cada grupo muscular objetivo de esta sesión, elegir los mejores 1-2 ejercicios
    session.muscles.forEach((muscle, mIdx) => {
      const candidates = safeLibrary.filter(ex => ex.muscle_group === muscle && !usedExerciseIds.has(ex.id));
      const pool = candidates.length > 0 ? candidates : safeLibrary.filter(ex => ex.muscle_group === muscle);

      if (pool.length > 0) {
        // Tomar hasta 2 ejercicios si es grupo muscular principal, o 1 si es secundario
        const countToPick = session.muscles.length <= 3 ? 2 : 1;
        const picked = pool.slice(0, countToPick);

        picked.forEach((ex, pIdx) => {
          usedExerciseIds.add(ex.id);
          const isCompound = mIdx === 0 && pIdx === 0;

          dayExercises.push({
            id: ex.id,
            exerciseId: ex.id,
            name: ex.name,
            target: ex.muscle_group,
            series: isCompound ? scheme.compoundSeries : scheme.accessorySeries,
            restSeconds: isCompound ? scheme.restCompound : scheme.restAccessory,
            prescribedWeight: isCompound ? Math.round((athlete.weight || 70) * 0.7) : Math.round((athlete.weight || 70) * 0.4),
            loggedWeight: 0,
            completed: false,
            feedback: '',
            videoUrl: ex.videoUrl || ex.video_url || ''
          });
        });
      }
    });

    // Limitar de 4 a 6 ejercicios por día para no sobrecargar la sesión
    const finalExercises = dayExercises.slice(0, 6);

    let injuryNotice = '';
    if (profile.injuries && profile.injuries.trim()) {
      injuryNotice = ` [Adaptada: Protege ${profile.injuries.slice(0, 30)}...]`;
    }

    weekRoutine[session.day] = {
      dayTitle: `${session.title}${injuryNotice}`,
      supplementPrescription: scheme.supplement,
      exercises: finalExercises
    };
  });

  return {
    weekRoutine,
    appliedSplit: `${profile.daysPerWeek} días/semana • ${athlete.goal || 'Hipertrofia'} • ${profile.experience}`,
    injuriesConsidered: profile.injuries || 'Sin lesiones reportadas'
  };
}
