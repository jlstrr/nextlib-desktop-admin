import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Switch } from '@headlessui/react';
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '../api/admin';

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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [createForm, setCreateForm] = useState({
    firstname: '',
    middle_initial: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    isSuperAdmin: false,
  });
  const [editForm, setEditForm] = useState({
    firstname: '',
    middle_initial: '',
    lastname: '',
    username: '',
    email: '',
    isSuperAdmin: false,
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'error' | 'success' | 'info'>('info');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [adminIdToRemove, setAdminIdToRemove] = useState<string | null>(null);

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
    const admin = admins.find(a => a._id === adminId) || null;
    if (!admin) return;
    setSelectedAdmin(admin);
    setEditForm({
      firstname: admin.firstname || '',
      middle_initial: admin.middle_initial || '',
      lastname: admin.lastname || '',
      username: admin.username || '',
      email: admin.email || '',
      isSuperAdmin: !!admin.isSuperAdmin,
      password: '',
    });
    setIsEditDialogOpen(true);
  };

  const handleRemove = (adminId: string) => {
    setAdminIdToRemove(adminId);
    setIsConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!adminIdToRemove) return;
    try {
      await deleteAdmin(adminIdToRemove);
      setIsConfirmOpen(false);
      setAdminIdToRemove(null);
      await fetchAdmins();
    } catch (err) {
      setIsConfirmOpen(false);
      setAlertTitle('Error');
      setAlertMessage(err instanceof Error ? err.message : 'Failed to delete admin');
      setAlertVariant('error');
      setIsAlertOpen(true);
    }
  };

  const handleAddNewAdmin = () => {
    setCreateForm({
      firstname: '',
      middle_initial: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      isSuperAdmin: false,
    });
    setIsCreateDialogOpen(true);
  };

  const getFullName = (admin: Admin) => {
    return `${admin.firstname} ${admin.middle_initial ? `${admin.middle_initial}. ` : ''}${admin.lastname}`;
  };

  const getPermissionLabel = (admin: Admin) => {
    return admin.isSuperAdmin ? 'Super Admin' : 'Admin';
  };

  const getStatusBadgeClasses = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-green-100 text-green-800';
    if (s === 'inactive') return 'bg-gray-200 text-gray-700';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (s === 'disabled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
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

      <Dialog open={isCreateDialogOpen} onClose={() => !isSubmitting && setIsCreateDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-semibold text-gray-800">Add New Admin</DialogTitle>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input value={createForm.firstname} onChange={(e) => setCreateForm({ ...createForm, firstname: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial (Optional)</label>
                  <input value={createForm.middle_initial} onChange={(e) => setCreateForm({ ...createForm, middle_initial: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input value={createForm.lastname} onChange={(e) => setCreateForm({ ...createForm, lastname: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Super Admin</span>
                  <Switch
                    checked={createForm.isSuperAdmin}
                    onChange={(val) => setCreateForm({ ...createForm, isSuperAdmin: val })}
                    className={`${createForm.isSuperAdmin ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <span className="sr-only">Super Admin</span>
                    <span
                      aria-hidden
                      className={`${createForm.isSuperAdmin ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button disabled={isSubmitting} onClick={() => setIsCreateDialogOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button disabled={isSubmitting} onClick={async () => {
                if (!createForm.firstname || !createForm.lastname || !createForm.username || !createForm.email || !createForm.password) {
                  setAlertTitle('Validation');
                  setAlertMessage('Please fill in all required fields');
                  setAlertVariant('error');
                  setIsAlertOpen(true);
                  return;
                }
                setIsSubmitting(true);
                try {
                  await createAdmin(createForm);
                  setIsCreateDialogOpen(false);
                  await fetchAdmins();
                } catch (err) {
                  setAlertTitle('Error');
                  setAlertMessage(err instanceof Error ? err.message : 'Failed to create admin');
                  setAlertVariant('error');
                  setIsAlertOpen(true);
                } finally {
                  setIsSubmitting(false);
                }
              }} className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-semibold text-gray-800">Remove Admin</DialogTitle>
            <div className="mt-2 text-sm text-gray-600">Are you sure you want to remove this admin?</div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmRemove} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Remove</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              {alertVariant === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.75 5.25a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0v-6zm.75 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              )}
              {alertVariant === 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-600">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.06 11.19l-2.12-2.12a.75.75 0 10-1.06 1.06l2.65 2.65c.293.293.768.293 1.06 0l5.3-5.3a.75.75 0 10-1.06-1.06l-4.77 4.77z" clipRule="evenodd" />
                </svg>
              )}
              {alertVariant === 'info' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-600">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 5.25a1 1 0 110 2 1 1 0 010-2zm-1 3.75a1 1 0 000 2h.5v4a1 1 0 002 0v-4a1 1 0 00-1-1h-1.5z" clipRule="evenodd" />
                </svg>
              )}
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-800">{alertTitle}</DialogTitle>
                <div className="mt-1 text-sm text-gray-600">{alertMessage}</div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsAlertOpen(false)} className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-medium">OK</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={isEditDialogOpen} onClose={() => !isSubmitting && setIsEditDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-semibold text-gray-800">Edit Admin</DialogTitle>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input value={editForm.firstname} onChange={(e) => setEditForm({ ...editForm, firstname: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Initial (Optional)</label>
                  <input value={editForm.middle_initial} onChange={(e) => setEditForm({ ...editForm, middle_initial: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input value={editForm.lastname} onChange={(e) => setEditForm({ ...editForm, lastname: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Leave blank to keep" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Super Admin</span>
                  <Switch
                    checked={editForm.isSuperAdmin}
                    onChange={(val) => setEditForm({ ...editForm, isSuperAdmin: val })}
                    className={`${editForm.isSuperAdmin ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <span className="sr-only">Super Admin</span>
                    <span
                      aria-hidden
                      className={`${editForm.isSuperAdmin ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button disabled={isSubmitting} onClick={() => setIsEditDialogOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button disabled={isSubmitting || !selectedAdmin} onClick={async () => {
                if (!selectedAdmin) return;
                if (!editForm.firstname || !editForm.lastname || !editForm.username || !editForm.email) {
                  setAlertTitle('Validation');
                  setAlertMessage('Please fill in all required fields');
                  setAlertVariant('error');
                  setIsAlertOpen(true);
                  return;
                }
                setIsSubmitting(true);
                try {
                  const payload: any = {
                    firstname: editForm.firstname,
                    middle_initial: editForm.middle_initial,
                    lastname: editForm.lastname,
                    username: editForm.username,
                    email: editForm.email,
                    isSuperAdmin: editForm.isSuperAdmin,
                  };
                  if (editForm.password) payload.password = editForm.password;
                  await updateAdmin(selectedAdmin._id, payload);
                  setIsEditDialogOpen(false);
                  await fetchAdmins();
                } catch (err) {
                  setAlertTitle('Error');
                  setAlertMessage(err instanceof Error ? err.message : 'Failed to update admin');
                  setAlertVariant('error');
                  setIsAlertOpen(true);
                } finally {
                  setIsSubmitting(false);
                }
              }} className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-medium disabled:opacity-50">Save</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

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
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClasses(admin.status)}`}>
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
