const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export interface ApiContact {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    customFields?: Record<string, any>;
}

export interface ApiTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    createdAt: Date;
}

export interface ApiCampaign {
    id: string;
    name: string;
    templateId: string;
    contactIds: string[];
    status: "draft" | "scheduled" | "sending" | "completed" | "paused";
    sentCount: number;
    openCount: number;
    clickCount: number;
    dailyLimit: number;
    delayBetweenEmails: number;
    scheduledAt?: Date;
    createdAt: Date;
}

class ApiService {
    // Contacts
    async getContacts(): Promise<ApiContact[]> {
        const response = await fetch(`${API_BASE}/contacts`, {
            headers: {
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
        });
        return response.json();
    }

    async createContacts(contacts: Omit<ApiContact, "id">[]): Promise<void> {
        await fetch(`${API_BASE}/contacts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
            body: JSON.stringify(contacts),
        });
    }

    async deleteContact(id: string): Promise<void> {
        await fetch(`${API_BASE}/contacts/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
        });
    }

    // Templates
    async getTemplates(): Promise<ApiTemplate[]> {
        const response = await fetch(`${API_BASE}/templates`, {
            headers: {
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
        });
        const templates = await response.json();
        return templates.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
        }));
    }

    async createTemplate(
        template: Omit<ApiTemplate, "id" | "createdAt">
    ): Promise<string> {
        const response = await fetch(`${API_BASE}/templates`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
            body: JSON.stringify(template),
        });
        const result = await response.json();
        return result.id;
    }

    async updateTemplate(template: ApiTemplate): Promise<void> {
        await fetch(`${API_BASE}/templates`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
            body: JSON.stringify(template),
        });
    }

    async deleteTemplate(id: string): Promise<void> {
        await fetch(`${API_BASE}/templates/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
        });
    }

    // Campaigns
    async getCampaigns(): Promise<ApiCampaign[]> {
        const response = await fetch(`${API_BASE}/campaigns`, {
            headers: {
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
        });
        const campaigns = await response.json();
        return campaigns.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            scheduledAt: c.scheduledAt ? new Date(c.scheduledAt) : undefined,
        }));
    }

    async createCampaign(
        campaign: Omit<
            ApiCampaign,
            | "id"
            | "status"
            | "sentCount"
            | "openCount"
            | "clickCount"
            | "createdAt"
            | "scheduledAt"
        >
    ): Promise<string> {
        const response = await fetch(`${API_BASE}/campaigns`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
            body: JSON.stringify(campaign),
        });
        const result = await response.json();
        return result.id;
    }

    async updateCampaignStatus(
        id: string,
        status: ApiCampaign["status"]
    ): Promise<void> {
        await fetch(`${API_BASE}/campaigns/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
            body: JSON.stringify({ status }),
        });
    }

    async startCampaign(id: string): Promise<void> {
        await fetch(`${API_BASE}/campaigns/${id}/start`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
        });
    }

    async deleteCampaign(id: string): Promise<void> {
        await fetch(`${API_BASE}/campaigns/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
        });
    }

    // Analytics
    async getAnalytics(): Promise<any> {
        const response = await fetch(`${API_BASE}/analytics`, {
            headers: {
                Authorization: `Bearer ${
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                }`,
            },
        });
        return response.json();
    }
}

export const apiService = new ApiService();
