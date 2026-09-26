export const INITIAL_STUDENTS = [
  {
    id: "std-1",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@fitmail.com",
    phone: "+52 55 4920 1823",
    weight: 78.5,
    height: 176,
    goal: "Hipertrofia",
    injuries: "Molestia leve en manguito rotador derecho al realizar press militar pesado.",
    status: "Activo",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    coachNotes: "Buen progreso en banco plano. Cuidar retracción escapular."
  },
  {
    id: "std-2",
    name: "Valeria Gómez",
    email: "valeria.g@gympro.com",
    phone: "+52 33 1184 9021",
    weight: 59.0,
    height: 164,
    goal: "Definición",
    injuries: "Tendinitis rotuliana controlada, evitar sentadillas profundas sin calentamiento previo.",
    status: "Activo",
    avatar: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80",
    coachNotes: "Plan de déficit moderado. Priorizar proteína."
  },
  {
    id: "std-3",
    name: "Héctor Ramírez",
    email: "hector.power@outlook.com",
    phone: "+52 81 2093 4511",
    weight: 84.2,
    height: 180,
    goal: "Hipertrofia",
    injuries: "Ninguna reportada.",
    status: "Activo",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    coachNotes: "Mesociclo de sobrecarga progresiva."
  }
];

export const INITIAL_EXERCISE_LIBRARY = [
  { id: "ex-1", name: "Press Plano con Barra", target: "Pecho / Tríceps", videoUrl: "https://www.youtube-nocookie.com/embed/rT7DgCr-3pg", tips: "Mantén retracción escapular y pies bien apoyados en el suelo. Baja la barra a la línea media del pecho." },
  { id: "ex-2", name: "Aperturas en Polea (Crossover)", target: "Pecho (Pectoral Mayor)", videoUrl: "https://www.youtube-nocookie.com/embed/taI4XduLpTk", tips: "Codos semiflexionados fijos. Concéntrate en apretar 1s en la contracción máxima concéntrica." },
  { id: "ex-3", name: "Fondos en Paralelas (Dips)", target: "Pecho Inferior / Tríceps", videoUrl: "https://www.youtube-nocookie.com/embed/2z8JmcrW-As", tips: "Inclina el torso 30° hacia adelante para mayor activación pectoral. Desciende con control." },
  { id: "ex-4", name: "Jalón al Pecho Agarre Neutro", target: "Espalda / Dorsales", videoUrl: "https://www.youtube-nocookie.com/embed/CAwf7n6Luuc", tips: "Inicia el movimiento deprimiendo las escápulas y lleva los codos hacia la cadera." },
  { id: "ex-5", name: "Remo con Mancuerna Unilateral", target: "Espalda / Dorsal", videoUrl: "https://www.youtube-nocookie.com/embed/pYcpY20QaE8", tips: "Columna neutra. Sube la mancuerna en arco hacia el bolsillo de la cadera." },
  { id: "ex-6", name: "Sentadilla Libre con Barra (Squat)", target: "Cuádriceps / Glúteos", videoUrl: "https://www.youtube-nocookie.com/embed/bEv6CCg2BC8", tips: "Fuerza distribuida en todo el pie. Rodillas alineadas con la punta de los pies y core activo." },
  { id: "ex-7", name: "Prensa Inclinada 45°", target: "Cuádriceps / Aductores", videoUrl: "https://www.youtube-nocookie.com/embed/IZxyjW7MPJQ", tips: "No bloquees las rodillas arriba por completo para mantener tensión continua." },
  { id: "ex-8", name: "Elevaciones Laterales con Mancuerna", target: "Hombro Lateral", videoUrl: "https://www.youtube-nocookie.com/embed/3VcKaXpzqRo", tips: "Ligera inclinación hacia adelante, levantar los codos dirigiendo el movimiento." },
  { id: "ex-9", name: "Curl de Bíceps en Banco Scott", target: "Bíceps Braquial", videoUrl: "https://www.youtube-nocookie.com/embed/soxrZlIl35U", tips: "Evita despegar los codos de la almohadilla y controla la fase excéntrica en 3 segundos." },
  { id: "ex-10", name: "Extensiones de Tríceps en Polea Alta", target: "Tríceps", videoUrl: "https://www.youtube-nocookie.com/embed/vB5OHsJ3EME", tips: "Codos pegados a los costados sin balanceo de hombros." }
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Proteína Isolate HD 100% WPI",
    brand: "Strength Fit Pro",
    category: "Proteína",
    price: 1399,
    stock: 18,
    flavor: "Vainilla Gourmet / 2kg",
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&auto=format&fit=crop&q=80",
    badge: "Más Vendido",
    description: "27g de proteína aislada por scoop, 0g azúcar, 0g carbohidratos. Máxima absorción post-entreno."
  },
  {
    id: "prod-2",
    name: "Creatina Creapure® Monohidrato",
    brand: "Strength Fit Pro",
    category: "Rendimiento",
    price: 689,
    stock: 26,
    flavor: "Unflavored / 500g (100 servicios)",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&auto=format&fit=crop&q=80",
    badge: "Pureza 99.9%",
    description: "Monohidrato de creatina de patente alemana Creapure®. Potencia ATP, fuerza y recuperación muscular."
  },
  {
    id: "prod-3",
    name: "Pre-Workout Blood Fire HD",
    brand: "Strength Fit Pro",
    category: "Pre-Entreno",
    price: 849,
    stock: 12,
    flavor: "Blueberry Blast / 300g",
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&auto=format&fit=crop&q=80",
    badge: "Energía Explosiva",
    description: "350mg cafeína anhidra, 3.2g beta-alanina, 6g citrulina malato para bombeo vascular brutal."
  },
  {
    id: "prod-4",
    name: "Intra-Workout EAA + Electrolitos",
    brand: "Strength Fit Pro",
    category: "Intra-Entreno",
    price: 749,
    stock: 8,
    flavor: "Sandía Refrescante / 450g",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80",
    badge: "Hidratación",
    description: "9 aminoácidos esenciales con agua de coco y minerales para entrenamientos de alta intensidad."
  }
];

