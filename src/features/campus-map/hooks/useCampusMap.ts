import { useQuery } from "@tanstack/react-query";
import { getCampusMap } from "../api/campusRepository";
import { blocks, edges } from "../mockData";

export function useCampusMap() {
  return useQuery({
    queryKey: ["campus-map"],
    queryFn: getCampusMap,
    initialData: { blocks, edges },
  });
}
