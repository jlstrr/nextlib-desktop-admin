import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { getAdminProfile } from '../api/admin';

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
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    id_number: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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
        email: response.data.email || '',
        id_number: response.data.username || ''
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
      // TODO: Add API call to update admin profile
      // await updateAdminProfile(admin._id, formData);
      
      // Update localStorage
      if (admin) {
        const updatedAdmin = { ...admin, ...formData };
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
        setAdmin(updatedAdmin);
      }
      
      setIsEditDialogOpen(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Add API call to change password
      // await changeAdminPassword(admin._id, passwordData);
      
      setIsPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
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
        <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600 rounded-t-lg"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
              <div className="w-full h-full rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
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
                  {admin.isSuperAdmin && (
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      Super Admin
                    </span>
                  )}
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
                <label className="text-sm font-medium text-gray-500">ID Number</label>
                <p className="text-gray-800 mt-1">{admin.id_number}</p>
              </div>
              
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
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
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
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
