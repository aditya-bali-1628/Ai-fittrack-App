// Updated BotomNav.tsx — Add AI Workouts tab for mobile
// Replace the existing BotomNav.tsx with this file

import { NavLink } from "react-router-dom";
import {
  LayoutDashboardIcon,
  UtensilsIcon,
  ActivityIcon,
  UserIcon,
  SparklesIcon, // ← NEW
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboardIcon, end: true },
  { to: "/food", label: "Food", icon: UtensilsIcon },
  { to: "/ai-workouts", label: "AI", icon: SparklesIcon }, // ← NEW (center spot)
  { to: "/activity", label: "Activity", icon: ActivityIcon },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

const BotomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2 pb-safe z-40">
      <div className="flex items-center justify-around">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-3 min-w-0 flex-1 transition-colors ${
                isActive
                  ? label === "AI"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400 dark:text-slate-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive && label === "AI"
                      ? "bg-purple-50 dark:bg-purple-900/30"
                      : isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BotomNav;
