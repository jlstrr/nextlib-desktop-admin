import { useState } from 'react';
import { getReports } from '../api/reports';

function Reports() {
  const [pendingReportType, setPendingReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [filters, setFilters] = useState({
    user_id: '',
    user_type: '',
    program: '',
    date_from: '',
    date_to: '',
  });
  // Removed pagination state
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);


  // Only fetch data when Generate is clicked
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        // No page param
      };
      const queryString = Object.entries(params)
        .filter(([_, v]) => v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      const response = await getReports(pendingReportType, queryString);
      setData(response.data || []);
      setTotalRecords(response.total || response.data?.length || 0);
      setReportType(pendingReportType);
    } catch (err) {
      setData([]);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingReportType(e.target.value as any);
    // No pagination
  };

  // PDF Export Logic (adapted from ComputerUsersPage)
  const buildExportHTML = () => {
    let header = '';
    let rows = '';
    if (reportType === 'daily') {
      header = `<thead><tr><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Date</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Name</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">ID Number</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">User Type</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Program/Course</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Usage Count</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Total Usage Time (min)</th></tr></thead>`;
      rows = data.flatMap((record: any) =>
        record.users.map((user: any) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.date}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.name}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.id_number}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.user_type}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.program_course}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.usage_count}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.total_usage_time}</td>
          </tr>`
        )
      ).join('');
    } else if (reportType === 'weekly') {
      header = `<thead><tr><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Year</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Week</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Name</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">ID Number</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">User Type</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Program/Course</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Usage Count</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Total Usage Time (min)</th></tr></thead>`;
      rows = data.flatMap((record: any) =>
        record.users.map((user: any) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.year}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.week}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.name}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.id_number}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.user_type}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.program_course}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.usage_count}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:12px">${user.total_usage_time}</td>
          </tr>`
        )
      ).join('');
    } else if (reportType === 'monthly') {
      header = `<thead><tr><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Month</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Total Unique Users</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Total Sessions Logged</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Total Usage Time (min)</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Total Students</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Total Faculty/Staff</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Peak Usage Day</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Lowest Usage Day</th></tr></thead>`;
      rows = data.map((record: any) =>
        `<tr>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.month}</td>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.total_unique_users}</td>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.total_sessions}</td>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.total_usage_time}</td>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.total_students}</td>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.total_faculty_staff}</td>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.peak_usage_day}</td>
          <td style="padding:8px;border:1px solid #ddd;font-size:12px">${record.lowest_usage_day}</td>
        </tr>`
      ).join('');
    }
    const table = `<table style="border-collapse:collapse;margin:0 auto">${header}<tbody>${rows}</tbody></table>`;
    const adminDataRaw = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
    const adminData = adminDataRaw ? JSON.parse(adminDataRaw) : null;
    const adminName = adminData
      ? [adminData.firstname, adminData.middle_initial ? `${adminData.middle_initial}.` : '', adminData.lastname]
          .filter(Boolean)
          .join(' ')
      : 'Admin';
    const today = new Date().toLocaleDateString();
    const tableTitle = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Usage Report`;
    const dateRange = (filters.date_from || filters.date_to)
      ? `${filters.date_from || '—'} to ${filters.date_to || '—'}`
      : 'All dates';
    const headerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #1f2937;padding-bottom:12px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:12px">
          <img src="/ustp-logo.png" alt="USTP Logo" style="height:40px" />
          <div>
            <div style="font-size:14px;font-weight:700;color:#111827;text-transform:uppercase">University of Science and Technology of Southern Philippines</div>
            <div style="font-size:13px;font-weight:600;color:#4b5563;margin-top:2px">Jasaan, Misamis Oriental</div>
          </div>
        </div>
        <img src="/favicon.png" alt="System Logo" style="height:40px" />
      </div>
    `;
    const detailsHTML = `
      <div style="font-size:12px;color:#374151;margin-bottom:16px">
        <div><strong>Generated on:</strong> ${today}</div>
        <div><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</div>
        <div><strong>Date Range:</strong> ${dateRange}</div>
        ${filters.user_id ? `<div><strong>User ID:</strong> ${filters.user_id}</div>` : ''}
        ${filters.user_type ? `<div><strong>User Type:</strong> ${filters.user_type}</div>` : ''}
        ${filters.program ? `<div><strong>Program/Course:</strong> ${filters.program}</div>` : ''}
        <div><strong>Total Records:</strong> ${totalRecords}</div>
      </div>
    `;
    const titleHTML = `
      <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:8px;text-align:center">${tableTitle}</div>
    `;
    const signatureHTML = `
      <div style="margin-top:24px">
        <div style="display:inline-block;text-align:center">
          <div style="font-size:12px;color:#111827">${adminName}</div>
          <div style="border-bottom:1px solid #111827;margin:6px 0"></div>
          <div style="font-size:12px;color:#374151">E-Library In-charge</div>
        </div>
      </div>
    `;
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${tableTitle}</title><style>body{font-family:Arial,sans-serif;padding:24px}thead th{background:#f3f4f6}tr:nth-child(even){background:#fafafb}</style></head><body>${headerHTML}${detailsHTML}${titleHTML}${table}${signatureHTML}<script>window.onload=function(){window.print();setTimeout(function(){window.close()},300)}</script></body></html>`;
  };

  const performExportPDF = () => {
    const html = buildExportHTML();
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports Management</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Reports</p>
        </div>
        <button
          className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          onClick={performExportPDF}
        >
          Export PDF
        </button>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium">Report Type:</label>
          <select value={pendingReportType} onChange={handleReportTypeChange} className="px-3 py-2 border rounded">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input name="user_id" value={filters.user_id} onChange={handleFilterChange} placeholder="User ID" className="px-3 py-2 border rounded text-sm" />
          <select name="user_type" value={filters.user_type} onChange={handleFilterChange} className="px-3 py-2 border rounded text-sm">
            <option value="">User Type</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
          <input name="program" value={filters.program} onChange={handleFilterChange} placeholder="Program/Course" className="px-3 py-2 border rounded text-sm" />
          <input name="date_from" type="date" value={filters.date_from} onChange={handleFilterChange} className="px-3 py-2 border rounded text-sm" />
          <input name="date_to" type="date" value={filters.date_to} onChange={handleFilterChange} className="px-3 py-2 border rounded text-sm" />
          <button onClick={fetchReports} className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg text-sm font-medium ml-2">Generate</button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Usage Report
        </h2>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {/* Dynamic columns based on report type */}
                  {reportType === 'daily' && (
                    <>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">ID Number</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">User Type</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Program/Course</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Usage Count</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Total Usage Time (min)</th>
                    </>
                  )}
                  {reportType === 'weekly' && (
                    <>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Year</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Week</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">ID Number</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">User Type</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Program/Course</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Usage Count</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Total Usage Time (min)</th>
                    </>
                  )}
                  {reportType === 'monthly' && (
                    <>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Month</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Total Unique Users</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Total Sessions Logged</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Total Usage Time (min)</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Total Students</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Total Faculty/Staff</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Peak Usage Day</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase">Lowest Usage Day</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={reportType === 'monthly' ? 8 : 8} className="text-center py-8 text-gray-500">No data found.</td>
                  </tr>
                ) : (
                  // Daily report rendering
                  reportType === 'daily' ? (
                    data.flatMap((record, idx) => (
                      record.users.map((user: any, uidx: any) => (
                        <tr key={`${idx}-${uidx}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{record.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.id_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.user_type}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.program_course}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.usage_count}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.total_usage_time}</td>
                        </tr>
                      ))
                    ))
                  ) : reportType === 'weekly' ? (
                    data.flatMap((record, idx) => (
                      record.users.map((user: any, uidx: any) => (
                        <tr key={`${idx}-${uidx}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{record.year}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{record.week}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.id_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.user_type}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.program_course}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.usage_count}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.total_usage_time}</td>
                        </tr>
                      ))
                    ))
                  ) : (
                    // Monthly report rendering
                    data.map((record, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{record.month}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.total_unique_users}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.total_sessions}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.total_usage_time}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.total_students}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.total_faculty_staff}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.peak_usage_day}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{record.lowest_usage_day}</td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* No pagination controls, just show all records */}
      </div>
    </div>
  );
}

export default Reports;
