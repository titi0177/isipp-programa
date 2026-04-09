-- =============================================================================
-- ISIPP · Línea base académica tipo SIU-Guaraní (Supabase / PostgreSQL 15+)
-- ADVERTENCIA: elimina tablas públicas listadas y las recrea. Solo entornos
-- controlados o proyectos nuevos. Haz backup antes de ejecutar.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Limpieza (orden con CASCADE para romper FKs)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS
  public.audit_logs,
  public.notifications,
  public.certificates,
  public.exam_records,
  public.exam_attempts,
  public.exam_enrollments,
  public.final_exams,
  public.exam_rooms,
  public.grade_history,
  public.grade_components,
  public.grades,
  public.attendance_records,
  public.attendance_sessions,
  public.attendance,
  public.enrollment_history,
  public.waitlists,
  public.enrollments,
  public.subject_correlatives,
  public.subject_schedules,
  public.subjects,
  public.student_programs,
  public.students,
  public.professors,
  public.program_plans,
  public.programs,
  public.academic_periods,
  public.material_files,
  public.materials,
  public.announcements,
  public.calendar_events,
  public.user_roles,
  public.role_permissions,
  public.profiles,
  public.permissions,
  public.roles,
  public.campuses,
  public.departments,
  public.institutions
CASCADE;

DROP VIEW IF EXISTS public.vista_progreso_alumno CASCADE;
DROP VIEW IF EXISTS public.vista_promedio_alumno CASCADE;
DROP VIEW IF EXISTS public.vista_estadisticas_materia CASCADE;

-- ---------------------------------------------------------------------------
-- Institución / SaaS
-- ---------------------------------------------------------------------------
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  legal_name text,
  country text DEFAULT 'AR',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  campus_id uuid REFERENCES public.campuses(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_campuses_inst ON public.campuses(institution_id);
CREATE INDEX idx_dept_inst ON public.departments(institution_id);

-- ---------------------------------------------------------------------------
-- Perfiles y RBAC (roles: admin, profesor, alumno, operador)
-- ---------------------------------------------------------------------------
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'alumno'
    CHECK (role IN ('admin', 'profesor', 'alumno', 'operador')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_inst ON public.profiles(institution_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id, institution_id)
);

-- ---------------------------------------------------------------------------
-- Estructura académica
-- ---------------------------------------------------------------------------
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  name text NOT NULL,
  duration_years integer NOT NULL DEFAULT 3,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.program_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  version text NOT NULL DEFAULT '1',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, version)
);

CREATE TABLE public.academic_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ap_range CHECK (ends_on >= starts_on)
);

CREATE TABLE public.professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  department text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_prof_user ON public.professors(user_id);

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  professor_id uuid REFERENCES public.professors(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text NOT NULL,
  year integer NOT NULL DEFAULT 1,
  credits integer NOT NULL DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code)
);

CREATE INDEX idx_subj_program ON public.subjects(program_id);
CREATE INDEX idx_subj_prof ON public.subjects(professor_id);

CREATE TABLE public.subject_correlatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  requires_subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subject_id, requires_subject_id),
  CONSTRAINT corr_no_self CHECK (subject_id <> requires_subject_id)
);

CREATE TABLE public.subject_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_period_id uuid REFERENCES public.academic_periods(id) ON DELETE SET NULL,
  campus_id uuid REFERENCES public.campuses(id) ON DELETE SET NULL,
  capacity integer NOT NULL DEFAULT 30 CHECK (capacity > 0),
  modality text DEFAULT 'presencial',
  room text,
  weekday smallint,
  starts_at time,
  ends_at time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Estudiantes
-- ---------------------------------------------------------------------------
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dni text NOT NULL,
  legajo text NOT NULL,
  email text NOT NULL,
  year integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dni),
  UNIQUE (legajo)
);

CREATE INDEX idx_students_user ON public.students(user_id);
CREATE INDEX idx_students_program ON public.students(program_id);

CREATE TABLE public.student_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  program_plan_id uuid REFERENCES public.program_plans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  started_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, program_id)
);

-- ---------------------------------------------------------------------------
-- Inscripciones
-- ---------------------------------------------------------------------------
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_period_id uuid REFERENCES public.academic_periods(id) ON DELETE SET NULL,
  year integer NOT NULL,
  semester integer NOT NULL DEFAULT 1 CHECK (semester IN (1, 2)),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'withdrawn', 'failed', 'audit')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, year, semester)
);

