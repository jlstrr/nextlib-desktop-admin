import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { adminLogout } from '../api/admin';
import { useSidebar } from '../context/SidebarContext';

function Header() {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Get admin info from localStorage
  const adminData = localStorage.getItem('admin');
  const admin = adminData ? JSON.parse(adminData) : null;
  const displayName = admin ? `${admin.firstname} ${admin.lastname}` : 'Admin';
  const email = admin?.email;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showDropdown || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, showNotifications]);

  const handleLogout = async () => {
    try {
      // Call the admin logout API
      await adminLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all stored data regardless of API call result
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      navigate('/');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left side - Hamburger menu */}
      <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Right side - Dark mode toggle, notifications, and user menu */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        {/* <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </button> */}

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          {/* <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button> */}

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fade-in">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  Mark all as read
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-96 overflow-y-auto">
                {/* Sample Notification 1 */}
                <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 bg-orange-500 rounded-full shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium">New Reservation Request</p>
                      <p className="text-xs text-gray-600 mt-1">John Doe requested Computer Lab 1 for tomorrow at 2:00 PM</p>
                      <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                    </div>
                  </div>
                </div>

                {/* Sample Notification 2 */}
                <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 bg-orange-500 rounded-full shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium">Reservation Cancelled</p>
                      <p className="text-xs text-gray-600 mt-1">Jane Smith cancelled their reservation for Computer Lab 2</p>
                      <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>

                {/* Sample Notification 3 - Read */}
                <div className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 bg-gray-300 rounded-full shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 font-medium">System Maintenance</p>
                      <p className="text-xs text-gray-500 mt-1">Scheduled maintenance on Sunday from 12 AM to 4 AM</p>
                      <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>

                {/* Empty state (uncomment when no notifications) */}
                {/* <div className="px-4 py-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-300 mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  <p className="text-sm text-gray-500">No notifications</p>
                </div> */}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-100">
                <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#201a50] flex items-center justify-center text-white font-semibold text-sm">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-700">{displayName}</p>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{email}</p>
                {admin?.isSuperAdmin && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Super Admin
                  </span>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>My Profile</span>
                </button>
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
              </div>

              <hr className="my-1 border-gray-100" />
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
