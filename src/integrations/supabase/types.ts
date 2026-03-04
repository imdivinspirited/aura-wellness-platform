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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      aol_content: {
        Row: {
          category: string | null
          city: string | null
          content_type: string
          created_at: string
          description: string
          donation: string | null
          eligibility: string | null
          end_date: string | null
          fetched_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          raw_content: string
          registration_link: string | null
          search_vector: unknown
          slug: string
          source_url: string | null
          start_date: string | null
          summary: string
          tags: string[] | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          content_type?: string
          created_at?: string
          description?: string
          donation?: string | null
          eligibility?: string | null
          end_date?: string | null
          fetched_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          raw_content?: string
          registration_link?: string | null
          search_vector?: unknown
          slug: string
          source_url?: string | null
          start_date?: string | null
          summary?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          content_type?: string
          created_at?: string
          description?: string
          donation?: string | null
          eligibility?: string | null
          end_date?: string | null
          fetched_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          raw_content?: string
          registration_link?: string | null
          search_vector?: unknown
          slug?: string
          source_url?: string | null
          start_date?: string | null
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          age: number | null
          application_type: string
          available_from: string | null
          city: string
          country: string
          created_at: string
          duration: string | null
          education: string | null
          email: string
          full_name: string
          gender: string | null
          id: string
          phone: string
          photo_url: string | null
          position: string
          resume_url: string | null
          sheets_synced: boolean
          skills: string | null
          state: string | null
          status: string
          whatsapp: string | null
          why_join: string
        }
        Insert: {
          age?: number | null
          application_type: string
          available_from?: string | null
          city: string
          country?: string
          created_at?: string
          duration?: string | null
          education?: string | null
          email: string
          full_name: string
          gender?: string | null
          id?: string
          phone: string
          photo_url?: string | null
          position: string
          resume_url?: string | null
          sheets_synced?: boolean
          skills?: string | null
          state?: string | null
          status?: string
          whatsapp?: string | null
          why_join: string
        }
        Update: {
          age?: number | null
          application_type?: string
          available_from?: string | null
          city?: string
          country?: string
          created_at?: string
          duration?: string | null
          education?: string | null
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string
          photo_url?: string | null
          position?: string
          resume_url?: string | null
          sheets_synced?: boolean
          skills?: string | null
          state?: string | null
          status?: string
          whatsapp?: string | null
          why_join?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_aol_content: {
        Args: {
          content_types?: string[]
          only_upcoming?: boolean
          result_limit?: number
          search_query: string
        }
        Returns: {
          category: string
          city: string
          content_type: string
          description: string
          donation: string
          eligibility: string
          end_date: string
          id: string
          metadata: Json
          rank: number
          registration_link: string
          source_url: string
          start_date: string
          summary: string
          tags: string[]
          title: string
          venue: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
