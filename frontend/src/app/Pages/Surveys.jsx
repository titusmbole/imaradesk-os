import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import toast from 'react-hot-toast'
import AppShell from '../components/AppShell'
import SurveySidebar from '../components/SurveySidebar'
import Modal, { ModalBody, ModalFooter } from '../components/Modal'
import { THEME } from '../constants/theme'
import { Plus, Search, ClipboardList, Eye, Mail, Edit, Trash2, AlertTriangle } from 'lucide-react'

const surveyTypeColors = {
  csat: 'bg-blue-100 text-blue-800',
  resolution: 'bg-green-100 text-green-800',
  agent: 'bg-purple-100 text-purple-800',
  nps: 'bg-orange-100 text-orange-800',
  custom: 'bg-gray-100 text-gray-800',
}

const triggerColors = {
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-100 text-slate-800',
  sla_breach: 'bg-red-100 text-red-800',
  manual: 'bg-yellow-100 text-yellow-800',
}

export default function Surveys({
  surveys = [],
  sidebar = { views: [] },
  settings = {},
  filters = {},
  pagination = {},
  currentView = 'all'
}) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [triggerFilter, setTriggerFilter] = useState('')
  
  // Test survey modal state
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testSurvey, setTestSurvey] = useState(null)
  const [testEmail, setTestEmail] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    router.get('/surveys/', {
      view: currentView,
      search,
      type: typeFilter,
      trigger: triggerFilter
    }, { preserveState: true })
  }

  const handleDelete = (surveyId) => {
    if (confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      router.delete(`/api/surveys/${surveyId}/delete/`, {
        onSuccess: () => {
          router.reload()
        }
      })
    }
  }

  const handleToggleActive = (survey) => {
    fetch(`/api/surveys/${survey.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': window.csrfToken,
      },
      body: JSON.stringify({ is_active: !survey.is_active })
    }).then(() => router.reload())
  }
  
  const openTestModal = (survey) => {
    setTestSurvey(survey)
    setTestEmail('')
    setTestModalOpen(true)
  }
  
  const closeTestModal = () => {
    setTestModalOpen(false)
    setTestSurvey(null)
    setTestEmail('')
  }
  
  const handleSendTestSurvey = async () => {
    if (!testEmail || !testSurvey) return
    
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setSendingTest(true)
    try {
      const response = await fetch(`/api/surveys/${testSurvey.id}/send-test/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken,
        },
        body: JSON.stringify({ email: testEmail })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Test survey sent to ${testEmail}`)
        closeTestModal()
      } else {
        toast.error(data.error || 'Failed to send test survey')
      }
    } catch (error) {
      toast.error('An error occurred while sending the test survey')
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <>
      <Head title="Surveys & Feedback" />
      <AppShell active="surveys">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <SurveySidebar 
            views={sidebar.views.map(v => ({ ...v, active: v.id === currentView }))} 
            currentView={currentView} 
            activePage="home" 
          />

          {/* Main Content */}
          <main className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">Surveys & Feedback</h1>
                  {!settings.enabled && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Surveys are currently disabled. Enable them in settings.
                    </p>
                  )}
                </div>
                <Link
                  href="/surveys/new/"
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Survey
                </Link>
              </div>

              {/* Search and Filters */}
              <form onSubmit={handleSearch} className="mt-4 flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search surveys..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {filters.types?.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <select
                  value={triggerFilter}
                  onChange={(e) => setTriggerFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                >
                  <option value="">All Triggers</option>
                  {filters.triggers?.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                >
                  Filter
                </button>
              </form>
            </div>

            {/* Survey List */}
            <div className="p-6">
              {surveys.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <ClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
                  <p className="text-gray-500 mb-4">Create your first survey to start collecting feedback</p>
                  <Link
                    href="/surveys/new/"
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                  >
                    Create Survey
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trigger</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {surveys.map((survey) => (
                        <tr key={survey.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/surveys/${survey.id}/`} className="text-[#4a154b] hover:underline font-medium">
                              {survey.name}
                            </Link>
                            {survey.is_default && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-[#4a154b] text-white rounded">Default</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${surveyTypeColors[survey.survey_type] || surveyTypeColors.custom}`}>
                              {survey.survey_type_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${triggerColors[survey.trigger_event] || triggerColors.manual}`}>
                              {survey.trigger_event_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {survey.question_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {survey.response_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-[#4a154b] h-2 rounded-full"
                                  style={{ width: `${survey.completion_rate || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{survey.completion_rate || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleActive(survey)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                survey.is_active ? 'bg-[#4a154b]' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  survey.is_active ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/surveys/${survey.id}/`}
                                className="text-gray-600 hover:text-[#4a154b]"
                                title="View"
                              >
                                <Eye className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => openTestModal(survey)}
                                className="text-gray-600 hover:text-blue-600"
                                title="Send Test Survey"
                              >
                                <Mail className="w-5 h-5" />
                              </button>
                              <Link
                                href={`/surveys/${survey.id}/edit/`}
                                className="text-gray-600 hover:text-[#4a154b]"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(survey.id)}
                                className="text-gray-600 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_count} surveys)
                      </div>
                      <div className="flex gap-2">
                        {pagination.has_previous && (
                          <button
                            onClick={() => router.get('/surveys/', { page: pagination.current_page - 1, view: currentView })}
                            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                          >
                            Previous
                          </button>
                        )}
                        {pagination.has_next && (
                          <button
                            onClick={() => router.get('/surveys/', { page: pagination.current_page + 1, view: currentView })}
                            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                          >
                            Next
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </AppShell>
      
      {/* Test Survey Modal */}
      <Modal
        isOpen={testModalOpen}
        onClose={closeTestModal}
        title="Send Test Survey"
        maxWidth="max-w-md"
      >
        <ModalBody>
          <div className="space-y-4">
            {testSurvey && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{testSurvey.name}</p>
                <p className="text-xs text-gray-500 mt-1">{testSurvey.question_count} questions</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to send test survey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                A test survey link will be sent to this email address. The link will be valid for {testSurvey?.expiry_days || 7} days.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={closeTestModal}
            className={`px-4 py-2 rounded-md ${THEME.button.secondary}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendTestSurvey}
            disabled={sendingTest || !testEmail}
            className={`px-4 py-2 rounded-md ${THEME.button.primary} disabled:opacity-50`}
          >
            {sendingTest ? 'Sending...' : 'Send Test'}
          </button>
        </ModalFooter>
      </Modal>
    </>
  )
}
