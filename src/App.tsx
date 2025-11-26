import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Admin from './pages/Admin';
import Computers from './pages/Computers';
import Reservations from './pages/Reservations';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Laboratory from './pages/Laboratory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// A wrapper to check authentication and provide the layout
const ProtectedLayout = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes with Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/computers" element={<Computers />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/laboratory" element={<Laboratory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;