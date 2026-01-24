import { useState } from 'react';
import { Calendar, Code, Zap, Bell, Save } from 'lucide-react';

export function SettingsView() {
  const [settings, setSettings] = useState({
    semesterStart: '2026-01-15',
    semesterEnd: '2026-05-30',
    semesterCode: 'SP26',
    allowTopicRegistration: true,
    enableAISupport: true,
    publicRegistration: false,
    emailAlerts: true,
    pushNotifications: true,
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl">
      {/* Section 1: Semester Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#F27125]/10 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#F27125]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Semester Configuration</h2>
            <p className="text-sm text-gray-600">Set up the current academic semester</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester Start Date
            </label>
            <input
              type="date"
              value={settings.semesterStart}
              onChange={(e) => setSettings({ ...settings, semesterStart: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester End Date
            </label>
            <input
              type="date"
              value={settings.semesterEnd}
              onChange={(e) => setSettings({ ...settings, semesterEnd: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Semester Code
            </label>
            <div className="relative">
              <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={settings.semesterCode}
                onChange={(e) => setSettings({ ...settings, semesterCode: e.target.value })}
                placeholder="e.g., SP26"
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Feature Toggles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Feature Toggles</h2>
            <p className="text-sm text-gray-600">Enable or disable platform features</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Allow Topic Registration</div>
              <div className="text-sm text-gray-600">Students can submit new project topics</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowTopicRegistration}
                onChange={(e) =>
                  setSettings({ ...settings, allowTopicRegistration: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 transition-all">
                <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Enable AI Support</div>
              <div className="text-sm text-gray-600">AI-powered question answering system</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAISupport}
                onChange={(e) => setSettings({ ...settings, enableAISupport: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 transition-all">
                <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Public Registration Mode</div>
              <div className="text-sm text-gray-600">Allow public access without approval</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.publicRegistration}
                onChange={(e) =>
                  setSettings({ ...settings, publicRegistration: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 transition-all">
                <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Section 3: Notification Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-600">Configure how you receive alerts</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition">
            <input
              type="checkbox"
              checked={settings.emailAlerts}
              onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
              className="w-5 h-5 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125]"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Email Alerts</div>
              <div className="text-sm text-gray-600">Receive notifications via email</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
              className="w-5 h-5 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125]"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Push Notifications</div>
              <div className="text-sm text-gray-600">Real-time browser notifications</div>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#F27125] hover:bg-[#d96420] text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}