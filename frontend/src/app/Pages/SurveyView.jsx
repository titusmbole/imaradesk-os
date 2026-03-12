import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SurveySidebar from '../components/SurveySidebar'
import Modal, { ModalBody, ModalFooter } from '../components/Modal'
import { THEME } from '../constants/theme'

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

export default function SurveyView({
  survey = {},
  responses = [],
  analytics = {},
  pagination = {},
  sidebar = { views: [] },
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedResponse, setSelectedResponse] = useState(null)
  
  return (
    <>
      <Head title={`Survey - ${survey.name}`} />
      <AppShell active="surveys">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <SurveySidebar 
            views={sidebar.views} 
            currentView="view" 
            activePage="view" 
          />

          {/* Main Content */}
          <main className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/surveys/" className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">{survey.name}</h1>
                  <p className="text-sm text-gray-500">
                    {survey.survey_type_display} • {survey.trigger_event_display}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm rounded-full ${survey.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {survey.is_active ? 'Active' : 'Inactive'}
                </span>
                {survey.is_default && (
                  <span className="px-3 py-1 text-sm bg-[#4a154b] text-white rounded-full">Default</span>
                )}
                <Link
                  href={`/surveys/${survey.id}/edit/`}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                >
                  Edit Survey
                </Link>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="mt-4 flex gap-6 border-b border-gray-200 -mb-4">
              {['overview', 'responses', 'questions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-[#4a154b] text-[#4a154b]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Total Invitations</div>
                    <div className="text-3xl font-semibold text-gray-900">{analytics.total_invitations || 0}</div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Total Responses</div>
                    <div className="text-3xl font-semibold text-gray-900">{analytics.total_responses || 0}</div>
                    <div className="text-sm text-green-600 mt-1">
                      {analytics.response_rate?.toFixed(1) || 0}% response rate
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">Average Rating</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-semibold text-gray-900">
                        {analytics.average_rating?.toFixed(1) || '-'}
                      </div>
                      <div className="text-lg text-gray-400">/ 5</div>
                    </div>
                    <div className="flex mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= (analytics.average_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="text-sm text-gray-500 mb-1">CSAT Score</div>
                    <div className="text-3xl font-semibold text-gray-900">
                      {analytics.csat_score ? `${analytics.csat_score.toFixed(0)}%` : '-'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Customer satisfaction
                    </div>
                  </div>
                </div>
                
                {/* NPS Score */}
                {analytics.nps_score !== null && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Net Promoter Score (NPS)</h3>
                    <div className="flex items-center gap-8">
                      <div className="text-5xl font-bold text-[#4a154b]">
                        {analytics.nps_score?.toFixed(0) || 0}
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-red-500 h-full"
                            style={{ width: '30%' }}
                          />
                          <div 
                            className="bg-yellow-400 h-full"
                            style={{ width: '40%' }}
                          />
                          <div 
                            className="bg-green-500 h-full"
                            style={{ width: '30%' }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Detractors (0-6)</span>
                          <span>Passives (7-8)</span>
                          <span>Promoters (9-10)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Sentiment Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Distribution</h3>
                  <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">😊</span>
                      <div>
                        <div className="text-2xl font-semibold text-green-600">{analytics.positive_count || 0}</div>
                        <div className="text-sm text-gray-500">Positive</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">😐</span>
                      <div>
                        <div className="text-2xl font-semibold text-yellow-600">{analytics.neutral_count || 0}</div>
                        <div className="text-sm text-gray-500">Neutral</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">😞</span>
                      <div>
                        <div className="text-2xl font-semibold text-red-600">{analytics.negative_count || 0}</div>
                        <div className="text-sm text-gray-500">Negative</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Survey Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Details</h3>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Description:</span>
                      <p className="mt-1 text-gray-900">{survey.description || 'No description'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Questions:</span>
                      <p className="mt-1 text-gray-900">{survey.question_count} questions</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Send Delay:</span>
                      <p className="mt-1 text-gray-900">{survey.send_delay} minutes after trigger</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Link Expiry:</span>
                      <p className="mt-1 text-gray-900">{survey.expiry_days} days</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Multiple Responses:</span>
                      <p className="mt-1 text-gray-900">{survey.allow_multiple_responses ? 'Allowed' : 'Not allowed'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Anonymous:</span>
                      <p className="mt-1 text-gray-900">{survey.is_anonymous ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Responses Tab */}
            {activeTab === 'responses' && (
              <div className="bg-white rounded-lg border border-gray-200">
                {responses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No responses yet for this survey.</p>
                  </div>
                ) : (
                  <>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Respondent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sentiment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {responses.map((response) => (
                          <tr key={response.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {response.is_anonymous ? (
                                <span className="text-gray-500 italic">Anonymous</span>
                              ) : (
                                <div>
                                  <div className="font-medium text-gray-900">{response.user?.name || 'Unknown'}</div>
                                  <div className="text-sm text-gray-500">{response.user?.email}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {response.ticket ? (
                                <Link href={`/tickets/${response.ticket.ticket_number}/`} className="text-[#4a154b] hover:underline">
                                  #{response.ticket.ticket_number}
                                </Link>
                              ) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                {response.overall_rating && (
                                  <>
                                    <span className="font-medium">{response.overall_rating.toFixed(1)}</span>
                                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {response.sentiment && (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${sentimentColors[response.sentiment]}`}>
                                  {sentimentIcons[response.sentiment]} {response.sentiment}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {response.agent?.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(response.submitted_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedResponse(response)}
                                className="text-[#4a154b] hover:underline text-sm"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                      <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                        <div className="text-sm text-gray-700">
                          Page {pagination.current_page} of {pagination.total_pages}
                        </div>
                        <div className="flex gap-2">
                          {pagination.has_previous && (
                            <button
                              onClick={() => router.get(`/surveys/${survey.id}/`, { page: pagination.current_page - 1 })}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                            >
                              Previous
                            </button>
                          )}
                          {pagination.has_next && (
                            <button
                              onClick={() => router.get(`/surveys/${survey.id}/`, { page: pagination.current_page + 1 })}
                              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                            >
                              Next
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {survey.questions?.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                    <p>No questions in this survey.</p>
                    <Link
                      href={`/surveys/${survey.id}/edit/`}
                      className="inline-block mt-4 text-[#4a154b] hover:underline"
                    >
                      Add Questions
                    </Link>
                  </div>
                ) : (
                  survey.questions?.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-[#4a154b] text-white rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-medium text-gray-900">{question.question_text}</span>
                            {question.is_required && (
                              <span className="text-red-500">*</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded">{question.question_type_display}</span>
                            {question.question_type === 'rating' && (
                              <span>Scale: 1-{question.rating_scale}</span>
                            )}
                          </div>
                          {question.choices?.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {question.choices.map((choice) => (
                                <div key={choice.id} className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="w-4 h-4 border border-gray-300 rounded-full"></span>
                                  {choice.label}
                                  {choice.is_other && <span className="text-gray-400">(Other)</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
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
        title="Response Details"
        maxWidth="max-w-2xl"
      >
        <ModalBody>
          {selectedResponse && (
            <div className="space-y-6">
              {/* Response Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      {selectedResponse.is_anonymous ? (
                        <span className="italic">Anonymous response</span>
                      ) : (
                        selectedResponse.user?.name || selectedResponse.user?.email || 'Unknown'
                      )}
                    </div>
                    {selectedResponse.ticket && (
                      <div className="text-sm text-gray-500 mt-1">
                        Ticket: #{selectedResponse.ticket.ticket_number}
                      </div>
                    )}
                    {selectedResponse.agent && (
                      <div className="text-sm text-gray-500">
                        Agent: {selectedResponse.agent.name}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {selectedResponse.overall_rating && (
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-2xl font-bold text-gray-900">{selectedResponse.overall_rating.toFixed(1)}</span>
                        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    )}
                    {selectedResponse.sentiment && (
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${sentimentColors[selectedResponse.sentiment]}`}>
                        {sentimentIcons[selectedResponse.sentiment]} {selectedResponse.sentiment}
                      </span>
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
                              <svg
                                key={star}
                                className={`w-6 h-6 ${star <= answer.numeric_value ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
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
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                          {answer.choice_values?.[0] || answer.value || 'No selection'}
                        </div>
                      )}
                      
                      {/* Multiple Choice */}
                      {answer.question_type === 'multiple_choice' && (
                        <div className="flex flex-wrap gap-2">
                          {(answer.choice_values || []).map((choice, ci) => (
                            <span key={ci} className="inline-flex items-center gap-1 px-3 py-1 bg-[#4a154b]/10 text-[#4a154b] rounded-full text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {choice}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!selectedResponse.answers || selectedResponse.answers.length === 0) && (
                  <p className="text-gray-500 text-sm italic">No answer details available</p>
                )}
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
