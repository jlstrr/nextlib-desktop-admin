import { useState, useEffect } from 'react';
import { getAllUsers } from '../api/users';

interface User {
  _id: string;
  id_number: string;
  firstname: string;
  middle_initial: string;
  lastname: string;
  program_course: string;
  email: string;
  user_type: string;
  status: string;
  remaining_time: number | null;
  isDeleted: boolean;
  resetPasswordToken: string | null;
  resetPasswordExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery
      });
      setUsers(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleEdit = (userId: string) => {
    console.log('Edit user:', userId);
  };

  const handleRemove = (userId: string) => {
    console.log('Remove user:', userId);
  };

  const handleAddNewUser = () => {
    console.log('Add new user');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Records</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Users</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => console.log('Import data')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Import Data
          </button>
          <button 
            onClick={() => console.log('Semester configuration')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Semester Configuration
          </button>
          <button 
            onClick={handleAddNewUser}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Add New User
          </button>
        </div>
      </div>
      
      {/* Search and Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Search Bar */}
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
        <div className="overflow-x-auto relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <p className="text-gray-600 text-sm">Loading users...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">No.</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">ID Number</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">User Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && users.map((user, index) => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-800">{((pagination.currentPage - 1) * pagination.itemsPerPage) + index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    {user.firstname} {user.middle_initial}. {user.lastname}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800">{user.id_number}</td>
                  <td className="py-4 px-4 text-sm text-gray-800">{user.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-800 capitalize">{user.user_type}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(user._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleRemove(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} users
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
      </div>
    </div>
  );
}

export default Users;