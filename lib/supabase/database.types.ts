export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      analytics_hits: {
        Row: {
          event_id: string | null;
          id: number;
          metric: Database["public"]["Enums"]["analytics_metric"];
          occurred_at: string;
          owner_id: string;
        };
        Insert: {
          event_id?: string | null;
          id?: never;
          metric: Database["public"]["Enums"]["analytics_metric"];
          occurred_at?: string;
          owner_id: string;
        };
        Update: {
          event_id?: string | null;
          id?: never;
          metric?: Database["public"]["Enums"]["analytics_metric"];
          occurred_at?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_hits_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_hits_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          label: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          label: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          label?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      event_tags: {
        Row: {
          event_id: string;
          tag_id: string;
        };
        Insert: {
          event_id: string;
          tag_id: string;
        };
        Update: {
          event_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_tags_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          address: string | null;
          category_id: string;
          city: string | null;
          country_code: string | null;
          cover_image_url: string | null;
          created_at: string;
          description: string | null;
          end_at: string | null;
          event_type: Database["public"]["Enums"]["event_type"];
          external_url: string | null;
          id: string;
          is_free: boolean;
          latitude: number | null;
          longitude: number | null;
          map_url: string | null;
          online_url: string | null;
          owner_id: string;
          price_info: string | null;
          published_at: string | null;
          search_vector: unknown;
          short_description: string | null;
          slug: string;
          start_at: string;
          status: Database["public"]["Enums"]["event_status"];
          ticket_cta_label: string | null;
          ticket_url: string | null;
          timezone: string;
          title: string;
          updated_at: string;
          venue_name: string | null;
        };
        Insert: {
          address?: string | null;
          category_id: string;
          city?: string | null;
          country_code?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          end_at?: string | null;
          event_type?: Database["public"]["Enums"]["event_type"];
          external_url?: string | null;
          id?: string;
          is_free?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          map_url?: string | null;
          online_url?: string | null;
          owner_id: string;
          price_info?: string | null;
          published_at?: string | null;
          search_vector?: unknown;
          short_description?: string | null;
          slug: string;
          start_at: string;
          status?: Database["public"]["Enums"]["event_status"];
          ticket_cta_label?: string | null;
          ticket_url?: string | null;
          timezone: string;
          title: string;
          updated_at?: string;
          venue_name?: string | null;
        };
        Update: {
          address?: string | null;
          category_id?: string;
          city?: string | null;
          country_code?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          end_at?: string | null;
          event_type?: Database["public"]["Enums"]["event_type"];
          external_url?: string | null;
          id?: string;
          is_free?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          map_url?: string | null;
          online_url?: string | null;
          owner_id?: string;
          price_info?: string | null;
          published_at?: string | null;
          search_vector?: unknown;
          short_description?: string | null;
          slug?: string;
          start_at?: string;
          status?: Database["public"]["Enums"]["event_status"];
          ticket_cta_label?: string | null;
          ticket_url?: string | null;
          timezone?: string;
          title?: string;
          updated_at?: string;
          venue_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          city: string | null;
          country_code: string | null;
          cover_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          publisher_type: Database["public"]["Enums"]["publisher_type"];
          social_links: Json;
          updated_at: string;
          username: string;
          website_url: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          country_code?: string | null;
          cover_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          publisher_type?: Database["public"]["Enums"]["publisher_type"];
          social_links?: Json;
          updated_at?: string;
          username: string;
          website_url?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          city?: string | null;
          country_code?: string | null;
          cover_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          publisher_type?: Database["public"]["Enums"]["publisher_type"];
          social_links?: Json;
          updated_at?: string;
          username?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          slug?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      analytics_daily: {
        Args: { p_from: string; p_owner_id: string; p_to: string };
        Returns: {
          day: string;
          hits: number;
          metric: Database["public"]["Enums"]["analytics_metric"];
        }[];
      };
      analytics_top_events: {
        Args: {
          p_from: string;
          p_limit: number;
          p_owner_id: string;
          p_to: string;
        };
        Returns: {
          event_id: string;
          slug: string;
          status: Database["public"]["Enums"]["event_status"];
          title: string;
          views: number;
        }[];
      };
      record_analytics_hit: {
        Args: {
          p_event_id?: string;
          p_metric: Database["public"]["Enums"]["analytics_metric"];
          p_username: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      analytics_metric: "page_view" | "ticket_click";
      event_status:
        | "draft"
        | "published"
        | "cancelled"
        | "postponed"
        | "archived";
      event_type: "in_person" | "online" | "hybrid";
      publisher_type:
        | "artist"
        | "band"
        | "theater"
        | "cinema"
        | "sports_team"
        | "event_organizer"
        | "school"
        | "university"
        | "conference_organizer"
        | "church"
        | "community"
        | "venue"
        | "business"
        | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      analytics_metric: ["page_view", "ticket_click"],
      event_status: [
        "draft",
        "published",
        "cancelled",
        "postponed",
        "archived",
      ],
      event_type: ["in_person", "online", "hybrid"],
      publisher_type: [
        "artist",
        "band",
        "theater",
        "cinema",
        "sports_team",
        "event_organizer",
        "school",
        "university",
        "conference_organizer",
        "church",
        "community",
        "venue",
        "business",
        "other",
      ],
    },
  },
} as const;
