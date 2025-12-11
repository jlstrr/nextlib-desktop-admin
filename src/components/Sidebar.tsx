
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useState } from 'react';

function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [attendanceDropdownOpen, setAttendanceDropdownOpen] = useState(false);
  const adminData = localStorage.getItem('admin');
  const admin = adminData ? JSON.parse(adminData) : null;
  const isSuperAdmin = !!admin?.isSuperAdmin;
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      )
    },
    { 
      name: 'User Records', 
      path: '/users', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      )
    },
    { 
      name: 'Admin', 
      path: '/admin', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      name: 'Computers', 
      path: '/computers', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      )
    },
    { 
      name: 'Laboratories', 
      path: '/laboratory', 
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <rect x="4" y="10" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="8" y="6" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="10" y="14" width="2" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="12" y="14" width="2" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <rect x="14" y="14" width="2" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        )
    },
    { 
      name: 'Reservation', 
      path: '/reservations', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      )
    },
    // Attendance dropdown handled separately
    { 
      name: 'Subject Scheduler', 
      path: '/subject-scheduler', 
      icon: (
        // Calendar icon for Subject Scheduler
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    },
  ];

  const filteredMenuItems = isSuperAdmin
    ? menuItems.filter((item) => ['Dashboard', 'Admin', 'Reports'].includes(item.name))
    : menuItems.filter((item) => item.name !== 'Admin');

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } fixed lg:static inset-y-0 left-0 z-30 ${
        isSidebarOpen ? 'w-64' : 'w-64 lg:w-20'
      } bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300 ease-in-out`}>
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-700 rounded-md flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">NL</span>
            </div>
            <span className={`font-bold text-lg text-gray-800 whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isSidebarOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'
            }`}>NextLib System</span>
          </div>
        </div>

      {/* Menu Section */}
      <div className="flex-1 py-6">
        <div className="px-4 mb-2">
          <span className={`text-xs font-semibold text-gray-400 uppercase tracking-wider transition-all duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'lg:opacity-0'
          }`}>Menu</span>
        </div>
        <nav className="px-2 space-y-1">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={!isSidebarOpen ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center ${isSidebarOpen ? 'space-x-3' : 'lg:justify-center'} px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isSidebarOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'
              }`}>{item.name}</span>
            </NavLink>
          ))}

          {/* Attendance Dropdown */}
          <div className="relative">
            <button
              type="button"
              className={`flex items-center w-full ${isSidebarOpen ? 'space-x-3' : 'lg:justify-center'} px-4 py-2.5 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 focus:outline-none`}
              onClick={() => setAttendanceDropdownOpen((open) => !open)}
              title={!isSidebarOpen ? 'Attendance' : undefined}
            >
              <span className="shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </span>
              <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isSidebarOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'
              }`}>Attendance</span>
              <svg className={`w-4 h-4 ml-auto transition-transform ${attendanceDropdownOpen ? 'rotate-90' : ''} ${!isSidebarOpen ? 'hidden lg:inline' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* Dropdown menu */}
            <div
              className={`pl-10 pr-2 mt-1 space-y-1 ${attendanceDropdownOpen ? 'block' : 'hidden'}`}
            >
              <NavLink
                to="/attendance/computer-users"
                className={({ isActive }) =>
                  `block px-2 py-1 rounded transition-colors text-sm ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >Computer Usage</NavLink>
              <NavLink
                to="/attendance/non-computer-users"
                className={({ isActive }) =>
                  `block px-2 py-1 rounded transition-colors text-sm ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >Non Computer Usage</NavLink>
            </div>
          </div>
        </nav>
      </div>
    </div>
    </>
  );
}

export default Sidebar;
