import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
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

export default function Assets({
  assets = [],
  sidebar = { views: [] },
  filters = {},
  pagination = {},
  currentView = 'all'
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    router.get('/assets/', {
      view: currentView,
      search,
      status: statusFilter,
      category: categoryFilter
    }, { preserveState: true })
  }

  return (
    <>
      <Head title="Assets" />
      <AppShell active="assets">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <AssetSidebar views={sidebar.views} currentView={currentView} activePage="assets" />

          {/* Main Content */}
          <main className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-800">Assets</h1>
                <Link
                  href="/assets/new/"
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Asset
                </Link>
              </div>

              {/* Search and Filters */}
              <form onSubmit={handleSearch} className="mt-4 flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, asset ID, serial number..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  {filters.statuses?.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {filters.categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                >
                  Search
                </button>
              </form>
            </div>

            {/* Assets Table */}
            <div className="p-6">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warranty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assets.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <p className="mt-2 text-sm">No assets found</p>
                          <Link href="/assets/new/" className={`mt-4 inline-flex items-center px-4 py-2 rounded-md text-sm ${THEME.button.primary}`}>
                            Add your first asset
                          </Link>
                        </td>
                      </tr>
                    ) : (
                      assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.visit(`/assets/${asset.id}/`)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                              <div className="text-sm text-gray-500">{asset.asset_id}</div>
                              {asset.serial_number && (
                                <div className="text-xs text-gray-400">S/N: {asset.serial_number}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{asset.category?.name || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {asset.assigned_user ? (
                              <div>
                                <div className="text-sm text-gray-900">{asset.assigned_user.name}</div>
                                <div className="text-xs text-gray-500">{asset.assigned_user.email}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{asset.location?.name || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[asset.status] || 'bg-gray-100 text-gray-800'}`}>
                              {asset.status_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${conditionColors[asset.condition] || 'bg-gray-100 text-gray-800'}`}>
                              {asset.condition_display}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {asset.warranty_expiry_date ? (
                              <div>
                                {asset.is_warranty_active ? (
                                  <span className="text-sm text-green-600">
                                    {asset.days_until_warranty_expiry} days left
                                  </span>
                                ) : (
                                  <span className="text-sm text-red-600">Expired</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/assets/${asset.id}/edit/`}
                              className="text-[#4a154b] hover:text-[#5a235c] mr-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/assets/${asset.id}/`}
                              className="text-gray-600 hover:text-gray-900"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing page {pagination.current_page} of {pagination.total_pages} ({pagination.total_count} total)
                      </div>
                      <div className="flex gap-2">
                        {pagination.has_previous && (
                          <button
                            onClick={() => router.get('/assets/', { view: currentView, page: pagination.current_page - 1 })}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                          >
                            Previous
                          </button>
                        )}
                        {pagination.has_next && (
                          <button
                            onClick={() => router.get('/assets/', { view: currentView, page: pagination.current_page + 1 })}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                          >
                            Next
                          </button>
                        )}
                      </div>
                    </div>
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

