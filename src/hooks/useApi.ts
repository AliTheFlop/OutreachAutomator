import { useState, useEffect } from "react";
import {
    apiService,
    ApiContact,
    ApiTemplate,
    ApiCampaign,
} from "../services/api";

export function useContacts() {
    const [contacts, setContacts] = useState<ApiContact[]>([]);
    const [loading, setLoading] = useState(true);

    const loadContacts = async () => {
        try {
            const data = await apiService.getContacts();
            setContacts(data);
        } catch (error) {
            console.error("Failed to load contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    const addContacts = async (newContacts: Omit<ApiContact, "id">[]) => {
        try {
            await apiService.createContacts(newContacts);
            await loadContacts();
        } catch (error) {
            console.error("Failed to add contacts:", error);
        }
    };

    const removeContact = async (id: string) => {
        try {
            await apiService.deleteContact(id);
            setContacts(contacts.filter((c) => c.id !== id));
        } catch (error) {
            console.error("Failed to remove contact:", error);
        }
    };

    useEffect(() => {
        loadContacts();
    }, []);

    return {
        contacts,
        loading,
        addContacts,
        removeContact,
        refreshContacts: loadContacts,
    };
}

export function useTemplates() {
    const [templates, setTemplates] = useState<ApiTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTemplates = async () => {
        try {
            const data = await apiService.getTemplates();
            setTemplates(data);
        } catch (error) {
            console.error("Failed to load templates:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveTemplate = async (
        template: Omit<ApiTemplate, "id" | "createdAt"> | ApiTemplate
    ) => {
        try {
            if ("id" in template) {
                await apiService.updateTemplate(template);
            } else {
                await apiService.createTemplate(template);
            }
            await loadTemplates();
        } catch (error) {
            console.error("Failed to save template:", error);
        }
    };

    const removeTemplate = async (id: string) => {
        try {
            await apiService.deleteTemplate(id);
            setTemplates(templates.filter((t) => t.id !== id));
        } catch (error) {
            console.error("Failed to remove template:", error);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    return {
        templates,
        loading,
        saveTemplate,
        removeTemplate,
        refreshTemplates: loadTemplates,
    };
}

export function useCampaigns() {
    const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCampaigns = async () => {
        try {
            const data = await apiService.getCampaigns();
            setCampaigns(data);
        } catch (error) {
            console.error("Failed to load campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    const createCampaign = async (
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
    ) => {
        try {
            await apiService.createCampaign(campaign);
            await loadCampaigns();
        } catch (error) {
            console.error("Failed to create campaign:", error);
        }
    };

    const updateCampaignStatus = async (
        id: string,
        status: ApiCampaign["status"]
    ) => {
        try {
            await apiService.updateCampaignStatus(id, status);
            setCampaigns(
                campaigns.map((c) => (c.id === id ? { ...c, status } : c))
            );
        } catch (error) {
            console.error("Failed to update campaign status:", error);
        }
    };

    const startCampaign = async (id: string) => {
        try {
            await apiService.startCampaign(id);
            await loadCampaigns();
        } catch (error) {
            console.error("Failed to start campaign:", error);
        }
    };

    const deleteCampaign = async (id: string) => {
        try {
            await apiService.deleteCampaign(id);
            setCampaigns(campaigns.filter((c) => c.id !== id));
        } catch (error) {
            console.error("Failed to delete campaign:", error);
        }
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    return {
        campaigns,
        loading,
        createCampaign,
        updateCampaignStatus,
        startCampaign,
        deleteCampaign,
        refreshCampaigns: loadCampaigns,
    };
}
