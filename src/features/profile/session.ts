import { profiles, type StudentProfile } from "./mockData";

const KEY = "uniguia.profileId";

export function getCurrentProfile(): StudentProfile | null {
  const id = localStorage.getItem(KEY);
  if (!id) return null;
  return profiles.find((profile) => profile.id === id) || null;
}

export function setCurrentProfile(id: string) {
  localStorage.setItem(KEY, id);
}

export function clearCurrentProfile() {
  localStorage.removeItem(KEY);
}
