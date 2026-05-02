import { useQuery } from "@tanstack/react-query";
import { getSubjectById } from "../api/academicsRepository";

export function useSubject(id: string | undefined) {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: () => getSubjectById(id!),
    enabled: Boolean(id),
  });
}
