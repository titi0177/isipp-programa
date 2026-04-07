-- ISIPP Academic System - Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Programs (Carreras)
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_years INTEGER NOT NULL DEFAULT 3,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Professors
CREATE TABLE IF NOT EXISTS public.professors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subjects (Materias)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  year INTEGER NOT NULL DEFAULT 1,
  professor_id UUID REFERENCES public.professors(id) ON DELETE SET NULL,
  credits INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  legajo TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  year INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subject Correlatives (Prerequisites)
CREATE TABLE IF NOT EXISTS public.subject_correlatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  requires_subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(subject_id, requires_subject_id)
);

-- Enrollments (Inscripciones)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL DEFAULT 1 CHECK (semester IN (1, 2)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, subject_id, year, semester)
);

-- Grades (Calificaciones)
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE UNIQUE,
  partial_grade NUMERIC(4,2) CHECK (partial_grade BETWEEN 1 AND 10),
  final_exam_grade NUMERIC(4,2) CHECK (final_exam_grade BETWEEN 1 AND 10),
  final_grade NUMERIC(4,2) CHECK (final_grade BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('promoted', 'regular', 'in_progress', 'free', 'failed', 'passed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance (Asistencia)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE UNIQUE,
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Final Exams (Mesas de Examen)
CREATE TABLE IF NOT EXISTS public.final_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  professor_id UUID REFERENCES public.professors(id) ON DELETE SET NULL,
  location TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exam Enrollments
CREATE TABLE IF NOT EXISTS public.exam_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  final_exam_id UUID NOT NULL REFERENCES public.final_exams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, final_exam_id)
);

-- Announcements (Anuncios)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'event' CHECK (type IN ('exam', 'deadline', 'event')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_correlatives ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to get student id for current user
CREATE OR REPLACE FUNCTION public.my_student_id()
RETURNS UUID AS $$
  SELECT id FROM public.students WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- USERS: users can read/update their own row; admins have full access
CREATE POLICY "users_self_read" ON public.users FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "users_self_update" ON public.users FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "users_admin_insert" ON public.users FOR INSERT WITH CHECK (public.is_admin() OR id = auth.uid());
CREATE POLICY "users_admin_delete" ON public.users FOR DELETE USING (public.is_admin());

-- STUDENTS: students see own record; admins full access
CREATE POLICY "students_own_read" ON public.students FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "students_admin_all" ON public.students FOR ALL USING (public.is_admin());

-- PUBLIC READ tables (programs, professors, subjects, announcements, calendar_events, final_exams)
CREATE POLICY "programs_read_all" ON public.programs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "programs_admin_write" ON public.programs FOR ALL USING (public.is_admin());

CREATE POLICY "professors_read_all" ON public.professors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "professors_admin_write" ON public.professors FOR ALL USING (public.is_admin());

CREATE POLICY "subjects_read_all" ON public.subjects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "subjects_admin_write" ON public.subjects FOR ALL USING (public.is_admin());

CREATE POLICY "announcements_read_all" ON public.announcements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "announcements_admin_write" ON public.announcements FOR ALL USING (public.is_admin());

CREATE POLICY "calendar_read_all" ON public.calendar_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "calendar_admin_write" ON public.calendar_events FOR ALL USING (public.is_admin());

CREATE POLICY "final_exams_read_all" ON public.final_exams FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "final_exams_admin_write" ON public.final_exams FOR ALL USING (public.is_admin());

CREATE POLICY "correlatives_read_all" ON public.subject_correlatives FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "correlatives_admin_write" ON public.subject_correlatives FOR ALL USING (public.is_admin());

-- ENROLLMENTS: students see own; admins full
CREATE POLICY "enrollments_own_read" ON public.enrollments FOR SELECT USING (student_id = public.my_student_id() OR public.is_admin());
CREATE POLICY "enrollments_admin_write" ON public.enrollments FOR ALL USING (public.is_admin());

-- GRADES: students see own; admins full
CREATE POLICY "grades_own_read" ON public.grades FOR SELECT
  USING (enrollment_id IN (SELECT id FROM public.enrollments WHERE student_id = public.my_student_id()) OR public.is_admin());
CREATE POLICY "grades_admin_write" ON public.grades FOR ALL USING (public.is_admin());

-- ATTENDANCE: students see own; admins full
CREATE POLICY "attendance_own_read" ON public.attendance FOR SELECT
  USING (enrollment_id IN (SELECT id FROM public.enrollments WHERE student_id = public.my_student_id()) OR public.is_admin());
CREATE POLICY "attendance_admin_write" ON public.attendance FOR ALL USING (public.is_admin());

-- EXAM ENROLLMENTS: students manage own; admins full
CREATE POLICY "exam_enrollments_own" ON public.exam_enrollments FOR SELECT USING (student_id = public.my_student_id() OR public.is_admin());
CREATE POLICY "exam_enrollments_insert" ON public.exam_enrollments FOR INSERT WITH CHECK (student_id = public.my_student_id() OR public.is_admin());
CREATE POLICY "exam_enrollments_delete" ON public.exam_enrollments FOR DELETE USING (student_id = public.my_student_id() OR public.is_admin());
CREATE POLICY "exam_enrollments_admin_all" ON public.exam_enrollments FOR ALL USING (public.is_admin());

-- =============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (NEW.id, NEW.email, 'student', COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SAMPLE DATA (optional)
-- =============================================

-- Insert a sample program
INSERT INTO public.programs (name, duration_years, description) VALUES
  ('Tecnicatura en Programación', 3, 'Tecnicatura Superior en Programación Informática'),
  ('Tecnicatura en Administración', 3, 'Tecnicatura Superior en Administración de Empresas'),
  ('Licenciatura en Sistemas', 5, 'Licenciatura en Sistemas de Información')
ON CONFLICT DO NOTHING;

-- Insert sample announcements
INSERT INTO public.announcements (title, description, date) VALUES
  ('Inicio del Ciclo Lectivo 2025', 'Se informa a toda la comunidad educativa el inicio del ciclo lectivo 2025. Las clases comenzarán el lunes 17 de marzo.', '2025-03-10'),
  ('Inscripción a Exámenes Finales', 'Se abre el período de inscripción a mesas de exámenes finales para el turno de julio 2025. Plazo límite: 30 de junio.', '2025-06-15')
ON CONFLICT DO NOTHING;
