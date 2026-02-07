import { Link, useLocation } from "react-router-dom";
import { BookOpen, User, LogIn } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">ExamEdge</span>
          </Link>

          {!isAuthPage && (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors px-4 py-2"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;