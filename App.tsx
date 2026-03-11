import React from 'react';
    import '@radix-ui/themes/styles.css';
    import { Theme } from '@radix-ui/themes';
    import { ToastContainer } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

    import Home from './src/pages/Home';
    import About from './src/pages/About';
    import Services from './src/pages/Services';
    import Inventory from './src/pages/Inventory';
    import VehicleDetail from './src/pages/VehicleDetail';
    import Contact from './src/pages/Contact';
    import NotFound from './src/pages/NotFound';
    import Login from './src/pages/Login';
    import Register from './src/pages/Register';
    import { AuthProvider } from './src/context/AuthContext';
    import Admin from './src/pages/Admin';

    const App: React.FC = () => {
      return (
        <Theme appearance="inherit" radius="large" scaling="100%">
          <AuthProvider>
            <Router>
              <main className="min-h-screen font-sans">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/:id" element={<VehicleDetail />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin" element={<Admin />} />
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
      );
    }

    export default App;