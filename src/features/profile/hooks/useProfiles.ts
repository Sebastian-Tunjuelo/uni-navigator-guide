import { useQuery } from "@tanstack/react-query";
import { listProfiles } from "../api/profileRepository";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: listProfiles,
  });
}
