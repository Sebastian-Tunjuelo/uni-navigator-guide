import { useQuery } from "@tanstack/react-query";
import { listSubjects } from "../api/academicsRepository";

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: listSubjects,
  });
}
