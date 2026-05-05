import { ActivityIcon, HomeIcon, MoonIcon, PersonStandingIcon, UserIcon, UtensilsIcon, SunIcon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {

    const { theme, toggleTheme } = useTheme();

    const navItems = [

        { path: '/', label: 'home', icon: HomeIcon },
        { path: '/food', label: 'food', icon: UtensilsIcon },
        { path: '/activity', label: 'Activity', icon: ActivityIcon },
        { path: '/profile', label: 'Profile', icon: UserIcon },

    ]



    return (
        <nav className='hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-s-teal-100 dark:border-slate-800 p-6 transition-colors duration-200'>
            <div className='flex items-center gap-3 mb-8'>
                <div className='size-10 rounded-xl bg-emerald-500 flex items-center justify-center'>
                    <PersonStandingIcon className='size-7 text-white' />
                </div>
                <h1 className='text-2xl font-bold text-slate-800 dark:text-white'>FitTrack</h1>
            </div>
            <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink key={item.path} to={item.path}>
                        {({ isActive }) => (
                            <div
                                className={`flex items-center gap-3 p-2 rounded-lg 
                                    transition-colors duration-300 ease-in-out
                                   ${isActive
                                        ? "text-emerald-500 font-semibold"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <item.icon
                                    className={`size-5 ${isActive
                                        ? "text-emerald-500"
                                        : "text-slate-500 dark:text-slate-400"
                                        }`}
                                />
                                <span>{item.label}</span>
                            </div>
                        )}
                    </NavLink>
                ))}
            </div>
            <div className='mt-auto pt-6 border-t border-slate-100 dark:border-slate-800' >
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-2.5 w-full 
text-slate-500 dark:text-slate-400
hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 
rounded-lg transition-colors duration-200 cursor-pointer"
                >
                    {theme === "light" ? (
                        <>
                            <MoonIcon className="size-5" />
                            <span className="text-base">Dark Mode</span>
                        </>
                    ) : (
                        <>
                            <SunIcon className="size-5" />
                            <span className="text-base">Light Mode</span>
                        </>
                    )}
                </button>
            </div>
        </nav>
    )
}

export default Sidebar