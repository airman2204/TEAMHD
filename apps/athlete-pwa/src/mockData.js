// Datos iniciales limpios sin datos dummy de prueba
export const INITIAL_STUDENTS = [
  {
    id: "std-nuevo",
    name: "Nuevo Atleta",
    email: "atleta@teamhd.com",
    phone: "",
    weight: 70,
    height: 170,
    goal: "Hipertrofia",
    injuries: "",
    status: "Activo",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    coachNotes: "Comienza registrando tus cargas de entrenamiento."
  }
];

export const INITIAL_EXERCISE_LIBRARY = [];

export const INITIAL_PRODUCTS = [];

export const INITIAL_SCHEDULED_APPOINTMENTS = [];

export const INITIAL_STUDENT_ROUTINES = {
  "std-nuevo": {
    "Lun": { dayTitle: "Día de Inicio", supplementPrescription: "", exercises: [] },
    "Mar": { dayTitle: "Sesión Programada", supplementPrescription: "", exercises: [] },
    "Mié": { dayTitle: "Recuperación", supplementPrescription: "", exercises: [] },
    "Jue": { dayTitle: "Sesión Programada", supplementPrescription: "", exercises: [] },
    "Vie": { dayTitle: "Sesión Programada", supplementPrescription: "", exercises: [] },
    "Sáb": { dayTitle: "Sesión Programada", supplementPrescription: "", exercises: [] },
    "Dom": { dayTitle: "Descanso Total", supplementPrescription: "", exercises: [] }
  }
};

export const INITIAL_ORDERS = [];

export const INITIAL_FEEDBACKS = [];
