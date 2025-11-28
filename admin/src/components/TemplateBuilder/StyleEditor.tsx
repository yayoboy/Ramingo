import { useState } from 'react'

interface Block {
  id: string
  type: string
  content: any
  styles?: any
  settings?: any
}

interface StyleEditorProps {
  content: Block[]
  styles: any
  onContentChange: (content: Block[]) => void
  onStylesChange: (styles: any) => void
}

type MobileTab = 'preview' | 'global' | 'block'

export default function StyleEditor({ content, styles, onContentChange, onStylesChange }: StyleEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<MobileTab>('preview')
  const [globalStyles, setGlobalStyles] = useState(styles || {
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      text: '#333333',
      background: '#ffffff'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      baseFontSize: '16px',
      lineHeight: '1.6',
      headingFontFamily: 'inherit'
    },
    spacing: {
      containerWidth: '1200px',
      sectionPadding: '60px'
    }
  })

  const updateGlobalStyles = (path: string, value: any) => {
    const pathParts = path.split('.')
    const newStyles = { ...globalStyles }
    let current: any = newStyles

    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]]
    }

    current[pathParts[pathParts.length - 1]] = value
    setGlobalStyles(newStyles)
    onStylesChange(newStyles)
  }

  const updateBlockStyle = (blockId: string, property: string, value: string) => {
    onContentChange(
      content.map((block) =>
        block.id === blockId
          ? { ...block, styles: { ...block.styles, [property]: value } }
          : block
      )
    )
  }

  const selectedBlockData = content.find((b) => b.id === selectedBlock)

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mobileTab === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setMobileTab('global')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mobileTab === 'global'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Global
          </button>
          {selectedBlockData && (
            <button
              onClick={() => setMobileTab('block')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mobileTab === 'block'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Block
            </button>
          )}
        </div>
      </div>

      {/* Global Styles Panel */}
      <div className={`
        ${mobileTab === 'global' ? 'block' : 'hidden'} lg:block
        w-full lg:w-80 bg-white lg:border-r border-gray-200 overflow-y-auto
      `}>
        <div className="p-4">
          <h3 className="font-semibold text-base md:text-lg mb-4">Global Styles</h3>

          {/* Colors */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-sm text-gray-700">Colors</h4>
            <div className="space-y-3">
              <StyleInput
                label="Primary"
                type="color"
                value={globalStyles.colors.primary}
                onChange={(value) => updateGlobalStyles('colors.primary', value)}
              />
              <StyleInput
                label="Secondary"
                type="color"
                value={globalStyles.colors.secondary}
                onChange={(value) => updateGlobalStyles('colors.secondary', value)}
              />
              <StyleInput
                label="Text"
                type="color"
                value={globalStyles.colors.text}
                onChange={(value) => updateGlobalStyles('colors.text', value)}
              />
              <StyleInput
                label="Background"
                type="color"
                value={globalStyles.colors.background}
                onChange={(value) => updateGlobalStyles('colors.background', value)}
              />
            </div>
          </div>

          {/* Typography */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-sm text-gray-700">Typography</h4>
            <div className="space-y-3">
              <StyleInput
                label="Font Family"
                type="select"
                value={globalStyles.typography.fontFamily}
                onChange={(value) => updateGlobalStyles('typography.fontFamily', value)}
                options={[
                  { value: 'system-ui, -apple-system, sans-serif', label: 'System' },
                  { value: 'Georgia, serif', label: 'Georgia' },
                  { value: '"Times New Roman", serif', label: 'Times New Roman' },
                  { value: 'Arial, sans-serif', label: 'Arial' },
                  { value: '"Courier New", monospace', label: 'Courier New' }
                ]}
              />
              <StyleInput
                label="Base Font Size"
                type="text"
                value={globalStyles.typography.baseFontSize}
                onChange={(value) => updateGlobalStyles('typography.baseFontSize', value)}
                placeholder="16px"
              />
              <StyleInput
                label="Line Height"
                type="text"
                value={globalStyles.typography.lineHeight}
                onChange={(value) => updateGlobalStyles('typography.lineHeight', value)}
                placeholder="1.6"
              />
            </div>
          </div>

          {/* Spacing */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-sm text-gray-700">Layout</h4>
            <div className="space-y-3">
              <StyleInput
                label="Container Width"
                type="text"
                value={globalStyles.spacing.containerWidth}
                onChange={(value) => updateGlobalStyles('spacing.containerWidth', value)}
                placeholder="1200px"
              />
              <StyleInput
                label="Section Padding"
                type="text"
                value={globalStyles.spacing.sectionPadding}
                onChange={(value) => updateGlobalStyles('spacing.sectionPadding', value)}
                placeholder="60px"
              />
            </div>
          </div>

          {/* CSS Code Export */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-sm text-gray-700">Export CSS</h4>
            <button
              onClick={() => {
                const css = generateCSS(globalStyles)
                navigator.clipboard.writeText(css)
                alert('CSS copied to clipboard!')
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm touch-manipulation"
            >
              📋 Copy CSS
            </button>
          </div>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className={`
        ${mobileTab === 'preview' ? 'block' : 'hidden'} lg:block
        flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8
      `}>
        <div
          className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-4 md:p-8"
          style={{
            color: globalStyles.colors.text,
            backgroundColor: globalStyles.colors.background,
            fontFamily: globalStyles.typography.fontFamily,
            fontSize: globalStyles.typography.baseFontSize,
            lineHeight: globalStyles.typography.lineHeight
          }}
        >
          {content.length === 0 ? (
            <div className="text-center py-12 md:py-16 text-gray-500">
              <p className="text-sm md:text-base">No content to style</p>
              <p className="text-xs md:text-sm mt-2">Switch to Block Editor or Component Library to add content first</p>
            </div>
          ) : (
            <div className="space-y-6">
              {content.map((block) => (
                <div
                  key={block.id}
                  onClick={() => {
                    setSelectedBlock(block.id)
                    setMobileTab('block')
                  }}
                  className={`cursor-pointer transition-all touch-manipulation rounded ${
                    selectedBlock === block.id ? 'ring-2 ring-blue-500 p-2' : ''
                  }`}
                >
                  <BlockPreview block={block} globalStyles={globalStyles} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block Styles Panel */}
      {selectedBlockData && (
        <div className={`
          ${mobileTab === 'block' ? 'block' : 'hidden'} lg:block
          w-full lg:w-80 bg-white lg:border-l border-gray-200 overflow-y-auto
        `}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base md:text-lg">Block Styles</h3>
              <button
                onClick={() => setMobileTab('preview')}
                className="lg:hidden text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-4">
              Styling: <strong>{selectedBlockData.type}</strong> block
            </p>

            <div className="space-y-4">
              <StyleInput
                label="Text Color"
                type="color"
                value={selectedBlockData.styles?.color || '#000000'}
                onChange={(value) => updateBlockStyle(selectedBlock!, 'color', value)}
              />
              <StyleInput
                label="Background"
                type="color"
                value={selectedBlockData.styles?.['background-color'] || '#ffffff'}
                onChange={(value) => updateBlockStyle(selectedBlock!, 'background-color', value)}
              />
              <StyleInput
                label="Font Size"
                type="text"
                value={selectedBlockData.styles?.['font-size'] || ''}
                onChange={(value) => updateBlockStyle(selectedBlock!, 'font-size', value)}
                placeholder="16px"
              />
              <StyleInput
                label="Font Weight"
                type="select"
                value={selectedBlockData.styles?.['font-weight'] || 'normal'}
                onChange={(value) => updateBlockStyle(selectedBlock!, 'font-weight', value)}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'bold', label: 'Bold' },
                  { value: '300', label: 'Light' },
                  { value: '600', label: 'Semi-bold' }
                ]}
              />
              <StyleInput
                label="Margin"
                type="text"
                value={selectedBlockData.styles?.margin || ''}
                onChange={(value) => updateBlockStyle(selectedBlock!, 'margin', value)}
                placeholder="0"
              />
              <StyleInput
                label="Padding"
                type="text"
                value={selectedBlockData.styles?.padding || ''}
                onChange={(value) => updateBlockStyle(selectedBlock!, 'padding', value)}
                placeholder="0"
              />
              <StyleInput
                label="Border Radius"
                type="text"
                value={selectedBlockData.styles?.['border-radius'] || ''}
                onChange={(value) => updateBlockStyle(selectedBlock!, 'border-radius', value)}
                placeholder="0"
              />
              <StyleInput
                label="Border"
                type="text"
                value={selectedBlockData.styles?.border || ''}
                onChange={(value) => updateBlockStyle(selectedBlock!, 'border', value)}
                placeholder="1px solid #ccc"
              />
            </div>

            <button
              onClick={() => {
                if (confirm('Reset all styles for this block?')) {
                  onContentChange(
                    content.map((block) =>
                      block.id === selectedBlock
                        ? { ...block, styles: {} }
                        : block
                    )
                  )
                }
              }}
              className="w-full mt-6 bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 px-4 py-2 rounded text-sm touch-manipulation"
            >
              Reset Block Styles
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StyleInput({
  label,
  type,
  value,
  onChange,
  options,
  placeholder
}: {
  label: string
  type: 'text' | 'color' | 'select'
  value: string
  onChange: (value: string) => void
  options?: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'color' ? (
        <div className="flex gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded border border-gray-300"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
          />
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />
      )}
    </div>
  )
}

function BlockPreview({ block, globalStyles }: { block: Block; globalStyles: any }) {
  const combinedStyles = { ...block.styles }

  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.settings?.level || 2}` as keyof JSX.IntrinsicElements
      return (
        <HeadingTag className="text-xl md:text-2xl lg:text-3xl" style={combinedStyles}>
          {block.content.text || 'Heading'}
        </HeadingTag>
      )

    case 'text':
      return (
        <div
          className="prose prose-sm md:prose max-w-none"
          style={combinedStyles}
          dangerouslySetInnerHTML={{ __html: block.content.html || '<p>Text content</p>' }}
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
              style={{ maxWidth: '100%', ...combinedStyles }}
            />
          ) : (
            <div
              className="bg-gray-100 h-32 md:h-48 flex items-center justify-center rounded"
              style={combinedStyles}
            >
              <span className="text-gray-400 text-sm">Image placeholder</span>
            </div>
          )}
        </div>
      )

    case 'button':
      return (
        <div style={{ textAlign: block.settings?.align || 'left' }}>
          <a
            href={block.content.url || '#'}
            className="inline-block px-4 md:px-6 py-2 md:py-3 rounded text-sm md:text-base"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: globalStyles.colors.primary,
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              ...combinedStyles
            }}
          >
            {block.content.text || 'Button'}
          </a>
        </div>
      )

    case 'spacer':
      return <div style={{ height: block.settings?.height || '40px', ...combinedStyles }} />

    case 'divider':
      return <hr className="border-t border-gray-300 my-2 md:my-4" style={combinedStyles} />

    default:
      return <div className="text-sm" style={combinedStyles}>{block.type} block</div>
  }
}

function generateCSS(styles: any): string {
  return `
/* Global Styles */
:root {
  --primary-color: ${styles.colors.primary};
  --secondary-color: ${styles.colors.secondary};
  --text-color: ${styles.colors.text};
  --background-color: ${styles.colors.background};
  --font-family: ${styles.typography.fontFamily};
  --base-font-size: ${styles.typography.baseFontSize};
  --line-height: ${styles.typography.lineHeight};
  --container-width: ${styles.spacing.containerWidth};
  --section-padding: ${styles.spacing.sectionPadding};
}

body {
  font-family: var(--font-family);
  font-size: var(--base-font-size);
  line-height: var(--line-height);
  color: var(--text-color);
  background-color: var(--background-color);
}

.container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 20px;
}

section {
  padding: var(--section-padding) 0;
}
  `.trim()
}
