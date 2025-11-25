import { useState } from 'react';

interface AttendanceRecord {
  id: number;
  name: string;
  program: string;
  timeIn: string;
  timeOut: string;
  purpose: string;
  userType: string;
  date: string;
}

function Attendance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Sample data - replace with actual data from API
  const attendanceData: AttendanceRecord[] = [
    {
      id: 1,
      name: 'Zyrah Claire',
      program: 'BSIT',
      timeIn: '10:00 am',
      timeOut: '11:00 am',
      purpose: 'Research',
      userType: 'Student',
      date: 'March 3, 2025'
    },
    {
      id: 2,
      name: 'Zyrah Claire',
      program: 'BSIT',
      timeIn: '10:00 am',
      timeOut: '11:00 am',
      purpose: 'Research',
      userType: 'Student',
      date: 'March 3, 2025'
    },
    {
      id: 3,
      name: 'Zyrah Claire',
      program: 'BSIT',
      timeIn: '10:00 am',
      timeOut: '11:00 am',
      purpose: 'Research',
      userType: 'Student',
      date: 'March 3, 2025'
    }
  ];

  const totalRecords = 15;
  const totalPages = Math.ceil(totalRecords / 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Attendance</p>
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        {/* Search and Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, program, or purpose..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={handleSearch}
              className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Go
            </button>
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
                          Date From
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
                          Date To
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
        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">ID No.</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Program</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Time In</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Time Out</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Purpose</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">User Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{record.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.program}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.timeIn}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.timeOut}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.purpose}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.userType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing 1-3 of {totalRecords} Results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === 1
                      ? 'bg-indigo-700 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === 2
                      ? 'bg-indigo-700 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentPage(2)}
                >
                  2
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === 3
                      ? 'bg-indigo-700 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentPage(3)}
                >
                  3
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
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

export default Attendance;