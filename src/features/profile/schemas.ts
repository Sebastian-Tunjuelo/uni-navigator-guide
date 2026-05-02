import { z } from "zod";

export const StudentProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  program: z.string().min(1),
  semester: z.number().int().positive(),
  email: z.string().email(),
  avatarColor: z.string().min(1),
  initials: z.string().min(1),
  validUntil: z.string().min(1),
});

export const StudentProfilesSchema = z.array(StudentProfileSchema);

export type StudentProfile = z.infer<typeof StudentProfileSchema>;