CREATE INDEX idx_enr_student ON public.enrollments(student_id);
CREATE INDEX idx_enr_subject ON public.enrollments(subject_id);

CREATE TABLE public.enrollment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payload jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.waitlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_period_id uuid REFERENCES public.academic_periods(id) ON DELETE SET NULL,
  position integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Calificaciones
-- ---------------------------------------------------------------------------
CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  partial_grade numeric(5,2),
  final_exam_grade numeric(5,2),
  final_grade numeric(5,2),
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('promoted', 'regular', 'in_progress', 'free', 'failed', 'passed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id)
);

CREATE TABLE public.grade_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id uuid NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  label text NOT NULL,
  weight numeric(6,3) NOT NULL DEFAULT 1 CHECK (weight >= 0),
  score numeric(6,2),
  max_score numeric(6,2) DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.grade_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id uuid NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  previous jsonb,
  next jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Asistencia (sesiones + registros + resumen compatible con la app actual)
-- ---------------------------------------------------------------------------
CREATE TABLE public.attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_period_id uuid REFERENCES public.academic_periods(id) ON DELETE SET NULL,
  session_date date NOT NULL,
  topic text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  present boolean NOT NULL DEFAULT true,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, enrollment_id)
);

CREATE TABLE public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  percentage numeric(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id)
);

-- ---------------------------------------------------------------------------
-- Exámenes finales
-- ---------------------------------------------------------------------------
CREATE TABLE public.exam_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 30 CHECK (capacity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.final_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  professor_id uuid REFERENCES public.professors(id) ON DELETE SET NULL,
  exam_room_id uuid REFERENCES public.exam_rooms(id) ON DELETE SET NULL,
  exam_date timestamptz NOT NULL,
  location text NOT NULL DEFAULT '',
  max_students integer,
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fe_subject ON public.final_exams(subject_id);

CREATE TABLE public.exam_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  final_exam_id uuid NOT NULL REFERENCES public.final_exams(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, final_exam_id)
);

CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_enrollment_id uuid NOT NULL REFERENCES public.exam_enrollments(id) ON DELETE CASCADE,
  attempt_no smallint NOT NULL DEFAULT 1,
  grade numeric(5,2),
  status text DEFAULT 'registered',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_enrollment_id, attempt_no)
);

-- Acta oficial de examen final
CREATE TABLE public.exam_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  professor_id uuid REFERENCES public.professors(id) ON DELETE SET NULL,
  final_exam_id uuid REFERENCES public.final_exams(id) ON DELETE SET NULL,
  exam_date timestamptz NOT NULL,
  title text NOT NULL DEFAULT 'ACTA DE EXAMEN FINAL',
  students_grades jsonb NOT NULL DEFAULT '[]',
  estado_acta text NOT NULL DEFAULT 'borrador'
    CHECK (estado_acta IN ('borrador', 'cerrada', 'anulada')),
  firma_digital_profesor text,
  firma_digital_institucion text,
  pdf_storage_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_records_subject ON public.exam_records(subject_id);

-- ---------------------------------------------------------------------------
-- Materiales
-- ---------------------------------------------------------------------------
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  professor_id uuid REFERENCES public.professors(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.material_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  storage_bucket text NOT NULL DEFAULT 'materials',
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Anuncios, calendario, notificaciones, certificados, auditoría
-- ---------------------------------------------------------------------------
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  date timestamptz NOT NULL,
  type text NOT NULL DEFAULT 'event' CHECK (type IN ('exam', 'deadline', 'event')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  data jsonb DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user ON public.notifications(user_id);

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  certificate_type text NOT NULL DEFAULT 'regular',
  issued_on date NOT NULL DEFAULT (now()::date),
  metadata jsonb DEFAULT '{}',
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  old_record jsonb,
  new_record jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_res ON public.audit_logs(resource_type, resource_id);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DO $t$
DECLARE r record;
BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'institutions','campuses','departments','roles','profiles','programs','program_plans',
    'academic_periods','professors','subjects','subject_schedules','students','student_programs',
    'enrollments','grades','grade_components','final_exams','exam_records','materials',
    'announcements','calendar_events','attendance'
  ]) AS tbl
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_u_%I ON public.%I;
      CREATE TRIGGER trg_u_%I BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
    ', r.tbl, r.tbl, r.tbl, r.tbl);
  END LOOP;
