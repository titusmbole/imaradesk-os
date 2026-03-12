import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import toast from 'react-hot-toast'
import AppShell from '../components/AppShell'
import AssetSidebar from '../components/AssetSidebar'
import { THEME } from '../constants/theme'

const statusColors = {
  in_stock: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  in_repair: 'bg-yellow-100 text-yellow-800',
  in_maintenance: 'bg-orange-100 text-orange-800',
  retired: 'bg-gray-100 text-gray-800',
  lost: 'bg-red-100 text-red-800',
  disposed: 'bg-gray-200 text-gray-600',
}

const conditionColors = {
  new: 'bg-green-100 text-green-800',
  excellent: 'bg-green-50 text-green-700',
  good: 'bg-blue-100 text-blue-800',
  fair: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-orange-100 text-orange-800',
  damaged: 'bg-red-100 text-red-800',
}

export default function AssetView({
  asset,
  tickets = [],
  maintenance = [],
  assignment_history = [],
  activity_log = [],
  attachments = [],
  sidebar = { views: [] },
}) {
  const [activeTab, setActiveTab] = useState('overview')

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      router.post(`/assets/${asset.id}/delete/`, {}, {
        headers: { 'X-CSRFToken': window.csrfToken },
        onSuccess: () => {
          toast.success('Asset deleted successfully')
          router.visit('/assets/')
        }
      })
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tickets', label: 'Tickets', count: tickets.length },
    { id: 'maintenance', label: 'Maintenance', count: maintenance.length },
    { id: 'history', label: 'History' },
    { id: 'attachments', label: 'Attachments', count: attachments.length },
  ]

  return (
    <>
      <Head title={`Asset: ${asset.asset_id}`} />
      <AppShell active="assets">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          <AssetSidebar views={sidebar.views} currentView="" activePage="view" />
          <main className="flex-1 bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/assets/" className="text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </Link>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-xl font-semibold text-gray-900">{asset.name}</h1>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[asset.status]}`}>
                        {asset.status_display}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${conditionColors[asset.condition]}`}>
                        {asset.condition_display}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{asset.asset_id}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/assets/${asset.id}/edit/`}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                  >
                    Edit Asset
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-md text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-[#4a154b] text-[#4a154b]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="col-span-2 space-y-6">
                  {/* Basic Info Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Asset ID</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.asset_id}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.category?.name || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.serial_number || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Tag Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.tag_number || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Type / Model</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.asset_type || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.vendor?.name || '-'}</dd>
                      </div>
                    </dl>
                    {asset.description && (
                      <div className="mt-4 pt-4 border-t">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.description}</dd>
                      </div>
                    )}
                  </div>

                  {/* Financial Info Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h2>
                    <dl className="grid grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Purchase Cost</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {asset.purchase_cost ? `$${parseFloat(asset.purchase_cost).toLocaleString()}` : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Current Value</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {asset.current_value ? `$${parseFloat(asset.current_value).toLocaleString()}` : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Invoice Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.invoice_number || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">PO Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.po_number || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Assignment Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Assignment</h2>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                        <dd className="mt-1">
                          {asset.assigned_user ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#4a154b] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {asset.assigned_user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{asset.assigned_user.name}</p>
                                <p className="text-xs text-gray-500">{asset.assigned_user.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Department</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.department?.name || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.location?.name || '-'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Warranty Card */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Lifecycle & Warranty</h2>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.purchase_date || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Warranty Status</dt>
                        <dd className="mt-1">
                          {asset.warranty_expiry_date ? (
                            asset.is_warranty_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active - {asset.days_until_warranty_expiry} days left
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Expired
                              </span>
                            )
                          ) : (
                            <span className="text-sm text-gray-500">Not specified</span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Warranty Expiry</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.warranty_expiry_date || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">End of Life</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.end_of_life_date || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Support Contract</dt>
                        <dd className="mt-1 text-sm text-gray-900">{asset.support_contract || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Related Tickets</h2>
                </div>
                {tickets.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p>No tickets linked to this asset</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/tickets/${ticket.id}/`} className="text-[#4a154b] hover:underline">
                              {ticket.ticket_number}
                            </Link>
                          </td>
                          <td className="px-6 py-4">{ticket.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">
                              {ticket.status_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Maintenance Tab */}
            {activeTab === 'maintenance' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Maintenance History</h2>
                </div>
                {maintenance.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p>No maintenance records for this asset</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {maintenance.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{m.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{m.maintenance_type_display}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">
                              {m.status_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(m.scheduled_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {m.completed_at ? new Date(m.completed_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Assignment History */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Assignment History</h2>
                  </div>
                  {assignment_history.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <p>No assignment history</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {assignment_history.map((a) => (
                        <div key={a.id} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {a.assigned_to ? `Assigned to ${a.assigned_to.name}` : 'Unassigned'}
                            </p>
                            {a.assigned_by && (
                              <p className="text-xs text-gray-500">by {a.assigned_by.name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(a.assigned_at).toLocaleString()}
                            </p>
                            {a.returned_at && (
                              <p className="text-xs text-gray-400">
                                Returned: {new Date(a.returned_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Log */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Activity Log</h2>
                  </div>
                  {activity_log.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      <p>No activity recorded</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {activity_log.map((act) => (
                        <div key={act.id} className="p-4 flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{act.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {act.actor?.name || 'System'} • {new Date(act.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === 'attachments' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
                  <button className={`px-4 py-2 rounded-md text-sm font-medium ${THEME.button.secondary}`}>
                    Upload File
                  </button>
                </div>
                {attachments.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2">No attachments</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {attachments.map((att) => (
                      <div key={att.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{att.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {att.uploaded_by} • {new Date(att.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={att.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#4a154b] hover:underline text-sm"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        </div>
      </AppShell>
    </>
  )
}

