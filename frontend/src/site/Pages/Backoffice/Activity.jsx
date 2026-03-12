import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import BackofficeLayout from './components/BackofficeLayout'
import { COLORS } from '../../../constants/theme'

const ACTION_ICONS = {
  create: { icon: '➕', bg: 'bg-green-100', text: 'text-green-700' },
  update: { icon: '✏️', bg: 'bg-blue-100', text: 'text-blue-700' },
  delete: { icon: '🗑️', bg: 'bg-red-100', text: 'text-red-700' },
  activate: { icon: '✅', bg: 'bg-green-100', text: 'text-green-700' },
  deactivate: { icon: '⛔', bg: 'bg-red-100', text: 'text-red-700' },
  login: { icon: '🔐', bg: 'bg-purple-100', text: 'text-purple-700' },
  logout: { icon: '🚪', bg: 'bg-gray-100', text: 'text-gray-700' },
}

function ActivityCard({ activity }) {
  const action = ACTION_ICONS[activity.action_type] || { icon: '📋', bg: 'bg-gray-100', text: 'text-gray-700' }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center text-lg shrink-0`}>
          {action.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{activity.admin_name}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${action.bg} ${action.text}`}>
              {activity.action_type}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {activity.target_type}: <span className="font-medium">{activity.target_name || activity.target_id || '-'}</span>
          </p>
          {activity.description && (
            <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-400">
            <span>{new Date(activity.created_at).toLocaleString()}</span>
            {activity.ip_address && <span>IP: {activity.ip_address}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ activity }) {
  const action = ACTION_ICONS[activity.action_type] || { icon: '📋', bg: 'bg-gray-100', text: 'text-gray-700' }
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center text-sm shrink-0`}>
            {action.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">{activity.admin_name}</p>
            <p className="text-xs text-gray-500">{activity.admin_email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${action.bg} ${action.text}`}>
          {activity.action_type}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {activity.target_type}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {activity.target_name || activity.target_id || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
        {activity.ip_address || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(activity.created_at).toLocaleDateString()}
      </td>
    </tr>
  )
}

export default function Activity({ admin, activities, admins, filters, action_types, redirect }) {
  const [actionFilter, setActionFilter] = useState(filters?.action || '')
  const [adminFilter, setAdminFilter] = useState(filters?.admin || '')
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'

  React.useEffect(() => {
    if (redirect) {
      router.visit(redirect)
    }
  }, [redirect])

  if (redirect) return null

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (actionFilter) params.set('action', actionFilter)
    if (adminFilter) params.set('admin', adminFilter)
    router.visit(`/backoffice/activity/?${params.toString()}`)
  }

  return (
    <>
      <Head title="Activity Log - Backoffice" />
      <BackofficeLayout admin={admin}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-500 mt-1">Track admin actions and changes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Card view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Table view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Actions</option>
              {action_types?.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Admins</option>
              {admins?.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <button
              onClick={handleFilter}
              className="px-6 py-2 text-white font-medium rounded-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              Filter
            </button>
          </div>
        </div>

        {/* Activity list */}
        {activities?.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activities.map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No activity yet</h3>
            <p className="text-gray-500">Activity logs will appear here</p>
          </div>
        )}
      </BackofficeLayout>
    </>
  )
}
