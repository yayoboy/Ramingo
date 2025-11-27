import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

interface MediaFile {
  id: string
  filename: string
  url: string
  size: number
  mimeType: string
  uploadedAt: string
}

interface MediaLibraryProps {
  siteId: string
  onSelect?: (url: string) => void
  multiple?: boolean
  maxSelect?: number
}

export default function MediaLibrary({ siteId, onSelect, multiple = false, maxSelect = 10 }: MediaLibraryProps) {
  const queryClient = useQueryClient()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch media files
  const { data: mediaFiles = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ['media', siteId],
    queryFn: async () => {
      const response = await api.get(`/sites/${siteId}/media`)
      return response.data.data || []
    },
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files[]', file)
      })

      const response = await api.post(`/sites/${siteId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', siteId] })
      setUploadProgress(0)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await api.delete(`/sites/${siteId}/media/${fileId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', siteId] })
    },
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files)
    }
  }

  const toggleFileSelection = (url: string) => {
    if (multiple) {
      setSelectedFiles((prev) => {
        if (prev.includes(url)) {
          return prev.filter((u) => u !== url)
        } else if (prev.length < maxSelect) {
          return [...prev, url]
        }
        return prev
      })
    } else {
      setSelectedFiles([url])
      if (onSelect) {
        onSelect(url)
      }
    }
  }

  const handleSelectMultiple = () => {
    if (onSelect && selectedFiles.length > 0) {
      selectedFiles.forEach((url) => onSelect(url))
      setSelectedFiles([])
    }
  }

  const filteredFiles = mediaFiles.filter((file) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-300">
      {/* Header */}
      <div className="border-b border-gray-300 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Media Library</h3>
          <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
            Upload Files
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploadMutation.isPending}
            />
          </label>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search files..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Upload Progress */}
      {uploadMutation.isPending && (
        <div className="p-4 border-b border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Uploading...</span>
            <span className="text-sm font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading media...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No files found' : 'No media files yet. Upload some to get started!'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                  selectedFiles.includes(file.url)
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => toggleFileSelection(file.url)}
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  {file.mimeType.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-end">
                  <div className="p-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{file.filename}</p>
                    <p className="text-gray-300 text-xs">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                {/* Selected Indicator */}
                {selectedFiles.includes(file.url) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Are you sure you want to delete this file?')) {
                      deleteMutation.mutate(file.id)
                    }
                  }}
                  className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Delete file"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {multiple && selectedFiles.length > 0 && (
        <div className="border-t border-gray-300 p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFiles([])}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Clear
            </button>
            <button
              onClick={handleSelectMultiple}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Insert Selected
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