END $t$;

-- ---------------------------------------------------------------------------
-- Funciones (lógica en BD)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calcular_promedio_alumno(p_estudiante uuid)
RETURNS numeric
LANGUAGE sql STABLE SET search_path = public AS $$
  WITH g AS (
    SELECT gr.final_grade::numeric AS fg, s.credits::numeric AS cr
    FROM public.enrollments e
    JOIN public.grades gr ON gr.enrollment_id = e.id
    JOIN public.subjects s ON s.id = e.subject_id
    WHERE e.student_id = p_estudiante
      AND gr.final_grade IS NOT NULL
      AND gr.status IN ('promoted', 'passed', 'regular')
  )
  SELECT CASE WHEN SUM(cr) > 0 THEN round(SUM(fg * cr) / SUM(cr), 2) END FROM g;
$$;

CREATE OR REPLACE FUNCTION public.validar_correlativas(p_estudiante uuid, p_materia uuid)
RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.subject_correlatives c
    WHERE c.subject_id = p_materia
      AND NOT EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.grades g ON g.enrollment_id = e.id
        WHERE e.student_id = p_estudiante
          AND e.subject_id = c.requires_subject_id
          AND g.status IN ('promoted', 'passed', 'regular')
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.validar_cupo_examen(p_mesa uuid)
RETURNS boolean
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE cap int; n int;
BEGIN
  SELECT max_students INTO cap FROM public.final_exams WHERE id = p_mesa;
  IF cap IS NULL OR cap <= 0 THEN RETURN true; END IF;
  SELECT count(*)::int INTO n FROM public.exam_enrollments WHERE final_exam_id = p_mesa;
  RETURN n < cap;
END;
$$;

CREATE OR REPLACE FUNCTION public.validar_inscripcion_materia(p_estudiante uuid, p_materia uuid)
RETURNS boolean
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT public.validar_correlativas(p_estudiante, p_materia)
    AND NOT EXISTS (
      SELECT 1 FROM public.students st
      JOIN public.subjects su ON su.id = p_materia
      WHERE st.id = p_estudiante
        AND su.program_id IS NOT NULL
        AND st.program_id IS DISTINCT FROM su.program_id
    );
$$;

CREATE OR REPLACE FUNCTION public.calcular_progreso_carrera(p_estudiante uuid)
RETURNS TABLE (
  total_materias integer,
  aprobadas integer,
  en_curso integer,
  pendientes integer,
  porcentaje numeric
)
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  prog uuid;
  tot int := 0;
  ap int := 0;
  cur int := 0;
BEGIN
  SELECT program_id INTO prog FROM public.students WHERE id = p_estudiante;
  IF prog IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0, 0, 0::numeric;
    RETURN;
  END IF;
  SELECT count(*)::int INTO tot FROM public.subjects WHERE program_id = prog;
  SELECT count(DISTINCT e.subject_id)::int INTO ap
  FROM public.enrollments e
  JOIN public.grades g ON g.enrollment_id = e.id
  WHERE e.student_id = p_estudiante
    AND g.status IN ('promoted', 'passed', 'regular')
    AND g.final_grade IS NOT NULL
    AND g.final_grade >= 4;
  SELECT count(DISTINCT e.subject_id)::int INTO cur
  FROM public.enrollments e
  LEFT JOIN public.grades g ON g.enrollment_id = e.id
  WHERE e.student_id = p_estudiante
    AND e.status = 'active'
    AND (g.id IS NULL OR g.status = 'in_progress' OR (g.final_grade IS NULL OR g.final_grade < 4));
  RETURN QUERY SELECT
    tot,
    ap,
    cur,
    GREATEST(tot - ap - cur, 0),
    CASE WHEN tot > 0 THEN round((ap::numeric / tot) * 100, 1) ELSE 0 END;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_exam_cupo()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE cap int; taken int;
BEGIN
  SELECT max_students INTO cap FROM public.final_exams WHERE id = NEW.final_exam_id;
  IF cap IS NOT NULL AND cap > 0 THEN
    SELECT count(*)::int INTO taken FROM public.exam_enrollments WHERE final_exam_id = NEW.final_exam_id;
    IF taken >= cap THEN
      RAISE EXCEPTION 'cupo_examen_lleno' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exam_cupo ON public.exam_enrollments;
