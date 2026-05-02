import { supabase } from "@/integrations/supabase/client";
import { profiles } from "../mockData";
import type { StudentProfile } from "../schemas";
import { StudentProfileSchema, StudentProfilesSchema } from "../schemas";

function toStudentProfile(row: {
  id: string;
  name: string;
  code: string;
  program: string;
  semester: number;
  email: string;
  avatar_color: string;
  initials: string;
  valid_until: string;
}): StudentProfile {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    program: row.program,
    semester: row.semester,
    email: row.email,
    avatarColor: row.avatar_color,
    initials: row.initials,
    validUntil: row.valid_until,
  };
}

export async function listProfiles() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,code,program,semester,email,avatar_color,initials,valid_until")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return StudentProfilesSchema.parse(data.map(toStudentProfile));
    }
  } catch (error) {
    console.warn("Using mock profiles after Supabase read failed", error);
  }

  return StudentProfilesSchema.parse(profiles);
}

export async function getProfileById(id: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,code,program,semester,email,avatar_color,initials,valid_until")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return StudentProfileSchema.parse(toStudentProfile(data));
    }
  } catch (error) {
    console.warn("Using mock profile after Supabase read failed", error);
  }

  const profile = profiles.find((item) => item.id === id);
  return profile ? StudentProfileSchema.parse(profile) : null;
}
