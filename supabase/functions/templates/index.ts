import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

interface Template {
  id?: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
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
    const templateId = pathParts[pathParts.length - 1];

    if (req.method === 'GET') {
      const { data, error } = await supabaseClient
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const templates = data.map((template: any) => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        body: template.body,
        variables: template.variables || [],
        createdAt: new Date(template.created_at)
      }));

      return new Response(JSON.stringify(templates), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const template: Template = await req.json();
      
      if (template.id) {
        // Update existing template
        const { error } = await supabaseClient
          .from('templates')
          .update({
            name: template.name,
            subject: template.subject,
            body: template.body,
            variables: template.variables || []
          })
          .eq('id', template.id);

        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true, id: template.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Create new template
        const { data, error } = await supabaseClient
          .from('templates')
          .insert({
            name: template.name,
            subject: template.subject,
            body: template.body,
            variables: template.variables || []
          })
          .select()
          .single();

        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true, id: data.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (req.method === 'DELETE' && templateId) {
      const { error } = await supabaseClient
        .from('templates')
        .delete()
        .eq('id', templateId);

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