CREATE TRIGGER trg_exam_cupo
  BEFORE INSERT ON public.exam_enrollments
  FOR EACH ROW EXECUTE PROCEDURE public.trg_exam_cupo();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(
      CASE WHEN (NEW.raw_user_meta_data->>'role') IN ('admin', 'profesor', 'alumno', 'operador')
        THEN NEW.raw_user_meta_data->>'role' END,
      'alumno'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Vistas (nombres en español)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vista_promedio_alumno AS
SELECT
  s.id AS estudiante_id,
  s.legajo,
  s.first_name,
  s.last_name,
  public.calcular_promedio_alumno(s.id) AS promedio_ponderado,
  p.name AS carrera
FROM public.students s
LEFT JOIN public.programs p ON p.id = s.program_id;

CREATE OR REPLACE VIEW public.vista_progreso_alumno AS
SELECT
  s.id AS estudiante_id,
  e.id AS inscripcion_id,
  m.id AS materia_id,
  m.code AS codigo,
  m.name AS materia,
  m.year AS anio_plan,
  e.status AS estado_inscripcion,
  g.status AS estado_nota,
  g.final_grade AS nota_final,
  public.validar_correlativas(s.id, m.id) AS correlativas_ok
FROM public.students s
JOIN public.enrollments e ON e.student_id = s.id
JOIN public.subjects m ON m.id = e.subject_id
LEFT JOIN public.grades g ON g.enrollment_id = e.id;

CREATE OR REPLACE VIEW public.vista_estadisticas_materia AS
SELECT
  m.id AS materia_id,
  m.code AS codigo,
  m.name AS nombre,
  count(DISTINCT e.id) FILTER (WHERE e.status = 'active') AS inscriptos_activos,
  round(avg(g.final_grade) FILTER (WHERE g.final_grade IS NOT NULL), 2) AS promedio_nota,
  round(
    100.0 * count(*) FILTER (WHERE g.status = 'failed')::numeric
      / NULLIF(count(*) FILTER (WHERE g.status IS NOT NULL), 0),
    1
  ) AS tasa_desaprobacion_pct
FROM public.subjects m
LEFT JOIN public.enrollments e ON e.subject_id = m.id
LEFT JOIN public.grades g ON g.enrollment_id = e.id
GROUP BY m.id, m.code, m.name;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'operador'));
$$;

CREATE OR REPLACE FUNCTION public.es_profesor()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'profesor');
$$;

CREATE OR REPLACE FUNCTION public.mi_estudiante_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.students WHERE user_id = auth.uid() LIMIT 1;
$$;

-- profiles
CREATE POLICY p_profiles_self ON public.profiles FOR SELECT USING (id = auth.uid() OR public.es_admin());
CREATE POLICY p_profiles_upd_self ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY p_profiles_all_admin ON public.profiles FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

-- students
CREATE POLICY p_students_self ON public.students FOR SELECT USING (user_id = auth.uid() OR public.es_admin());
CREATE POLICY p_students_prof ON public.students FOR SELECT USING (
  public.es_profesor() AND EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.subjects s ON s.id = e.subject_id
    JOIN public.professors pr ON pr.id = s.professor_id
    WHERE e.student_id = students.id AND pr.user_id = auth.uid()
  )
);
CREATE POLICY p_students_admin ON public.students FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

-- enrollments
CREATE POLICY p_enr_student ON public.enrollments FOR SELECT USING (
  student_id = public.mi_estudiante_id() OR public.es_admin()
  OR (
    public.es_profesor() AND EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.professors pr ON pr.id = s.professor_id
      WHERE s.id = enrollments.subject_id AND pr.user_id = auth.uid()
    )
  )
);
CREATE POLICY p_enr_admin ON public.enrollments FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());
CREATE POLICY p_enr_ins_alumno ON public.enrollments FOR INSERT TO authenticated
  WITH CHECK (student_id = public.mi_estudiante_id());

