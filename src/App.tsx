import React, { useState } from "react";
import {
    Mail,
    Upload,
    Settings,
    BarChart3,
    Users,
    Send,
    Eye,
    MousePointer,
} from "lucide-react";
import ContactUpload from "./components/ContactUpload";
import TemplateManager from "./components/TemplateManager";
import CampaignDashboard from "./components/CampaignDashboard";
import Analytics from "./components/Analytics";
import { useContacts, useTemplates, useCampaigns } from "./hooks/useApi";

function App() {
    const [activeTab, setActiveTab] = useState("contacts");
    const { contacts, addContacts, removeContact } = useContacts();
    const { templates, saveTemplate, removeTemplate } = useTemplates();
    const {
        campaigns,
        createCampaign,
        updateCampaignStatus,
        startCampaign,
        deleteCampaign,
    } = useCampaigns();

    const sidebarItems = [
        { id: "contacts", label: "Contacts", icon: Users },
        { id: "templates", label: "Templates", icon: Mail },
        { id: "campaigns", label: "Campaigns", icon: Send },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "contacts":
                return (
                    <ContactUpload
                        contacts={contacts}
                        addContacts={addContacts}
                        removeContact={removeContact}
                    />
                );
            case "templates":
                return (
                    <TemplateManager
                        templates={templates}
                        saveTemplate={saveTemplate}
                        removeTemplate={removeTemplate}
                    />
                );
            case "campaigns":
                return (
                    <CampaignDashboard
                        campaigns={campaigns}
                        createCampaign={createCampaign}
                        updateCampaignStatus={updateCampaignStatus}
                        startCampaign={startCampaign}
                        deleteCampaign={deleteCampaign}
                        contacts={contacts}
                        templates={templates}
                    />
                );
            case "analytics":
                return <Analytics campaigns={campaigns} />;
            default:
                return (
                    <ContactUpload
                        contacts={contacts}
                        addContacts={addContacts}
                        removeContact={removeContact}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Mail className="w-6 h-6 text-blue-400" />
                        Outreach Pro
                    </h1>
                </div>

                <nav className="flex-1 p-4">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                activeTab === item.id
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="text-sm text-gray-400">
                        <div className="flex justify-between mb-1">
                            <span>Daily Limit</span>
                            <span>47/150</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                                className="bg-blue-400 h-2 rounded-full"
                                style={{ width: "31%" }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">{renderContent()}</div>
        </div>
    );
}

export default App;
