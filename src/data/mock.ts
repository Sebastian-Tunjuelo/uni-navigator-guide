// Datos mock para la app universitaria UniGuía

export interface StudentProfile {
  id: string;
  name: string;
  code: string;
  program: string;
  semester: number;
  email: string;
  avatarColor: string; // tailwind class
  initials: string;
  validUntil: string;
}

export const profiles: StudentProfile[] = [
  {
    id: "u1",
    name: "Ana Torres",
    code: "20251234",
    program: "Ingeniería de Sistemas",
    semester: 1,
    email: "ana.torres@uni.edu",
    avatarColor: "bg-gradient-to-br from-rose-400 to-pink-500",
    initials: "AT",
    validUntil: "Dic 2026",
  },
  {
    id: "u2",
    name: "Carlos Méndez",
    code: "20255678",
    program: "Diseño Industrial",
    semester: 1,
    email: "carlos.mendez@uni.edu",
    avatarColor: "bg-gradient-to-br from-sky-400 to-indigo-500",
    initials: "CM",
    validUntil: "Dic 2026",
  },
  {
    id: "u3",
    name: "Lucía Ramírez",
    code: "20259876",
    program: "Psicología",
    semester: 1,
    email: "lucia.ramirez@uni.edu",
    avatarColor: "bg-gradient-to-br from-emerald-400 to-teal-500",
    initials: "LR",
    validUntil: "Dic 2026",
  },
  {
    id: "u4",
    name: "Diego Soto",
    code: "20254321",
    program: "Administración",
    semester: 1,
    email: "diego.soto@uni.edu",
    avatarColor: "bg-gradient-to-br from-amber-400 to-orange-500",
    initials: "DS",
    validUntil: "Dic 2026",
  },
];

export interface ClassEntry {
  id: string;
  subject: string;
  room: string;
  block: string; // id de bloque del mapa
  start: string; // "08:00"
  end: string;
  day: number; // 1=Lun ... 7=Dom
  color: string;
}

export const todayClasses: ClassEntry[] = [
  { id: "c1", subject: "Cálculo I", room: "Aula 302", block: "B", start: "08:00", end: "10:00", day: 1, color: "bg-primary-soft text-primary" },
  { id: "c2", subject: "Programación", room: "Lab 105", block: "C", start: "10:30", end: "12:30", day: 1, color: "bg-success-soft text-success" },
  { id: "c3", subject: "Inglés Técnico", room: "Aula 210", block: "A", start: "14:00", end: "15:30", day: 1, color: "bg-warning-soft text-warning" },
  { id: "c4", subject: "Comunicación", room: "Aula 401", block: "D", start: "16:00", end: "17:30", day: 1, color: "bg-accent text-accent-foreground" },
];

export interface Activity {
  name: string;
  weight: number; // % de la nota
  grade: number | null; // 0-5
}

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  current: number; // nota actual acumulada
  activities: Activity[];
}

export const subjects: Subject[] = [
  {
    id: "s1",
    name: "Cálculo I",
    teacher: "Prof. Martínez",
    current: 4.2,
    activities: [
      { name: "Quiz 1", weight: 10, grade: 4.5 },
      { name: "Parcial 1", weight: 25, grade: 4.0 },
      { name: "Talleres", weight: 15, grade: 4.3 },
      { name: "Parcial 2", weight: 25, grade: null },
      { name: "Examen final", weight: 25, grade: null },
    ],
  },
  {
    id: "s2",
    name: "Programación",
    teacher: "Prof. Gómez",
    current: 4.6,
    activities: [
      { name: "Proyecto 1", weight: 30, grade: 4.7 },
      { name: "Quizzes", weight: 20, grade: 4.5 },
      { name: "Proyecto final", weight: 50, grade: null },
    ],
  },
  {
    id: "s3",
    name: "Inglés Técnico",
    teacher: "Prof. Lee",
    current: 3.8,
    activities: [
      { name: "Speaking", weight: 25, grade: 4.0 },
      { name: "Writing", weight: 25, grade: 3.5 },
      { name: "Listening", weight: 25, grade: 3.9 },
      { name: "Reading", weight: 25, grade: null },
    ],
  },
  {
    id: "s4",
    name: "Comunicación",
    teacher: "Prof. Rivas",
    current: 4.4,
    activities: [
      { name: "Ensayo 1", weight: 30, grade: 4.5 },
      { name: "Exposición", weight: 30, grade: 4.3 },
      { name: "Examen final", weight: 40, grade: null },
    ],
  },
];

export interface NewsItem {
  id: string;
  title: string;
  category: "Académico" | "Eventos" | "Becas" | "Bienestar";
  date: string;
  excerpt: string;
  emoji: string;
}

export const news: NewsItem[] = [
  {
    id: "n1",
    title: "Inscripciones abiertas a semilleros de investigación",
    category: "Académico",
    date: "Hoy",
    excerpt: "Conoce los grupos disponibles y postula hasta el 15 de mayo.",
    emoji: "🔬",
  },
  {
    id: "n2",
    title: "Feria universitaria de bienvenida",
    category: "Eventos",
    date: "Mañana",
    excerpt: "Plaza central, 10:00 a.m. Música, comida y stands de clubes.",
    emoji: "🎉",
  },
  {
    id: "n3",
    title: "Convocatoria de becas de excelencia",
    category: "Becas",
    date: "2 días",
    excerpt: "Cubre hasta el 80% de la matrícula. Revisa los requisitos.",
    emoji: "🎓",
  },
  {
    id: "n4",
    title: "Talleres gratuitos de bienestar emocional",
    category: "Bienestar",
    date: "3 días",
    excerpt: "Cupo limitado. Inscríbete en el portal estudiantil.",
    emoji: "🌿",
  },
];


