import { useState } from 'react';

interface DailyUsageRecord {
  id: number;
  name: string;
  program: string;
  userType: string;
  usageCount: number;
  remainingTime: string;
}

interface MonthlyUsageRecord {
  month: string;
  facultyUsersCount: number;
  studentUsersCount: number;
  totalUsers: number;
}

function Reports() {
  const [dailySearchQuery, setDailySearchQuery] = useState('');
  const [monthlySearchQuery, setMonthlySearchQuery] = useState('');
  const [dailyCurrentPage, setDailyCurrentPage] = useState(1);
  const [monthlyCurrentPage, setMonthlyCurrentPage] = useState(1);

  // Sample data for Daily Usage Report
  const dailyUsageData: DailyUsageRecord[] = [
    { id: 1, name: 'Zyrah Claire', program: 'BSIT', userType: 'Student', usageCount: 99, remainingTime: '15 hours' },
    { id: 2, name: 'Zyrah Claire', program: 'BSIT', userType: 'Student', usageCount: 99, remainingTime: '15 hours' },
    { id: 3, name: 'Zyrah Claire', program: 'BSIT', userType: 'Student', usageCount: 99, remainingTime: '15 hours' }
  ];

  // Sample data for Monthly Usage Report
  const monthlyUsageData: MonthlyUsageRecord[] = [
    { month: 'March 2025', facultyUsersCount: 100, studentUsersCount: 99, totalUsers: 199 },
    { month: 'March 2025', facultyUsersCount: 100, studentUsersCount: 99, totalUsers: 199 },
    { month: 'March 2025', facultyUsersCount: 100, studentUsersCount: 99, totalUsers: 199 }
  ];

  const dailyTotalRecords = 15;
  const monthlyTotalRecords = 15;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports Management</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Reports</p>
        </div>
      </div>

      {/* Daily Usage Report Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Usage Report</h2>
        
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search"
              value={dailySearchQuery}
              onChange={(e) => setDailySearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg text-sm font-medium">
            Go
          </button>
          <button className="ml-auto flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>

        {/* Daily Usage Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg mb-4">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">No.</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Program</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">User Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Usage Count</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Remaining Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {dailyUsageData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{record.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.program}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.userType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.usageCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.remainingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Daily Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1-3 of {dailyTotalRecords} sessions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDailyCurrentPage(Math.max(1, dailyCurrentPage - 1))}
              disabled={dailyCurrentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                dailyCurrentPage === 1 ? 'bg-indigo-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setDailyCurrentPage(1)}
            >
              1
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                dailyCurrentPage === 2 ? 'bg-indigo-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setDailyCurrentPage(2)}
            >
              2
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                dailyCurrentPage === 3 ? 'bg-indigo-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setDailyCurrentPage(3)}
            >
              3
            </button>
            <button
              onClick={() => setDailyCurrentPage(Math.min(3, dailyCurrentPage + 1))}
              disabled={dailyCurrentPage === 3}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Usage Report Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Usage Report</h2>
        
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search"
              value={monthlySearchQuery}
              onChange={(e) => setMonthlySearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg text-sm font-medium">
            Go
          </button>
          <button className="ml-auto flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>

        {/* Monthly Usage Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg mb-4">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Month</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Faculty Users Count</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Student Users Count</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Total Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {monthlyUsageData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{record.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.facultyUsersCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.studentUsersCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.totalUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Monthly Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1-3 of {monthlyTotalRecords} sessions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonthlyCurrentPage(Math.max(1, monthlyCurrentPage - 1))}
              disabled={monthlyCurrentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                monthlyCurrentPage === 1 ? 'bg-indigo-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setMonthlyCurrentPage(1)}
            >
              1
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                monthlyCurrentPage === 2 ? 'bg-indigo-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setMonthlyCurrentPage(2)}
            >
              2
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                monthlyCurrentPage === 3 ? 'bg-indigo-700 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setMonthlyCurrentPage(3)}
            >
              3
            </button>
            <button
              onClick={() => setMonthlyCurrentPage(Math.min(3, monthlyCurrentPage + 1))}
              disabled={monthlyCurrentPage === 3}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;