import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Head } from '@inertiajs/react'
import BackofficeLayout from './components/BackofficeLayout'
import { COLORS } from '../../../constants/theme'

function formatTimestamp(date) {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
}

function LogLine({ line, showTimestamp }) {
  // Detect log level for coloring
  const getLogLevelColor = (text) => {
    const lower = text.toLowerCase()
    if (lower.includes('error') || lower.includes('exception') || lower.includes('fatal')) {
      return 'text-red-400'
    }
    if (lower.includes('warning') || lower.includes('warn')) {
      return 'text-yellow-400'
    }
    if (lower.includes('info')) {
      return 'text-blue-400'
    }
    if (lower.includes('debug')) {
      return 'text-gray-500'
    }
    if (lower.includes('success') || lower.includes('✓') || lower.includes('✅')) {
      return 'text-green-400'
    }
    return 'text-gray-300'
  }

  return (
    <div className={`font-mono text-sm py-0.5 hover:bg-gray-800 px-2 ${getLogLevelColor(line)}`}>
      {showTimestamp && (
        <span className="text-gray-500 mr-2">{formatTimestamp(new Date())}</span>
      )}
      <span className="whitespace-pre-wrap break-all">{line}</span>
    </div>
  )
}

function ServiceTab({ service, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
        isActive
          ? 'bg-gray-900 text-white border-t-2'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      style={{ borderColor: isActive ? COLORS.primary : 'transparent' }}
    >
      {service.name}
    </button>
  )
}

function LogFileSelector({ files, selectedFile, onSelect }) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {files.map((file) => (
        <button
          key={file.key}
          onClick={() => onSelect(file.key)}
          disabled={!file.exists}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedFile === file.key
              ? 'text-white'
              : file.exists
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          style={{ backgroundColor: selectedFile === file.key ? COLORS.primary : undefined }}
        >
          {file.name}
          {!file.exists && ' (N/A)'}
        </button>
      ))}
    </div>
  )
}