export const INITIAL_SCHEDULED_APPOINTMENTS = [
  {
    id: "apt-1",
    title: "Check-in Mensual & Ajuste Calórico",
    coach: "Coach Dave / Team HD Muscle",
    date: "Jueves, 24 de Sep - 18:00 hrs",
    type: "online", // 'online' | 'presencial'
    location: "Google Meet HD",
    link: "https://meet.google.com/fit-team-hd",
    status: "Confirmada",
    athleteNote: "Revisar progreso en tren superior y fotos de control."
  },
  {
    id: "apt-2",
    title: "Técnica de Sentadilla & Test 1RM",
    coach: "Coach Dave / Team HD Muscle",
    date: "Sábado, 26 de Sep - 10:30 hrs",
    type: "presencial",
    location: "Gym Central - Zona Powerlifting (Piso 2)",
    link: null,
    status: "Agendada",
    athleteNote: "Llevar calzado plano y cinturón de levantamiento."
  }
];

export const INITIAL_STUDENT_ROUTINES = {
  "std-1": {
    "Lun": {
      dayTitle: "Torso Fuerza & Pectoral Mayor",
      supplementPrescription: "Creatina Creapure® 5g + Proteína Isolate 1 scoop post-entreno",
      exercises: [
        {
          id: "ex-1",
          name: "Press Plano con Barra",
          series: "4x8-10",
          restSeconds: 90,
          prescribedWeight: 80,
          loggedWeight: 82.5,
          completed: true,
          feedback: "Buena sensación en las 2 primeras series, en la última necesité apoyo.",
          videoUrl: "https://www.youtube-nocookie.com/embed/rT7DgCr-3pg"
        },
        {
          id: "ex-2",
          name: "Aperturas en Polea (Crossover)",
          series: "4x12-15",
          restSeconds: 60,
          prescribedWeight: 17.5,
          loggedWeight: 17.5,
          completed: false,
          feedback: "",
          videoUrl: "https://www.youtube-nocookie.com/embed/taI4XduLpTk"
        },
        {
          id: "ex-3",
          name: "Fondos en Paralelas (Dips)",
          series: "3x10-12 (Al fallo técnico)",
          restSeconds: 90,
          prescribedWeight: 0,
          loggedWeight: 0,
          completed: false,
          feedback: "",
          videoUrl: "https://www.youtube-nocookie.com/embed/2z8JmcrW-As"
        }
      ]
    },
    "Mar": {
      dayTitle: "Pierna Dominante Cuádriceps & Gemelo",
      supplementPrescription: "Pre-Workout Blood Fire HD 1 scoop 20 min antes",
      exercises: [
        {
          id: "ex-6",
          name: "Sentadilla Libre con Barra (Squat)",
          series: "4x8-10",
          restSeconds: 120,
          prescribedWeight: 100,
          loggedWeight: 100,
          completed: false,
          feedback: "",
          videoUrl: "https://www.youtube-nocookie.com/embed/bEv6CCg2BC8"
        },
        {
          id: "ex-7",
          name: "Prensa Inclinada 45°",
          series: "4x12",
          restSeconds: 90,
          prescribedWeight: 220,
          loggedWeight: 220,
          completed: false,
          feedback: "",
          videoUrl: "https://www.youtube-nocookie.com/embed/IZxyjW7MPJQ"
        }
      ]
    },
    "Mié": {
      dayTitle: "Descanso Activo / Movilidad & Cardio LISS",
      supplementPrescription: "Intra-Workout EAA 1 scoop con 750ml de agua",
      exercises: []
    },
    "Jue": {
      dayTitle: "Espalda Densidad & Deltoides Posterior",
      supplementPrescription: "Creatina Creapure® 5g en ayunas o post-sesión",
      exercises: [
        {
          id: "ex-4",
          name: "Jalón al Pecho Agarre Neutro",
          series: "4x10-12",
          restSeconds: 75,
          prescribedWeight: 65,
          loggedWeight: 65,
          completed: false,
          feedback: "",
          videoUrl: "https://www.youtube-nocookie.com/embed/CAwf7n6Luuc"
        },
        {
          id: "ex-5",
          name: "Remo con Mancuerna Unilateral",
          series: "3x10 cada brazo",
          restSeconds: 60,
          prescribedWeight: 32,
          loggedWeight: 32,
          completed: false,
          feedback: "",
          videoUrl: "https://www.youtube-nocookie.com/embed/pYcpY20QaE8"
        }
      ]
    },
    "Vie": {
      dayTitle: "Hombro 3D & Brazos Hipertrofia",
      supplementPrescription: "Pre-Workout Blood Fire HD + Isolate Whey",
      exercises: [
        {
          id: "ex-8",
          name: "Elevaciones Laterales con Mancuerna",
          series: "5x15 (Drop set en la última)",
          restSeconds: 60,
          prescribedWeight: 12,
          loggedWeight: 12,
          completed: false,
          feedback: "",
          videoUrl: "https://www.youtube-nocookie.com/embed/3VcKaXpzqRo"
        },
        {
          id: "ex-9",
          name: "Curl de Bíceps en Banco Scott",
          series: "3x12",
          restSeconds: 60,
          prescribedWeight: 25,
          loggedWeight: 25,
          completed: false,
          feedback: "",
          videoUrl: "https://www.youtube-nocookie.com/embed/soxrZlIl35U"
        }
      ]
    },
    "Sáb": {
      dayTitle: "Cadena Posterior & Isquios / Glúteo",
      supplementPrescription: "Creatina Creapure® 5g con carbohidratos",
      exercises: []
    },
    "Dom": {
      dayTitle: "Recuperación Total & Sauna",
      supplementPrescription: "Día libre de pre-entrenos. Mantener hidratación.",
      exercises: []
    }
  }
};

