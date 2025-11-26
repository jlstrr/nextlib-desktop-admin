import { useState } from 'react';

function Settings() {
  const [activeTab, setActiveTab] = useState('semester');
  const [semesterData, setSemesterData] = useState({
    semester: '1st Semester',
    schoolYear: '2024-2025',
    startDate: '',
    endDate: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSemester = async () => {
    setIsSaving(true);
    try {
      // TODO: Add API call to save semester configuration
      // await saveSemesterConfig(semesterData);
      
      console.log('Saving semester configuration:', semesterData);
      alert('Semester configuration saved successfully');
    } catch (error) {
      console.error('Error saving semester configuration:', error);
      alert('Failed to save semester configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Settings</p>
        </div>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('semester')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'semester'
                  ? 'border-indigo-700 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Semester Configuration
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-indigo-700 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-indigo-700 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Semester Configuration Tab */}
          {activeTab === 'semester' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Academic Semester Configuration</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Configure the current academic semester and school year settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Semester Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    value={semesterData.semester}
                    onChange={(e) => setSemesterData({ ...semesterData, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                {/* School Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Year
                  </label>
                  <input
                    type="text"
                    value={semesterData.schoolYear}
                    onChange={(e) => setSemesterData({ ...semesterData, schoolYear: e.target.value })}
                    placeholder="e.g., 2024-2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={semesterData.startDate}
                    onChange={(e) => setSemesterData({ ...semesterData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={semesterData.endDate}
                    onChange={(e) => setSemesterData({ ...semesterData, endDate: e.target.value })}
                    min={semesterData.startDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Current Configuration Display */}
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">Current Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Semester:</span>
                    <span className="ml-2 font-medium text-gray-900">{semesterData.semester}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">School Year:</span>
                    <span className="ml-2 font-medium text-gray-900">{semesterData.schoolYear}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {semesterData.startDate || 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">End Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {semesterData.endDate || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSemester}
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Configure general system settings and preferences.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">System Maintenance Mode</h3>
                    <p className="text-xs text-gray-600 mt-1">Temporarily disable user access for maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">Email Notifications</h3>
                    <p className="text-xs text-gray-600 mt-1">Send email notifications to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">Auto-approve Reservations</h3>
                    <p className="text-xs text-gray-600 mt-1">Automatically approve all reservation requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Manage how and when you receive notifications.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-800">New Reservation Requests</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">Get notified when users submit new reservation requests</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-800">User Registration</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">Get notified when new users register in the system</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-800">System Alerts</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">Get notified about important system events and errors</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
