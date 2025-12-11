import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { RadioGroup } from '@headlessui/react';
import * as XLSX from 'xlsx';
import { getAllUsers, addUser, updateUser, deleteUser } from '../api/users';
import { getCourses } from '../api/courses';
import { getSystemDefault } from '../api/system-default';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  id_number: string;
  firstname: string;
  middle_initial?: string;
  lastname: string;
  yearLevel?: string | undefined;
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
  const navigate = useNavigate();
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
  const [userTypeFilter, setUserTypeFilter] = useState('');
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
  const [importUserType, setImportUserType] = useState<'student' | 'faculty'>('student');
  const debounceTimerRef = useRef<number | null>(null);
  const [formData, setFormData] = useState<{
    id_number: string;
    firstname: string;
    middle_initial: string;
    lastname: string;
    yearLevel?: string | undefined;
    program_course?: string | undefined;
    email: string;
    user_type: string;
  }>({
    id_number: '',
    firstname: '',
    middle_initial: '',
    lastname: '',
    yearLevel: undefined,
    program_course: undefined,
    email: '',
    user_type: 'student'
  });
  const yearLevels = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year'
  ];

  const [userTypeSelected, setUserTypeSelected] = useState('all');

  const DEFAULT_REMAINING_TIME = '20:00:00';
  const [systemDefaultTime, setSystemDefaultTime] = useState<string>(DEFAULT_REMAINING_TIME);
  const getDefaultRemainingTime = () => systemDefaultTime || localStorage.getItem('default_allotted_time') || DEFAULT_REMAINING_TIME;

  const [programCourses, setProgramCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourses();
        // Response shape: { status, message, data: [...] }
        if (response && Array.isArray(response.data)) {
          setProgramCourses(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const fetchDefaultTime = async () => {
      try {
        const res = await getSystemDefault();
        const t = res?.data?.default_allotted_time || DEFAULT_REMAINING_TIME;
        setSystemDefaultTime(t);
      } catch (e) {
        const stored = localStorage.getItem('default_allotted_time');
        setSystemDefaultTime(stored || DEFAULT_REMAINING_TIME);
      }
    };
    fetchDefaultTime();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: currentPage,
        limit: itemsPerPage
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
    setSearchInput(value);
    setCurrentPage(1);
  };
  const handleClearSearch = () => {
    setSearchInput('');
    setCurrentPage(1);
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
        yearLevel: user.yearLevel,
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
      yearLevel: undefined,
      program_course: undefined,
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
      let userData = {
        ...formData,
        ...(formData.middle_initial && { middle_initial: formData.middle_initial })
      };
      // Remove yearLevel and program_course if user_type is faculty
      if (formData.user_type === 'faculty') {
        userData.yearLevel = undefined;
        userData.program_course = undefined;
      }
      if (isEditMode && editingUserId) {
        await updateUser(editingUserId, userData);
      } else {
        const newUserData = {
          ...userData,
          password: formData.lastname + "@" + formData.id_number,
          remaining_time: formData.user_type === 'student' ? getDefaultRemainingTime() : null
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
          // Filter columns based on importUserType
          const previewData = jsonData.map((row: any) => {
            if (importUserType === 'faculty') {
              return {
                id_number: row.id_number || row.ID || '',
                firstname: row.firstname || row.first_name || row.Firstname || '',
                middle_initial: row.middle_initial || row.MI || '',
                lastname: row.lastname || row.last_name || row.Lastname || '',
                email: row.email || row.Email || '',
                user_type: row.user_type || row.type || 'faculty',
              };
            } else {
              return {
                id_number: row.id_number || row.ID || '',
                firstname: row.firstname || row.first_name || row.Firstname || '',
                middle_initial: row.middle_initial || row.MI || '',
                lastname: row.lastname || row.last_name || row.Lastname || '',
                program_course: row.program_course || row.program || row.course || '',
                yearLevel: row.yearLevel || row.year_level || '',
                email: row.email || row.Email || '',
                user_type: row.user_type || row.type || 'student',
              };
            }
          });
          setImportPreview(previewData.slice(0, 5)); // Show first 5 rows as preview
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
            let userData;
            if (importUserType === 'faculty') {
              userData = {
                id_number: row.id_number?.toString() || row.ID?.toString() || '',
                firstname: row.firstname || row.first_name || row.Firstname || '',
                middle_initial: row.middle_initial || row.MI || '',
                lastname: row.lastname || row.last_name || row.Lastname || '',
                email: row.email || row.Email || '',
                user_type: 'faculty',
                password: (row.lastname || row.last_name || row.Lastname || '') + "@" + (row.id_number?.toString() || row.ID?.toString() || ''),
                remaining_time: null
              };
            } else {
              userData = {
                id_number: row.id_number?.toString() || row.ID?.toString() || '',
                firstname: row.firstname || row.first_name || row.Firstname || '',
                middle_initial: row.middle_initial || row.MI || '',
                lastname: row.lastname || row.last_name || row.Lastname || '',
                program_course: row.program_course || row.program || row.course || '',
                yearLevel: row.yearLevel || row.year_level || '',
                email: row.email || row.Email || '',
                user_type: 'student',
                password: (row.lastname || row.last_name || row.Lastname || '') + "@" + (row.id_number?.toString() || row.ID?.toString() || ''),
                remaining_time: getDefaultRemainingTime()
              };
            }
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
    let template;
    if (importUserType === 'faculty') {
      template = [
        {
          id_number: 'EMP001',
          firstname: 'Alice',
          middle_initial: 'C',
          lastname: 'Johnson',
          email: 'alice.johnson@example.com',
          user_type: 'faculty'
        },
        {
          id_number: 'EMP002',
          firstname: 'Bob',
          middle_initial: 'D',
          lastname: 'Williams',
          email: 'bob.williams@example.com',
          user_type: 'faculty'
        }
      ];
    } else {
      template = [
        {
          id_number: '123456789',
          firstname: 'John',
          middle_initial: 'A',
          lastname: 'Doe',
          program_course: 'BSIT',
          yearLevel: '1st Year',
          email: 'john.doe@example.com',
          user_type: 'student'
        },
        {
          id_number: '987654321',
          firstname: 'Jane',
          middle_initial: 'B',
          lastname: 'Smith',
          program_course: 'BSCS',
          yearLevel: '1st Year',
          email: 'jane.smith@example.com',
          user_type: 'student'
        }
      ];
    }
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
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, ID number, or email"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm pr-10"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={0}
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* User Type Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="userTypeFilter" className="text-sm text-gray-600 whitespace-nowrap">Type:</label>
            <select
              id="userTypeFilter"
              value={userTypeFilter}
              onChange={(e) => {
                setUserTypeFilter(e.target.value);
                setCurrentPage(1);
                setUserTypeSelected(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                  {userTypeSelected === 'faculty' ? 'Employee ID' : 'ID Number'}
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
                {userTypeSelected === 'student' && (
                  <>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Program/Course</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Year Level</th>
                  </>
                )}
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">User Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && (() => {
                const filteredUsers = users.filter(user => {
                  const matchesType = !userTypeFilter || user.user_type === userTypeFilter;
                  const search = searchInput.trim().toLowerCase();
                  const matchesSearch = !search || (
                    user.firstname.toLowerCase().includes(search) ||
                    user.lastname.toLowerCase().includes(search) ||
                    user.id_number.toLowerCase().includes(search) ||
                    user.email.toLowerCase().includes(search)
                  );
                  return matchesType && matchesSearch;
                });

                // Pagination logic for filtered users
                const paginatedUsers = filteredUsers.slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                );

                if (filteredUsers.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-gray-500 font-medium">No users found</p>
                          {(searchInput || userTypeFilter) && (
                            <p className="text-sm text-gray-400">
                              {searchInput && userTypeFilter
                                ? `No results match your search "${searchInput}" and filter "${userTypeFilter}"`
                                : searchInput
                                  ? `No results match your search "${searchInput}"`
                                  : `No results match the filter "${userTypeFilter}"`
                              }
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
                return paginatedUsers.map((user, index) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm text-gray-800">{((currentPage - 1) * itemsPerPage) + index + 1}</td>
                    <td className="py-4 px-4 text-sm text-gray-800">
                      {user.firstname} {user.middle_initial ? `${user.middle_initial}. ` : ''}{user.lastname}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800">{user.id_number}</td>
                    <td className="py-4 px-4 text-sm text-gray-800">{user.email}</td>
                    {userTypeSelected === 'student' && (
                      <>
                        <td className="py-4 px-4 text-sm text-gray-800">{user.program_course}</td>
                        <td className="py-4 px-4 text-sm text-gray-800">{user.yearLevel}</td>
                      </>
                    )}
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
                        {/* <button 
                          onClick={() => handleRemove(user._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Delete
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ));
              })()}
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

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onClose={handleCloseImportDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
                Import Users from Excel
              </DialogTitle>
              {/* User Type Selection for Import */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <RadioGroup value={importUserType} onChange={setImportUserType}>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {[
                      {
                        type: 'student',
                        label: 'Student',
                        description: 'For regular students using the system.'
                      },
                      {
                        type: 'faculty',
                        label: 'Faculty',
                        description: 'For teachers, professors, and staff.'
                      }
                    ].map(option => (
                      <RadioGroup.Option key={option.type} value={option.type} className={({ checked }) =>
                        `flex flex-col items-start px-4 py-3 rounded-lg border transition-colors duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full min-w-0 ${checked ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`
                      }>
                        {({ checked }) => (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-block w-4 h-4 rounded-full border-2 ${checked ? 'bg-white border-white' : 'bg-gray-200 border-gray-400'}`}></span>
                              <span className="font-semibold">{option.label}</span>
                            </div>
                            <span className={`text-xs ${checked ? 'text-indigo-100' : 'text-gray-500'}`}>{option.description}</span>
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>
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
                  <span className="font-medium">
                    {importUserType === 'faculty'
                      ? ' id_number, firstname, middle_initial, lastname, email, user_type'
                      : ' id_number, firstname, middle_initial, lastname, program_course, yearLevel, email, user_type'}
                  </span>
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
                        <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      {/* <Dialog open={isImportDialogOpen} onClose={handleCloseImportDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
                Import Users from Excel
              </DialogTitle>
              
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
                  <span className="font-medium"> id_number, firstname, middle_initial, lastname, program_course, yearLevel, email, user_type</span>
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

              {importResult && (
                <div className="mb-6">
                  {importResult.failed === 0 ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      </Dialog> */}
    </div>
  );
}

export default Users;
