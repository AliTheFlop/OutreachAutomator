import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get total stats from campaigns
    const { data: campaigns, error: campaignsError } = await supabaseClient
      .from('campaigns')
      .select('sent_count, open_count, click_count');

    if (campaignsError) throw campaignsError;

    const totals = campaigns.reduce((acc: any, campaign: any) => ({
      totalCampaigns: acc.totalCampaigns + 1,
      totalSent: acc.totalSent + campaign.sent_count,
      totalOpens: acc.totalOpens + campaign.open_count,
      totalClicks: acc.totalClicks + campaign.click_count
    }), { totalCampaigns: 0, totalSent: 0, totalOpens: 0, totalClicks: 0 });
    
    // Get recent email opens
    const { data: recentOpens, error: opensError } = await supabaseClient
      .from('email_opens')
      .select(`
        *,
        email_sends!inner(
          campaign_id,
          campaigns!inner(name)
        )
      `)
      .order('opened_at', { ascending: false })
      .limit(10);

    if (opensError) throw opensError;

    const analytics = {
      totals,
      recentOpens: recentOpens.map((open: any) => ({
        ...open,
        campaignId: open.email_sends.campaign_id,
        campaignName: open.email_sends.campaigns.name
      }))
    };

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});