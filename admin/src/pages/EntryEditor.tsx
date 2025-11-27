import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import RichTextEditor from '../components/RichTextEditor'
import GoogleFontPicker from '../components/GoogleFontPicker'
import api from '../lib/api'

interface EntryFormData {
  title: string
  slug: string
  content: {
    description: string
    images: string[]
    metadata: {
      tags: string[]
      year?: string
      customFont?: string
    }
  }
  seo: {
    title: string
    description: string
    ogImage: string
  }
  published: boolean
  featured: boolean
  order: number
}

export default function EntryEditor() {
  const { siteId, sectionId, entryId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<EntryFormData>({
    title: '',
    slug: '',
    content: {
      description: '',
      images: [],
      metadata: {
        tags: [],
        year: new Date().getFullYear().toString(),
      },
    },
    seo: {
      title: '',
      description: '',
      ogImage: '',
    },
    published: false,
    featured: false,
    order: 0,
  })

  const [tagInput, setTagInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Fetch entry if editing
  const { data: entry, isLoading } = useQuery({
    queryKey: ['entry', siteId, sectionId, entryId],
    queryFn: async () => {
      if (!entryId) return null
      const response = await api.get(`/sites/${siteId}/sections/${sectionId}/entries/${entryId}`)
      return response.data.data
    },
    enabled: !!entryId,
  })

  // Populate form when entry loads
  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        slug: entry.slug,
        content: entry.content,
        seo: entry.seo,
        published: entry.published,
        featured: entry.featured,
        order: entry.order,
      })
    }
  }, [entry])

  // Auto-generate slug from title
  useEffect(() => {
    if (!entryId && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, entryId])

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: EntryFormData) => {
      if (entryId) {
        return api.put(`/sites/${siteId}/sections/${sectionId}/entries/${entryId}`, data)
      } else {
        return api.post(`/sites/${siteId}/sections/${sectionId}/entries`, data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries', siteId, sectionId] })
      navigate(`/admin/sites/${siteId}/sections/${sectionId}/entries`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.content.metadata.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          metadata: {
            ...prev.content.metadata,
            tags: [...prev.content.metadata.tags, tagInput.trim()],
          },
        },
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        metadata: {
          ...prev.content.metadata,
          tags: prev.content.metadata.tags.filter(t => t !== tag),
        },
      },
    }))
  }

  const addImage = () => {
    if (imageUrl.trim() && !formData.content.images.includes(imageUrl.trim())) {
      setFormData(prev => ({
        ...prev,
        content: {
          ...prev.content,
          images: [...prev.content.images, imageUrl.trim()],
        },
      }))
      setImageUrl('')
    }
  }

  const removeImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        images: prev.content.images.filter(img => img !== url),
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {entryId ? 'Edit Entry' : 'Create New Entry'}
        </h1>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Auto-generated from title</p>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                content={formData.content.description}
                onChange={(html) =>
                  setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, description: html },
                  }))
                }
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Image
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {formData.content.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo.title}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo, title: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seo.description}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo, description: e.target.value },
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OG Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.seo.ogImage}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo, ogImage: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, published: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Published</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, featured: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Featured</span>
                </label>
              </div>
            </div>

            {/* Order */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Google Font Picker */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Font
              </label>
              <GoogleFontPicker
                selectedFont={formData.content.metadata.customFont || ''}
                onFontSelect={(font) =>
                  setFormData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      metadata: { ...prev.content.metadata, customFont: font },
                    },
                  }))
                }
              />
            </div>

            {/* Tags */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.content.metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Year */}
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="text"
                value={formData.content.metadata.year}
                onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    content: {
                      ...prev.content,
                      metadata: { ...prev.content.metadata, year: e.target.value },
                    },
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/admin/sites/${siteId}/sections/${sectionId}/entries`)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Preview</h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div
              className="p-8"
              style={{ fontFamily: formData.content.metadata.customFont || 'inherit' }}
            >
              <h1 className="text-4xl font-bold mb-4">{formData.title || 'Untitled'}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.content.metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.content.description }}
              />
              {formData.content.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {formData.content.images.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
