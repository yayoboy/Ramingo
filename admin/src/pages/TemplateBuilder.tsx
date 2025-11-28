import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'

interface Template {
  id: string
  name: string
  slug: string
  mode: 'block' | 'component' | 'style' | 'hybrid'
  type: 'page' | 'gallery' | 'blog' | 'entry'
  thumbnail: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export default function TemplateBuilder() {
  const { siteId } = useParams<{ siteId: string }>()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'page' as 'page' | 'gallery' | 'blog' | 'entry',
    mode: 'block' as 'block' | 'component' | 'style' | 'hybrid'
  })

  useEffect(() => {
    loadTemplates()
  }, [siteId])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/sites/${siteId}/templates`)
      setTemplates(response.data.data)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async () => {
    try {
      await api.post(`/sites/${siteId}/templates`, newTemplate)
      setShowCreateModal(false)
      setNewTemplate({ name: '', type: 'page', mode: 'block' })
      loadTemplates()
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  const duplicateTemplate = async (id: string) => {
    try {
      await api.post(`/sites/${siteId}/templates/${id}/duplicate`)
      loadTemplates()
    } catch (error) {
      console.error('Error duplicating template:', error)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      await api.delete(`/sites/${siteId}/templates/${id}`)
      loadTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const getModeLabel = (mode: string) => {
    const labels = {
      block: 'Block Editor',
      component: 'Component Library',
      style: 'Style Editor',
      hybrid: 'Hybrid'
    }
    return labels[mode as keyof typeof labels] || mode
  }

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      page: 'bg-blue-100 text-blue-800',
      gallery: 'bg-purple-100 text-purple-800',
      blog: 'bg-green-100 text-green-800',
      entry: 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Builder</h1>
            <p className="mt-2 text-gray-600">
              Create and manage visual templates with multiple editing modes
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Template
          </button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📐</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first visual template using Block Editor, Component Library, or Style Editor
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
                {template.thumbnail ? (
                  <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover rounded-t-lg" />
                ) : (
                  <div className="text-gray-400 text-4xl">📄</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{getModeLabel(template.mode)}</p>
                  </div>
                  {template.isDefault && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className={`inline-block text-xs px-2 py-1 rounded ${getTypeBadgeColor(template.type)}`}>
                    {template.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/${siteId}/templates/${template.id}`}
                    className="flex-1 bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => duplicateTemplate(template.id)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-sm"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition-colors text-sm"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create New Template</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Type
                </label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="page">Page</option>
                  <option value="gallery">Gallery</option>
                  <option value="blog">Blog</option>
                  <option value="entry">Entry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Editing Mode
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'block', label: 'Block Editor', desc: 'Gutenberg-style drag & drop blocks' },
                    { value: 'component', label: 'Component Library', desc: 'Pre-built template components' },
                    { value: 'style', label: 'Style Editor', desc: 'Visual CSS customization' },
                    { value: 'hybrid', label: 'Hybrid', desc: 'Combine all editing modes' }
                  ].map((mode) => (
                    <label key={mode.value} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="mode"
                        value={mode.value}
                        checked={newTemplate.mode === mode.value}
                        onChange={(e) => setNewTemplate({ ...newTemplate, mode: e.target.value as any })}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{mode.label}</div>
                        <div className="text-sm text-gray-500">{mode.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createTemplate}
                disabled={!newTemplate.name}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
