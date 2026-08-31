/**
 * TheTutor — Supabase database types
 *
 * Generated from the live Supabase schema.
 * Keep this file aligned with the database schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      grades: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          code: string | null;
          level: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          code?: string | null;
          level?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          code?: string | null;
          level?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      terms: {
        Row: {
          id: string;
          grade_id: string;
          name: string;
          code: string | null;
          term_number: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          grade_id: string;
          name: string;
          code?: string | null;
          term_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          grade_id?: string;
          name?: string;
          code?: string | null;
          term_number?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      subjects: {
        Row: {
          id: string;
          term_id: string;
          name: string;
          code: string | null;
          description: string | null;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          term_id: string;
          name: string;
          code?: string | null;
          description?: string | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          term_id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      units: {
        Row: {
          id: string;
          subject_id: string;
          name: string;
          code: string | null;
          unit_number: number | null;
          description: string | null;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          name: string;
          code?: string | null;
          unit_number?: number | null;
          description?: string | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          name?: string;
          code?: string | null;
          unit_number?: number | null;
          description?: string | null;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      lessons: {
        Row: {
          id: string;
          unit_id: string;
          title: string;
          lesson_number: number | null;
          description: string | null;
          content_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          title: string;
          lesson_number?: number | null;
          description?: string | null;
          content_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          title?: string;
          lesson_number?: number | null;
          description?: string | null;
          content_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};