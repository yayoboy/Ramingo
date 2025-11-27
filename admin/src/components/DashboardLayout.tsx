import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
              <Link to="/admin" className="text-2xl font-bold text-gray-900">
                Ramingo CMS
              </Link>

              <nav className="hidden md:flex gap-6">
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/sites"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Sites
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user?.username}</span>
                <span className="ml-2 text-gray-400">({user?.role})</span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        Ramingo CMS v0.1.0 - Flat-file CMS
      </footer>
    </div>
  )
}
