import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Switch } from '@headlessui/react';
import { getAllAdmins, createAdmin, updateAdmin } from '../api/admin';
import { RefreshCcw } from 'lucide-react';

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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'super'>('all');
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
  const [adminToToggle, setAdminToToggle] = useState<{ id: string, newStatus: string } | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, itemsPerPage, roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = (searchInput || '').slice(0, 100);
      setDebouncedSearch(trimmed);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ApiResponse = await getAllAdmins({
        page: currentPage,
        limit: itemsPerPage,
        isSuperAdmin: roleFilter === 'super' ? true : roleFilter === 'admin' ? false : undefined,
      });
      setAdmins(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
      console.error('Error fetching admins:', err);
    } finally {
      setIsLoading(false);
    }
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

  const handleToggleStatus = (admin: Admin) => {
    const newStatus = admin.status === 'active' ? 'suspended' : 'active';
    setAdminToToggle({ id: admin._id, newStatus });
    setIsConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!adminToToggle) return;
    try {
      await updateAdmin(adminToToggle.id, { status: adminToToggle.newStatus });
      setIsConfirmOpen(false);
      setAdminToToggle(null);
      await fetchAdmins();
      
      setAlertTitle('Success');
      setAlertMessage(`Admin has been ${adminToToggle.newStatus === 'active' ? 'activated' : 'suspended'}`);
      setAlertVariant('success');
      setIsAlertOpen(true);
    } catch (err) {
      setIsConfirmOpen(false);
      setAlertTitle('Error');
      setAlertMessage(err instanceof Error ? err.message : 'Failed to update admin status');
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
    if (s === 'suspended') return 'bg-red-100 text-red-800';
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (s === 'disabled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  const normalizedSearch = debouncedSearch.trim().toLowerCase();
  const safeAdmins = Array.isArray(admins) ? admins : [];
  const filteredAdmins = safeAdmins.filter((admin) => {
    if (!normalizedSearch) return true;
    const values = [getFullName(admin), admin.username, admin.email].map(v => String(v ?? '').toLowerCase());
    return values.some(v => v.includes(normalizedSearch));
  });

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAdmins()}
            disabled={isLoading}
            aria-label="Refresh admins"
            className="inline-flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isLoading ? (
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
          <button 
            onClick={handleAddNewAdmin}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Add New Admin
          </button>
        </div>
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
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCreatePassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {adminToToggle?.newStatus === 'active' ? 'Activate Admin' : 'Suspend Admin'}
            </DialogTitle>
            <div className="mt-2 text-sm text-gray-600">
              Are you sure you want to {adminToToggle?.newStatus === 'active' ? 'activate' : 'suspend'} this admin?
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button 
                onClick={confirmStatusChange} 
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${
                  adminToToggle?.newStatus === 'active' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {adminToToggle?.newStatus === 'active' ? 'Activate' : 'Suspend'}
              </button>
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
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="Leave blank to keep"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showEditPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, username, and email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="roleFilter" className="text-sm text-gray-600 whitespace-nowrap">
              Role:
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => {
                const val = e.target.value as 'all' | 'admin' | 'super';
                setRoleFilter(val);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
            >
              <option value="all">All</option>
              <option value="admin">Admin</option>
              <option value="super">Super Admin</option>
            </select>
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
          ) : filteredAdmins.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">No admins match your filters</div>
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
                {filteredAdmins.map((admin, index) => (
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
                          onClick={() => handleToggleStatus(admin)}
                          className={`${
                            admin.status === 'active' 
                              ? 'bg-yellow-500 hover:bg-yellow-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white px-3 py-1 rounded text-xs font-medium`}
                        >
                          {admin.status === 'active' ? 'Suspend' : 'Activate'}
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
