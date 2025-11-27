import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/DashboardLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Sites } from './pages/Sites'
import { Sections } from './pages/Sections'
import { Entries } from './pages/Entries'
import EntryEditor from './pages/EntryEditor'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="sites" element={<Sites />} />
            <Route path="sites/:siteId/sections" element={<Sections />} />
            <Route
              path="sites/:siteId/sections/:sectionId/entries"
              element={<Entries />}
            />
            <Route
              path="sites/:siteId/sections/:sectionId/entries/new"
              element={<EntryEditor />}
            />
            <Route
              path="sites/:siteId/sections/:sectionId/entries/:entryId/edit"
              element={<EntryEditor />}
            />
          </Route>

          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
