import { useState, useEffect } from 'react';
import { getAllReservations } from '../api/reservation';

interface User {
  _id: string;
  id_number: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface Reservation {
  reservation_number: string;
  user_id: User;
  reservation_type: string;
  computer_id: string | null;
  laboratory_id: string | null;
  reservation_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  notes: string | null;
  duration: number;
  status: string;
  approved_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [currentPage, itemsPerPage, searchQuery, dateFrom, dateTo]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await getAllReservations({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        date_from: dateFrom,
        date_to: dateTo
      });
      setReservations(response.data.reservations);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reservation Management</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Reservation</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
        <div className="overflow-x-auto relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <p className="text-gray-600 text-sm">Loading reservations...</p>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reservation Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Time Slot</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Purpose</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && reservations.map((reservation, index) => (
                <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-800">{index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    {reservation.user_id.firstname} {reservation.user_id.lastname}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800 capitalize">
                    {reservation.reservation_type}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-800">{reservation.purpose}</td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    {formatDate(reservation.reservation_date)}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                        disabled={reservation.status !== 'pending'}
                      >
                        Approve
                      </button>
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                        disabled={reservation.status !== 'pending'}
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && reservations.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No reservations found
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
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} reservations
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

export default Reservations;