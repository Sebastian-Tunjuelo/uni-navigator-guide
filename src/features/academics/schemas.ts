import { z } from "zod";

export const ClassEntrySchema = z.object({
  id: z.string().min(1),
  subject: z.string().min(1),
  room: z.string().min(1),
  block: z.string().min(1),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  day: z.number().int().min(1).max(7),
  color: z.string().min(1),
});

export const ActivitySchema = z.object({
  name: z.string().min(1),
  weight: z.number().min(0).max(100),
  grade: z.number().min(0).max(5).nullable(),
});

export const SubjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  teacher: z.string().min(1),
  current: z.number().min(0).max(5),
  activities: z.array(ActivitySchema),
});

export const ClassEntriesSchema = z.array(ClassEntrySchema);
export const SubjectsSchema = z.array(SubjectSchema);

export type Activity = z.infer<typeof ActivitySchema>;
export type ClassEntry = z.infer<typeof ClassEntrySchema>;
export type Subject = z.infer<typeof SubjectSchema>;
