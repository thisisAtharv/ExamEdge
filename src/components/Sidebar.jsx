import React from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookCheck,
  Library,
  Trophy,
  Badge,
  User,
  LogOut,
  BookOpen
} from "lucide-react";
// 1. Import our custom useAuth hook
import { useAuth } from '../context/AuthContext';

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, end: true },
  { name: "My Quizzes", href: "/dashboard/quizzes", icon: BookCheck },
  { name: "Study Resources", href: "/dashboard/resources", icon: Library },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "My Badges", href: "/dashboard/badges", icon: Badge },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

function Sidebar() {
  const navigate = useNavigate();
  // 2. Get the real logout function from our context
  const { logout } = useAuth();

  // 3. Implement the real logout logic
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
      alert("Error logging out. Please try again.");
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">ExamEdge</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button at the bottom */}
        <div className="p-4 mt-auto border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
