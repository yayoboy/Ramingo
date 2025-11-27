import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { sectionsApi } from '../lib/api'

export function Sections() {
  const { siteId = 'default' } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['sections', siteId],
    queryFn: () => sectionsApi.getAll(siteId),
  })

  const sections = data?.data || []

  if (isLoading) {
    return <div className="text-gray-600">Loading sections...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading sections: {(error as any).message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            to="/admin/sites"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Back to Sites
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Sections</h1>
          <p className="text-gray-600 mt-1">Site: {siteId}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No sections found</div>
              <p className="text-gray-500 text-sm">
                Create sections to organize your content
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section: any) => (
                <div
                  key={section.id}
                  className="border rounded-lg p-6 hover:border-blue-500 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {section.name}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          {section.type}
                        </span>
                        {section.published && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Published
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Slug: /{section.slug}</span>
                        <span>Order: {section.order}</span>
                        <span>
                          Entries: {section.entries?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/admin/sites/${siteId}/sections/${section.id}/entries`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Manage Entries ({section.entries?.length || 0})
                    </Link>

                    <Link
                      to={`/admin/sites/${siteId}/sections/${section.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Edit Section
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
