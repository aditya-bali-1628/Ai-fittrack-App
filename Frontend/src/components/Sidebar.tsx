// Updated Sidebar.tsx — Add AI Workouts nav link
// Replace the existing Sidebar.tsx with this file

import { NavLink } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboardIcon,
  UtensilsIcon,
  ActivityIcon,
  UserIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon, // ← NEW
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboardIcon, end: true },
  { to: "/food", label: "Food Log", icon: UtensilsIcon },
  { to: "/activity", label: "Activity", icon: ActivityIcon },
  { to: "/ai-workouts", label: "AI Workouts", icon: SparklesIcon }, // ← NEW
  { to: "/profile", label: "Profile", icon: UserIcon },
];

const Sidebar = () => {
  const { logout, user } = useAppContext();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          FitTrack
        </h1>
        <p className="text-xs text-slate-400 mt-1">Your fitness companion</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              } ${label === "AI Workouts" ? "border border-purple-100 dark:border-purple-900/40" : ""}`
            }
          >
            <Icon
              className={`w-5 h-5 ${
                label === "AI Workouts" ? "text-purple-500" : ""
              }`}
            />
            {label}
            {label === "AI Workouts" && (
              <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full">
                AI
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === "dark" ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOutIcon className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* User info */}
      {user && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {user.username}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
