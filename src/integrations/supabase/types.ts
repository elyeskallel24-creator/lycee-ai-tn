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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_date: string
          activity_type: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      annotations: {
        Row: {
          created_at: string
          data: Json
          id: string
          ressource_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          ressource_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          ressource_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_ressource_id_fkey"
            columns: ["ressource_id"]
            isOneToOne: false
            referencedRelation: "ressources"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          subject: string | null
          thumbnail: string | null
          title: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          subject?: string | null
          thumbnail?: string | null
          title?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          subject?: string | null
          thumbnail?: string | null
          title?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_countdowns: {
        Row: {
          created_at: string
          exam_date: string
          exam_name: string
          id: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_date: string
          exam_name: string
          id?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          exam_name?: string
          id?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flashcard_decks: {
        Row: {
          created_at: string
          id: string
          name: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string
          deck_id: string
          ease_factor: number
          id: string
          interval: number
          next_review: string
          question: string
          repetitions: number
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          deck_id: string
          ease_factor?: number
          id?: string
          interval?: number
          next_review?: string
          question: string
          repetitions?: number
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          deck_id?: string
          ease_factor?: number
          id?: string
          interval?: number
          next_review?: string
          question?: string
          repetitions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_log: {
        Row: {
          breakfast: boolean | null
          created_at: string
          dinner: boolean | null
          id: string
          log_date: string
          lunch: boolean | null
          snack: boolean | null
          user_id: string
          water_1: boolean | null
          water_2: boolean | null
          water_3: boolean | null
          water_4: boolean | null
        }
        Insert: {
          breakfast?: boolean | null
          created_at?: string
          dinner?: boolean | null
          id?: string
          log_date?: string
          lunch?: boolean | null
          snack?: boolean | null
          user_id: string
          water_1?: boolean | null
          water_2?: boolean | null
          water_3?: boolean | null
          water_4?: boolean | null
        }
        Update: {
          breakfast?: boolean | null
          created_at?: string
          dinner?: boolean | null
          id?: string
          log_date?: string
          lunch?: boolean | null
          snack?: boolean | null
          user_id?: string
          water_1?: boolean | null
          water_2?: boolean | null
          water_3?: boolean | null
          water_4?: boolean | null
        }
        Relationships: []
      }
      knowledge_nodes: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          parent_id: string | null
          position: number | null
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          parent_id?: string | null
          position?: number | null
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          parent_id?: string | null
          position?: number | null
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planner_events: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_recurring: boolean
          recurrence_rule: string | null
          start_time: string
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
          start_time: string
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
          start_time?: string
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          level: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          school_level: string | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          level?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          school_level?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          level?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          school_level?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      ressources: {
        Row: {
          available_to: string[]
          description: string | null
          file_url: string
          id: string
          subject: string | null
          title: string
          uploaded_at: string
        }
        Insert: {
          available_to?: string[]
          description?: string | null
          file_url: string
          id?: string
          subject?: string | null
          title: string
          uploaded_at?: string
        }
        Update: {
          available_to?: string[]
          description?: string | null
          file_url?: string
          id?: string
          subject?: string | null
          title?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          start_time: string
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          hex_color: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hex_color?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          hex_color?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          daily_reset_date: string | null
          description: string | null
          due_date: string | null
          id: string
          is_daily_goal: boolean
          position: number | null
          status: string
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_reset_date?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_daily_goal?: boolean
          position?: number | null
          status?: string
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_reset_date?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_daily_goal?: boolean
          position?: number | null
          status?: string
          subject?: string | null
          title?: string
          user_id?: string
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
      app_role: "admin" | "user"
      plan_type: "freemium" | "lite" | "premium"
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
      app_role: ["admin", "user"],
      plan_type: ["freemium", "lite", "premium"],
    },
  },
} as const
