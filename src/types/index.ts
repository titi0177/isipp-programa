export type Role = 'admin' | 'student'

export interface UserProfile {
  id: string
  email: string
  role: Role
  full_name: string
  created_at: string
}

export interface Student {
  id: string
  user_id?: string
  first_name: string
  last_name: string
  dni: string
  legajo: string
  email: string
  program_id?: string
  year: number
  status: 'active' | 'inactive' | 'graduated' | 'suspended'
  created_at: string
  program?: Program
}

export interface Program {
  id: string
  name: string
  duration_years: number
  description?: string
  created_at: string
}

export interface Professor {
  id: string
  name: string
  email: string
  department: string
  created_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
  program_id?: string
  year: number
  professor_id?: string
  credits: number
  created_at: string
  program?: Program
  professor?: Professor
}

export interface Enrollment {
  id: string
  student_id: string
  subject_id: string
  year: number
  semester: number
  created_at: string
  student?: Student
  subject?: Subject
}

export interface Grade {
  id: string
  enrollment_id: string
  partial_grade?: number
  final_exam_grade?: number
  final_grade?: number
  status: 'promoted' | 'regular' | 'in_progress' | 'free' | 'failed' | 'passed'
  created_at: string
  enrollment?: Enrollment
}

export interface Attendance {
  id: string
  enrollment_id: string
  percentage: number
  created_at: string
}

export interface FinalExam {
  id: string
  subject_id: string
  date: string
  professor_id?: string
  location: string
  created_at: string
  subject?: Subject
  professor?: Professor
}

export interface ExamEnrollment {
  id: string
  student_id: string
  final_exam_id: string
  created_at: string
  student?: Student
  final_exam?: FinalExam
}

export interface Announcement {
  id: string
  title: string
  description: string
  date: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string
  type: 'exam' | 'deadline' | 'event'
  created_at: string
}

export interface SubjectCorrelative {
  id: string
  subject_id: string
  requires_subject_id: string
  created_at: string
}

export interface StudentSubjectView {
  subject: string
  professor: string
  partial_grade?: number
  final_grade?: number
  attendance?: number
  status: Grade['status']
}
