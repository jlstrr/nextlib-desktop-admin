import { useState, useEffect } from 'react';
import { getAllAdmins } from '../api/admin';

interface Admin {
  _id: string;
  profile_picture: string | null;
  firstname: string;
  middle_initial: string;
  lastname: string;
  username: string;
  email: string;
  isSuperAdmin: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ApiResponse {
  status: number;
  message: string;
  data: Admin[];
  pagination: PaginationData;
}

function Admin() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, itemsPerPage]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ApiResponse = await getAllAdmins();
      setAdmins(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
      console.error('Error fetching admins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    console.log('Searching for:', searchInput);
    // TODO: Implement search functionality
  };

  const handleEdit = (adminId: string) => {
    console.log('Edit admin:', adminId);
    // TODO: Implement edit functionality
  };

  const handleRemove = (adminId: string) => {
    console.log('Remove admin:', adminId);
    // TODO: Implement remove functionality
  };

  const handleAddNewAdmin = () => {
    console.log('Add new admin');
    // TODO: Implement add new admin functionality
  };

  const getFullName = (admin: Admin) => {
    return `${admin.firstname} ${admin.middle_initial}. ${admin.lastname}`;
  };

  const getPermissionLabel = (admin: Admin) => {
    return admin.isSuperAdmin ? 'Super Admin' : 'Admin';
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSearchInput('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Management</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Admin</p>
        </div>
        <button 
          onClick={handleAddNewAdmin}
          className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Add New Admin
        </button>
      </div>
      
      {/* Search and Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Search Bar and Controls */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button 
            onClick={handleSearch}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Go
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date To
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        setShowFilterDropdown(false);
                      }}
                      className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        handleClearFilters();
                        setShowFilterDropdown(false);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <div className="text-gray-500">Loading admins...</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">{error}</div>
            </div>
          ) : admins.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">No admins found</div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">No.</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Username</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Permissions</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr key={admin._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-800">
                      {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800">{getFullName(admin)}</td>
                    <td className="py-4 px-4 text-sm text-gray-800">{admin.username}</td>
                    <td className="py-4 px-4 text-sm text-gray-800">{admin.email}</td>
                    <td className="py-4 px-4 text-sm text-gray-800">{getPermissionLabel(admin)}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                        {admin.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(admin._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleRemove(admin._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !error && admins.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} admins
            </p>
            <div className="flex items-center gap-2">
              <button 
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    page === currentPage
                      ? 'bg-indigo-700 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button 
                className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;