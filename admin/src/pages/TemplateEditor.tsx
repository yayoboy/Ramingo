import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import BlockEditor from '../components/TemplateBuilder/BlockEditor'
import ComponentLibrary from '../components/TemplateBuilder/ComponentLibrary'
import StyleEditor from '../components/TemplateBuilder/StyleEditor'

interface Template {
  id: string
  name: string
  slug: string
  mode: 'block' | 'component' | 'style' | 'hybrid'
  type: 'page' | 'gallery' | 'blog' | 'entry'
  content: any[]
  styles: any
  settings: any
  isDefault: boolean
}

type EditorMode = 'block' | 'component' | 'style'

export default function TemplateEditor() {
  const { siteId, templateId } = useParams<{ siteId: string; templateId: string }>()
  const navigate = useNavigate()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeMode, setActiveMode] = useState<EditorMode>('block')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadTemplate()
  }, [siteId, templateId])

  useEffect(() => {
    if (template) {
      // Set active mode based on template mode
      if (template.mode === 'component') {
        setActiveMode('component')
      } else if (template.mode === 'style') {
        setActiveMode('style')
      } else {
        setActiveMode('block')
      }
    }
  }, [template?.mode])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/sites/${siteId}/templates/${templateId}`)
      setTemplate(response.data.data)
    } catch (error) {
      console.error('Error loading template:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async () => {
    if (!template) return

    try {
      setSaving(true)
      await api.put(`/sites/${siteId}/templates/${templateId}`, {
        name: template.name,
        content: template.content,
        styles: template.styles,
        settings: template.settings,
        isDefault: template.isDefault
      })
      alert('Template saved successfully!')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error saving template')
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (content: any[]) => {
    if (template) {
      setTemplate({ ...template, content })
    }
  }

  const updateStyles = (styles: any) => {
    if (template) {
      setTemplate({ ...template, styles })
    }
  }

  const updateSettings = (settings: any) => {
    if (template) {
      setTemplate({ ...template, settings })
    }
  }

  const isHybridMode = template?.mode === 'hybrid'

  if (loading || !template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/admin/${siteId}/templates`)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div>
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                className="text-xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
              />
              <div className="text-sm text-gray-500">
                {template.type} • {template.mode} mode
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={template.isDefault}
                onChange={(e) => setTemplate({ ...template, isDefault: e.target.checked })}
                className="rounded"
              />
              Set as default
            </label>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {showPreview ? '✏️ Edit' : '👁️ Preview'}
            </button>
            <button
              onClick={saveTemplate}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Mode Switcher (only for hybrid mode) */}
        {isHybridMode && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveMode('block')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeMode === 'block'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🧱 Block Editor
            </button>
            <button
              onClick={() => setActiveMode('component')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeMode === 'component'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📦 Components
            </button>
            <button
              onClick={() => setActiveMode('style')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeMode === 'style'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎨 Styles
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {showPreview ? (
          <div className="h-full bg-white p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Preview</h2>
              <div className="prose max-w-none">
                {/* Render preview here */}
                <p className="text-gray-500">Preview coming soon...</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeMode === 'block' && (
              <BlockEditor
                content={template.content}
                onChange={updateContent}
              />
            )}
            {activeMode === 'component' && (
              <ComponentLibrary
                content={template.content}
                onChange={updateContent}
              />
            )}
            {activeMode === 'style' && (
              <StyleEditor
                content={template.content}
                styles={template.styles}
                onContentChange={updateContent}
                onStylesChange={updateStyles}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Template ID: {template.id}
          </div>
          <div>
            {template.content.length} blocks
          </div>
        </div>
      </div>
    </div>
  )
}
