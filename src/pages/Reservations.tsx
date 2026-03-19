import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { getAllReservations, approveReservation, walkInReservation, cancelAllReservations } from '../api/reservation';
import { Plus, RefreshCcw } from 'lucide-react';
import { getAllComputers } from '../api/computers';
import { getAllLaboratories } from '../api/laboratory';

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

interface Computer {
  id: string;
  pc_number: string;
  status: string;
  laboratory_id?: {
    name: string;
  };
}

interface Laboratory {
  id: string;
  name: string;
  status: string;
}

function Reservations() {
  const getLocalISODate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
  const [isCancellingAll, setIsCancellingAll] = useState(false);
  const [cancelAllNotes, setCancelAllNotes] = useState('');
  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState(false);
  const [showWalkInDialog, setShowWalkInDialog] = useState(false);
  const [walkInType, setWalkInType] = useState<'computer' | 'laboratory'>('computer');
  const [reservationFor, setReservationFor] = useState<'user' | 'guest'>('guest');
  const [idNumber, setIdNumber] = useState('');
  const [guestFirstname, setGuestFirstname] = useState('');
  const [guestLastname, setGuestLastname] = useState('');
  const [guestMiddleInitial, setGuestMiddleInitial] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [activateNow, setActivateNow] = useState(true);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [selectedComputerId, setSelectedComputerId] = useState('');
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [selectedLaboratoryId, setSelectedLaboratoryId] = useState('');
  const [walkInDate, setWalkInDate] = useState(() => getLocalISODate());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const PURPOSE_OPTIONS = [
    'Academic Research',
    'Coursework/Assignment',
    'Online Class',
    'Programming/Development',
    'Printing',
    'Other'
  ];

  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    const urlStatus = new URLSearchParams(window.location.search).get('status');
    const saved = localStorage.getItem('reservationStatusFilter');
    return (urlStatus || saved || 'all').toLowerCase();
  });

  useEffect(() => {
    fetchReservations();
  }, [currentPage, itemsPerPage, selectedStatus]);

  useEffect(() => {
    if (showWalkInDialog && walkInType === 'computer') {
      const fetchComputers = async () => {
        try {
          const response = await getAllComputers();
          if (response.data && response.data.computers) {
             setComputers(response.data.computers);
          } else if (Array.isArray(response)) {
             setComputers(response);
          }
        } catch (err) {
          console.error('Failed to fetch computers:', err);
        }
      };
      fetchComputers();
    }
  }, [showWalkInDialog, walkInType]);

  useEffect(() => {
    if (showWalkInDialog && walkInType === 'laboratory') {
      const fetchLaboratories = async () => {
        try {
          const response = await getAllLaboratories();
          if (response.data && response.data.laboratories) {
             setLaboratories(response.data.laboratories);
          } else if (Array.isArray(response)) {
             setLaboratories(response);
          }
        } catch (err) {
          console.error('Failed to fetch laboratories:', err);
        }
      };
      fetchLaboratories();
    }
  }, [showWalkInDialog, walkInType]);

  useEffect(() => {
    if (reservationFor === 'guest' && walkInType !== 'computer') {
      setWalkInType('computer');
      setSelectedLaboratoryId('');
    }
  }, [reservationFor, walkInType]);

  useEffect(() => {
    if (reservationFor === 'guest' && !activateNow) {
      setActivateNow(true);
    }
  }, [reservationFor, activateNow]);

  useEffect(() => {
    // Client-side search in displayed reservations (ID, Name, Status only)
    if (!searchInput) {
      setFilteredReservations(reservations);
    } else {
      const searchLower = searchInput.toLowerCase();
      setFilteredReservations(
        reservations.filter(r => {
          const name = `${r.user_id.firstname} ${r.user_id.lastname}`;
          const id = r.reservation_number || '';
          const status = r.status || '';
          return (
            id.toLowerCase().includes(searchLower) ||
            name.toLowerCase().includes(searchLower) ||
            status.toLowerCase().includes(searchLower)
          );
        })
      );
    }
  }, [searchInput, reservations]);

  const fetchReservations = async (ignoreDateFilters = false) => {
    try {
      setLoading(true);
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (!ignoreDateFilters) {
        if (dateFrom) filters.date_from = dateFrom;
        if (dateTo) filters.date_to = dateTo;
      }
      if (selectedStatus && selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      const response = await getAllReservations(filters);
      setReservations(response.data.reservations);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  // Removed handleSearch, search is now client-side

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    fetchReservations(true);
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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async () => {
    if (!approveTargetId) return;
    setIsApproving(true);
    try {
      await approveReservation(approveTargetId);
      setShowApproveDialog(false);
      setApproveTargetId(null);
      await fetchReservations();
      setError(null);
    } catch (err) {
      console.error('Failed to approve reservation:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve reservation');
    } finally {
      setIsApproving(false);
    }
  };

  const handleWalkInSubmit = async () => {
    if (reservationFor === 'guest' && walkInType !== 'computer') {
      alert('Guest can only reserve computers');
      return;
    }

    if (walkInType === 'computer' && !selectedComputerId) {
      alert('Please select a computer');
      return;
    }
    
    if (walkInType === 'laboratory' && !selectedLaboratoryId) {
      alert('Please select a laboratory');
      return;
    }

    if (!purpose) {
      alert('Please select a purpose');
      return;
    }

    if (reservationFor === 'user') {
      if (!idNumber.trim()) {
        alert('Please enter ID number');
        return;
      }
      if (!walkInDate) {
        alert('Please select a reservation date');
        return;
      }
      if (!startTime || !endTime) {
        alert('Please provide start time and end time');
        return;
      }
    } else {
      if (!guestFirstname.trim() || !guestLastname.trim()) {
        alert('Please enter guest first name and last name');
        return;
      }
      if (!duration || duration <= 0) {
        alert('Please enter a valid duration');
        return;
      }
    }

    setIsSubmittingWalkIn(true);
    try {
      const trimmedGuestMiddleInitial = guestMiddleInitial.trim();
      const trimmedGuestEmail = guestEmail.trim();

      const payload = {
        reservation_type: walkInType,
        computer_id: walkInType === 'computer' ? selectedComputerId : undefined,
        laboratory_id: walkInType === 'laboratory' ? selectedLaboratoryId : undefined,
        reservation_date: walkInDate,
        start_time: reservationFor === 'user' ? startTime : undefined,
        end_time: reservationFor === 'user' ? endTime : undefined,
        duration: reservationFor === 'guest' ? duration : undefined,
        purpose,
        notes: notes || undefined,
        id_number: reservationFor === 'user' ? idNumber.trim() : undefined,
        guest:
          reservationFor === 'guest'
            ? {
                firstname: guestFirstname.trim(),
                lastname: guestLastname.trim(),
                middle_initial: trimmedGuestMiddleInitial ? trimmedGuestMiddleInitial : undefined,
                email: trimmedGuestEmail ? trimmedGuestEmail : undefined
              }
            : undefined,
        activate_now: reservationFor === 'guest' ? true : undefined
      };

      await walkInReservation(payload);
      
      // Reset form
      setSelectedComputerId('');
      setSelectedLaboratoryId('');
      setWalkInDate(getLocalISODate());
      setStartTime('');
      setEndTime('');
      setPurpose('');
      setDuration(60);
      setNotes('');
      setIdNumber('');
      setGuestFirstname('');
      setGuestLastname('');
      setGuestMiddleInitial('');
      setGuestEmail('');
      setActivateNow(true);
      setReservationFor('guest');
      
      setShowWalkInDialog(false);
      await fetchReservations();
    } catch (err) {
      console.error('Failed to create walk-in reservation:', err);
      alert(err instanceof Error ? err.message : 'Failed to create walk-in reservation');
    } finally {
      setIsSubmittingWalkIn(false);
    }
  };

  const handleWalkIn = () => {
    setShowWalkInDialog(true);
  };

  const handleCancelAllReservations = async () => {
    setIsCancellingAll(true);
    try {
      setError(null);
      const notes = cancelAllNotes.trim();
      await cancelAllReservations(notes ? { notes } : undefined);

      setShowCancelAllDialog(false);
      setCancelAllNotes('');
      setCurrentPage(1);
      await fetchReservations(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel all reservations');
    } finally {
      setIsCancellingAll(false);
    }
  };

  const totalReservations = reservations.length
  const pendingReservations = reservations.filter(r => r.status.toLowerCase() === 'pending').length
  const activeReservations = reservations.filter(r => r.status.toLowerCase() === 'active').length
  const completedReservations = reservations.filter(r => r.status.toLowerCase() === 'completed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reservation Management</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Reservation</p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => fetchReservations(false)}
            disabled={loading}
            aria-label="Refresh reservations"
            className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
          <div className="relative">
            <button
              onClick={handleWalkIn}
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Plus className="w-4 h-4" />
              Walk-in Reservation
            </button>
          </div>
          <button
            onClick={() => setShowCancelAllDialog(true)}
            disabled={loading || isCancellingAll}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {isCancellingAll ? 'Cancelling...' : 'Cancel All'}
          </button>
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reservations</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalReservations}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h8m-9 8l-3-3H5a2 2 0 002-2V6a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 002 2h1l-3 3M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{pendingReservations}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{activeReservations}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3l-4 4H7a4 4 0 000 8h2l4 4v-7h2a3 3 0 000-6h-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{completedReservations}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search ID, name, and status..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="statusFilter" className="text-sm text-gray-600 whitespace-nowrap">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              aria-label="Filter by Status"
              value={selectedStatus}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedStatus(value);
                localStorage.setItem('reservationStatusFilter', value);
                const params = new URLSearchParams(window.location.search);
                if (value === 'all') {
                  params.delete('status');
                } else {
                  params.set('status', value);
                }
                const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
                window.history.replaceState(null, '', newUrl);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Date Filter
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
                        fetchReservations(false);
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
        <div
          className="overflow-x-auto relative"
          style={{ minHeight: loading ? 400 : Math.max(200, filteredReservations.length * 56 + 120) }}
        >
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10" aria-live="polite">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <p className="text-gray-600 text-sm">Loading reservations...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10" role="alert" aria-live="assertive">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Reservation No.</th>
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
              {!loading && !error && filteredReservations.length > 0 && filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-800">{reservation.reservation_number}</td>
                  <td className="py-4 px-4 text-sm text-gray-800">
                    {reservation.user_id.firstname || "No firstname"} {reservation.user_id.lastname || "No lastname"}
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
                      {reservation.status !== 'pending' ? (
                        <svg
                          className="w-5 h-5 text-green-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <button
                          onClick={() => {
                            setApproveTargetId(reservation.id);
                            setShowApproveDialog(true);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                          disabled={reservation.status !== 'pending'}
                        >
                          Approve
                        </button>
                      )}

                      
                      {/* <button 
                        onClick={() => handleReject(reservation.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50"
                        disabled={reservation.status !== 'pending'}
                      >
                        Reject
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No matching results found
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

      <Dialog open={showApproveDialog} onClose={() => { setShowApproveDialog(false); setApproveTargetId(null); }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm w-full bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <DialogTitle className="text-lg font-bold text-gray-800">Confirm Approval</DialogTitle>
              <button
                onClick={() => { setShowApproveDialog(false); setApproveTargetId(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-6">Are you sure you want to approve this reservation?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowApproveDialog(false); setApproveTargetId(null); }}
                  disabled={isApproving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isApproving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isApproving ? 'Approving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={showCancelAllDialog} onClose={() => setShowCancelAllDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-sm w-full bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <DialogTitle className="text-lg font-bold text-gray-800">Cancel All Reservations</DialogTitle>
              <button
                onClick={() => setShowCancelAllDialog(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isCancellingAll}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-6">This will cancel all pending, approved, and active reservations.</p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={cancelAllNotes}
                  onChange={(e) => setCancelAllNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  placeholder="System-wide cancellation due to maintenance"
                  disabled={isCancellingAll}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCancelAllDialog(false)}
                  disabled={isCancellingAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Close
                </button>
                <button
                  onClick={handleCancelAllReservations}
                  disabled={isCancellingAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCancellingAll && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isCancellingAll ? 'Cancelling...' : 'Confirm'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Walk-in Reservation Dialog */}
      <Dialog open={showWalkInDialog} onClose={() => setShowWalkInDialog(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <DialogTitle className="text-lg font-bold text-gray-800">Walk-in Reservation</DialogTitle>
              <button
                onClick={() => setShowWalkInDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {/* Reservation For Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reservation For</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={reservationFor === 'guest'}
                        onChange={() => setReservationFor('guest')}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Guest</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={reservationFor === 'user'}
                        onChange={() => setReservationFor('user')}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Existing User</span>
                    </label>
                  </div>
                </div>

                {reservationFor === 'user' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="e.g. 2020-12345"
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={guestFirstname}
                          onChange={(e) => setGuestFirstname(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="Juan"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={guestLastname}
                          onChange={(e) => setGuestLastname(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="Dela Cruz"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial (optional)</label>
                        <input
                          type="text"
                          value={guestMiddleInitial}
                          onChange={(e) => setGuestMiddleInitial(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="M"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="juan.delacruz@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min="15"
                          step="15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={activateNow}
                            onChange={(e) => setActivateNow(e.target.checked)}
                            disabled
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Activate now</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Resource Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={walkInType === 'computer'}
                        onChange={() => setWalkInType('computer')}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Computer</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={walkInType === 'laboratory'}
                        onChange={() => setWalkInType('laboratory')}
                        disabled={reservationFor === 'guest'}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className={`text-sm ${reservationFor === 'guest' ? 'text-gray-400' : 'text-gray-700'}`}>Laboratory</span>
                    </label>
                  </div>
                  {reservationFor === 'guest' && (
                    <div className="text-xs text-gray-500 mt-1">Guests can only reserve computers.</div>
                  )}
                </div>

                {walkInType === 'computer' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Computer
                    </label>
                    <select
                      value={selectedComputerId}
                      onChange={(e) => setSelectedComputerId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">Select a computer...</option>
                      {computers.map((computer) => (
                        <option key={computer.id} value={computer.id}>
                          {computer.pc_number} ({computer.status})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Laboratory
                    </label>
                    <select
                      value={selectedLaboratoryId}
                      onChange={(e) => setSelectedLaboratoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">Select a laboratory...</option>
                      {laboratories.map((lab) => (
                        <option key={lab.id} value={lab.id}>
                          {lab.name} ({lab.status})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {reservationFor === 'user' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={walkInDate}
                        onChange={(e) => setWalkInDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select a purpose...</option>
                    {PURPOSE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowWalkInDialog(false)}
                  disabled={isSubmittingWalkIn}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWalkInSubmit}
                  disabled={isSubmittingWalkIn}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingWalkIn && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isSubmittingWalkIn ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

export default Reservations;
