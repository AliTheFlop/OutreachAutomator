import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const trackingId = pathParts[pathParts.length - 1];

    if (!trackingId) {
      return new Response('Invalid tracking ID', { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userAgent = req.headers.get('User-Agent') || '';
    const ipAddress = req.headers.get('CF-Connecting-IP') || 
                     req.headers.get('X-Forwarded-For') || 
                     'unknown';

    // Find the email send record
    const { data: emailSend, error } = await supabaseClient
      .from('email_sends')
      .select('*')
      .eq('tracking_pixel_id', trackingId)
      .single();

    if (!error && emailSend) {
      // Mark email as opened
      await supabaseClient
        .from('email_sends')
        .update({ opened: true })
        .eq('id', emailSend.id);
      
      // Record the open event
      await supabaseClient
        .from('email_opens')
        .insert({
          email_send_id: emailSend.id,
          user_agent: userAgent,
          ip_address: ipAddress
        });
      
      // Update campaign open count
      await supabaseClient
        .rpc('increment_open_count', { campaign_id: emailSend.campaign_id });
    }
  } catch (error) {
    console.error('Error tracking pixel:', error);
  }

  // Return a 1x1 transparent pixel
  const pixel = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x60, 0x18, 0x05, 0xA3,
    0x60, 0x14, 0x8C, 0x02, 0x08, 0x00, 0x00, 0x04, 0x10, 0x00, 0x01, 0x27,
    0x6B, 0xF7, 0x4C, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);

  return new Response(pixel, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': pixel.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
});