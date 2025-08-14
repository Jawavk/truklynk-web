import { Settings, User, Bell, LogOut, ChevronRight, Menu } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useToast } from "../context/ToastContext"
import { AnimatePresence, motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { Modal } from "./ui/layout/Modal"

type UserData = {
  name: string
  mobileNumber: string
  [key: string]: any
}

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export const Header = ({ onToggleSidebar, isSidebarOpen }: HeaderProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { showToast } = useToast()

  const handleProfileClick = () => {
    setIsOpen((prev) => !prev)
  }

  const handleLogout = () => {
    setIsOpen(false)
    setIsModalOpen(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userData")
    setIsModalOpen(false)
    navigate("/login")
  }

  const handleProfile = () => {
    navigate("/userprofile")
  }

  const handleSettings = () => {
    console.log("Hii")
    showToast({ message: "Settings", type: "info" })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as HTMLElement).contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      const parsedData: UserData = JSON.parse(storedData)
      setUserData(parsedData)
    }
  }, [])

  return (
    <header
      style={{
        backgroundColor: "black",
        borderColor: currentTheme.colors.secondary,
        zIndex: 1000,
      }}
      className="px-4 p-[20px] flex items-center justify-between shadow-sm backdrop-blur-sm bg-opacity-80 relative"
    >
      <div className="flex items-center space-x-4">
        {/* Mobile Hamburger Menu */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="text-white hover:text-gray-300 md:hidden p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-all duration-200"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu size={20} />
        </motion.button>

        <h1 style={{ color: currentTheme.colors.text }} className="text-sm font-medium"></h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ color: currentTheme.colors.text }}
          className="relative p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-all duration-200"
        >
          <Bell size={18} className="text-white" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            3
          </motion.span>
        </motion.button> */}

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center space-x-2 pl-2 cursor-pointer"
          style={{ borderColor: currentTheme.colors.secondary }}
        >
          <motion.div
            className="flex items-center gap-2 sm:gap-4 text-white border border-gray-600 p-2 rounded-md"
            onClick={handleProfileClick}
          >
            <img src="assets/images/Profile.png" className="w-6 h-6 sm:w-7 sm:h-7 rounded-md" />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{userData?.name}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transform`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 top-[70px] w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <div className="bg-white rounded-lg shadow-lg p-4 w-64 border border-gray-100">
                <div className="space-y-2">
                  <button
                    onClick={handleProfile}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <User size={18} className="text-blue-600 mr-3" />
                      <span>Profile</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>

                  <button
                    onClick={handleSettings}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <Settings size={18} className="text-gray-600 mr-3" />
                      <span>Settings</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>

                  <div className="border-t border-gray-100 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                  >
                    <LogOut size={18} className="mr-3" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Action"
        type="warning"
        size="md"
        className="mt-44 bg-white"
        footer={
          <div className="flex justify-end space-x-2 ">
            <button className="px-4 py-2 bg-gray-200 rounded-md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={confirmLogout}>
              Confirm
            </button>
          </div>
        }
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </header>
  )
}
