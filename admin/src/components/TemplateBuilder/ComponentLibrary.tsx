import { useState } from 'react'

interface Block {
  id: string
  type: string
  content: any
  styles?: any
  settings?: any
}

interface ComponentLibraryProps {
  content: Block[]
  onChange: (content: Block[]) => void
}

interface Component {
  id: string
  name: string
  category: string
  thumbnail: string
  blocks: Omit<Block, 'id'>[]
}

const COMPONENTS: Component[] = [
  {
    id: 'hero-centered',
    name: 'Hero - Centered',
    category: 'hero',
    thumbnail: '🎯',
    blocks: [
      {
        type: 'heading',
        content: { text: 'Welcome to Our Site' },
        settings: { level: 1, align: 'center' },
        styles: { 'font-size': '48px', 'margin-bottom': '20px' }
      },
      {
        type: 'text',
        content: { html: '<p>A compelling subtitle that describes your service</p>' },
        settings: { align: 'center' },
        styles: { 'font-size': '20px', 'color': '#666', 'margin-bottom': '30px' }
      },
      {
        type: 'button',
        content: { text: 'Get Started', url: '#' },
        settings: { align: 'center', variant: 'primary' }
      }
    ]
  },
  {
    id: 'hero-image',
    name: 'Hero - With Image',
    category: 'hero',
    thumbnail: '🖼️',
    blocks: [
      {
        type: 'columns',
        content: {
          columns: [
            [
              {
                type: 'heading',
                content: { text: 'Build Something Amazing' },
                settings: { level: 1 }
              },
              {
                type: 'text',
                content: { html: '<p>Create beautiful websites with our powerful CMS</p>' }
              },
              {
                type: 'button',
                content: { text: 'Learn More', url: '#' }
              }
            ],
            [
              {
                type: 'image',
                content: { src: '/placeholder-hero.jpg', alt: 'Hero' }
              }
            ]
          ]
        },
        settings: { gap: '40px' }
      }
    ]
  },
  {
    id: 'features-grid',
    name: 'Features Grid',
    category: 'features',
    thumbnail: '⚡',
    blocks: [
      {
        type: 'heading',
        content: { text: 'Features' },
        settings: { level: 2, align: 'center' },
        styles: { 'margin-bottom': '40px' }
      },
      {
        type: 'columns',
        content: {
          columns: [
            [
              {
                type: 'heading',
                content: { text: '🚀 Fast' },
                settings: { level: 3 }
              },
              {
                type: 'text',
                content: { html: '<p>Lightning-fast performance</p>' }
              }
            ],
            [
              {
                type: 'heading',
                content: { text: '🎨 Beautiful' },
                settings: { level: 3 }
              },
              {
                type: 'text',
                content: { html: '<p>Stunning visual designs</p>' }
              }
            ],
            [
              {
                type: 'heading',
                content: { text: '🔒 Secure' },
                settings: { level: 3 }
              },
              {
                type: 'text',
                content: { html: '<p>Enterprise-grade security</p>' }
              }
            ]
          ]
        },
        settings: { gap: '30px' }
      }
    ]
  },
  {
    id: 'gallery-masonry',
    name: 'Gallery - Masonry',
    category: 'gallery',
    thumbnail: '🎨',
    blocks: [
      {
        type: 'heading',
        content: { text: 'Gallery' },
        settings: { level: 2, align: 'center' }
      },
      {
        type: 'gallery',
        content: {
          images: [
            { src: '/placeholder-1.jpg', alt: 'Image 1' },
            { src: '/placeholder-2.jpg', alt: 'Image 2' },
            { src: '/placeholder-3.jpg', alt: 'Image 3' },
            { src: '/placeholder-4.jpg', alt: 'Image 4' }
          ]
        },
        settings: { columns: 3, gap: '15px' }
      }
    ]
  },
  {
    id: 'blog-list',
    name: 'Blog List',
    category: 'content',
    thumbnail: '📝',
    blocks: [
      {
        type: 'heading',
        content: { text: 'Latest Posts' },
        settings: { level: 2 }
      },
      {
        type: 'entries',
        content: { sectionId: 'all' },
        settings: { limit: 6, layout: 'grid' }
      }
    ]
  },
  {
    id: 'cta-centered',
    name: 'Call to Action',
    category: 'cta',
    thumbnail: '📢',
    blocks: [
      {
        type: 'spacer',
        settings: { height: '60px' }
      },
      {
        type: 'heading',
        content: { text: 'Ready to Get Started?' },
        settings: { level: 2, align: 'center' },
        styles: { 'margin-bottom': '20px' }
      },
      {
        type: 'text',
        content: { html: '<p>Join thousands of satisfied users today</p>' },
        settings: { align: 'center' },
        styles: { 'margin-bottom': '30px' }
      },
      {
        type: 'button',
        content: { text: 'Sign Up Now', url: '#' },
        settings: { align: 'center', variant: 'primary' }
      },
      {
        type: 'spacer',
        settings: { height: '60px' }
      }
    ]
  },
  {
    id: 'contact-form',
    name: 'Contact Section',
    category: 'contact',
    thumbnail: '📧',
    blocks: [
      {
        type: 'heading',
        content: { text: 'Get in Touch' },
        settings: { level: 2, align: 'center' }
      },
      {
        type: 'text',
        content: { html: '<p>We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.</p>' },
        settings: { align: 'center' }
      },
      {
        type: 'button',
        content: { text: 'Contact Us', url: '/contact' },
        settings: { align: 'center' }
      }
    ]
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    category: 'social',
    thumbnail: '💬',
    blocks: [
      {
        type: 'heading',
        content: { text: 'What Our Clients Say' },
        settings: { level: 2, align: 'center' }
      },
      {
        type: 'columns',
        content: {
          columns: [
            [
              {
                type: 'text',
                content: { html: '<p><em>"Excellent service!"</em></p><p><strong>- John Doe</strong></p>' }
              }
            ],
            [
              {
                type: 'text',
                content: { html: '<p><em>"Highly recommended!"</em></p><p><strong>- Jane Smith</strong></p>' }
              }
            ]
          ]
        }
      }
    ]
  }
]

