/**
 * USER SETTINGS PANEL
 * File: d:\GitHub\SWD392-FrontEnd\src\components\admin\UserSettingsPanel.jsx
 * Để thêm vào User Settings Page
 */

import { useState, useEffect } from 'react';
import { Cloud, Zap, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../config/api.config';

export default function UserSettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enable_cloudinary_upload: true,
    enable_ai_assistant: true,
  });

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/user-settings');
        if (response.data?.success && response.data?.data) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Use defaults if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Update setting when toggle changes
  const handleToggle = async (key) => {
    setSaving(true);
    try {
      if (key === 'enable_cloudinary_upload') {
        const response = await api.put('/user-settings/toggle-cloudinary');
        if (response.data?.success) {
          setSettings(prev => ({
            ...prev,
            enable_cloudinary_upload: response.data.data.enable_cloudinary_upload
          }));
          const status = response.data.data.enable_cloudinary_upload ? 'enabled' : 'disabled';
          toast.success(`Cloudinary upload ${status}`);
        }
      } else {
        const newValue = !settings[key];
        const response = await api.put('/user-settings', {
          [key]: newValue
        });
        if (response.data?.success) {
          setSettings(prev => ({
            ...prev,
            [key]: newValue
          }));
          toast.success('Settings updated');
        }
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error(error.response?.data?.message || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Upload & AI Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Configure your file upload and AI assistant preferences</p>
      </div>

      {/* Settings */}
      <div className="p-6 space-y-4">
        {/* Cloudinary Upload Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Cloud className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Cloudinary Upload</p>
              <p className="text-sm text-gray-500 mt-1">
                Upload files to Cloudinary instead of using API upload
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle('enable_cloudinary_upload')}
            disabled={saving}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
              settings.enable_cloudinary_upload
                ? 'bg-blue-600'
                : 'bg-gray-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings.enable_cloudinary_upload ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* AI Assistant Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-600 mt-1" />
            <div>
              <p className="font-medium text-gray-800">AI Assistant</p>
              <p className="text-sm text-gray-500 mt-1">
                Enable AI-powered draft answers for questions (Gemini)
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggle('enable_ai_assistant')}
            disabled={saving}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
              settings.enable_ai_assistant
                ? 'bg-amber-600'
                : 'bg-gray-300'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings.enable_ai_assistant ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="px-6 py-4 bg-blue-50 border-t border-blue-200 rounded-b-lg flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Settings are automatically saved</p>
          <p className="mt-1 text-blue-700">Your preferences will be remembered across sessions</p>
        </div>
      </div>
    </div>
  );
}
