import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  campaignId: string;
  contactId: string;
  templateId: string;
}

function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
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

    const { campaignId, contactId, templateId }: EmailRequest = await req.json();

    // Get contact details
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      throw new Error('Contact not found');
    }

    // Get template details
    const { data: template, error: templateError } = await supabaseClient
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    const trackingPixelId = crypto.randomUUID();
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || '';
    
    // Prepare variables for template replacement
    const variables = {
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      company: contact.company || '',
      email: contact.email || '',
      ...contact.custom_fields
    };

    // Replace variables in subject and body
    const subject = replaceVariables(template.subject, variables);
    let body = replaceVariables(template.body, variables);
    
    // Add tracking pixel
    const trackingPixel = `<img src="${baseUrl}/functions/v1/track-open/${trackingPixelId}" width="1" height="1" style="display:none;" />`;
    body += trackingPixel;

    // Record email send
    const { error: emailSendError } = await supabaseClient
      .from('email_sends')
      .insert({
        campaign_id: campaignId,
        contact_id: contactId,
        tracking_pixel_id: trackingPixelId
      });

    if (emailSendError) throw emailSendError;

    // Here you would integrate with your email service (Resend, SendGrid, etc.)
    // For now, we'll simulate sending
    console.log(`[SIMULATED] Email sent to ${contact.email} with subject: ${subject}`);

    // Update campaign sent count
    const { error: updateError } = await supabaseClient
      .rpc('increment_sent_count', { campaign_id: campaignId });

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully',
      trackingPixelId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});