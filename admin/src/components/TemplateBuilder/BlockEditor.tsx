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
  const [showBlockPalette, setShowBlockPalette] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

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
    setShowBlockPalette(false)
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

  const selectedBlockData = content.find((b) => b.id === selectedBlock)

  return (
    <div className="h-full flex flex-col lg:flex-row relative">
      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setShowBlockPalette(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 active:scale-95 transition-transform"
      >
        +
      </button>

      {/* Block Palette - Desktop Sidebar / Mobile Drawer */}
      <div
        className={`
          fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
          ${showBlockPalette ? 'block' : 'hidden lg:block'}
        `}
      >
        {/* Backdrop for mobile */}
        <div
          className="lg:hidden absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setShowBlockPalette(false)}
        />

        {/* Drawer/Sidebar */}
        <div className={`
          absolute lg:relative bottom-0 lg:bottom-auto left-0 right-0 lg:right-auto
          bg-white lg:border-r border-gray-200
          w-full lg:w-64 h-[70vh] lg:h-full
          rounded-t-2xl lg:rounded-none
          overflow-y-auto
          transform transition-transform lg:transform-none
          ${showBlockPalette ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `}>
          {/* Mobile Handle */}
          <div className="lg:hidden flex justify-center py-2 border-b border-gray-200">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Add Blocks</h3>
              <button
                onClick={() => setShowBlockPalette(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {BLOCK_TYPES.map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 text-left transition-colors"
                >
                  <span className="text-2xl">{blockType.icon}</span>
                  <span className="text-sm font-medium">{blockType.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {content.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 md:p-12 text-center">
              <p className="text-gray-500 mb-4">No blocks yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Tap the + button to add your first block
              </p>
              <button
                onClick={() => setShowBlockPalette(true)}
                className="lg:hidden bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                Add Block
              </button>
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
                  onClick={() => {
                    setSelectedBlock(block.id)
                    setShowSettings(true)
                  }}
                  className={`bg-white rounded-lg border-2 p-4 cursor-move transition-all touch-manipulation ${
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
                        className="text-gray-500 hover:text-gray-700 text-lg p-1 touch-manipulation"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteBlock(block.id)
                        }}
                        className="text-red-500 hover:text-red-700 text-lg p-1 touch-manipulation"
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

      {/* Settings Panel - Desktop Sidebar / Mobile Bottom Sheet */}
      {selectedBlockData && (
        <div
          className={`
            fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
            ${showSettings ? 'block' : 'hidden lg:block'}
          `}
        >
          {/* Backdrop for mobile */}
          <div
            className="lg:hidden absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSettings(false)}
          />

          {/* Panel */}
          <div className={`
            absolute lg:relative bottom-0 lg:bottom-auto left-0 right-0 lg:right-auto
            bg-white lg:border-l border-gray-200
            w-full lg:w-80 h-[70vh] lg:h-full
            rounded-t-2xl lg:rounded-none
            overflow-y-auto
            transform transition-transform lg:transform-none
            ${showSettings ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}>
            {/* Mobile Handle */}
            <div className="lg:hidden flex justify-center py-2 border-b border-gray-200">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Block Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <BlockSettings
                block={selectedBlockData}
                onChange={(updates) => updateBlock(selectedBlock!, updates)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="text-xl md:text-2xl font-bold">{block.content.text || 'Heading'}</h2>
    case 'text':
      return <div className="prose prose-sm md:prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content.html || '<p>Text content</p>' }} />
    case 'image':
      return (
        <div className="text-center">
          {block.content.src ? (
            <img src={block.content.src} alt={block.content.alt} className="max-w-full h-auto" />
          ) : (
            <div className="bg-gray-100 h-32 md:h-48 flex items-center justify-center rounded">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
      )
    case 'button':
      return (
        <button className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded text-sm md:text-base">
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
              className="w-full px-3 py-2 border rounded text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              value={block.settings?.level || 2}
              onChange={(e) => onChange({ settings: { ...block.settings, level: parseInt(e.target.value) } })}
              className="w-full px-3 py-2 border rounded text-sm md:text-base"
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
            <div className="grid grid-cols-3 gap-2">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => onChange({ settings: { ...block.settings, align } })}
                  className={`px-3 py-2 rounded border text-sm capitalize ${
                    (block.settings?.align || 'left') === align
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
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
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alt Text</label>
            <input
              type="text"
              value={block.content.alt || ''}
              onChange={(e) => onChange({ content: { ...block.content, alt: e.target.value } })}
              className="w-full px-3 py-2 border rounded text-sm"
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
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link URL</label>
            <input
              type="text"
              value={block.content.url || ''}
              onChange={(e) => onChange({ content: { ...block.content, url: e.target.value } })}
              className="w-full px-3 py-2 border rounded text-sm"
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
