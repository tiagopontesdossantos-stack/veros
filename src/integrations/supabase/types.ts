export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type WorkspaceTable<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      diagnostic_answers: {
        Row: {
          answer_number: number | null
          answer_text: string | null
          created_at: string
          id: string
          meeting_id: string
          question_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          answer_number?: number | null
          answer_text?: string | null
          created_at?: string
          id?: string
          meeting_id: string
          question_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          answer_number?: number | null
          answer_text?: string | null
          created_at?: string
          id?: string
          meeting_id?: string
          question_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_answers_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_evidence: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          meeting_id: string
          question_id: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          meeting_id: string
          question_id?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          meeting_id?: string
          question_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_evidence_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_evidence_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_meetings: {
        Row: {
          created_at: string
          current_question_id: string | null
          general_notes: string | null
          id: string
          interviewee_name: string | null
          objective: string | null
          owner_id: string | null
          owner_name: string | null
          prospect_id: string
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_question_id?: string | null
          general_notes?: string | null
          id?: string
          interviewee_name?: string | null
          objective?: string | null
          owner_id?: string | null
          owner_name?: string | null
          prospect_id: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_question_id?: string | null
          general_notes?: string | null
          id?: string
          interviewee_name?: string | null
          objective?: string | null
          owner_id?: string | null
          owner_name?: string | null
          prospect_id?: string
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_meetings_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          meeting_id: string
          section_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_id: string
          section_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_id?: string
          section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_notes_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_notes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_questions: {
        Row: {
          answer_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          meeting_id: string | null
          position: number
          section_id: string
          spin_stage: string
          text: string
        }
        Insert: {
          answer_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          meeting_id?: string | null
          position?: number
          section_id: string
          spin_stage: string
          text: string
        }
        Update: {
          answer_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          meeting_id?: string | null
          position?: number
          section_id?: string
          spin_stage?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_questions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_reports: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          id: string
          meeting_id: string
          status: string
          title: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_id: string
          status?: string
          title: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          meeting_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_reports_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_requests: {
        Row: {
          challenge: string
          company: string
          created_at: string
          email: string
          id: string
          name: string
          revenue_range: string
          role: string
          segment: string
          source: string
          whatsapp: string
        }
        Insert: {
          challenge: string
          company: string
          created_at?: string
          email: string
          id?: string
          name: string
          revenue_range: string
          role: string
          segment: string
          source?: string
          whatsapp: string
        }
        Update: {
          challenge?: string
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          revenue_range?: string
          role?: string
          segment?: string
          source?: string
          whatsapp?: string
        }
        Relationships: []
      }
      diagnostic_sections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          position: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          position?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      prospects: {
        Row: {
          acquisition_channels: string | null
          active_customers: number | null
          average_ticket: number | null
          city: string | null
          cnpj: string | null
          contact_name: string | null
          contact_role: string | null
          created_at: string
          created_by: string | null
          cs_staff: number | null
          email: string | null
          employees: number | null
          growth_goals: string | null
          id: string
          legal_name: string
          marketing_investment: number | null
          marketing_staff: number | null
          monthly_revenue: number | null
          perceived_challenges: string | null
          phone: string | null
          products: string | null
          segment: string | null
          sellers: number | null
          state: string | null
          tools: string | null
          trade_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          acquisition_channels?: string | null
          active_customers?: number | null
          average_ticket?: number | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string | null
          cs_staff?: number | null
          email?: string | null
          employees?: number | null
          growth_goals?: string | null
          id?: string
          legal_name: string
          marketing_investment?: number | null
          marketing_staff?: number | null
          monthly_revenue?: number | null
          perceived_challenges?: string | null
          phone?: string | null
          products?: string | null
          segment?: string | null
          sellers?: number | null
          state?: string | null
          tools?: string | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          acquisition_channels?: string | null
          active_customers?: number | null
          average_ticket?: number | null
          city?: string | null
          cnpj?: string | null
          contact_name?: string | null
          contact_role?: string | null
          created_at?: string
          created_by?: string | null
          cs_staff?: number | null
          email?: string | null
          employees?: number | null
          growth_goals?: string | null
          id?: string
          legal_name?: string
          marketing_investment?: number | null
          marketing_staff?: number | null
          monthly_revenue?: number | null
          perceived_challenges?: string | null
          phone?: string | null
          products?: string | null
          segment?: string | null
          sellers?: number | null
          state?: string | null
          tools?: string | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      crm_pipelines: WorkspaceTable<{ id: string; organization_id: string; name: string; is_default: boolean; created_at: string }>,
      crm_stages: WorkspaceTable<{ id: string; pipeline_id: string; name: string; position: number; probability: number; is_won: boolean; is_lost: boolean }>,
      crm_opportunities: WorkspaceTable<{ id: string; organization_id: string; pipeline_id: string; stage_id: string; prospect_id: string | null; title: string; amount: number; expected_close_date: string | null; owner_id: string | null; source: string | null; lost_reason: string | null; next_activity_at: string | null; created_at: string; updated_at: string }>,
      crm_activities: WorkspaceTable<{ id: string; organization_id: string; prospect_id: string | null; opportunity_id: string | null; project_id: string | null; title: string; description: string | null; activity_type: string; status: string; due_at: string | null; completed_at: string | null; owner_id: string | null; created_at: string; updated_at: string }>,
      client_projects: WorkspaceTable<{ id: string; organization_id: string; client_organization_id: string; name: string; description: string | null; service_type: string; status: string; progress: number; start_date: string | null; target_end_date: string | null; completed_at: string | null; client_visible: boolean; created_by: string | null; created_at: string; updated_at: string }>,
      project_milestones: WorkspaceTable<{ id: string; project_id: string; title: string; description: string | null; status: string; due_date: string | null; position: number; client_visible: boolean; completed_at: string | null; created_at: string; updated_at: string }>,
      project_updates: WorkspaceTable<{ id: string; project_id: string; title: string; content: string; progress: number | null; client_visible: boolean; published_at: string | null; created_by: string | null; created_at: string }>,
      finance_entries: WorkspaceTable<{ id: string; organization_id: string; project_id: string | null; entry_type: string; category: string; description: string; amount: number; due_date: string; paid_at: string | null; status: string; payment_method: string | null; reference_month: string | null; notes: string | null; created_by: string | null; created_at: string; updated_at: string }>,
      business_metrics: WorkspaceTable<{ id: string; organization_id: string; name: string; metric_key: string; value: number; unit: string; period_start: string; period_end: string; target: number | null; notes: string | null; client_visible: boolean; created_by: string | null; created_at: string; updated_at: string }>,
      commercial_proposals: WorkspaceTable<{ id: string; organization_id: string; prospect_id: string | null; opportunity_id: string | null; title: string; service_type: string; status: string; amount: number; valid_until: string | null; scope: Json; terms: string | null; sent_at: string | null; decided_at: string | null; created_by: string | null; created_at: string; updated_at: string }>,
      report_schedules: WorkspaceTable<{ id: string; organization_id: string; meeting_id: string | null; project_id: string | null; frequency: string; next_run_at: string | null; is_active: boolean; created_by: string | null; created_at: string }>,
      organizations: WorkspaceTable<{ id: string; name: string; slug: string; organization_type: string; status: string; created_at: string; updated_at: string }>,
      organization_memberships: WorkspaceTable<{ id: string; organization_id: string; user_id: string; role: string; invited_by: string | null; created_at: string }>,
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "consultant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "consultant"],
    },
  },
} as const
