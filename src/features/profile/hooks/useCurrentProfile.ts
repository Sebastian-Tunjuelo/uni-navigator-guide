import { useQuery } from "@tanstack/react-query";
import { getCurrentProfile } from "../session";

export function useCurrentProfile() {
  return useQuery({
    queryKey: ["current-profile"],
    queryFn: getCurrentProfile,
  });
}
