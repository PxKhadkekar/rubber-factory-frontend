import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navLinkClass = (path) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      location.pathname === path
        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-200">
      {/* Header & Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/admin/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-white font-bold text-lg tracking-tight">Factory Admin</span>
              </Link>
              <div className="hidden md:block">
                <div className="flex items-center space-x-1.5">
                  <Link to="/admin/dashboard" className={navLinkClass("/admin/dashboard")}>Dashboard</Link>
                  <Link to="/admin/analytics" className={navLinkClass("/admin/analytics")}>Analytics</Link>
                  <Link to="/admin/create-job" className={navLinkClass("/admin/create-job")}>Create Job</Link>
                  <Link to="/admin/workers" className={navLinkClass("/admin/workers")}>Workers</Link>
                  <Link to="/admin/audit-logs" className={navLinkClass("/admin/audit-logs")}>Audit Logs</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="bg-red-600/90 hover:bg-red-600 active:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm shadow-red-500/20 hover:shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
