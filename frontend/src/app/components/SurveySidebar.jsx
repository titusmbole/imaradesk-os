import React from 'react'
import { Link, router } from '@inertiajs/react'
import { Home, PlusCircle, FileText, BarChart3, Settings, ClipboardList } from 'lucide-react'

export default function SurveySidebar({ views = [], currentView = 'all', activePage = 'surveys' }) {
  const handleViewChange = (viewId) => {
    router.get('/surveys/', { view: viewId }, { preserveState: true })
  }

  const quickActions = [
    { href: '/surveys/', label: 'Surveys Home', icon: Home, id: 'home' },
    { href: '/surveys/new/', label: 'Create Survey', icon: PlusCircle, id: 'new-survey' },
    { href: '/surveys/responses/', label: 'All Responses', icon: FileText, id: 'responses' },
    { href: '/surveys/analytics/', label: 'Analytics', icon: BarChart3, id: 'analytics' },
    { href: '/surveys/settings/', label: 'Settings', icon: Settings, id: 'settings' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Views</h2>
        <nav className="space-y-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => handleViewChange(view.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                view.active
                  ? 'bg-[#4a154b] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{view.label}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                view.active ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {view.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                activePage === action.id
                  ? 'bg-[#4a154b]/10 text-[#4a154b] font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Survey Types */}
      <div className="p-4 border-t border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Survey Types</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            CSAT - Customer Satisfaction
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            NPS - Net Promoter Score
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            Agent Performance
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Resolution Quality
          </div>
        </div>
      </div>
    </aside>
  )
}
