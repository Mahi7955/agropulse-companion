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
      apmc_prices: {
        Row: {
          arrival_date: string
          commodity: string
          created_at: string
          district: string
          grade: string | null
          id: string
          market: string
          max_price: number
          min_price: number
          modal_price: number
          state: string
          variety: string | null
        }
        Insert: {
          arrival_date: string
          commodity: string
          created_at?: string
          district: string
          grade?: string | null
          id?: string
          market: string
          max_price: number
          min_price: number
          modal_price: number
          state: string
          variety?: string | null
        }
        Update: {
          arrival_date?: string
          commodity?: string
          created_at?: string
          district?: string
          grade?: string | null
          id?: string
          market?: string
          max_price?: number
          min_price?: number
          modal_price?: number
          state?: string
          variety?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          daily_price: number
          description: string | null
          district: string | null
          equipment_name: string
          equipment_type: string
          id: string
          image_url: string | null
          is_available: boolean
          latitude: number | null
          longitude: number | null
          owner_id: string
          phone_contact: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_price: number
          description?: string | null
          district?: string | null
          equipment_name: string
          equipment_type: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          latitude?: number | null
          longitude?: number | null
          owner_id: string
          phone_contact?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_price?: number
          description?: string | null
          district?: string | null
          equipment_name?: string
          equipment_type?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          latitude?: number | null
          longitude?: number | null
          owner_id?: string
          phone_contact?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          expense_date: string
          expense_type: string
          farm_id: string
          id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type: string
          farm_id: string
          id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_type?: string
          farm_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farmers: {
        Row: {
          created_at: string
          district: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      farms: {
        Row: {
          area_acres: number | null
          created_at: string
          crop_type: string
          farmer_id: string
          id: string
          season: string
          sowing_date: string
          updated_at: string
        }
        Insert: {
          area_acres?: number | null
          created_at?: string
          crop_type: string
          farmer_id: string
          id?: string
          season: string
          sowing_date: string
          updated_at?: string
        }
        Update: {
          area_acres?: number | null
          created_at?: string
          crop_type?: string
          farmer_id?: string
          id?: string
          season?: string
          sowing_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      price_alerts: {
        Row: {
          created_at: string
          crop: string
          farmer_id: string
          id: string
          is_active: boolean | null
          target_price: number
          triggered_at: string | null
        }
        Insert: {
          created_at?: string
          crop: string
          farmer_id: string
          id?: string
          is_active?: boolean | null
          target_price: number
          triggered_at?: string | null
        }
        Update: {
          created_at?: string
          crop?: string
          farmer_id?: string
          id?: string
          is_active?: boolean | null
          target_price?: number
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
