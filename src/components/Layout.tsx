import { menuItems } from '@/constants';
import type { UserData } from '@/types';
import { LogOut, Menu, Star, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  user: UserData | null;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isActivePath = (path: string) =>
    location.pathname === path ||
    (path === '/dashboard' && location.pathname === '/');

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transform bg-white shadow-lg transition-all duration-300 flex flex-col justify-between
      ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
      md:translate-x-0 ${isSidebarOpen ? 'md:w-64' : 'md:w-20'}`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-700 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-400" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-gray-800 text-sm leading-tight">
                Trường Quân sự
              </h1>
              <p className="text-xs text-gray-600">Quân khu 5</p>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                      ${
                        active
                          ? 'bg-red-50 text-red-700 border-r-2 border-red-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${active ? 'text-red-700' : item.color}`}
                    />
                    {isSidebarOpen && (
                      <span className="font-medium text-sm truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info + Logout */}
        {user && (
          <div className="p-4 border-t border-gray-200 flex items-center space-x-3">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.unit}</p>
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center text-sm text-red-600 hover:text-red-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Overlay (mobile) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300
      ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between md:px-6">
          <div className="flex items-center space-x-3">
            {/* Toggle sidebar */}
            <button
              onClick={() =>
                window.innerWidth < 768
                  ? setIsMobileOpen(!isMobileOpen)
                  : setIsSidebarOpen(!isSidebarOpen)
              }
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                {menuItems.find((item) => isActivePath(item.path))?.label ||
                  'Tổng quan'}
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Hệ thống quản lý học viên và đào tạo
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
