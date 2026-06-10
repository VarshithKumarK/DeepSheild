import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import UploadDashboard from './pages/UploadDashboard';
import Profile from './pages/Profile';
import LiveVerification from './pages/LiveVerification';
import ScreenMonitor from './pages/ScreenMonitor';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<UploadDashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="live-verification" element={<LiveVerification />} />
                <Route path="screen-monitor" element={<ScreenMonitor />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
