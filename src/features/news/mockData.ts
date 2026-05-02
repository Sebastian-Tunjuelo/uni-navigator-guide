import type { NewsItem } from "./schemas";

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
