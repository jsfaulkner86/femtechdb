export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          category: Database["public"]["Enums"]["femtech_category"]
          claimed_by: string | null
          continent: string | null
          country: string | null
          created_at: string
          founded_year: number | null
          headquarters: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          mission: string | null
          name: string
          problem: string | null
          solution: string | null
          source_url: string | null
          state: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["femtech_category"]
          claimed_by?: string | null
          continent?: string | null
          country?: string | null
          created_at?: string
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          mission?: string | null
          name: string
          problem?: string | null
          solution?: string | null
          source_url?: string | null
          state?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["femtech_category"]
          claimed_by?: string | null
          continent?: string | null
          country?: string | null
          created_at?: string
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          mission?: string | null
          name?: string
          problem?: string | null
          solution?: string | null
          source_url?: string | null
          state?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      company_submissions: {
        Row: {
          admin_notes: string | null
          category: string
          company_name: string
          created_at: string
          description: string | null
          id: string
          reviewed_at: string | null
          status: string
          submitter_email: string | null
          website_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string
          submitter_email?: string | null
          website_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string
          submitter_email?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      founder_claims: {
        Row: {
          admin_notes: string | null
          company_id: string
          created_at: string
          domain_verified: boolean | null
          id: string
          reviewed_at: string | null
          status: string
          user_email: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          company_id: string
          created_at?: string
          domain_verified?: boolean | null
          id?: string
          reviewed_at?: string | null
          status?: string
          user_email: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          company_id?: string
          created_at?: string
          domain_verified?: boolean | null
          id?: string
          reviewed_at?: string | null
          status?: string
          user_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_claims_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      function_executions: {
        Row: {
          executed_at: string
          executed_by: string | null
          function_name: string
          id: string
          success: boolean
          summary: Json | null
        }
        Insert: {
          executed_at?: string
          executed_by?: string | null
          function_name: string
          id?: string
          success?: boolean
          summary?: Json | null
        }
        Update: {
          executed_at?: string
          executed_by?: string | null
          function_name?: string
          id?: string
          success?: boolean
          summary?: Json | null
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      femtech_category:
        | "fertility"
        | "pregnancy"
        | "postpartum"
        | "menstrual_health"
        | "menopause"
        | "sexual_health"
        | "mental_health"
        | "general_wellness"
        | "chronic_conditions"
        | "diagnostics"
        | "telehealth"
        | "other"
        | "investors"
        | "resources_community"
        | "precision_medicine_ai"
        | "reproductive_health"
        | "maternal_health"
        | "hormonal_health"
        | "gynecological_health"
        | "endometriosis"
        | "heart_disease"
        | "pelvic_health"
        | "bone_health"
        | "cancer"
        | "mobile_apps"
        | "pcos"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "moderator", "user"],
      femtech_category: [
        "fertility",
        "pregnancy",
        "postpartum",
        "menstrual_health",
        "menopause",
        "sexual_health",
        "mental_health",
        "general_wellness",
        "chronic_conditions",
        "diagnostics",
        "telehealth",
        "other",
        "investors",
        "resources_community",
        "precision_medicine_ai",
        "reproductive_health",
        "maternal_health",
        "hormonal_health",
        "gynecological_health",
        "endometriosis",
        "heart_disease",
        "pelvic_health",
        "bone_health",
        "cancer",
        "mobile_apps",
        "pcos",
      ],
    },
  },
} as const
