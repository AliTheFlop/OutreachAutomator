import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
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
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const url = new URL(req.url);
        const pathParts = url.pathname
            .split("/")
            .filter((part) => part.length > 0);

        // Extract campaign ID and action from URL path
        // Expected patterns: /functions/v1/campaigns/{id} or /functions/v1/campaigns/{id}/{action}
        let campaignId = null;
        let action = null;

        const campaignsIndex = pathParts.findIndex(
            (part) => part === "campaigns"
        );
        if (campaignsIndex !== -1 && pathParts.length > campaignsIndex + 1) {
            campaignId = pathParts[campaignsIndex + 1];
            if (pathParts.length > campaignsIndex + 2) {
                action = pathParts[campaignsIndex + 2];
            }
        }

        if (req.method === "GET") {
            const { data, error } = await supabaseClient
                .from("campaigns")
                .select("*")
                .order("created_at", { ascending: false });

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
                scheduledAt: campaign.scheduled_at
                    ? new Date(campaign.scheduled_at)
                    : null,
                createdAt: new Date(campaign.created_at),
            }));

            return new Response(JSON.stringify(campaigns), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (req.method === "POST" && action === "start") {
            // Start campaign - this will trigger the email sending
            const { error: updateError } = await supabaseClient
                .from("campaigns")
                .update({ status: "sending" })
                .eq("id", campaignId);

            if (updateError) throw updateError;

            // Start the campaign scheduler
            try {
                const schedulerResponse = await fetch(
                    `${Deno.env
                        .get("SUPABASE_URL")
                        ?.replace(
                            "/rest/v1",
                            ""
                        )}/functions/v1/campaign-scheduler`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${Deno.env.get(
                                "SUPABASE_SERVICE_ROLE_KEY"
                            )}`,
                        },
                        body: JSON.stringify({ campaignId }),
                    }
                );

                if (!schedulerResponse.ok) {
                    throw new Error("Failed to start campaign scheduler");
                }

                const schedulerResult = await schedulerResponse.json();
                console.log("Campaign scheduler started:", schedulerResult);
            } catch (schedulerError) {
                console.error(
                    "Failed to start campaign scheduler:",
                    schedulerError
                );
                // Don't fail the whole request, just log the error
            }

            return new Response(
                JSON.stringify({ success: true, message: "Campaign started" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        if (req.method === "POST") {
            const campaign: Campaign = await req.json();

            const { data, error } = await supabaseClient
                .from("campaigns")
                .insert({
                    name: campaign.name,
                    template_id: campaign.templateId,
                    contact_ids: campaign.contactIds,
                    daily_limit: campaign.dailyLimit,
                    delay_between_emails: campaign.delayBetweenEmails,
                })
                .select()
                .single();

            if (error) throw error;

            return new Response(
                JSON.stringify({ success: true, id: data.id }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        if (req.method === "DELETE" && campaignId && !action) {
            const { error } = await supabaseClient
                .from("campaigns")
                .delete()
                .eq("id", campaignId);

            if (error) throw error;

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (req.method === "PATCH" && action === "status") {
            const { status } = await req.json();

            const { error } = await supabaseClient
                .from("campaigns")
                .update({ status })
                .eq("id", campaignId);

            if (error) throw error;

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response("Method not allowed", {
            status: 405,
            headers: corsHeaders,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
