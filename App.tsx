import React, { useEffect } from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import Home from './src/pages/Home';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import About from './src/pages/About';
import Services from './src/pages/Services';
import Vehicles from './src/pages/Vehicles';
import VehicleDetail from './src/pages/VehicleDetail';
import Contact from './src/pages/Contact';
import NotFound from './src/pages/NotFound';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Profile from './src/pages/Profile';
import MyActivities from './src/pages/MyActivities';
import Policies from './src/pages/Policies';
import Terms from './src/pages/Terms';
import Payment from './src/pages/Payment';
import Owner from './src/pages/Owner';
import Employee from './src/pages/Employee';
import Admin from './src/pages/Admin';
import AdminAccount from './src/pages/AdminAccount';
import VerifyEmail from './src/pages/VerifyEmail';
import ErrorBoundary from './src/components/ErrorBoundary';
import { safeLocalStorage } from './src/utils/localStorage';

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: location.pathname + location.search,
    });
  }, [location]);

  useEffect(() => {
    safeLocalStorage.setItem('lastPage', location.pathname);
  }, [location]);

  return null;
}

function PagePersistence() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect on initial load when at home page
    const savedPage = safeLocalStorage.getItem('lastPage');
    if (savedPage && location.pathname === '/' && savedPage !== '/') {
      // Small delay to ensure router is ready, especially on mobile
      const timer = setTimeout(() => {
        navigate(savedPage, { replace: true });
      }, 10);
      return () => clearTimeout(timer);
    }
  }, []); // Only run once on mount

  return null;
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <Theme appearance="inherit" radius="large" scaling="100%">
        <AuthProvider>
          <Router>
          <AnalyticsTracker />
          <PagePersistence />
            <main className="min-h-screen font-sans">
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/inventory" element={<Vehicles />} />
              <Route path="/inventory/:id" element={<VehicleDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-activities" element={<MyActivities />} />
              <Route path="/orders" element={<MyActivities />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/owner" element={<Owner />} />
              <Route path="/employee" element={<Employee />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-account" element={<AdminAccount />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              newestOnTop
              closeOnClick
              pauseOnHover
            />
          </main>
        </Router>
      </AuthProvider>
    </Theme>
  </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;