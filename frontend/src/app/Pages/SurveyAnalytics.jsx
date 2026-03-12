import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SurveySidebar from '../components/SurveySidebar'
import { THEME } from '../constants/theme'
import { Star } from 'lucide-react'

export default function SurveyAnalytics({
  overview = {},
  sentiment_distribution = [],
  response_trends = [],
  agent_performance = [],
  sidebar = { views: [] },
}) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleFilter = () => {
    router.get('/surveys/analytics/', {
      date_from: dateFrom,
      date_to: dateTo,
    }, { preserveState: true })
  }

  const getSentimentCount = (sentiment) => {
    const item = sentiment_distribution.find(s => s.sentiment === sentiment)
    return item?.count || 0
  }

  const totalSentiment = sentiment_distribution.reduce((acc, s) => acc + s.count, 0) || 1

  return (
    <>
      <Head title="Survey Analytics" />
      <AppShell active="surveys">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <SurveySidebar 
            views={sidebar.views} 
            currentView="analytics" 
            activePage="analytics" 
          />

          {/* Main Content */}
          <main className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-800">Survey Analytics</h1>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="To"
                  />
                  <button
                    onClick={handleFilter}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-5 gap-6 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">Active Surveys</div>
                  <div className="text-3xl font-semibold text-gray-900">{overview.total_surveys || 0}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">Total Responses</div>
                  <div className="text-3xl font-semibold text-gray-900">{overview.total_responses || 0}</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">Average Rating</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-semibold text-gray-900">
                      {overview.average_rating || '-'}
                    </div>
                    <div className="text-lg text-gray-400">/ 5</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">CSAT Score</div>
                  <div className="text-3xl font-semibold text-green-600">
                    {overview.csat_score ? `${overview.csat_score}%` : '-'}
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">NPS Score</div>
                  <div className={`text-3xl font-semibold ${
                    overview.nps_score > 0 ? 'text-green-600' : overview.nps_score < 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {overview.nps_score !== null ? overview.nps_score : '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Sentiment Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">😊 Positive</span>
                        <span className="font-medium">{getSentimentCount('positive')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all"
                          style={{ width: `${(getSentimentCount('positive') / totalSentiment) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">😐 Neutral</span>
                        <span className="font-medium">{getSentimentCount('neutral')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-yellow-500 h-3 rounded-full transition-all"
                          style={{ width: `${(getSentimentCount('neutral') / totalSentiment) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">😞 Negative</span>
                        <span className="font-medium">{getSentimentCount('negative')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full transition-all"
                          style={{ width: `${(getSentimentCount('negative') / totalSentiment) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Trends */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Response Trends (Last 30 Days)</h3>
                  {response_trends.length > 0 ? (
                    <div className="h-48 flex items-end gap-1">
                      {response_trends.slice(-30).map((day, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-[#4a154b] rounded-t hover:bg-[#5a235c] transition-colors relative group"
                          style={{ height: `${Math.max((day.count / Math.max(...response_trends.map(d => d.count), 1)) * 100, 5)}%` }}
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            {day.date}: {day.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Performance */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Performance</h3>
                {agent_performance.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Agent</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Responses</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Avg Rating</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-500">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agent_performance.map((agent, index) => (
                        <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#4a154b] text-white rounded-full flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <span className="font-medium text-gray-900">{agent.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-gray-600">{agent.response_count}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{agent.avg_rating || '-'}</span>
                              {agent.avg_rating && (
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= agent.avg_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  agent.avg_rating >= 4 ? 'bg-green-500' :
                                  agent.avg_rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${((agent.avg_rating || 0) / 5) * 100}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No agent performance data available yet
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </AppShell>
    </>
  )
}
