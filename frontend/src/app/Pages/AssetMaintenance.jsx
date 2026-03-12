import React from 'react'
import { Head, Link } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import AssetSidebar from '../components/AssetSidebar'
import { THEME } from '../constants/theme'

const maintenanceTypeColors = {
  preventive: 'bg-blue-100 text-blue-800',
  corrective: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
  inspection: 'bg-purple-100 text-purple-800',
  upgrade: 'bg-green-100 text-green-800',
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default function AssetMaintenance({ upcoming = [], logs = [], sidebar = { views: [] } }) {
  return (
    <>
      <Head title="Asset Maintenance" />
      <AppShell active="assets">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          <AssetSidebar views={sidebar.views} activePage="maintenance" />
          <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/assets/" className="text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-xl font-semibold text-gray-800">Asset Maintenance</h1>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Upcoming Maintenance */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Upcoming Maintenance</h2>
                <p className="text-sm text-gray-500 mt-1">Scheduled maintenance tasks that are due soon</p>
              </div>
              {upcoming.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p className="mt-2">No upcoming maintenance scheduled</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {upcoming.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#4a154b]/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#4a154b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <Link href={`/assets/${item.asset.id}/`} className="text-xs text-[#4a154b] hover:underline">
                            {item.asset.asset_id} - {item.asset.name}
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{item.frequency_display}</span>
                        <span className="text-sm font-medium text-gray-900">
                          Due: {new Date(item.next_due).toLocaleDateString()}
                        </span>
                        {item.vendor && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {item.vendor}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Maintenance Logs */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Maintenance Logs</h2>
                <p className="text-sm text-gray-500 mt-1">History of maintenance activities</p>
              </div>
              {logs.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p>No maintenance logs recorded yet</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maintenance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{log.title}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/assets/${log.asset.id}/`} className="text-sm text-[#4a154b] hover:underline">
                            {log.asset.asset_id}
                          </Link>
                          <p className="text-xs text-gray-500">{log.asset.name}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${maintenanceTypeColors[log.maintenance_type] || 'bg-gray-100 text-gray-800'}`}>
                            {log.maintenance_type_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[log.status] || 'bg-gray-100 text-gray-800'}`}>
                            {log.status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.scheduled_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.completed_at ? new Date(log.completed_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.performed_by || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
        </div>
      </AppShell>
    </>
  )
}

