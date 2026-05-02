import { useQuery } from "@tanstack/react-query";
import { listNews } from "../api/newsRepository";

export function useNews() {
  return useQuery({
    queryKey: ["news"],
    queryFn: listNews,
  });
}
