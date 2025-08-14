import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { menuItems } from "@/config/menuItems"
import { X } from "lucide-react"

interface MenuItem {
  name: string
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  route?: string
  header: string
  submenu?: {
    name: string
    route: string
  }[]
}

interface MainSidebarProps {
  onCloseSidebar?: () => void
}

export default function MainSidebar({ onCloseSidebar }: MainSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeRoute, setActiveRoute] = useState<string>(location.pathname)
  const [expandedHeaders, setExpandedHeaders] = useState<Record<string, boolean>>({
    Dashboard: true,
    "Assets & Accounts": true,
    Insights: true,
  })
  const [expandedSubmenus, setExpandedSubmenus] = useState<Record<string, boolean>>({
    "Assets & Accounts": true,
  })

   useEffect(() => {
    setActiveRoute(location.pathname)
       // Auto-expand submenu if current route is in a submenu
       menuItems.forEach((item) => {
         if (item.submenu) {
           const isSubmenuActive = item.submenu.some((subItem) => subItem.route === location.pathname)
           if (isSubmenuActive) {
             setExpandedSubmenus((prev) => ({
               ...prev,
               [item.name]: true,
             }))
           }
         }
       })
     }, [location.pathname])


  const toggleHeader = (header: string) => {
    setExpandedHeaders((prev) => ({
      ...prev,
      [header]: !prev[header],
    }))
  }

  const toggleSubmenu = (name: string) => {
    setExpandedSubmenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const handleMenuItemClick = (route: string) => {
    setActiveRoute(route)
    navigate(route)

    // Close sidebar on mobile after navigation
    const isMobile = window.innerWidth < 768;
    if (isMobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <div className="w-64 h-full bg-black text-white border-r border-gray-800 flex flex-col">
      <div className="p-[31px] border-b border-gray-800 flex justify-between items-center">
        <img src="assets/images/logo.png" className="w-28 ml-8" />
        {isMobile && onCloseSidebar && (
          <button onClick={onCloseSidebar} className="text-gray-400 hover:text-white" aria-label="Close sidebar">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <div key={item.name} className="mb-1">
            <div
              className={`px-6 py-2.5 text-sm flex items-center cursor-pointer transition-colors ${
                activeRoute === item.route
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => {
                if (item.submenu) {
                  toggleSubmenu(item.name)
                } else if (item.route) {
                  handleMenuItemClick(item.route)
                }
              }}
            >
              {item.icon && <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />}
              <span className="truncate flex-1">{item.name}</span>
              {item.submenu && (
                <svg
                  className={`w-4 h-4 transition-transform ${expandedSubmenus[item.name] ? "rotate-0" : "-rotate-90"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>

            {/* Submenu Items */}
            {item.submenu && expandedSubmenus[item.name] && (
              <div className="ml-8 mt-1">
                {item.submenu.map((subItem) => (
                  <div
                    key={subItem.route}
                    className={`px-4 py-2 text-sm flex items-center cursor-pointer transition-colors ${
                      activeRoute === subItem.route
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                    onClick={() => handleMenuItemClick(subItem.route)}
                  >
                    <span className="truncate">{subItem.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
