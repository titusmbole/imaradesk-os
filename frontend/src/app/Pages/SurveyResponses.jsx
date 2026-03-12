import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SurveySidebar from '../components/SurveySidebar'
import Modal, { ModalBody, ModalFooter } from '../components/Modal'
import { THEME } from '../constants/theme'
import { Search, ClipboardList, Star, Eye, Circle, Check } from 'lucide-react'

const sentimentColors = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-yellow-100 text-yellow-800',
  negative: 'bg-red-100 text-red-800',
}

const sentimentIcons = {
  positive: '😊',
  neutral: '😐',
  negative: '😞',
}

export default function SurveyResponses({
  responses = [],
  sidebar = { views: [] },
  currentView = 'responses',
  filters = {},
  pagination = {},
}) {
  const [search, setSearch] = useState('')
  const [surveyFilter, setSurveyFilter] = useState('')
  const [sentimentFilter, setSentimentFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedResponse, setSelectedResponse] = useState(null)

  const handleSearch = (e) => {
    e.preventDefault()
    router.get('/surveys/responses/', {
      search,
      survey: surveyFilter,
      sentiment: sentimentFilter,
      date_from: dateFrom,
      date_to: dateTo,
    }, { preserveState: true })
  }

  return (
    <>
      <Head title="Survey Responses" />
      <AppShell active="surveys">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <SurveySidebar 
            views={sidebar.views.map(v => ({ ...v, active: v.id === 'responses' }))} 
            currentView="responses" 
            activePage="responses" 
          />

          {/* Main Content */}
          <main className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-800">Survey Responses</h1>
                <Link
                  href="/surveys/analytics/"
                  className="text-[#4a154b] hover:underline text-sm"
                >
                  View Analytics →
                </Link>
              </div>

              {/* Filters */}
              <form onSubmit={handleSearch} className="mt-4 flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by email, ticket..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                <select
                  value={surveyFilter}
                  onChange={(e) => setSurveyFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                >
                  <option value="">All Surveys</option>
                  {filters.surveys?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                >
                  <option value="">All Sentiments</option>
                  {filters.sentiments?.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                >
                  Filter
                </button>
              </form>
            </div>

            {/* Responses List */}
            <div className="p-6">
              {responses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <ClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                  <p className="text-gray-500">Responses will appear here as customers complete surveys</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((response) => (
                    <div key={response.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {/* Sentiment Icon */}
                          <div className={`text-3xl`}>
                            {response.sentiment ? sentimentIcons[response.sentiment] : '📝'}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/surveys/${response.survey.id}/`} className="font-medium text-[#4a154b] hover:underline">
                                {response.survey.name}
                              </Link>
                              {response.sentiment && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${sentimentColors[response.sentiment]}`}>
                                  {response.sentiment}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <span className="text-gray-500">Respondent:</span>{' '}
                                {response.is_anonymous ? (
                                  <span className="italic">Anonymous</span>
                                ) : (
                                  response.user?.name || response.user?.email || 'Unknown'
                                )}
                              </div>
                              {response.ticket && (
                                <div>
                                  <span className="text-gray-500">Ticket:</span>{' '}
                                  <Link href={`/tickets/${response.ticket.ticket_number}/`} className="text-[#4a154b] hover:underline">
                                    #{response.ticket.ticket_number}
                                  </Link>
                                  {' - '}{response.ticket.title}
                                </div>
                              )}
                              {response.agent && (
                                <div>
                                  <span className="text-gray-500">Agent:</span>{' '}
                                  {response.agent.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {response.overall_rating && (
                            <div className="flex items-center gap-1 mb-2 justify-end">
                              <span className="text-2xl font-bold text-gray-900">{response.overall_rating.toFixed(1)}</span>
                              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            {new Date(response.submitted_at).toLocaleDateString()} at{' '}
                            {new Date(response.submitted_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Answers Preview */}
                      {response.answers?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setSelectedResponse(response)}
                            className="text-sm text-[#4a154b] hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View {response.answers.length} answers
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-700">
                        Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_count} responses)
                      </div>
                      <div className="flex gap-2">
                        {pagination.has_previous && (
                          <button
                            onClick={() => router.get('/surveys/responses/', { page: pagination.current_page - 1 })}
                            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                          >
                            Previous
                          </button>
                        )}
                        {pagination.has_next && (
                          <button
                            onClick={() => router.get('/surveys/responses/', { page: pagination.current_page + 1 })}
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
      
      {/* Response Details Modal */}
      <Modal
        isOpen={!!selectedResponse}
        onClose={() => setSelectedResponse(null)}
        title="Survey Response Details"
        maxWidth="max-w-2xl"
      >
        <ModalBody>
          {selectedResponse && (
            <div className="space-y-6">
              {/* Response Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedResponse.survey?.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedResponse.is_anonymous ? (
                        <span className="italic">Anonymous response</span>
                      ) : (
                        selectedResponse.user?.name || selectedResponse.user?.email || 'Unknown'
                      )}
                    </div>
                    {selectedResponse.ticket && (
                      <div className="text-sm text-gray-500">
                        Ticket: #{selectedResponse.ticket.ticket_number}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {selectedResponse.overall_rating && (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-2xl font-bold text-gray-900">{selectedResponse.overall_rating.toFixed(1)}</span>
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(selectedResponse.submitted_at).toLocaleDateString()} at{' '}
                      {new Date(selectedResponse.submitted_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Answers */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wider">Responses</h4>
                {selectedResponse.answers?.map((answer, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Q{idx + 1}: {answer.question_text}
                    </div>
                    <div className="text-gray-900">
                      {/* Rating */}
                      {answer.question_type === 'rating' && (
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: answer.rating_scale || 5 }, (_, i) => i + 1).map((star) => (
                              <Star
                                key={star}
                                className={`w-6 h-6 ${star <= answer.numeric_value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold">({answer.numeric_value})</span>
                        </div>
                      )}
                      
                      {/* NPS */}
                      {answer.question_type === 'nps' && (
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                            answer.numeric_value >= 9 ? 'bg-green-100 text-green-700' :
                            answer.numeric_value >= 7 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {answer.numeric_value}
                          </div>
                          <span className="text-sm text-gray-500">
                            {answer.numeric_value >= 9 ? 'Promoter' :
                             answer.numeric_value >= 7 ? 'Passive' : 'Detractor'}
                          </span>
                        </div>
                      )}
                      
                      {/* Yes/No */}
                      {answer.question_type === 'yes_no' && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          answer.boolean_value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {answer.boolean_value ? '✓ Yes' : '✗ No'}
                        </span>
                      )}
                      
                      {/* Text */}
                      {answer.question_type === 'text' && (
                        <div className="bg-gray-50 rounded-lg p-3 text-gray-700 italic">
                          "{answer.text_value || 'No response'}"
                        </div>
                      )}
                      
                      {/* Single Choice */}
                      {answer.question_type === 'single_choice' && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4a154b]/10 text-[#4a154b] rounded-full text-sm">
                          <Circle className="w-4 h-4 fill-current" />
                          {answer.choice_values?.[0] || answer.value || 'No selection'}
                        </div>
                      )}
                      
                      {/* Multiple Choice */}
                      {answer.question_type === 'multiple_choice' && (
                        <div className="flex flex-wrap gap-2">
                          {(answer.choice_values || []).map((choice, ci) => (
                            <span key={ci} className="inline-flex items-center gap-1 px-3 py-1 bg-[#4a154b]/10 text-[#4a154b] rounded-full text-sm">
                              <Check className="w-4 h-4" />
                              {choice}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={() => setSelectedResponse(null)}
            className={`px-4 py-2 rounded-md ${THEME.button.primary}`}
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
    </>
  )
}
