import { useQuery } from "@tanstack/react-query";
import { listTodayClasses } from "../api/academicsRepository";

export function useTodayClasses() {
  return useQuery({
    queryKey: ["today-classes"],
    queryFn: listTodayClasses,
  });
}
