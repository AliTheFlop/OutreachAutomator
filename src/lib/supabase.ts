import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          company: string | null;
          custom_fields: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          custom_fields?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          company?: string | null;
          custom_fields?: any;
          created_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          subject: string;
          body: string;
          variables: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          body: string;
          variables?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          body?: string;
          variables?: any;
          created_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          template_id: string | null;
          contact_ids: any;
          status: string;
          sent_count: number;
          open_count: number;
          click_count: number;
          daily_limit: number;
          delay_between_emails: number;
          scheduled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          template_id?: string | null;
          contact_ids?: any;
          status?: string;
          sent_count?: number;
          open_count?: number;
          click_count?: number;
          daily_limit?: number;
          delay_between_emails?: number;
          scheduled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          template_id?: string | null;
          contact_ids?: any;
          status?: string;
          sent_count?: number;
          open_count?: number;
          click_count?: number;
          daily_limit?: number;
          delay_between_emails?: number;
          scheduled_at?: string | null;
          created_at?: string;
        };
      };
      email_sends: {
        Row: {
          id: string;
          campaign_id: string | null;
          contact_id: string | null;
          sent_at: string;
          opened: boolean;
          clicked: boolean;
          tracking_pixel_id: string | null;
        };
        Insert: {
          id?: string;
          campaign_id?: string | null;
          contact_id?: string | null;
          sent_at?: string;
          opened?: boolean;
          clicked?: boolean;
          tracking_pixel_id?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string | null;
          contact_id?: string | null;
          sent_at?: string;
          opened?: boolean;
          clicked?: boolean;
          tracking_pixel_id?: string | null;
        };
      };
      email_opens: {
        Row: {
          id: string;
          email_send_id: string | null;
          opened_at: string;
          user_agent: string | null;
          ip_address: string | null;
        };
        Insert: {
          id?: string;
          email_send_id?: string | null;
          opened_at?: string;
          user_agent?: string | null;
          ip_address?: string | null;
        };
        Update: {
          id?: string;
          email_send_id?: string | null;
          opened_at?: string;
          user_agent?: string | null;
          ip_address?: string | null;
        };
      };
    };
  };
};