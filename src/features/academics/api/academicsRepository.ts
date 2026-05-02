import { supabase } from "@/integrations/supabase/client";
import { subjects, todayClasses } from "../mockData";
import type { Activity, ClassEntry, Subject } from "../schemas";
import { ClassEntriesSchema, SubjectSchema, SubjectsSchema } from "../schemas";

function toClassEntry(row: {
  id: string;
  subject: string;
  room: string;
  block: string;
  start_time: string;
  end_time: string;
  day: number;
  color: string;
}): ClassEntry {
  return {
    id: row.id,
    subject: row.subject,
    room: row.room,
    block: row.block,
    start: row.start_time,
    end: row.end_time,
    day: row.day,
    color: row.color,
  };
}

function toActivity(row: {
  name: string;
  weight: number;
  grade: number | null;
}): Activity {
  return {
    name: row.name,
    weight: Number(row.weight),
    grade: row.grade === null ? null : Number(row.grade),
  };
}

function toSubject(row: {
  id: string;
  name: string;
  teacher: string;
  current_grade: number;
  subject_activities?: Array<{
    name: string;
    weight: number;
    grade: number | null;
  }>;
}): Subject {
  return {
    id: row.id,
    name: row.name,
    teacher: row.teacher,
    current: Number(row.current_grade),
    activities: (row.subject_activities ?? []).map(toActivity),
  };
}

export async function listTodayClasses() {
  try {
    const { data, error } = await supabase
      .from("class_sessions")
      .select("id,subject,room,block,start_time,end_time,day,color")
      .order("day", { ascending: true })
      .order("start_time", { ascending: true });

    if (!error && data && data.length > 0) {
      return ClassEntriesSchema.parse(data.map(toClassEntry));
    }
  } catch (error) {
    console.warn("Using mock class sessions after Supabase read failed", error);
  }

  return ClassEntriesSchema.parse(todayClasses);
}

export async function listSubjects() {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("id,name,teacher,current_grade,subject_activities(name,weight,grade,display_order)")
      .order("name", { ascending: true })
      .order("display_order", { referencedTable: "subject_activities", ascending: true });

    if (!error && data && data.length > 0) {
      return SubjectsSchema.parse(data.map(toSubject));
    }
  } catch (error) {
    console.warn("Using mock subjects after Supabase read failed", error);
  }

  return SubjectsSchema.parse(subjects);
}

export async function getSubjectById(id: string) {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("id,name,teacher,current_grade,subject_activities(name,weight,grade,display_order)")
      .eq("id", id)
      .order("display_order", { referencedTable: "subject_activities", ascending: true })
      .maybeSingle();

    if (!error && data) {
      return SubjectSchema.parse(toSubject(data));
    }
  } catch (error) {
    console.warn("Using mock subject after Supabase read failed", error);
  }

  const subject = subjects.find((item) => item.id === id);
  return subject ? SubjectSchema.parse(subject) : null;
}
