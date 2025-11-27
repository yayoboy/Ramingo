import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { entriesApi } from '../lib/api'

export function Entries() {
  const { siteId = 'default', sectionId = '' } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['entries', siteId, sectionId],
    queryFn: () => entriesApi.getAll(siteId, sectionId),
  })

  const entries = data?.data || []

  if (isLoading) {
    return <div className="text-gray-600">Loading entries...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading entries: {(error as any).message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            to={`/admin/sites/${siteId}/sections`}
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Back to Sections
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Entries</h1>
          <p className="text-gray-600 mt-1">
            Section: {sectionId} • Site: {siteId}
          </p>
        </div>
        <Link
          to={`/admin/sites/${siteId}/sections/${sectionId}/entries/new`}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Create Entry
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No entries found</div>
              <p className="text-gray-500 text-sm">
                Create entries to add content to this section
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-6 hover:border-blue-500 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {entry.title}
                        </h3>
                        {entry.published && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Published
                          </span>
                        )}
                        {entry.featured && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {entry.content?.description?.replace(/<[^>]*>/g, '') ||
                          'No description'}
                      </div>

                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Slug: /{entry.slug}</span>
                        <span>Order: {entry.order}</span>
                        <span>
                          Created: {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to={`/admin/sites/${siteId}/sections/${sectionId}/entries/${entry.id}/edit`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>

                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      Preview
                    </button>

                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">
                      Delete
                    </button>
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
