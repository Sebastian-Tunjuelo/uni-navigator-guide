CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  program TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester > 0),
  email TEXT NOT NULL UNIQUE,
  avatar_color TEXT NOT NULL,
  initials TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  teacher TEXT NOT NULL,
  current_grade NUMERIC(3, 2) NOT NULL CHECK (current_grade >= 0 AND current_grade <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.subject_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight NUMERIC(5, 2) NOT NULL CHECK (weight >= 0 AND weight <= 100),
  grade NUMERIC(3, 2) CHECK (grade >= 0 AND grade <= 5),
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE public.class_sessions (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  room TEXT NOT NULL,
  block TEXT NOT NULL,
  start_time TEXT NOT NULL CHECK (start_time ~ '^[0-9]{2}:[0-9]{2}$'),
  end_time TEXT NOT NULL CHECK (end_time ~ '^[0-9]{2}:[0-9]{2}$'),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 7),
  color TEXT NOT NULL
);

CREATE TABLE public.news_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Académico', 'Eventos', 'Becas', 'Bienestar')),
  date_label TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  emoji TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read demo profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read demo subjects"
  ON public.subjects FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read demo subject activities"
  ON public.subject_activities FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read demo class sessions"
  ON public.class_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read demo news"
  ON public.news_items FOR SELECT
  USING (true);

CREATE INDEX idx_subject_activities_subject_id_order
  ON public.subject_activities(subject_id, display_order);

CREATE INDEX idx_class_sessions_day_start_time
  ON public.class_sessions(day, start_time);

CREATE INDEX idx_news_items_published_at
  ON public.news_items(published_at DESC);

INSERT INTO public.profiles (id, name, code, program, semester, email, avatar_color, initials, valid_until)
VALUES
  ('u1', 'Ana Torres', '20251234', 'Ingeniería de Sistemas', 1, 'ana.torres@uni.edu', 'bg-gradient-to-br from-rose-400 to-pink-500', 'AT', 'Dic 2026'),
  ('u2', 'Carlos Méndez', '20255678', 'Diseño Industrial', 1, 'carlos.mendez@uni.edu', 'bg-gradient-to-br from-sky-400 to-indigo-500', 'CM', 'Dic 2026'),
  ('u3', 'Lucía Ramírez', '20259876', 'Psicología', 1, 'lucia.ramirez@uni.edu', 'bg-gradient-to-br from-emerald-400 to-teal-500', 'LR', 'Dic 2026'),
  ('u4', 'Diego Soto', '20254321', 'Administración', 1, 'diego.soto@uni.edu', 'bg-gradient-to-br from-amber-400 to-orange-500', 'DS', 'Dic 2026');

INSERT INTO public.subjects (id, name, teacher, current_grade)
VALUES
  ('s1', 'Cálculo I', 'Prof. Martínez', 4.2),
  ('s2', 'Programación', 'Prof. Gómez', 4.6),
  ('s3', 'Inglés Técnico', 'Prof. Lee', 3.8),
  ('s4', 'Comunicación', 'Prof. Rivas', 4.4);

INSERT INTO public.subject_activities (subject_id, name, weight, grade, display_order)
VALUES
  ('s1', 'Quiz 1', 10, 4.5, 1),
  ('s1', 'Parcial 1', 25, 4.0, 2),
  ('s1', 'Talleres', 15, 4.3, 3),
  ('s1', 'Parcial 2', 25, NULL, 4),
  ('s1', 'Examen final', 25, NULL, 5),
  ('s2', 'Proyecto 1', 30, 4.7, 1),
  ('s2', 'Quizzes', 20, 4.5, 2),
  ('s2', 'Proyecto final', 50, NULL, 3),
  ('s3', 'Speaking', 25, 4.0, 1),
  ('s3', 'Writing', 25, 3.5, 2),
  ('s3', 'Listening', 25, 3.9, 3),
  ('s3', 'Reading', 25, NULL, 4),
  ('s4', 'Ensayo 1', 30, 4.5, 1),
  ('s4', 'Exposición', 30, 4.3, 2),
  ('s4', 'Examen final', 40, NULL, 3);

INSERT INTO public.class_sessions (id, subject, room, block, start_time, end_time, day, color)
VALUES
  ('c1', 'Cálculo I', 'Aula 302', 'B', '08:00', '10:00', 1, 'bg-primary-soft text-primary'),
  ('c2', 'Programación', 'Lab 105', 'C', '10:30', '12:30', 1, 'bg-success-soft text-success'),
  ('c3', 'Inglés Técnico', 'Aula 210', 'A', '14:00', '15:30', 1, 'bg-warning-soft text-warning'),
  ('c4', 'Comunicación', 'Aula 401', 'D', '16:00', '17:30', 1, 'bg-accent text-accent-foreground');

INSERT INTO public.news_items (id, title, category, date_label, excerpt, emoji)
VALUES
  ('n1', 'Inscripciones abiertas a semilleros de investigación', 'Académico', 'Hoy', 'Conoce los grupos disponibles y postula hasta el 15 de mayo.', '🔬'),
  ('n2', 'Feria universitaria de bienvenida', 'Eventos', 'Mañana', 'Plaza central, 10:00 a.m. Música, comida y stands de clubes.', '🎉'),
  ('n3', 'Convocatoria de becas de excelencia', 'Becas', '2 días', 'Cubre hasta el 80% de la matrícula. Revisa los requisitos.', '🎓'),
  ('n4', 'Talleres gratuitos de bienestar emocional', 'Bienestar', '3 días', 'Cupo limitado. Inscríbete en el portal estudiantil.', '🌿');
