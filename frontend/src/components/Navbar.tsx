import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, LayoutDashboard, UserCheck, LogOut, Shield, CircleDollarSign } from 'lucide-react';
import { API_URL } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const avatarUrl = user?.avatar
    ? `${API_URL.replace('/api/v1', '')}/${user.avatar.replace(/^\//, '')}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=6366f1&color=fff`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">Gap Platformasi</span>
            </Link>

            <nav className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition ${
                  isActive('/dashboard')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Bosh sahifa</span>
              </Link>

              <Link
                to="/gaps"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition ${
                  isActive('/gaps')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Gaplar</span>
              </Link>

              {user?.role === 'SUPER_ADMIN' && (
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition ${
                    isActive('/admin/users')
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Foydalanuvchilar (Admin)</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center space-x-3 group p-1.5 rounded-xl hover:bg-gray-100 transition"
            >
              <img
                src={avatarUrl}
                alt={user?.fullName}
                className="w-9 h-9 rounded-full object-cover border-2 border-indigo-200 group-hover:border-indigo-500 transition"
              />
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                  {user?.fullName}
                </div>
                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <span>{user?.phone}</span>
                  {user?.role === 'SUPER_ADMIN' && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Chiqish"
              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
