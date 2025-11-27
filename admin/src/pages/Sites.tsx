import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { sitesApi } from '../lib/api'

export function Sites() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesApi.getAll,
  })

  const sites = data?.data || []

  if (isLoading) {
    return <div className="text-gray-600">Loading sites...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading sites: {(error as any).message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-600 mt-1">Manage your websites</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {sites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No sites found</div>
              <p className="text-gray-500 text-sm">
                Run `php scripts/init-site.php` to create a default site
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sites.map((site: any) => (
                <div
                  key={site.id}
                  className="border rounded-lg p-6 hover:border-blue-500 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {site.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {site.settings?.description || 'No description'}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>ID: {site.id}</span>
                        <span>Theme: {site.theme}</span>
                        <span>Domain: {site.domain || 'Not set'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/admin/sites/${site.id}/sections`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Manage Sections
                    </Link>

                    <Link
                      to={`/admin/sites/${site.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
