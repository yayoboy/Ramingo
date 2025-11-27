import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Ramingo CMS
              </h1>
              <nav className="flex gap-6">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/about" className="text-gray-600 hover:text-gray-900">
                  About
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <footer className="mt-auto py-6 text-center text-gray-500 text-sm">
          Ramingo CMS v0.1.0 - Phase 1 Complete
        </footer>
      </div>
    </BrowserRouter>
  )
}

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axios.get('/api/health')
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🎉 Welcome to Ramingo CMS</h2>
        <p className="text-gray-600 mb-4">
          The admin panel is now running! Phase 1 implementation is complete.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">
          ✅ Phase 1 Complete
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li>✓ React 18 + TypeScript</li>
          <li>✓ Vite build tooling</li>
          <li>✓ Tailwind CSS</li>
          <li>✓ React Router</li>
          <li>✓ TanStack Query for data fetching</li>
          <li>✓ API connection working</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">API Health Check</h3>
        {isLoading && (
          <div className="text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
            Error connecting to API. Make sure the PHP server is running on port 8000.
          </div>
        )}
        {data && (
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <div className="text-green-800 font-semibold mb-2">
              ✓ API Connected Successfully
            </div>
            <pre className="text-sm text-gray-700 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">📋 Next Steps</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Implement Phase 2: Data Layer & File Storage</li>
          <li>Build authentication system</li>
          <li>Create WYSIWYG editor</li>
          <li>Add media management</li>
          <li>Develop theme system</li>
        </ol>
      </div>
    </div>
  )
}

function About() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">About Ramingo CMS</h2>
      <div className="prose max-w-none text-gray-600">
        <p className="mb-4">
          Ramingo CMS is a modern, flat-file content management system built with:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li><strong>Backend:</strong> PHP 8.2+, JSON storage, Composer</li>
          <li><strong>Frontend:</strong> React 18, TypeScript, Vite</li>
          <li><strong>Styling:</strong> Tailwind CSS</li>
          <li><strong>Data:</strong> TanStack Query, Zustand</li>
        </ul>
        <p>
          No database required - all content is stored in JSON files, making it
          perfect for version control with Git.
        </p>
      </div>
    </div>
  )
}

export default App
