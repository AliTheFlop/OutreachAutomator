import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
};

interface Campaign {
  id?: string;
  name: string;
  templateId: string;
  contactIds: string[];
  status?: string;
  sentCount?: number;
  openCount?: number;
  clickCount?: number;
  dailyLimit: number;
  delayBetweenEmails: number;
  scheduledAt?: Date;
  createdAt?: Date;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const campaignId = pathParts[pathParts.length - 2]; // campaigns/{id}/action
    const action = pathParts[pathParts.length - 1];

    if (req.method === 'GET') {
      const { data, error } = await supabaseClient
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const campaigns = data.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        templateId: campaign.template_id,
        contactIds: campaign.contact_ids || [],
        status: campaign.status,
        sentCount: campaign.sent_count,
        openCount: campaign.open_count,
        clickCount: campaign.click_count,
        dailyLimit: campaign.daily_limit,
        delayBetweenEmails: campaign.delay_between_emails,
        scheduledAt: campaign.scheduled_at ? new Date(campaign.scheduled_at) : null,
        createdAt: new Date(campaign.created_at)
      }));

      return new Response(JSON.stringify(campaigns), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && action === 'start') {
      // Start campaign - this will trigger the email sending
      const { error: updateError } = await supabaseClient
        .from('campaigns')
        .update({ status: 'sending' })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      // In a full serverless setup, you'd typically:
      // 1. Queue the email sending job
      // 2. Use a separate cron job or scheduled function to process emails
      // For now, we'll just update the status
      
      return new Response(JSON.stringify({ success: true, message: 'Campaign started' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const campaign: Campaign = await req.json();
      
      const { data, error } = await supabaseClient
        .from('campaigns')
        .insert({
          name: campaign.name,
          template_id: campaign.templateId,
          contact_ids: campaign.contactIds,
          daily_limit: campaign.dailyLimit,
          delay_between_emails: campaign.delayBetweenEmails
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, id: data.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PATCH' && action === 'status') {
      const { status } = await req.json();
      
      const { error } = await supabaseClient
        .from('campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});