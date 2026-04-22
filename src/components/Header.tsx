import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from './ConfirmDialog';
import { toast } from 'react-toastify';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Vehicles', href: '/vehicles' },
    { name: 'Contact', href: '/contact' }
  ];

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';
  const isEmployee = user?.role === 'employee';

  const roleNavigation = [
    ...(isAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
    ...(isOwner ? [{ name: 'Owner', href: '/owner' }] : []),
    ...(isEmployee ? [{ name: 'Employee', href: '/employee' }] : []),
  ];

  const isActive = (href: string) => {
    if (href === '/vehicles') {
      return [
        '/vehicles',
        '/inventory'
      ].some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`));
    }
    return location.pathname === href;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 dark:bg-slate-950 dark:shadow-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dy3vb87qz/image/upload/v1773986536/AncarLogo.7ad7473b37e000adbeb6-BmDIH5my_srdoz3.png"
                alt="Ancar Motors Inc Logo"
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">ANCAR MOTORS INC</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.concat(roleNavigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors nav-button-text ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    {user.user_profile_picture ? (
                      <img
                        src={user.user_profile_picture}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <span className="name-link">Hello, <strong>{user.name}</strong></span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-slate-700">
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            Admin Panel
                          </Link>
                          <Link
                            to="/admin-account"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            My Account
                          </Link>
                        </>
                      )}
                      {isOwner && (
                        <Link
                          to="/owner"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Owner Dashboard
                        </Link>
                      )}
                      {isEmployee && (
                        <Link
                          to="/employee"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          Employee Panel
                        </Link>
                      )}
                      {!isAdmin && !isOwner && !isEmployee && (
                        <>
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm dropdown-link hover:bg-gray-100 dark:hover:bg-slate-800"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            Profile Dashboard
                          </Link>
                          <Link
                            to="/my-activities"
                            className="block px-4 py-2 text-sm dropdown-link hover:bg-gray-100 dark:hover:bg-slate-800"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            My Activities
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="sign-out-link px-3 py-2 rounded-md font-medium bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium sign-in-link hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800">
                  Sign in
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-slate-950 dark:border-slate-700 border-t">
              {navigation.concat(roleNavigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="border-t pt-3 mt-3">
                {user ? (
                  <div className="px-3">
                    <div className="text-sm text-gray-900 dark:text-gray-200 mb-2">Signed in as <strong>{user.name}</strong></div>
                    {isAdmin && (
                      <>
                        <Link
                          to="/admin"
                          className={`block px-3 py-2 rounded-md text-base font-medium mb-2 transition-colors ${
                            isActive('/admin')
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                        <Link
                          to="/admin-account"
                          className={`block px-3 py-2 rounded-md text-base font-medium mb-2 transition-colors ${
                            isActive('/admin-account')
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Account
                        </Link>
                      </>
                    )}
                    {isOwner && (
                      <Link
                        to="/owner"
                        className={`block px-3 py-2 rounded-md text-base font-medium mb-2 transition-colors ${
                          isActive('/owner')
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Owner Dashboard
                      </Link>
                    )}
                    {isEmployee && (
                      <Link
                        to="/employee"
                        className={`block px-3 py-2 rounded-md text-base font-medium mb-2 transition-colors ${
                          isActive('/employee')
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Employee Panel
                      </Link>
                    )}
                    {!isAdmin && !isOwner && !isEmployee && (
                      <>
                        <Link
                          to="/profile"
                          className={`block px-3 py-2 rounded-md text-base font-medium mb-2 transition-colors ${
                            isActive('/profile')
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile Dashboard
                        </Link>
                        <Link
                          to="/orders"
                          className={`block px-3 py-2 rounded-md text-base font-medium mb-2 transition-colors ${
                            isActive('/orders')
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Orders Section
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => { setShowSignOutConfirm(true); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-slate-800" onClick={() => setIsMenuOpen(false)}>Sign in</Link>
                    <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      <ConfirmDialog
        isOpen={showSignOutConfirm}
        title="Sign Out"
        message="Do you wish to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={() => {
          logout();
          toast.success('Successfully signed out.');
          setShowSignOutConfirm(false);
          navigate('/');
        }}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </header>
  );
};

export default Header;