import { z } from "zod";

export const NewsItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["Académico", "Eventos", "Becas", "Bienestar"]),
  date: z.string().min(1),
  excerpt: z.string().min(1),
  emoji: z.string().min(1),
});

export const NewsItemsSchema = z.array(NewsItemSchema);

export type NewsItem = z.infer<typeof NewsItemSchema>;
