import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Bell, Menu, User, LogOut, Settings, ChevronDown } from "lucide-react";

export function Header() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Safely access user object from Redux store
  const user = useSelector((state) => state.user?.user);

  const userName = user?.name || "Guest";
  const userEmail = user?.email || "";
  const userId = user?.id || ""; // Safely get user Id

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                BankApp
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-4 items-center">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Dashboard
              </Link>
              <Link
                to="/accounts"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Accounts
              </Link>
              <Link
                to={userId ? `/api/bankmandate/${userId}` : "/google.com"}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
              >
                Mandates
              </Link>

              <Link
                to="/transactions"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Transactions
              </Link>
            </nav>
          </div>

          {/* User menu and buttons */}
          <div className="flex items-center">
            {/* Notification button */}
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-2 hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {userName}
                    </span>
                    {userEmail && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {userEmail}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* Dropdown menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Your Profile
                    </div>
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </div>
                  </Link>
                  <Link
                    to="/logout"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="ml-3 md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Dashboard
            </Link>
            <Link
              to="/accounts"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Accounts
            </Link>
            <Link
              to={userId ? `/api/bankmandate/${userId}` : "#"}
              className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              Mandates
            </Link>
            <Link
              to="/transactions"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Transactions
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