export default function ComponentLibrary({ content, onChange }: ComponentLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hero', label: 'Hero' },
    { id: 'features', label: 'Features' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'content', label: 'Content' },
    { id: 'cta', label: 'CTA' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social' }
  ]

  const filteredComponents = COMPONENTS.filter((component) => {
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addComponent = (component: Component) => {
    const newBlocks = component.blocks.map((block) => ({
      ...block,
      id: `block-${Date.now()}-${Math.random()}`
    }))
    onChange([...content, ...newBlocks])
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to remove all components?')) {
      onChange([])
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Header with Filters Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ☰
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Horizontal Category Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar / Mobile Drawer */}
        <div
          className={`
            fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
            ${showSidebar ? 'block' : 'hidden'} lg:block
          `}
        >
          {/* Backdrop */}
          <div
            className="lg:hidden absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSidebar(false)}
          />

          {/* Sidebar */}
          <div className={`
            absolute lg:relative left-0 top-0 bottom-0
            w-80 lg:w-80 bg-white border-r border-gray-200
            flex flex-col
            transform transition-transform lg:transform-none
            ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold">Components</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="hidden lg:block p-4 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="hidden lg:block p-4 border-b border-gray-200">
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowSidebar(false)
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {filteredComponents.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => {
                      addComponent(component)
                      setShowSidebar(false)
                    }}
                    className="text-left bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg p-4 transition-colors touch-manipulation"
                  >
                    <div className="text-4xl mb-2">{component.thumbnail}</div>
                    <div className="font-medium text-sm">{component.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {component.blocks.length} block{component.blocks.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>

              {filteredComponents.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No components found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Template Preview</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {content.length} component{content.length !== 1 ? 's' : ''} added
                </p>
              </div>
              {content.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {content.length === 0 ? (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 md:p-16 text-center">
                <div className="text-gray-400 text-5xl md:text-6xl mb-4">📦</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No components yet</h3>
                <p className="text-gray-500 text-sm md:text-base mb-4">
                  Choose a pre-built component from the library to get started
                </p>
                <button
                  onClick={() => setShowSidebar(true)}
                  className="lg:hidden bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Browse Components
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-8">
                <ComponentPreview blocks={content} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ComponentPreview({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <div key={block.id}>
          <BlockRenderer block={block} />
        </div>
      ))}
    </div>
  )
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.settings?.level || 2}` as keyof JSX.IntrinsicElements
      return (
        <HeadingTag
          className="text-xl md:text-2xl lg:text-3xl"
          style={{
            textAlign: block.settings?.align || 'left',
            ...block.styles
          }}
        >
          {block.content.text}
        </HeadingTag>
      )

    case 'text':
      return (
        <div
          className="prose prose-sm md:prose max-w-none"
          style={{ textAlign: block.settings?.align || 'left', ...block.styles }}
          dangerouslySetInnerHTML={{ __html: block.content.html }}
        />
      )

    case 'image':
      return (
        <div style={{ textAlign: block.settings?.align || 'center' }}>
          {block.content.src ? (
            <img
              src={block.content.src}
              alt={block.content.alt}
              className="max-w-full h-auto"
              style={{ maxWidth: block.settings?.width || '100%', ...block.styles }}
            />
          ) : (
            <div className="bg-gray-100 h-32 md:h-48 flex items-center justify-center rounded">
              <span className="text-gray-400 text-sm">Image placeholder</span>
            </div>
          )}
        </div>
      )

    case 'gallery':
      return (
        <div
          className="grid gap-2 md:gap-4"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
            ...block.styles
          }}
        >
          {block.content.images?.map((img: any, i: number) => (
            <img key={i} src={img.src} alt={img.alt} className="w-full h-auto rounded" />
          ))}
        </div>
      )

    case 'button':
      return (
        <div style={{ textAlign: block.settings?.align || 'left' }}>
          <a
            href={block.content.url}
            className="inline-block px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
            style={block.styles}
          >
            {block.content.text}
          </a>
        </div>
      )

    case 'spacer':
      return <div style={{ height: block.settings?.height || '40px' }} />

    case 'divider':
      return <hr className="border-t border-gray-300 my-4" style={block.styles} />

    case 'columns':
      return (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          style={{ gap: block.settings?.gap || '20px' }}
        >
          {block.content.columns?.map((column: any[], i: number) => (
            <div key={i}>
              {column.map((childBlock: any, j: number) => (
                <BlockRenderer key={j} block={{ ...childBlock, id: `${block.id}-${i}-${j}` }} />
              ))}
            </div>
          ))}
        </div>
      )

    default:
      return <div className="text-gray-500 text-sm">{block.type}</div>
  }
}
