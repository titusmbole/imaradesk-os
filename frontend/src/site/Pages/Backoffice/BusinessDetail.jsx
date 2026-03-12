import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import BackofficeLayout from './components/BackofficeLayout'
import { COLORS } from '../../../constants/theme'
import { securePost } from './utils/api'

function StatusBadge({ status }) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-gray-100 text-gray-800',
  }
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.cancelled}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

export default function BusinessDetail({ admin, business, subscription, usage, billing_history, packages, redirect, error }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  
  const [editData, setEditData] = useState({
    package_id: subscription?.package?.id || '',
    status: subscription?.status || 'trial',
    billing_cycle: subscription?.billing_cycle || 'monthly',
    discount_percent: subscription?.discount_percent || 0,
    notes: subscription?.notes || '',
  })

  React.useEffect(() => {
    if (redirect) {
      router.visit(redirect)
    }
  }, [redirect])

  if (redirect) return null

  const handleToggleStatus = async () => {
    setToggling(true)
    try {
      const { ok } = await securePost(`/backoffice/api/businesses/${business.schema_name}/toggle-status/`)
      if (ok) {
        router.reload()
      }
    } catch (e) {
      console.error('Toggle failed', e)
    }
    setToggling(false)
  }

  const handleSaveSubscription = async () => {
    setSaving(true)
    try {
      const { ok } = await securePost(`/backoffice/api/businesses/${business.schema_name}/subscription/`, editData)
      if (ok) {
        setEditing(false)
        router.reload()
      }
    } catch (e) {
      console.error('Save failed', e)
    }
    setSaving(false)
  }

  return (
    <>
      <Head title={`${business?.name || 'Business'} - Backoffice`} />
      <BackofficeLayout admin={admin}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/backoffice/businesses/" className="hover:text-gray-700">Businesses</Link>
          <span>/</span>
          <span className="text-gray-900">{business?.name}</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-600">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: business?.is_active ? COLORS.primary : '#9CA3AF' }}>
                {business?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{business?.name}</h1>
                <p className="text-gray-500">{business?.schema_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${business?.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {business?.is_active ? 'Active' : 'Inactive'}
              </div>
              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  business?.is_active
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                } disabled:opacity-50`}
              >
                {toggling ? 'Processing...' : business?.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Business Type</dt>
                  <dd className="text-gray-900 mt-1">{business?.business_type || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Organization Size</dt>
                  <dd className="text-gray-900 mt-1">{business?.org_size || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Created On</dt>
                  <dd className="text-gray-900 mt-1">
                    {business?.created_on ? new Date(business.created_on).toLocaleDateString() : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Description</dt>
                  <dd className="text-gray-900 mt-1">{business?.description || '-'}</dd>
                </div>
              </dl>

              {/* Domains */}
              {business?.domains?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Domains</h3>
                  <div className="flex flex-wrap gap-2">
                    {business.domains.map((d, i) => (
                      <span key={i} className={`px-3 py-1.5 rounded-lg text-sm ${d.is_primary ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {d.domain} {d.is_primary && '(Primary)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Registration Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Information</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Created By</dt>
                  <dd className="text-gray-900 mt-1">
                    {business?.created_by ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">{business.created_by.name}</p>
                          <p className="text-sm text-gray-500">{business.created_by.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Registration Date</dt>
                  <dd className="text-gray-900 mt-1">
                    {business?.registration?.timestamp ? (
                      new Date(business.registration.timestamp).toLocaleString()
                    ) : (
                      business?.created_on ? new Date(business.created_on).toLocaleDateString() : <span className="text-gray-400">N/A</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">IP Address</dt>
                  <dd className="text-gray-900 mt-1 font-mono text-sm">
                    {business?.registration?.ip || <span className="text-gray-400">N/A</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Location</dt>
                  <dd className="text-gray-900 mt-1">
                    {business?.registration?.location || <span className="text-gray-400">N/A</span>}
                  </dd>
                </div>
                {business?.registration?.country && (
                  <div>
                    <dt className="text-sm text-gray-500">Country</dt>
                    <dd className="text-gray-900 mt-1">{business.registration.country}</dd>
                  </div>
                )}
                {business?.registration?.region && (
                  <div>
                    <dt className="text-sm text-gray-500">Region</dt>
                    <dd className="text-gray-900 mt-1">{business.registration.region}</dd>
                  </div>
                )}
                {business?.registration?.city && (
                  <div>
                    <dt className="text-sm text-gray-500">City</dt>
                    <dd className="text-gray-900 mt-1">{business.registration.city}</dd>
                  </div>
                )}
                {business?.registration?.timezone && (
                  <div>
                    <dt className="text-sm text-gray-500">Timezone</dt>
                    <dd className="text-gray-900 mt-1">{business.registration.timezone}</dd>
                  </div>
                )}
              </dl>
              
              {/* User Agent */}
              {business?.registration?.user_agent && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <dt className="text-sm text-gray-500 mb-1">User Agent</dt>
                  <dd className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg font-mono break-all">
                    {business.registration.user_agent}
                  </dd>
                </div>
              )}
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
                {subscription && (
                  <button
                    onClick={() => setEditing(!editing)}
                    className="text-sm font-medium hover:underline"
                    style={{ color: COLORS.primary }}
                  >
                    {editing ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>

              {subscription ? (
                editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package</label>
                        <select
                          value={editData.package_id}
                          onChange={(e) => setEditData({ ...editData, package_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {packages?.map((pkg) => (
                            <option key={pkg.id} value={pkg.id}>{pkg.name} (${pkg.price_monthly}/mo)</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editData.status}
                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="trial">Trial</option>
                          <option value="active">Active</option>
                          <option value="past_due">Past Due</option>
                          <option value="suspended">Suspended</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                        <select
                          value={editData.billing_cycle}
                          onChange={(e) => setEditData({ ...editData, billing_cycle: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                        <input
                          type="number"
                          value={editData.discount_percent}
                          onChange={(e) => setEditData({ ...editData, discount_percent: e.target.value })}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={editData.notes}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSubscription}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                        style={{ backgroundColor: COLORS.primary }}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">Package</dt>
                      <dd className="text-gray-900 mt-1 font-medium">{subscription.package?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Status</dt>
                      <dd className="mt-1"><StatusBadge status={subscription.status} /></dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Billing Cycle</dt>
                      <dd className="text-gray-900 mt-1 capitalize">{subscription.billing_cycle}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Price</dt>
                      <dd className="text-gray-900 mt-1">${subscription.current_price}/{subscription.billing_cycle === 'yearly' ? 'yr' : 'mo'}</dd>
                    </div>
                    {subscription.trial_ends_at && (
                      <div>
                        <dt className="text-sm text-gray-500">Trial Ends</dt>
                        <dd className="text-gray-900 mt-1">{new Date(subscription.trial_ends_at).toLocaleDateString()}</dd>
                      </div>
                    )}
                    {subscription.current_period_end && (
                      <div>
                        <dt className="text-sm text-gray-500">Period Ends</dt>
                        <dd className="text-gray-900 mt-1">{new Date(subscription.current_period_end).toLocaleDateString()}</dd>
                      </div>
                    )}
                  </dl>
                )
              ) : (
                <p className="text-gray-500">No subscription found</p>
              )}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
              </div>
              {billing_history?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {billing_history.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(record.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                            {record.type?.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            ${record.amount} {record.currency}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={record.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">No billing history</div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Usage Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Agents</span>
                    <span className="font-medium">{usage?.agent_count || 0} / {subscription?.package?.max_agents || '∞'}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${subscription?.package?.max_agents ? Math.min(100, (usage?.agent_count / subscription.package.max_agents) * 100) : 0}%`,
                        backgroundColor: COLORS.primary 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Customers</span>
                    <span className="font-medium">{usage?.customer_count || 0} / {subscription?.package?.max_customers || '∞'}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${subscription?.package?.max_customers ? Math.min(100, (usage?.customer_count / subscription.package.max_customers) * 100) : 0}%`,
                        backgroundColor: COLORS.primary 
                      }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Tickets</span>
                    <span className="font-medium text-gray-900">{usage?.ticket_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button 
                  onClick={handleToggleStatus}
                  disabled={toggling}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-left flex items-center gap-3 ${
                    business?.is_active 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {business?.is_active ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  {business?.is_active ? 'Deactivate Business' : 'Activate Business'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </BackofficeLayout>
    </>
  )
}
