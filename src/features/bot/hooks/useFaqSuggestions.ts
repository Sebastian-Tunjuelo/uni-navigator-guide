import { useQuery } from "@tanstack/react-query";
import { listFaqSuggestions } from "../api/botRepository";

export function useFaqSuggestions() {
  return useQuery({
    queryKey: ["faq-suggestions"],
    queryFn: listFaqSuggestions,
  });
}
