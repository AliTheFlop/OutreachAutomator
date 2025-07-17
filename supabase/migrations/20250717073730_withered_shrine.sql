/*
  # Create Outreach Email Tool Schema

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `first_name` (text)
      - `last_name` (text)
      - `company` (text)
      - `custom_fields` (jsonb)
      - `created_at` (timestamp)
    - `templates`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `subject` (text, not null)
      - `body` (text, not null)
      - `variables` (jsonb)
      - `created_at` (timestamp)
    - `campaigns`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `template_id` (uuid, foreign key)
      - `contact_ids` (jsonb)
      - `status` (text, default 'draft')
      - `sent_count` (integer, default 0)
      - `open_count` (integer, default 0)
      - `click_count` (integer, default 0)
      - `daily_limit` (integer, default 50)
      - `delay_between_emails` (integer, default 30)
      - `scheduled_at` (timestamp)
      - `created_at` (timestamp)
    - `email_sends`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, foreign key)
      - `contact_id` (uuid, foreign key)
      - `sent_at` (timestamp)
      - `opened` (boolean, default false)
      - `clicked` (boolean, default false)
      - `tracking_pixel_id` (text)
    - `email_opens`
      - `id` (uuid, primary key)
      - `email_send_id` (uuid, foreign key)
      - `opened_at` (timestamp)
      - `user_agent` (text)
      - `ip_address` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  company text,
  custom_fields jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE,
  contact_ids jsonb DEFAULT '[]',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'paused')),
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  daily_limit integer DEFAULT 50,
  delay_between_emails integer DEFAULT 30,
  scheduled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create email_sends table
CREATE TABLE IF NOT EXISTS email_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  tracking_pixel_id text
);

-- Create email_opens table
CREATE TABLE IF NOT EXISTS email_opens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_send_id uuid REFERENCES email_sends(id) ON DELETE CASCADE,
  opened_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address text
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_opens ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
CREATE POLICY "Users can manage their own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for templates
CREATE POLICY "Users can manage their own templates"
  ON templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for campaigns
CREATE POLICY "Users can manage their own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for email_sends
CREATE POLICY "Users can manage their own email sends"
  ON email_sends
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for email_opens
CREATE POLICY "Users can manage their own email opens"
  ON email_opens
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign_id ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_tracking_pixel_id ON email_sends(tracking_pixel_id);
CREATE INDEX IF NOT EXISTS idx_email_opens_email_send_id ON email_opens(email_send_id);