export default function Logs({ admin, services, redirect }) {
  const [activeService, setActiveService] = useState(services[0]?.key || 'web')
  const [selectedFiles, setSelectedFiles] = useState(() => {
    // Initialize with default file for each service
    const defaults = {}
    services.forEach(s => {
      defaults[s.key] = s.default_file
    })
    return defaults
  })
  const [logs, setLogs] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showTimestamps, setShowTimestamps] = useState(false)
  
  const logsContainerRef = useRef(null)
  const eventSourceRef = useRef(null)

  const currentService = services.find(s => s.key === activeService)
  const currentLogFile = selectedFiles[activeService]

  // Scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  // Fetch initial logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/backoffice/api/logs/${activeService}/${currentLogFile}/?lines=200`)
      const data = await response.json()
      
      if (response.ok) {
        setLogs(data.lines || [])
      } else {
        setError(data.error || 'Failed to fetch logs')
        setLogs([])
      }
    } catch (err) {
      setError('Network error. Please try again.')
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }, [activeService, currentLogFile])

  // Start streaming logs
  const startStreaming = useCallback(() => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setIsStreaming(true)
    const eventSource = new EventSource(`/backoffice/api/logs/${activeService}/${currentLogFile}/stream/`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'log') {
          setLogs(prev => {
            // Keep last 1000 lines to prevent memory issues
            const newLogs = [...prev, data.line]
            if (newLogs.length > 1000) {
              return newLogs.slice(-1000)
            }
            return newLogs
          })
        } else if (data.type === 'error') {
          setError(data.message)
        }
      } catch (e) {
        console.error('Failed to parse SSE message:', e)
      }
    }

    eventSource.onerror = () => {
      setIsStreaming(false)
      eventSource.close()
    }
  }, [activeService, currentLogFile])

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsStreaming(false)
  }, [])

  // Cleanup on unmount or service/file change
  useEffect(() => {
    fetchLogs()
    return () => {
      stopStreaming()
    }
  }, [activeService, currentLogFile, fetchLogs, stopStreaming])

  // Handle service tab change
  const handleServiceChange = (serviceKey) => {
    stopStreaming()
    setActiveService(serviceKey)
    setLogs([])
  }

  // Handle log file change
  const handleFileChange = (fileKey) => {
    stopStreaming()
    setSelectedFiles(prev => ({
      ...prev,
      [activeService]: fileKey
    }))
    setLogs([])
  }

  // Clear logs
  const clearLogs = () => {
    setLogs([])
  }

  // Download logs
  const downloadLogs = () => {
    const content = logs.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeService}-${currentLogFile}-${formatTimestamp(new Date()).replace(/[/: ]/g, '-')}.log`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head title="Application Logs - Backoffice" />
      <BackofficeLayout admin={admin}>
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Application Logs</h1>
          <p className="text-gray-500 mt-1">Monitor real-time logs from all services</p>
        </div>

        {/* Service Tabs */}
        <div className="flex space-x-1 overflow-x-auto mb-0 border-b border-gray-200">
          {services.map((service) => (
            <ServiceTab
              key={service.key}
              service={service}
              isActive={activeService === service.key}
              onClick={() => handleServiceChange(service.key)}
            />
          ))}
        </div>

        {/* Log Viewer Container */}
        <div className="bg-gray-900 rounded-b-xl rounded-tr-xl shadow-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-800 border-b border-gray-700">
            {/* Log File Selector */}
            <div className="flex-1">
              {currentService && (
                <LogFileSelector
                  files={currentService.files}
                  selectedFile={currentLogFile}
                  onSelect={handleFileChange}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Toggle Timestamps */}
              <button
                onClick={() => setShowTimestamps(!showTimestamps)}
                className={`p-2 rounded-md transition-colors ${
                  showTimestamps ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Toggle timestamps"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Auto Scroll Toggle */}
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`p-2 rounded-md transition-colors ${
                  autoScroll ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Clear Logs */}
              <button
                onClick={clearLogs}
                className="p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                title="Clear logs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              {/* Download Logs */}
              <button
                onClick={downloadLogs}
                disabled={logs.length === 0}
                className="p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download logs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {/* Refresh */}
              <button
                onClick={fetchLogs}
                disabled={isLoading}
                className="p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors disabled:opacity-50"
                title="Refresh logs"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Stream Toggle */}
              <button
                onClick={isStreaming ? stopStreaming : startStreaming}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isStreaming
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isStreaming ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-100"></span>
                    </span>
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Stream</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 text-xs text-gray-400 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <span>Service: <span className="text-gray-200">{currentService?.name}</span></span>
              <span>File: <span className="text-gray-200">{currentLogFile}</span></span>
              <span>Lines: <span className="text-gray-200">{logs.length}</span></span>
            </div>
            {isStreaming && (
              <div className="flex items-center space-x-1 text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>Live</span>
              </div>
            )}
          </div>

          {/* Log Content */}
          <div
            ref={logsContainerRef}
            className="h-[500px] sm:h-[600px] overflow-y-auto overflow-x-auto font-mono text-sm"
          >
            {isLoading && logs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading logs...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-400 text-center p-4">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>{error}</p>
                  <button
                    onClick={fetchLogs}
                    className="mt-3 px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500 text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No logs available</p>
                  <p className="text-sm mt-1">Click "Stream" to watch for new logs</p>
                </div>
              </div>
            ) : (
              <div className="py-1">
                {logs.map((line, index) => (
                  <LogLine key={index} line={line} showTimestamp={showTimestamps} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Log Viewer Tips</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Click <strong>Stream</strong> to watch logs in real-time</li>
            <li>• Use the file selector to switch between different log types (stdout, stderr, access, etc.)</li>
            <li>• Toggle <strong>Auto-scroll</strong> to follow new logs automatically</li>
            <li>• Click the <strong>Timestamp</strong> button to add timestamps to streaming logs</li>
            <li>• <strong>Download</strong> logs to save them locally</li>
          </ul>
        </div>
      </BackofficeLayout>
    </>
  )
}
