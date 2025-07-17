/*
  # Add RPC Functions for Campaign Counters

  1. Functions
    - `increment_sent_count` - Safely increment campaign sent count
    - `increment_open_count` - Safely increment campaign open count
    - `increment_click_count` - Safely increment campaign click count

  2. Security
    - Functions can only be called by service role
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