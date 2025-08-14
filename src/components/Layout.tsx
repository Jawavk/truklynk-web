import { Header } from "./Header"
import { Route, Routes } from "react-router-dom"
import { LazyLoader } from "./utility/LazyLoader"
import { routes } from "./utility/route"
import { NotFound } from "./NotFound"
import MainSidebar from "./Sidebar/MainSidebar"
import { useState, useEffect } from "react"

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - position based on screen size and state */}
      <div
        className={`fixed left-0 top-0 h-screen transition-transform duration-300 ease-in-out z-30
          ${isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}`}
      >
        <MainSidebar onCloseSidebar={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content - responsive margin */}
      <div
        className={`flex-1 w-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out
          ${isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="bg-background min-h-[calc(100vh-64px)] border border-gray-800">
          <LazyLoader>
            <Routes>
              {routes.map(({ path, component: Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LazyLoader>
        </main>
      </div>
    </div>
  )
}
