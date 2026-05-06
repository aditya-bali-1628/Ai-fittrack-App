
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import BotomNav from "../components/BotomNav"

const Layout = () => {
  return (
    <div className="min-h-screen lg:max-h-screen lg:flex bg-white dark:bg-slate-950 transition-colors duration-200">
    <Sidebar />
      <div className="flex-1 overflow-y-scroll">
        <Outlet />
      </div>
      <BotomNav />
    </div>
  )
}

export default Layout