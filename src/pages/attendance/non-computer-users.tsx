import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { getAllAttendanceRecords } from '../../api/attendance';

interface AttendanceLog {
  _id: string;
  id: string;
  user_type: string;
  name?: string;
  address?: string;
  id_number?: string;
  purpose: string;
  isDeleted: boolean;
  logged_at: string;
  createdAt: string;
  updatedAt: string;
  user_data?: {
    _id?: string;
    id_number?: string;
    firstname?: string;
    middle_initial?: string;
    lastname?: string;
    program_course?: string;
    email?: string;
  } | null;
}

interface PaginationData {
  current_page: number;
  total_pages: number;
  total_logs: number;
  per_page: number;
}

function NonComputersUsersPage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceLog[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceLog[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    total_pages: 1,
    total_logs: 0,
    per_page: 10
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportInsiders, setExportInsiders] = useState(true);
  const [exportOutsiders, setExportOutsiders] = useState(true);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    // Client-side search in displayed data
    if (!tableSearch) {
      setFilteredRecords(attendanceRecords);
    } else {
      const searchLower = tableSearch.toLowerCase();
      setFilteredRecords(
        attendanceRecords.filter(record => {
          const name = record.user_type === 'visitor'
            ? record.name || ''
            : `${record.user_data?.firstname || ''} ${record.user_data?.lastname || ''}`;
          const program = record.user_type === 'visitor'
            ? record.address || ''
            : record.user_data?.program_course || '';
          return (
            name.toLowerCase().includes(searchLower) ||
            program.toLowerCase().includes(searchLower) ||
            (record.purpose || '').toLowerCase().includes(searchLower) ||
            (record.id_number || '').toLowerCase().includes(searchLower)
          );
        })
      );
    }
  }, [tableSearch, attendanceRecords]);

  const fetchAttendanceRecords = async (ignoreDateFilters = false) => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
      };
      if (!ignoreDateFilters) {
        if (dateFrom) filters.date_from = dateFrom;
        if (dateTo) filters.date_to = dateTo;
      }
      const response = await getAllAttendanceRecords(filters);
      setAttendanceRecords(response.data.logs);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  // API search (not used for table search)
  // Removed unused handleSearch

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchInput('');
    setSearchQuery('');
    setTableSearch('');
    setCurrentPage(1);
    fetchAttendanceRecords(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const buildExportHTML = (records: AttendanceLog[]) => {
    const header = `<thead><tr><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">No.</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Name</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Program / Address</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Time In</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Purpose</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">User Type</th><th style="text-align:left;padding:8px;border:1px solid #ddd;font-size:12px">Date</th></tr></thead>`;
    const rows = records.map((record, idx) => {
      const name = record.user_type === 'visitor'
        ? (record.name || '—')
        : (`${record.user_data?.firstname || ''} ${record.user_data?.lastname || ''}`.trim() || '—');
      const idLine = record.user_type === 'student'
        ? `<div style="font-size:10px;color:#6b7280">ID: ${record.id_number || record.user_data?.id_number || ''}</div>`
        : '';
      const programOrAddress = record.user_type === 'visitor'
        ? (record.address || '—')
        : (record.user_data?.program_course || '—');
      const timeIn = formatTime(record.logged_at);
      const purpose = (record.purpose || '').replace(/_/g, ' ');
      const userType = record.user_type;
      const date = formatDate(record.logged_at);
      return `<tr>
        <td style="padding:8px;border:1px solid #ddd;font-size:12px">${idx + 1}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:12px">${name}${idLine}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:12px">${programOrAddress}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:12px">${timeIn}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:12px">${purpose}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:12px;text-transform:capitalize">${userType}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:12px">${date}</td>
      </tr>`;
    }).join('');
    const table = `<table style="width:100%;border-collapse:collapse">${header}<tbody>${rows}</tbody></table>`;
    const adminDataRaw = typeof window !== 'undefined' ? localStorage.getItem('admin') : null;
    const adminData = adminDataRaw ? JSON.parse(adminDataRaw) : null;
    const adminName = adminData
      ? [adminData.firstname, adminData.middle_initial ? `${adminData.middle_initial}.` : '', adminData.lastname]
          .filter(Boolean)
          .join(' ')
      : 'Admin';
    const today = new Date().toLocaleDateString();
    const tableTitle = 'Attendance Records';
    const dateRange = (dateFrom || dateTo)
      ? `${dateFrom || '—'} to ${dateTo || '—'}`
      : 'All dates';
    const userTypesIncluded = [
      exportInsiders ? 'Student' : null,
      exportOutsiders ? 'Visitor' : null
    ].filter(Boolean).join(', ') || 'None';
    const totalRecords = records.length;
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
        <div><strong>Date Range:</strong> ${dateRange}</div>
        <div><strong>User Types:</strong> ${userTypesIncluded}</div>
        <div><strong>Total Records:</strong> ${totalRecords}</div>
      </div>
    `;
    const titleHTML = `
      <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:8px;text-align:center">${tableTitle}</div>
    `;
    const signatureHTML = `
      <div class="signature" style="text-align:center">
        <div style="display:inline-block;text-align:center">
          <div style="font-size:12px;color:#111827;margin-bottom:25px">Prepared by:</div>
          <div style="font-size:12px;color:#111827">${adminName}</div>
          <div style="border-bottom:1px solid #111827;margin:6px 0"></div>
          <div style="font-size:12px;color:#374151">E-Library In-charge</div>
        </div>
      </div>
    `;
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${tableTitle}</title><style>body{font-family:Arial,sans-serif;padding:24px;padding-bottom:120px}thead th{background:#f3f4f6}tr:nth-child(even){background:#fafafb}.signature{position:fixed;left:24px;right:24px;bottom:24px}</style></head><body>${headerHTML}${detailsHTML}${titleHTML}${table}${signatureHTML}<script>window.onload=function(){window.print();setTimeout(function(){window.close()},300)}</script></body></html>`;
  };

  const performExportPDF = () => {
    const selected = filteredRecords.filter(r => (
      (exportInsiders && r.user_type === 'student') ||
      (exportOutsiders && r.user_type === 'visitor')
    ));
    const html = buildExportHTML(selected);
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
          <h1 className="text-2xl font-bold text-gray-800">Non-computer Usage</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Attendance / Non-computer usage</p>
        </div>
        <button onClick={() => setShowExportDialog(true)} className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16l4-4m0 0l-4-4m4 4H8m8 4v1a2 2 0 01-2 2H10a2 2 0 01-2-2v-1" />
          </svg>
          Export PDF
        </button>
      </div>

      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm w-full bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <DialogTitle className="text-lg font-bold text-gray-800">Export to PDF</DialogTitle>
              <button onClick={() => setShowExportDialog(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={exportInsiders} onChange={(e) => setExportInsiders(e.target.checked)} />
                  <span className="text-sm text-gray-800">Insiders (Student)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={exportOutsiders} onChange={(e) => setExportOutsiders(e.target.checked)} />
                  <span className="text-sm text-gray-800">Outsiders (Visitor)</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button onClick={() => setShowExportDialog(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={() => { setShowExportDialog(false); performExportPDF(); }} disabled={!exportInsiders && !exportOutsiders} className={`px-4 py-2 text-sm font-medium rounded-lg ${(!exportInsiders && !exportOutsiders) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-700 text-white hover:bg-indigo-800'}`}>Export</button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        {/* Table Search and Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search in table..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              {tableSearch && (
                <button
                  onClick={() => setTableSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  dateFrom || dateTo 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
                {(dateFrom || dateTo) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                    1
                  </span>
                )}
              </button>
              {showFilterDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFilterDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20 p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">Filter Options</h3>
                        <button
                          onClick={() => setShowFilterDropdown(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          min={dateFrom}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setCurrentPage(1);
                            setShowFilterDropdown(false);
                            fetchAttendanceRecords(false);
                          }}
                          className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Apply Filter
                        </button>
                        <button
                          onClick={() => {
                            handleClearFilters();
                            setShowFilterDropdown(false);
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600 whitespace-nowrap">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-sm focus:outline-none bg-transparent text-gray-700 font-medium cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="bg-white rounded-lg overflow-hidden relative"
          style={{ minHeight: loading ? 400 : Math.max(200, filteredRecords.length * 56 + 120) }}
        >
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <p className="text-gray-600 text-sm">Loading attendance records...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error: {error}</p>
                <button 
                  onClick={() => fetchAttendanceRecords()}
                  className="text-indigo-700 hover:text-indigo-800 text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          <table ref={tableRef} className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">No.</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Program / Address</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Time In</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Purpose</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">User Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!loading && !error && filteredRecords.map((record, index) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  {/* <td className="px-6 py-4 text-sm text-gray-900">
                    {record.user_type === 'student'
                      ? record.id_number || record.user_data?.id_number || '—'
                      : '—'}
                  </td> */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                    {record.user_type === 'visitor'
                      ? record.name
                      : `${record.user_data?.firstname || ''} ${record.user_data?.lastname || ''}`.trim() || '—'}
                    {record.user_type === 'student' && (
                      <span className="block text-xs text-gray-500">
                      ID: {record.id_number || record.user_data?.id_number || ''}
                      </span>
                    )}
                    </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.user_type === 'visitor'
                      ? record.address || '—'
                      : record.user_data?.program_course || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatTime(record.logged_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.purpose.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                    {record.user_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(record.logged_at)}
                  </td>
                </tr>
              ))}
              {!loading && !error && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {pagination.total_logs === 0 ? 0 : ((pagination.current_page - 1) * pagination.per_page) + 1}-
                {Math.min(pagination.current_page * pagination.per_page, pagination.total_logs)} of {pagination.total_logs} Results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      page === currentPage
                        ? 'bg-indigo-700 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.total_pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NonComputersUsersPage;
