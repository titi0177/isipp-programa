export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; role: string; full_name: string; created_at: string }
        Insert: { id?: string; email: string; role?: string; full_name: string; created_at?: string }
        Update: { id?: string; email?: string; role?: string; full_name?: string }
      }
      students: {
        Row: { id: string; user_id?: string; first_name: string; last_name: string; dni: string; legajo: string; email: string; program_id?: string; year: number; status: string; created_at: string }
        Insert: { id?: string; user_id?: string; first_name: string; last_name: string; dni: string; legajo: string; email: string; program_id?: string; year?: number; status?: string }
        Update: { first_name?: string; last_name?: string; dni?: string; legajo?: string; email?: string; program_id?: string; year?: number; status?: string }
      }
      programs: {
        Row: { id: string; name: string; duration_years: number; description?: string; created_at: string }
        Insert: { id?: string; name: string; duration_years: number; description?: string }
        Update: { name?: string; duration_years?: number; description?: string }
      }
      professors: {
        Row: { id: string; name: string; email: string; department: string; created_at: string }
        Insert: { id?: string; name: string; email: string; department: string }
        Update: { name?: string; email?: string; department?: string }
      }
      subjects: {
        Row: { id: string; name: string; code: string; program_id?: string; year: number; professor_id?: string; credits: number; created_at: string }
        Insert: { id?: string; name: string; code: string; program_id?: string; year?: number; professor_id?: string; credits?: number }
        Update: { name?: string; code?: string; program_id?: string; year?: number; professor_id?: string; credits?: number }
      }
      enrollments: {
        Row: { id: string; student_id: string; subject_id: string; year: number; semester: number; created_at: string }
        Insert: { id?: string; student_id: string; subject_id: string; year: number; semester: number }
        Update: { year?: number; semester?: number }
      }
      grades: {
        Row: { id: string; enrollment_id: string; partial_grade?: number; final_exam_grade?: number; final_grade?: number; status: string; created_at: string }
        Insert: { id?: string; enrollment_id: string; partial_grade?: number; final_exam_grade?: number; final_grade?: number; status?: string }
        Update: { partial_grade?: number; final_exam_grade?: number; final_grade?: number; status?: string }
      }
      attendance: {
        Row: { id: string; enrollment_id: string; percentage: number; created_at: string }
        Insert: { id?: string; enrollment_id: string; percentage: number }
        Update: { percentage?: number }
      }
      final_exams: {
        Row: { id: string; subject_id: string; date: string; professor_id?: string; location: string; created_at: string }
        Insert: { id?: string; subject_id: string; date: string; professor_id?: string; location: string }
        Update: { date?: string; professor_id?: string; location?: string }
      }
      exam_enrollments: {
        Row: { id: string; student_id: string; final_exam_id: string; created_at: string }
        Insert: { id?: string; student_id: string; final_exam_id: string }
        Update: Record<string, never>
      }
      announcements: {
        Row: { id: string; title: string; description: string; date: string; created_at: string }
        Insert: { id?: string; title: string; description: string; date: string }
        Update: { title?: string; description?: string; date?: string }
      }
      calendar_events: {
        Row: { id: string; title: string; description?: string; date: string; type: string; created_at: string }
        Insert: { id?: string; title: string; description?: string; date: string; type: string }
        Update: { title?: string; description?: string; date?: string; type?: string }
      }
      subject_correlatives: {
        Row: { id: string; subject_id: string; requires_subject_id: string; created_at: string }
        Insert: { id?: string; subject_id: string; requires_subject_id: string }
        Update: Record<string, never>
      }
    }
  }
}
