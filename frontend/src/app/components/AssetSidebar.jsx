import React from 'react'
import { Link, router } from '@inertiajs/react'

export default function AssetSidebar({ views = [], currentView = 'all', activePage = 'assets' }) {
  const handleViewChange = (viewId) => {
    router.get('/assets/', { view: viewId }, { preserveState: true })
  }

  const quickActions = [
    { href: '/assets/', label: 'Assets Home', icon: '🏠', id: 'home' },
    { href: '/assets/new/', label: 'New Asset', icon: '➕', id: 'new-asset' },
    { href: '/assets/categories/', label: 'Manage Categories', icon: '📁', id: 'categories' },
    { href: '/assets/locations/', label: 'Manage Locations', icon: '📍', id: 'locations' },
    { href: '/assets/vendors/', label: 'Manage Vendors', icon: '🏢', id: 'vendors' },
    { href: '/assets/maintenance/', label: 'Maintenance', icon: '🔧', id: 'maintenance' },
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
              className={`block px-3 py-2 text-sm rounded-md ${
                activePage === action.id
                  ? 'bg-[#4a154b]/10 text-[#4a154b] font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {action.icon} {action.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
