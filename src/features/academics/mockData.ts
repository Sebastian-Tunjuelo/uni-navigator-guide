import type { Activity, ClassEntry, Subject } from "./schemas";

export const todayClasses: ClassEntry[] = [
  { id: "c1", subject: "Cálculo I", room: "Aula 302", block: "B", start: "08:00", end: "10:00", day: 1, color: "bg-primary-soft text-primary" },
  { id: "c2", subject: "Programación", room: "Lab 105", block: "C", start: "10:30", end: "12:30", day: 1, color: "bg-success-soft text-success" },
  { id: "c3", subject: "Inglés Técnico", room: "Aula 210", block: "A", start: "14:00", end: "15:30", day: 1, color: "bg-warning-soft text-warning" },
  { id: "c4", subject: "Comunicación", room: "Aula 401", block: "D", start: "16:00", end: "17:30", day: 1, color: "bg-accent text-accent-foreground" },
];

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