export const INITIAL_ORDERS = [
  {
    id: "ORD-9021",
    customerName: "Carlos Mendoza",
    customerPhone: "+52 55 4920 1823",
    items: [
      { productName: "Proteína Isolate HD 100% WPI", qty: 1, price: 1399 }
    ],
    deliveryMethod: "pickup", // 'pickup' | 'delivery'
    deliveryAddress: "Recoger en recepción con Coach Dave",
    subtotal: 1399,
    shippingFee: 0,
    total: 1399,
    status: "Listo para entrega", // 'Preparando' | 'Listo para entrega' | 'Entregado'
    date: "Hoy, 09:15 hrs"
  },
  {
    id: "ORD-9022",
    customerName: "Valeria Gómez",
    customerPhone: "+52 33 1184 9021",
    items: [
      { productName: "Creatina Creapure® Monohidrato", qty: 2, price: 689 },
      { productName: "Pre-Workout Blood Fire HD", qty: 1, price: 849 }
    ],
    deliveryMethod: "delivery",
    deliveryAddress: "Av. Providencia #1450, Int 4B, Guadalajara",
    subtotal: 2227,
    shippingFee: 150,
    total: 2377,
    status: "Preparando",
    date: "Ayer, 18:40 hrs"
  }
];

export const INITIAL_FEEDBACKS = [
  {
    id: "fb-1",
    studentId: "std-1",
    studentName: "Carlos Mendoza",
    date: "Hace 20 min",
    exercise: "Press Plano con Barra",
    note: "Terminé con 82.5 kg en la última serie. Sentí buena congestión pero ligera fatiga en tríceps para el bloqueo.",
    severity: "normal"
  },
  {
    id: "fb-2",
    studentId: "std-1",
    studentName: "Carlos Mendoza",
    date: "Ayer",
    exercise: "Hombro Militar",
    note: "Carlos reportó molestia leve en hombro derecho con mancuernas de 24kg. Sugiero cambiar a máquina guiada.",
    severity: "alert"
  },
  {
    id: "fb-3",
    studentId: "std-2",
    studentName: "Valeria Gómez",
    date: "Hace 2 días",
    exercise: "Sentadilla Libre",
    note: "Excelente movilidad hoy sin dolor en rodilla. Pude completar las 4 series con 60kg fluidos.",
    severity: "success"
  }
];
