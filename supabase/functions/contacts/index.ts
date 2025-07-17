import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

interface Contact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  customFields?: Record<string, any>;
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
    const contactId = pathParts[pathParts.length - 1];

    if (req.method === 'GET') {
      const { data, error } = await supabaseClient
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const contacts = data.map((contact: any) => ({
        id: contact.id,
        email: contact.email,
        firstName: contact.first_name || '',
        lastName: contact.last_name || '',
        company: contact.company || '',
        customFields: contact.custom_fields || {}
      }));

      return new Response(JSON.stringify(contacts), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const contacts: Contact[] = await req.json();
      
      const contactsToInsert = contacts.map(contact => ({
        email: contact.email,
        first_name: contact.firstName || null,
        last_name: contact.lastName || null,
        company: contact.company || null,
        custom_fields: contact.customFields || {}
      }));

      const { error } = await supabaseClient
        .from('contacts')
        .insert(contactsToInsert);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'DELETE' && contactId) {
      const { error } = await supabaseClient
        .from('contacts')
        .delete()
        .eq('id', contactId);

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