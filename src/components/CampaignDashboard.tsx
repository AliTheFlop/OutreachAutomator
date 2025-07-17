import React, { useState } from 'react';
import { Play, Pause, Plus, Settings, Eye, MousePointer, Clock, CheckCircle } from 'lucide-react';
import { ApiCampaign, ApiContact, ApiTemplate } from '../services/api';

interface CampaignDashboardProps {
  campaigns: ApiCampaign[];
  createCampaign: (campaign: Omit<ApiCampaign, 'id' | 'status' | 'sentCount' | 'openCount' | 'clickCount' | 'createdAt' | 'scheduledAt'>) => Promise<void>;
  updateCampaignStatus: (id: string, status: ApiCampaign['status']) => Promise<void>;
  startCampaign: (id: string) => Promise<void>;
  contacts: ApiContact[];
  templates: ApiTemplate[];
}

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  campaigns,
  createCampaign,
  updateCampaignStatus,
  startCampaign,
  contacts,
  templates,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    templateId: '',
    contactIds: [] as string[],
    dailyLimit: 50,
    delayBetweenEmails: 30,
  });

  const handleCreateCampaign = async () => {
    const campaign = {
      name: newCampaign.name,
      templateId: newCampaign.templateId,
      contactIds: newCampaign.contactIds,
      dailyLimit: newCampaign.dailyLimit,
      delayBetweenEmails: newCampaign.delayBetweenEmails,
    };
    
    await createCampaign(campaign);
    setIsCreating(false);
    setNewCampaign({
      name: '',
      templateId: '',
      contactIds: [],
      dailyLimit: 50,
      delayBetweenEmails: 30,
    });
  };

  const handleStartCampaign = async (id: string) => {
    await updateCampaignStatus(id, 'sending');
    await startCampaign(id);
  };

  const getStatusColor = (status: ApiCampaign['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ApiCampaign['status']) => {
    switch (status) {
      case 'sending': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Dashboard</h2>
        <p className="text-gray-600">Create and manage your outreach campaigns</p>
      </div>

      {/* Create Campaign Form */}
      {isCreating && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Campaign</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Q1 Cold Outreach"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <select
                value={newCampaign.templateId}
                onChange={(e) => setNewCampaign({ ...newCampaign, templateId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Limit
              </label>
              <input
                type="number"
                value={newCampaign.dailyLimit}
                onChange={(e) => setNewCampaign({ ...newCampaign, dailyLimit: parseInt(e.target.value) })}
                min="1"
                max="150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Between Emails (minutes)
              </label>
              <input
                type="number"
                value={newCampaign.delayBetweenEmails}
                onChange={(e) => setNewCampaign({ ...newCampaign, delayBetweenEmails: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contacts ({contacts.length} available)
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={newCampaign.contactIds.length === contacts.length}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    contactIds: e.target.checked ? contacts.map(c => c.id) : []
                  })}
                />
                <span className="text-sm font-medium">Select All</span>
              </label>
              {contacts.map((contact) => (
                <label key={contact.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={newCampaign.contactIds.includes(contact.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewCampaign({
                          ...newCampaign,
                          contactIds: [...newCampaign.contactIds, contact.id]
                        });
                      } else {
                        setNewCampaign({
                          ...newCampaign,
                          contactIds: newCampaign.contactIds.filter(id => id !== contact.id)
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{contact.firstName} {contact.lastName} ({contact.email})</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={handleCreateCampaign}
              disabled={!newCampaign.name || !newCampaign.templateId || newCampaign.contactIds.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Campaign
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {campaigns.map((campaign) => {
            const template = templates.find(t => t.id === campaign.templateId);
            const openRate = campaign.sentCount > 0 ? (campaign.openCount / campaign.sentCount * 100).toFixed(1) : 0;
            const clickRate = campaign.sentCount > 0 ? (campaign.clickCount / campaign.sentCount * 100).toFixed(1) : 0;
            
            return (
              <div key={campaign.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)}
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Template: {template?.name || 'Unknown'} | {campaign.contactIds.length} contacts
                    </p>
                    
                    <div className="grid grid-cols-4 gap-6 text-sm">
                      <div>
                        <p className="text-gray-500">Sent</p>
                        <p className="font-medium">{campaign.sentCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Opens
                        </p>
                        <p className="font-medium">{campaign.openCount} ({openRate}%)</p>
                      </div>
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          <MousePointer className="w-3 h-3" />
                          Clicks
                        </p>
                        <p className="font-medium">{campaign.clickCount} ({clickRate}%)</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Daily Limit</p>
                        <p className="font-medium">{campaign.dailyLimit}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleStartCampaign(campaign.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                    )}
                    {campaign.status === 'sending' && (
                      <button
                        onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                        className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                    )}
                    {campaign.status === 'paused' && (
                      <button
                        onClick={() => updateCampaignStatus(campaign.id, 'sending')}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Play className="w-4 h-4" />
                        Resume
                      </button>
                    )}
                    <button className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {campaigns.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Play className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No campaigns created yet</p>
              <p className="text-sm">Click "New Campaign" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;