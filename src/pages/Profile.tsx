import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { getAdminProfile, updateAdmin, changePassword } from '../api/admin';

interface Admin {
  _id: string;
  id_number: string;
  firstname: string;
  lastname: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

function Profile() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await getAdminProfile();
      setAdmin(response.data);
      setFormData({
        firstname: response.data.firstname || '',
        lastname: response.data.lastname || '',
        email: response.data.email || ''
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      if (!admin) throw new Error('No admin loaded');
      const payload: any = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
      };
      await updateAdmin(admin._id, payload);
      const refreshed = await getAdminProfile();
      setAdmin(refreshed.data);
      setFormData({
        firstname: refreshed.data.firstname || '',
        lastname: refreshed.data.lastname || '',
        email: refreshed.data.email || '',
      });
      
      // Update localStorage
      localStorage.setItem('admin', JSON.stringify(refreshed.data));
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('New password and confirm password do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });
      
      setIsPasswordDialogOpen(false);
      setPasswordData({
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchAdminProfile}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard / Profile</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Cover Photo */}
        <div className="h-32 bg-[#201a50] rounded-t-lg"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
              <div className="w-full h-full rounded-full bg-[#201a50] flex items-center justify-center text-white text-4xl font-bold">
                {admin.firstname[0]}{admin.lastname[0]}
              </div>
            </div>
            
            {/* Name and Actions */}
            <div className="flex-1 sm:ml-4 mt-16 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {admin.firstname} {admin.lastname}
                  </h2>
                  <p className="text-gray-600">{admin.email}</p>
                  {/* {admin.isSuperAdmin && (
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      Super Admin
                    </span>
                  )} */}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleEditProfile}
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setIsPasswordDialogOpen(true)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-gray-800 mt-1">{admin.firstname}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-gray-800 mt-1">{admin.lastname}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-800 mt-1">{admin.email}</p>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Information</h3>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-800 mt-1">{admin.isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-gray-800 mt-1">{formatDate(admin.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-800 mt-1">{formatDate(admin.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-semibold text-gray-800 mb-4">
                Edit Profile
              </DialogTitle>
              
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-semibold text-gray-800 mb-4">
                Change Password
              </DialogTitle>
              
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
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

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  onClick={() => setIsPasswordDialogOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

export default Profile;
