import { profiles, type StudentProfile } from "@/data/mock";

const KEY = "uniguia.profileId";

export function getCurrentProfile(): StudentProfile {
  const id = localStorage.getItem(KEY);
  if (!id) return profiles[0];
  return profiles.find((p) => p.id === id) || profiles[0];
}

export function setCurrentProfile(id: string) {
  localStorage.setItem(KEY, id);
}

export function clearCurrentProfile() {
  localStorage.removeItem(KEY);
}
