import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api/courses';

function Settings() {
  const [activeTab, setActiveTab] = useState('semester');
  const [courses, setCourses] = useState([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isCourseSubmitting, setIsCourseSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', description: '' });
  const [courseError, setCourseError] = useState('');
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<any | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    }
  }, [activeTab]);

  const fetchCourses = async () => {
    setIsCoursesLoading(true);
    try {
      const response = await getCourses();
      if (response && Array.isArray(response.data)) {
        setCourses(response.data);
      }
    } catch (err) {
      setCourses([]);
    } finally {
      setIsCoursesLoading(false);
    }
  };

  const handleOpenCourseDialog = () => {
    setNewCourse({ name: '', description: '' });
    setCourseError('');
    setIsCourseDialogOpen(true);
  };

  // Edit dialog handlers
  const handleOpenEditDialog = (course: any) => {
    setEditCourse({ ...course });
    setEditError('');
    setIsEditDialogOpen(true);
  };
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditCourse(null);
    setEditError('');
  };
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditCourse((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleUpdateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditSubmitting(true);
    setEditError('');
    try {
      if (!editCourse.name.trim()) {
        setEditError('Course name is required.');
        setIsEditSubmitting(false);
        return;
      }
      await updateCourse(editCourse._id, { name: editCourse.name, description: editCourse.description });
      setIsEditDialogOpen(false);
      fetchCourses();
    } catch (err) {
      setEditError('Failed to update course.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete dialog handlers
  const handleOpenDeleteDialog = (courseId: string) => {
    setDeleteCourseId(courseId);
    setIsDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeleteCourseId(null);
  };
  const handleDeleteCourse = async () => {
    if (!deleteCourseId) return;
    setIsDeleteSubmitting(true);
    try {
      await deleteCourse(deleteCourseId);
      setIsDeleteDialogOpen(false);
      fetchCourses();
    } catch (err) {
      // Optionally show error
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  const handleCloseCourseDialog = () => {
    setIsCourseDialogOpen(false);
    setCourseError('');
  };

  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCourseSubmitting(true);
    setCourseError('');
    try {
      if (!newCourse.name.trim()) {
        setCourseError('Course name is required.');
        setIsCourseSubmitting(false);
        return;
      }
      await createCourse(newCourse);
      setIsCourseDialogOpen(false);
      fetchCourses();
    } catch (err) {
      setCourseError('Failed to create course.');
    } finally {
      setIsCourseSubmitting(false);
    }
  };
  const [semesterData, setSemesterData] = useState({
    semester: '1st Semester',
    schoolYear: '2024-2025',
    startDate: '',
    endDate: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSemester = async () => {
    setIsSaving(true);
    try {
      // TODO: Add API call to save semester configuration
      // await saveSemesterConfig(semesterData);
      
      console.log('Saving semester configuration:', semesterData);
      alert('Semester configuration saved successfully');
    } catch (error) {
      console.error('Error saving semester configuration:', error);
      alert('Failed to save semester configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Settings</p>
        </div>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('semester')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'semester'
                  ? 'border-indigo-700 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Semester Configuration
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-indigo-700 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              General Settings
            </button>
            {/* <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-indigo-700 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Notifications
            </button> */}
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'courses'
                  ? 'border-indigo-700 text-indigo-700'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Courses
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-1">Courses</h2>
                  <p className="text-sm text-gray-600">Manage the list of academic programs/courses.</p>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={handleOpenCourseDialog}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Create New
                </button>
              </div>
              <div className="bg-gray-50 border border-transparent overflow-x-auto">
                <table className="min-w-full rounded-xl">
                  <thead className="bg-white sticky top-0 z-10 shadow">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Course Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isCoursesLoading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center">
                          <svg className="mx-auto animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span className="block mt-2 text-indigo-600 text-sm">Loading courses...</span>
                        </td>
                      </tr>
                    ) : courses.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No courses found.</td></tr>
                    ) : (
                      courses.map((course, idx) => (
                        <tr key={(course as any)._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50" + " hover:bg-indigo-50 transition"}>
                          <td className="px-6 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">{(course as any).name}</td>
                          <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{(course as any).description}</td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                onClick={() => handleOpenEditDialog(course as any)}
                              >Edit</button>
                              <button
                                className="px-3 py-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded shadow focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                                onClick={() => handleOpenDeleteDialog((course as any)._id)}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Create Course Dialog */}
              <Dialog open={isCourseDialogOpen} onClose={handleCloseCourseDialog} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
                    <div className="p-6">
                      <DialogTitle className="text-xl font-bold text-gray-800 mb-4">Create New Course</DialogTitle>
                      <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div>
                          <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                          <input
                            type="text"
                            id="courseName"
                            name="name"
                            value={newCourse.name}
                            onChange={handleCourseInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            id="courseDescription"
                            name="description"
                            value={newCourse.description}
                            onChange={handleCourseInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        {courseError && <p className="text-sm text-red-600">{courseError}</p>}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleCloseCourseDialog}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isCourseSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isCourseSubmitting ? 'Creating...' : 'Create Course'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </DialogPanel>
                </div>
              </Dialog>

              {/* Edit Course Dialog */}
              <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
                    <div className="p-6">
                      <DialogTitle className="text-xl font-bold text-gray-800 mb-4">Edit Course</DialogTitle>
                      <form onSubmit={handleUpdateCourse} className="space-y-4">
                        <div>
                          <label htmlFor="editCourseName" className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                          <input
                            type="text"
                            id="editCourseName"
                            name="name"
                            value={editCourse?.name || ''}
                            onChange={handleEditInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="editCourseDescription" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            id="editCourseDescription"
                            name="description"
                            value={editCourse?.description || ''}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                        {editError && <p className="text-sm text-red-600">{editError}</p>}
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleCloseEditDialog}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isEditSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </DialogPanel>
                </div>
              </Dialog>

              {/* Delete Course Dialog */}
              <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <DialogPanel className="mx-auto max-w-sm w-full bg-white rounded-xl shadow-xl">
                    <div className="p-6">
                      <DialogTitle className="text-xl font-bold text-gray-800 mb-4">Delete Course</DialogTitle>
                      <p className="mb-6 text-gray-700">Are you sure you want to delete this course? This action cannot be undone.</p>
                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleCloseDeleteDialog}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isDeleteSubmitting}
                          onClick={handleDeleteCourse}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isDeleteSubmitting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </div>
              </Dialog>
            </div>
          )}
          {activeTab === 'semester' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Academic Semester Configuration</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Configure the current academic semester and school year settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Semester Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    value={semesterData.semester}
                    onChange={(e) => setSemesterData({ ...semesterData, semester: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                {/* School Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Year
                  </label>
                  <input
                    type="text"
                    value={semesterData.schoolYear}
                    onChange={(e) => setSemesterData({ ...semesterData, schoolYear: e.target.value })}
                    placeholder="e.g., 2024-2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={semesterData.startDate}
                    onChange={(e) => setSemesterData({ ...semesterData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={semesterData.endDate}
                    onChange={(e) => setSemesterData({ ...semesterData, endDate: e.target.value })}
                    min={semesterData.startDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Current Configuration Display */}
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2">Current Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Semester:</span>
                    <span className="ml-2 font-medium text-gray-900">{semesterData.semester}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">School Year:</span>
                    <span className="ml-2 font-medium text-gray-900">{semesterData.schoolYear}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {semesterData.startDate || 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">End Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {semesterData.endDate || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSemester}
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Configure general system settings and preferences.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">System Maintenance Mode</h3>
                    <p className="text-xs text-gray-600 mt-1">Temporarily disable user access for maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">Email Notifications</h3>
                    <p className="text-xs text-gray-600 mt-1">Send email notifications to users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">Auto-approve Reservations</h3>
                    <p className="text-xs text-gray-600 mt-1">Automatically approve all reservation requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {/* {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Manage how and when you receive notifications.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-800">New Reservation Requests</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">Get notified when users submit new reservation requests</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-800">User Registration</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">Get notified when new users register in the system</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-800">System Alerts</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-700"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600">Get notified about important system events and errors</p>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default Settings;
