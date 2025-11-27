import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { sitesApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export function Dashboard() {
  const { user } = useAuth()

  const { data: sitesData, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesApi.getAll,
  })

  const sites = sitesData?.data || []

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-blue-100">
          Manage your content with Ramingo CMS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">
            Total Sites
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? '...' : sites.length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">
            Your Role
          </div>
          <div className="text-3xl font-bold text-gray-900 capitalize">
            {user?.role}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">
            Access Level
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {user?.sites?.length || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">sites accessible</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/sites"
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
              🌐 Manage Sites
            </div>
            <div className="text-gray-600 text-sm">
              View and edit your sites, sections, and content
            </div>
          </Link>

          <Link
            to="/admin/sites/default/sections"
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
              📄 Manage Content
            </div>
            <div className="text-gray-600 text-sm">
              Create and edit pages, posts, and entries
            </div>
          </Link>
        </div>
      </div>

      {/* Sites List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Your Sites</h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-gray-500">Loading sites...</div>
          ) : sites.length === 0 ? (
            <div className="text-gray-500">No sites found</div>
          ) : (
            <div className="space-y-4">
              {sites.map((site: any) => (
                <Link
                  key={site.id}
                  to={`/admin/sites/${site.id}`}
                  className="block p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {site.name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {site.settings?.title || 'No description'}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        ID: {site.id} • Theme: {site.theme}
                      </div>
                    </div>

                    <span className="text-blue-600 text-sm font-medium">
                      Manage →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
