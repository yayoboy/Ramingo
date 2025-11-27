import { useState, useEffect } from 'react'

interface GoogleFontPickerProps {
  selectedFont: string
  onFontSelect: (fontFamily: string) => void
}

// Popular Google Fonts for quick selection
const POPULAR_FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Playfair Display',
  'Inter',
  'Poppins',
  'Raleway',
  'Merriweather',
  'PT Sans',
  'Source Sans Pro',
  'Oswald',
  'Nunito',
  'Ubuntu',
  'Rubik'
]

export default function GoogleFontPicker({ selectedFont, onFontSelect }: GoogleFontPickerProps) {
  const [fonts] = useState<string[]>(POPULAR_FONTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)

  // Load a font dynamically
  const loadFont = (fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`
    document.head.appendChild(link)

    setLoadedFonts(prev => new Set([...prev, fontFamily]))
  }

  // Load selected font on mount
  useEffect(() => {
    if (selectedFont) {
      loadFont(selectedFont)
    }
  }, [selectedFont])

  // Filter fonts based on search
  const filteredFonts = fonts.filter(font =>
    font.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFontSelect = (fontFamily: string) => {
    loadFont(fontFamily)
    onFontSelect(fontFamily)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Selected Font Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ fontFamily: selectedFont || 'inherit' }}
      >
        <div className="flex items-center justify-between">
          <span>{selectedFont || 'Select a font'}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fonts..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Font List */}
          <div className="overflow-y-auto max-h-80">
            {filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => handleFontSelect(font)}
                  onMouseEnter={() => loadFont(font)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 transition-colors ${
                    selectedFont === font ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  style={{ fontFamily: font }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{font}</span>
                    {selectedFont === font && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">The quick brown fox jumps over the lazy dog</p>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No fonts found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
            Powered by Google Fonts
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
