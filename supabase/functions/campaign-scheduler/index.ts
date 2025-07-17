import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ScheduleRequest {
    campaignId: string;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return new Response("Method not allowed", {
            status: 405,
            headers: corsHeaders,
        });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { campaignId }: ScheduleRequest = await req.json();

        // Get campaign details
        const { data: campaign, error: campaignError } = await supabaseClient
            .from("campaigns")
            .select("*")
            .eq("id", campaignId)
            .single();

        if (campaignError || !campaign) {
            throw new Error("Campaign not found");
        }

        if (campaign.status !== "sending") {
            throw new Error("Campaign is not in sending status");
        }

        // Get contacts that haven't been sent to yet
        const { data: alreadySent, error: sentError } = await supabaseClient
            .from("email_sends")
            .select("contact_id")
            .eq("campaign_id", campaignId);

        if (sentError) throw sentError;

        const sentContactIds = alreadySent.map((s) => s.contact_id);
        const remainingContactIds = campaign.contact_ids.filter(
            (id: string) => !sentContactIds.includes(id)
        );

        if (remainingContactIds.length === 0) {
            // Campaign is complete
            await supabaseClient
                .from("campaigns")
                .update({ status: "completed" })
                .eq("id", campaignId);

            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Campaign completed - all emails sent",
                    emailsScheduled: 0,
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        // Calculate timing for spreading emails over 2-3 hours
        const totalEmails = remainingContactIds.length;
        const targetHours = Math.min(3, Math.max(2, totalEmails / 25)); // 2-3 hours based on volume
        const intervalMinutes = Math.max(1, (targetHours * 60) / totalEmails); // At least 1 minute between emails

        console.log(
            `📧 Scheduling ${totalEmails} emails over ${targetHours.toFixed(
                1
            )} hours (${intervalMinutes.toFixed(1)} min intervals)`
        );

        let emailsScheduled = 0;
        const now = new Date();

        // Schedule emails with staggered timing
        for (let i = 0; i < Math.min(totalEmails, campaign.daily_limit); i++) {
            const contactId = remainingContactIds[i];
            const sendTime = new Date(
                now.getTime() + i * intervalMinutes * 60 * 1000
            );

            // Schedule the email by calling send-email function after delay
            setTimeout(async () => {
                try {
                    const response = await fetch(
                        `${Deno.env
                            .get("SUPABASE_URL")
                            ?.replace("/rest/v1", "")}/functions/v1/send-email`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${Deno.env.get(
                                    "SUPABASE_SERVICE_ROLE_KEY"
                                )}`,
                            },
                            body: JSON.stringify({
                                campaignId: campaignId,
                                contactId: contactId,
                                templateId: campaign.template_id,
                            }),
                        }
                    );

                    if (response.ok) {
                        const result = await response.json();
                        console.log(
                            `✅ Scheduled email sent: ${
                                result.recipient
                            } at ${new Date().toISOString()}`
                        );
                    } else {
                        console.error(
                            `❌ Failed to send scheduled email to contact ${contactId}`
                        );
                    }
                } catch (error) {
                    console.error(`❌ Error sending scheduled email:`, error);
                }
            }, i * intervalMinutes * 60 * 1000);

            emailsScheduled++;
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Scheduled ${emailsScheduled} emails over ${targetHours.toFixed(
                    1
                )} hours`,
                emailsScheduled,
                intervalMinutes: intervalMinutes.toFixed(1),
                targetHours: targetHours.toFixed(1),
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Campaign scheduling error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
