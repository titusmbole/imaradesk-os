import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import BackofficeLayout from './components/BackofficeLayout'
import { COLORS } from '../../../constants/theme'
import { securePost } from './utils/api'

function BusinessCard({ business, onToggleStatus }) {
  const [toggling, setToggling] = useState(false)
  
  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    trial: 'bg-blue-100 text-blue-800 border-blue-200',
    past_due: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const handleToggle = async () => {
    setToggling(true)
    await onToggleStatus(business.schema_name)
    setToggling(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold shrink-0" style={{ backgroundColor: business.is_active ? COLORS.primary : '#9CA3AF' }}>
            {business.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{business.name}</h3>
            <p className="text-xs text-gray-500 truncate">{business.primary_domain || business.schema_name}</p>
          </div>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border ${business.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
          {business.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Subscription info */}
      {business.subscription ? (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium" style={{ backgroundColor: `${COLORS.primary}10`, color: COLORS.primary }}>
            {business.subscription.package}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[business.subscription.status] || statusColors.cancelled}`}>
            {business.subscription.status}
          </span>
        </div>
      ) : (
        <div className="mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
            No subscription
          </span>
        </div>
      )}

      {/* Created by - Admin info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Created by</p>
        {business.created_by ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{business.created_by.name}</p>
              <p className="text-xs text-gray-500 truncate">{business.created_by.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">N/A</p>
        )}
        
        {/* Location info */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{business.registration?.location || 'N/A'}</span>
          </div>
          {business.registration?.ip && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="font-mono">{business.registration.ip}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-lg font-bold text-gray-900">{business.agent_count}</p>
          <p className="text-xs text-gray-500">Agents</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-lg font-bold text-gray-900">{business.customer_count}</p>
          <p className="text-xs text-gray-500">Customers</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-lg font-bold text-gray-900">{business.ticket_count}</p>
          <p className="text-xs text-gray-500">Tickets</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link 
          href={`/backoffice/businesses/${business.schema_name}/`}
          className="flex-1 px-3 py-2 text-sm font-medium text-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View Details
        </Link>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            business.is_active 
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          } disabled:opacity-50`}
        >
          {toggling ? '...' : business.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

export default function Businesses({ admin, businesses, packages, filters, redirect }) {
  const [search, setSearch] = useState(filters?.search || '')
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all')
  const [packageFilter, setPackageFilter] = useState(filters?.package || '')
  const [businessList, setBusinessList] = useState(businesses || [])

  React.useEffect(() => {
    if (redirect) {
      router.visit(redirect)
    }
  }, [redirect])

  if (redirect) return null

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (packageFilter) params.set('package', packageFilter)
    router.visit(`/backoffice/businesses/?${params.toString()}`)
  }

  const handleToggleStatus = async (schemaName) => {
    try {
      const { ok, data } = await securePost(`/backoffice/api/businesses/${schemaName}/toggle-status/`)
      
      if (ok) {
        setBusinessList(prev => prev.map(b => 
          b.schema_name === schemaName 
            ? { ...b, is_active: data.is_active }
            : b
        ))
      }
    } catch (e) {
      console.error('Toggle failed', e)
    }
  }

  const activeCount = businessList.filter(b => b.is_active).length
  const inactiveCount = businessList.filter(b => !b.is_active).length

  return (
    <>
      <Head title="Businesses - Backoffice" />
      <BackofficeLayout admin={admin}>
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Businesses</h1>
            <p className="text-gray-500 mt-1">
              {businessList.length} total ({activeCount} active, {inactiveCount} inactive)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search businesses..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Packages</option>
              {packages?.map((pkg) => (
                <option key={pkg.slug} value={pkg.slug}>{pkg.name}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="px-6 py-2 text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: COLORS.primary }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Business grid */}
        {businessList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {businessList.map((business) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No businesses found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </BackofficeLayout>
    </>
  )
}
