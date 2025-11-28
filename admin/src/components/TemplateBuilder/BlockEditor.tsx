import { useState } from 'react'

interface Block {
  id: string
  type: string
  content: any
  styles?: any
  settings?: any
}

interface BlockEditorProps {
  content: Block[]
  onChange: (content: Block[]) => void
}

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: '📝' },
  { type: 'text', label: 'Text', icon: '📄' },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'gallery', label: 'Gallery', icon: '🎨' },
  { type: 'button', label: 'Button', icon: '🔘' },
  { type: 'columns', label: 'Columns', icon: '📊' },
  { type: 'spacer', label: 'Spacer', icon: '↕️' },
  { type: 'divider', label: 'Divider', icon: '➖' },
  { type: 'video', label: 'Video', icon: '🎬' },
  { type: 'entries', label: 'Entries', icon: '📚' },
  { type: 'navigation', label: 'Navigation', icon: '🧭' }
]

export default function BlockEditor({ content, onChange }: BlockEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null)

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: {},
      settings: getDefaultSettings(type)
    }
    onChange([...content, newBlock])
    setSelectedBlock(newBlock.id)
  }

  const updateBlock = (id: string, updates: Partial<Block>) => {
    onChange(
      content.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    )
  }

  const deleteBlock = (id: string) => {
    onChange(content.filter((block) => block.id !== id))
    setSelectedBlock(null)
  }

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newContent = [...content]
    const [movedBlock] = newContent.splice(fromIndex, 1)
    newContent.splice(toIndex, 0, movedBlock)
    onChange(newContent)
  }

  const duplicateBlock = (id: string) => {
    const block = content.find((b) => b.id === id)
    if (block) {
      const newBlock = { ...block, id: `block-${Date.now()}` }
      const index = content.findIndex((b) => b.id === id)
      const newContent = [...content]
      newContent.splice(index + 1, 0, newBlock)
      onChange(newContent)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedBlock(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedBlock !== null && draggedBlock !== index) {
      moveBlock(draggedBlock, index)
      setDraggedBlock(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedBlock(null)
  }

  return (
    <div className="h-full flex">
      {/* Block Palette */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Add Blocks</h3>
        <div className="space-y-2">
          {BLOCK_TYPES.map((blockType) => (
            <button
              key={blockType.type}
              onClick={() => addBlock(blockType.type)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-left transition-colors"
            >
              <span className="text-2xl">{blockType.icon}</span>
              <span className="text-sm font-medium">{blockType.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {content.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500 mb-4">No blocks yet</p>
              <p className="text-sm text-gray-400">
                Click a block type from the left panel to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((block, index) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedBlock(block.id)}
                  className={`bg-white rounded-lg border-2 p-4 cursor-move transition-all ${
                    selectedBlock === block.id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">⋮⋮</span>
                      <span className="font-medium text-sm text-gray-700">
                        {BLOCK_TYPES.find((t) => t.type === block.type)?.label || block.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateBlock(block.id)
                        }}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteBlock(block.id)
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <BlockPreview block={block} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {selectedBlock && (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Block Settings</h3>
          <BlockSettings
            block={content.find((b) => b.id === selectedBlock)!}
            onChange={(updates) => updateBlock(selectedBlock, updates)}
          />
        </div>
      )}
    </div>
  )
}

function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="text-2xl font-bold">{block.content.text || 'Heading'}</h2>
    case 'text':
      return <div className="prose" dangerouslySetInnerHTML={{ __html: block.content.html || '<p>Text content</p>' }} />
    case 'image':
      return (
        <div className="text-center">
          {block.content.src ? (
            <img src={block.content.src} alt={block.content.alt} className="max-w-full h-auto" />
          ) : (
            <div className="bg-gray-100 h-48 flex items-center justify-center rounded">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      )
    case 'button':
      return (
        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          {block.content.text || 'Button'}
        </button>
      )
    default:
      return <div className="text-gray-500 text-sm">{block.type} block</div>
  }
}

function BlockSettings({ block, onChange }: { block: Block; onChange: (updates: Partial<Block>) => void }) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Text</label>
            <input
              type="text"
              value={block.content.text || ''}
              onChange={(e) => onChange({ content: { ...block.content, text: e.target.value } })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              value={block.settings?.level || 2}
              onChange={(e) => onChange({ settings: { ...block.settings, level: parseInt(e.target.value) } })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
              <option value="5">H5</option>
              <option value="6">H6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alignment</label>
            <select
              value={block.settings?.align || 'left'}
              onChange={(e) => onChange({ settings: { ...block.settings, align: e.target.value } })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      )
    case 'image':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              value={block.content.src || ''}
              onChange={(e) => onChange({ content: { ...block.content, src: e.target.value } })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alt Text</label>
            <input
              type="text"
              value={block.content.alt || ''}
              onChange={(e) => onChange({ content: { ...block.content, alt: e.target.value } })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      )
    case 'button':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input
              type="text"
              value={block.content.text || ''}
              onChange={(e) => onChange({ content: { ...block.content, text: e.target.value } })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input
              type="text"
              value={block.content.url || ''}
              onChange={(e) => onChange({ content: { ...block.content, url: e.target.value } })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      )
    default:
      return <div className="text-sm text-gray-500">No settings available</div>
  }
}

function getDefaultContent(type: string): any {
  switch (type) {
    case 'heading':
      return { text: 'New Heading' }
    case 'text':
      return { html: '<p>Enter your text here...</p>' }
    case 'image':
      return { src: '', alt: '', caption: '' }
    case 'gallery':
      return { images: [] }
    case 'button':
      return { text: 'Click Me', url: '#' }
    case 'columns':
      return { columns: [[], []] }
    case 'spacer':
      return {}
    case 'divider':
      return {}
    case 'video':
      return { url: '', provider: 'youtube' }
    case 'entries':
      return { sectionId: 'all' }
    case 'navigation':
      return {}
    default:
      return {}
  }
}

function getDefaultSettings(type: string): any {
  switch (type) {
    case 'heading':
      return { level: 2, align: 'left' }
    case 'text':
      return { align: 'left' }
    case 'image':
      return { align: 'center', width: '100%' }
    case 'gallery':
      return { columns: 3, gap: '20px' }
    case 'button':
      return { align: 'left', variant: 'primary' }
    case 'columns':
      return { gap: '20px' }
    case 'spacer':
      return { height: '40px' }
    case 'entries':
      return { limit: 10, layout: 'grid' }
    default:
      return {}
  }
}