-- grades (alumno vía enrollment)
CREATE POLICY p_gr_student ON public.grades FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.id = grades.enrollment_id AND e.student_id = public.mi_estudiante_id()
  ) OR public.es_admin()
  OR (
    public.es_profesor() AND EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.subjects s ON s.id = e.subject_id
      JOIN public.professors pr ON pr.id = s.professor_id
      WHERE e.id = grades.enrollment_id AND pr.user_id = auth.uid()
    )
  )
);
CREATE POLICY p_gr_admin ON public.grades FOR INSERT WITH CHECK (public.es_admin() OR public.es_profesor());
CREATE POLICY p_gr_upd ON public.grades FOR UPDATE USING (public.es_admin() OR public.es_profesor());

-- attendance
CREATE POLICY p_at_student ON public.attendance FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.id = attendance.enrollment_id AND e.student_id = public.mi_estudiante_id()
  ) OR public.es_admin() OR public.es_profesor()
);
CREATE POLICY p_at_write ON public.attendance FOR ALL USING (public.es_admin() OR public.es_profesor())
  WITH CHECK (public.es_admin() OR public.es_profesor());

-- final_exams & exam_enrollments
CREATE POLICY p_fe_read ON public.final_exams FOR SELECT TO authenticated USING (true);
CREATE POLICY p_fe_admin ON public.final_exams FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY p_ee_student ON public.exam_enrollments FOR SELECT USING (
  student_id = public.mi_estudiante_id() OR public.es_admin()
);
CREATE POLICY p_ee_ins_student ON public.exam_enrollments FOR INSERT WITH CHECK (
  student_id = public.mi_estudiante_id() OR public.es_admin()
);
CREATE POLICY p_ee_del_student ON public.exam_enrollments FOR DELETE USING (
  student_id = public.mi_estudiante_id() OR public.es_admin()
);

-- exam_records
CREATE POLICY p_er_read ON public.exam_records FOR SELECT TO authenticated USING (public.es_admin() OR public.es_profesor());
CREATE POLICY p_er_admin ON public.exam_records FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

-- subjects / programs / professors read
CREATE POLICY p_subj_read ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY p_subj_write ON public.subjects FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY p_prog_read ON public.programs FOR SELECT TO authenticated USING (true);
CREATE POLICY p_prog_write ON public.programs FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY p_prof_read ON public.professors FOR SELECT TO authenticated USING (true);
CREATE POLICY p_prof_write ON public.professors FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

-- announcements & calendar
CREATE POLICY p_ann_read ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY p_ann_write ON public.announcements FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

CREATE POLICY p_cal_read ON public.calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY p_cal_write ON public.calendar_events FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

-- materials
CREATE POLICY p_mat_read ON public.materials FOR SELECT TO authenticated USING (true);
CREATE POLICY p_mat_write ON public.materials FOR ALL USING (public.es_admin() OR public.es_profesor())
  WITH CHECK (public.es_admin() OR public.es_profesor());

CREATE POLICY p_mf ON public.material_files FOR ALL TO authenticated USING (true) WITH CHECK (public.es_admin() OR public.es_profesor());

-- notifications
CREATE POLICY p_notif ON public.notifications FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- audit
CREATE POLICY p_audit_ins ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());
CREATE POLICY p_audit_read ON public.audit_logs FOR SELECT USING (public.es_admin());

-- ---------------------------------------------------------------------------
-- Datos semilla mínimos
-- ---------------------------------------------------------------------------
INSERT INTO public.institutions (id, slug, name)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'isipp-1206', 'ISIPP 1206 · Puerto Piray')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Administrador'),
  ('profesor', 'Docente'),
  ('alumno', 'Estudiante'),
  ('operador', 'Operador administrativo')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (key, description) VALUES
  ('academic.read', 'Lectura académica'),
  ('academic.write', 'Escritura académica'),
  ('reports.read', 'Reportes')
ON CONFLICT (key) DO NOTHING;

-- Bucket materiales (Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Profesores y admin suben materiales"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'materials'
  AND (
    public.es_admin()
    OR public.es_profesor()
  )
);

CREATE POLICY "Leer materiales autenticados"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'materials');

CREATE POLICY "Borrar materiales admin"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'materials' AND public.es_admin());

GRANT EXECUTE ON FUNCTION public.calcular_promedio_alumno(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calcular_progreso_carrera(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validar_correlativas(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validar_inscripcion_materia(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validar_cupo_examen(uuid) TO authenticated;

-- Realtime: en el panel de Supabase, habilitá la replicación para las tablas
-- `grades`, `final_exams` y `announcements` (Database → Replication) si usás
-- los hooks useRealtime* del frontend.
