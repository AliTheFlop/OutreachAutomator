import React, { useState } from 'react';
import { Plus, Edit, Trash2, Mail, Save, X } from 'lucide-react';
import { ApiTemplate } from '../services/api';

interface TemplateManagerProps {
  templates: ApiTemplate[];
  saveTemplate: (template: Omit<ApiTemplate, 'id' | 'createdAt'> | ApiTemplate) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ templates, saveTemplate, removeTemplate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ApiTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
  };

  const handleSave = async () => {
    const allVariables = [
      ...extractVariables(formData.subject),
      ...extractVariables(formData.body),
    ];
    const uniqueVariables = [...new Set(allVariables)];

    const template = {
      ...(editingTemplate ? { id: editingTemplate.id, createdAt: editingTemplate.createdAt } : {}),
      name: formData.name,
      subject: formData.subject,
      body: formData.body,
      variables: uniqueVariables,
    };

    await saveTemplate(template);

    setIsEditing(false);
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', body: '' });
  };

  const handleEdit = (template: ApiTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    removeTemplate(id);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', body: '' });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Templates</h2>
        <p className="text-gray-600">Create and manage your outreach email templates</p>
      </div>

      {/* Create/Edit Template Form */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTemplate ? 'Edit Template' : 'Create New Template'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Cold Outreach v1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Quick question about {{company}}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder={`Hi {{firstName}},

I noticed that {{company}} is doing great work in the industry. I'd love to connect and discuss how we might be able to help you with [specific value proposition].

Would you be open to a brief 15-minute call this week?

Best regards,
Your Name`}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Templates ({templates.length})
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {templates.map((template) => (
            <div key={template.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                    {template.body.length > 200 ? `${template.body.substring(0, 200)}...` : template.body}
                  </p>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {variable}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {templates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No templates created yet</p>
              <p className="text-sm">Click "New Template" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;