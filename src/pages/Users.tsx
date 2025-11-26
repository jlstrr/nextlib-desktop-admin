import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import * as XLSX from 'xlsx';
import { getAllUsers, addUser, updateUser, deleteUser } from '../api/users';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; data: any; error: string }>
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const [formData, setFormData] = useState({
    id_number: '',
    firstname: '',
    middle_initial: '',
    lastname: '',
    program_course: '',
    email: '',
    user_type: 'student'
  });

  const DEFAULT_PASSWORD = 'password';
  const DEFAULT_REMAINING_TIME = '20:00:00';

  const programCourses = [
    'BSIT',
    'BSCS',
    'BSIS',
    'ACT',
    'BSBA',
    'BSED',
    'BEED',
    'BSN'
  ];

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

  const handleSearch = (value: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 500); // 500ms debounce delay
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleEdit = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setFormData({
        id_number: user.id_number,
        firstname: user.firstname,
        middle_initial: user.middle_initial || '',
        lastname: user.lastname,
        program_course: user.program_course,
        email: user.email,
        user_type: user.user_type
      });
      setEditingUserId(userId);
      setIsEditMode(true);
      setIsDialogOpen(true);
    }
  };

  const handleRemove = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNewUser = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData({
      id_number: '',
      firstname: '',
      middle_initial: '',
      lastname: '',
      program_course: '',
      email: '',
      user_type: 'student'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userData = {
        ...formData,
        ...(formData.middle_initial && { middle_initial: formData.middle_initial })
      };
      
      if (isEditMode && editingUserId) {
        await updateUser(editingUserId, userData);
      } else {
        const newUserData = {
          ...userData,
          password: DEFAULT_PASSWORD,
          remaining_time: DEFAULT_REMAINING_TIME
        };
        await addUser(newUserData);
      }
      
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      console.error('Failed to save user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
    setImportFile(null);
    setImportPreview([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          setImportPreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
        } catch (error) {
          console.error('Error reading file:', error);
          alert('Error reading Excel file. Please check the file format.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleConfirmImport = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
          
          let successCount = 0;
          let failCount = 0;
          const failedRows: any[] = [];
          
          // Process and import users
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const userData = {
              id_number: row.id_number?.toString() || row.ID?.toString() || '',
              firstname: row.firstname || row.first_name || row.Firstname || '',
              middle_initial: row.middle_initial || row.MI || '',
              lastname: row.lastname || row.last_name || row.Lastname || '',
              program_course: row.program_course || row.program || row.course || '',
              email: row.email || row.Email || '',
              user_type: row.user_type || row.type || 'student',
              password: DEFAULT_PASSWORD,
              remaining_time: DEFAULT_REMAINING_TIME
            };
            
            try {
              await addUser(userData);
              successCount++;
            } catch (err) {
              failCount++;
              failedRows.push({
                row: i + 2, // +2 because Excel rows start at 1 and header is row 1
                data: userData,
                error: err instanceof Error ? err.message : 'Unknown error'
              });
              console.error('Failed to import user:', userData, err);
            }
          }
          
          handleCloseImportDialog();
          fetchUsers();
          
          // Set import results to display in dialog
          setImportResult({
            success: successCount,
            failed: failCount,
            errors: failedRows
          });
          
          // Reopen dialog to show results
          setIsImportDialogOpen(true);
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Error processing Excel file.');
        }
      };
      reader.readAsArrayBuffer(importFile);
    } catch (err) {
      console.error('Failed to import users:', err);
      alert('Failed to import users');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        id_number: '123456789',
        firstname: 'John',
        middle_initial: 'A',
        lastname: 'Doe',
        program_course: 'BSIT',
        email: 'john.doe@example.com',
        user_type: 'student'
      },
      {
        id_number: '987654321',
        firstname: 'Jane',
        middle_initial: 'B',
        lastname: 'Smith',
        program_course: 'BSCS',
        email: 'jane.smith@example.com',
        user_type: 'student'
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'users_import_template.xlsx');
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
            onClick={handleOpenImportDialog}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Import Data
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
            placeholder="Search by name, ID number, or email"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              handleSearch(e.target.value);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          
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
                    {user.firstname} {user.middle_initial ? `${user.middle_initial}. ` : ''}{user.lastname}
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
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-500 font-medium">No users found</p>
                      {searchQuery && (
                        <p className="text-sm text-gray-400">
                          No results match your search "{searchQuery}"
                        </p>
                      )}
                    </div>
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

      {/* Add User Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-bold text-gray-800 mb-6">
                {isEditMode ? 'Edit User' : 'Add New User'}
              </DialogTitle>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* ID Number */}
                  <div>
                    <label htmlFor="id_number" className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number
                    </label>
                    <input
                      type="number"
                      id="id_number"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* First Name */}
                  <div>
                    <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Middle Initial */}
                  <div>
                    <label htmlFor="middle_initial" className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Initial (Optional)
                    </label>
                    <input
                      type="text"
                      id="middle_initial"
                      name="middle_initial"
                      value={formData.middle_initial}
                      onChange={handleInputChange}
                      maxLength={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>

                  {/* Program/Course */}
                  <div>
                    <label htmlFor="program_course" className="block text-sm font-medium text-gray-700 mb-1">
                      Program/Course
                    </label>
                    <select
                      id="program_course"
                      name="program_course"
                      value={formData.program_course}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="">Select a program</option>
                      {programCourses.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  {/* User Type */}
                  <div>
                    <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
                      User Type
                    </label>
                    <select
                      id="user_type"
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update User' : 'Add User')}
                  </button>
                </div>
              </form>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCancelDelete} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
                Confirm Delete
              </DialogTitle>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onClose={handleCloseImportDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
                Import Users from Excel
              </DialogTitle>
              
              {/* Download Template Section */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Need a template?</h3>
                    <p className="text-xs text-blue-700">
                      Download our Excel template with sample data and the correct format
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="ml-4 px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    Download Template
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Upload an Excel file (.xlsx, .xls) with the following columns: 
                  <span className="font-medium"> id_number, firstname, middle_initial, lastname, program_course, email, user_type</span>
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {importPreview.length > 0 && !importResult && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview (First 5 rows)</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-60">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            {Object.keys(importPreview[0]).map((key) => (
                              <th key={key} className="px-3 py-2 text-left text-gray-600 font-semibold border-b">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              {Object.values(row).map((value: any, i) => (
                                <td key={i} className="px-3 py-2 text-gray-700">
                                  {value?.toString() || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Results */}
              {importResult && (
                <div className="mb-6">
                  {importResult.failed === 0 ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h3 className="text-sm font-semibold text-green-900 mb-1">Import Successful!</h3>
                          <p className="text-sm text-green-700">
                            Successfully imported all {importResult.success} users.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-yellow-900 mb-1">Import Completed with Errors</h3>
                            <p className="text-sm text-yellow-700">
                              ✓ Success: {importResult.success} | ✗ Failed: {importResult.failed}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-red-200 rounded-lg overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                          <h4 className="text-sm font-semibold text-red-900">Failed Imports</h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {importResult.errors.map((error, index) => (
                            <div key={index} className="px-4 py-3 border-b border-red-100 last:border-b-0">
                              <div className="text-xs">
                                <span className="font-semibold text-red-900">Row {error.row}:</span>
                                <span className="text-gray-700 ml-2">
                                  {error.data.firstname} {error.data.lastname}
                                </span>
                              </div>
                              <div className="text-xs text-red-600 mt-1">{error.error}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseImportDialog}
                  disabled={isImporting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importResult ? 'Close' : 'Cancel'}
                </button>
                {!importResult && (
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    disabled={!importFile || isImporting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isImporting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isImporting ? 'Importing...' : 'Import Users'}
                  </button>
                )}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

export default Users;