import { supabase } from "@/integrations/supabase/client";
import { news } from "../mockData";
import type { NewsItem } from "../schemas";
import { NewsItemsSchema } from "../schemas";

function toNewsItem(row: {
  id: string;
  title: string;
  category: string;
  date_label: string;
  excerpt: string;
  emoji: string;
}): NewsItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category as NewsItem["category"],
    date: row.date_label,
    excerpt: row.excerpt,
    emoji: row.emoji,
  };
}

export async function listNews() {
  try {
    const { data, error } = await supabase
      .from("news_items")
      .select("id,title,category,date_label,excerpt,emoji,published_at")
      .order("published_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return NewsItemsSchema.parse(data.map(toNewsItem));
    }
  } catch (error) {
    console.warn("Using mock news after Supabase read failed", error);
  }

  return NewsItemsSchema.parse(news);
}
