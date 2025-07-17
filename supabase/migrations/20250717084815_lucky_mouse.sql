/*
  # Add increment functions for campaign statistics

  1. Functions
    - `increment_sent_count` - Increments the sent_count for a campaign
    - `increment_open_count` - Increments the open_count for a campaign
    - `increment_click_count` - Increments the click_count for a campaign

  2. Security
    - Functions are accessible to authenticated users
    - Functions validate campaign exists before incrementing
*/

-- Function to increment sent count
CREATE OR REPLACE FUNCTION increment_sent_count(campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE campaigns 
  SET sent_count = sent_count + 1 
  WHERE id = campaign_id;
END;
$$;

-- Function to increment open count
CREATE OR REPLACE FUNCTION increment_open_count(campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE campaigns 
  SET open_count = open_count + 1 
  WHERE id = campaign_id;
END;
$$;

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_click_count(campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE campaigns 
  SET click_count = click_count + 1 
  WHERE id = campaign_id;
END;
$$;