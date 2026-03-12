import React from 'react'
import { Head, Link, router } from '@inertiajs/react'
import BackofficeLayout from './components/BackofficeLayout'
import { COLORS } from '../../../constants/theme'

function StatCard({ title, value, icon, trend, trendUp, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {trendUp ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
              {trendUp ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-lg bg-purple-50" style={{ backgroundColor: `${COLORS.primary}10` }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function RecentBusinessRow({ business }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    past_due: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: COLORS.primary }}>
            {business.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">{business.name}</p>
            <p className="text-xs text-gray-500 truncate">{business.schema_name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-sm text-gray-600">{business.package}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[business.status] || statusColors.cancelled}`}>
          {business.status}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-sm text-gray-500">{new Date(business.created_on).toLocaleDateString()}</span>
      </td>
      <td className="px-4 py-3">
        <Link 
          href={`/backoffice/businesses/${business.schema_name}/`}
          className="text-sm font-medium hover:underline"
          style={{ color: COLORS.primary }}
        >
          View
        </Link>
      </td>
    </tr>
  )
}

function ActivityItem({ activity }) {
  const actionIcons = {
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    activate: '✅',
    deactivate: '⛔',
    login: '🔐',
    logout: '🚪',
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="text-lg">{actionIcons[activity.action_type] || '📋'}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{activity.admin_name}</span>
          {' '}{activity.action_type}{' '}
          <span className="font-medium">{activity.target_name || activity.target_type}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date(activity.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default function Dashboard({ admin, stats, recent_businesses, package_distribution, recent_activity, redirect }) {
  // Handle redirect from backend
  React.useEffect(() => {
    if (redirect) {
      router.visit(redirect)
    }
  }, [redirect])

  if (redirect) return null

  return (
    <>
      <Head title="Dashboard - Backoffice" />
      <BackofficeLayout admin={admin}>
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your platform metrics</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Businesses"
            value={stats.total_businesses}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            subtitle={`${stats.active_businesses} active`}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.active_subscriptions}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            subtitle={`${stats.trial_subscriptions} on trial`}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthly_revenue.toLocaleString()}`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={stats.revenue_growth?.toFixed(1)}
            trendUp={stats.revenue_growth > 0}
          />
          <StatCard
            title="Inactive Businesses"
            value={stats.inactive_businesses}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: COLORS.primary }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }
          />
        </div>

        {/* Charts and tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Package distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Package Distribution</h3>
            {package_distribution?.length > 0 ? (
              <div className="space-y-3">
                {package_distribution.map((pkg, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{pkg.name}</span>
                      <span className="font-medium text-gray-900">{pkg.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.max(5, (pkg.count / (stats.active_subscriptions + stats.trial_subscriptions || 1)) * 100)}%`,
                          backgroundColor: COLORS.primary 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No packages yet</p>
            )}
          </div>

          {/* Recent businesses */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Businesses</h3>
              <Link 
                href="/backoffice/businesses/"
                className="text-sm font-medium hover:underline"
                style={{ color: COLORS.primary }}
              >
                View all
              </Link>
            </div>
            {recent_businesses?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Package</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Created</th>
                      <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recent_businesses.map((business) => (
                      <RecentBusinessRow key={business.id} business={business} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">No businesses yet</div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <Link 
              href="/backoffice/activity/"
              className="text-sm font-medium hover:underline"
              style={{ color: COLORS.primary }}
            >
              View all
            </Link>
          </div>
          {recent_activity?.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recent_activity.slice(0, 5).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>
      </BackofficeLayout>
    </>
  )
}
