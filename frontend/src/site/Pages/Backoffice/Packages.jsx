import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import BackofficeLayout from './components/BackofficeLayout'
import { COLORS } from '../../../constants/theme'
import { securePost } from './utils/api'

function PackageCard({ pkg, canEdit, onEdit }) {
  return (
    <div className={`bg-white rounded-xl border-2 p-4 sm:p-6 relative ${pkg.is_featured ? 'border-purple-300' : 'border-gray-200'}`}>
      {pkg.is_featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: COLORS.primary }}>
          {pkg.badge_text || 'Most Popular'}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{pkg.description || 'No description'}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {pkg.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">${pkg.price_monthly}</span>
          <span className="text-gray-500">/mo</span>
        </div>
        <p className="text-sm text-gray-500">${pkg.price_yearly}/year</p>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Max Agents</span>
          <span className="font-medium">{pkg.max_agents}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Max Customers</span>
          <span className="font-medium">{pkg.max_customers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tickets/Month</span>
          <span className="font-medium">{pkg.max_tickets_per_month}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Storage</span>
          <span className="font-medium">{pkg.storage_limit_gb} GB</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-500">{pkg.subscription_count} subscriptions</span>
        {canEdit && (
          <button
            onClick={() => onEdit(pkg)}
            className="text-sm font-medium hover:underline"
            style={{ color: COLORS.primary }}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

function PackageModal({ pkg, isNew, onClose, onSave }) {
  const [data, setData] = useState(pkg || {
    name: '',
    slug: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    max_agents: 5,
    max_customers: 100,
    max_tickets_per_month: 500,
    storage_limit_gb: 5,
    is_active: true,
    is_featured: false,
    badge_text: '',
    display_order: 0,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(data, isNew)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isNew ? 'Create Package' : 'Edit Package'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => setData({ ...data, slug: e.target.value })}
                required
                disabled={!isNew}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price ($)</label>
              <input
                type="number"
                value={data.price_monthly}
                onChange={(e) => setData({ ...data, price_monthly: e.target.value })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Price ($)</label>
              <input
                type="number"
                value={data.price_yearly}
                onChange={(e) => setData({ ...data, price_yearly: e.target.value })}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Agents</label>
              <input
                type="number"
                value={data.max_agents}
                onChange={(e) => setData({ ...data, max_agents: e.target.value })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Customers</label>
              <input
                type="number"
                value={data.max_customers}
                onChange={(e) => setData({ ...data, max_customers: e.target.value })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tickets/Mo</label>
              <input
                type="number"
                value={data.max_tickets_per_month}
                onChange={(e) => setData({ ...data, max_tickets_per_month: e.target.value })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage (GB)</label>
              <input
                type="number"
                value={data.storage_limit_gb}
                onChange={(e) => setData({ ...data, storage_limit_gb: e.target.value })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
              <input
                type="text"
                value={data.badge_text}
                onChange={(e) => setData({ ...data, badge_text: e.target.value })}
                placeholder="e.g., Most Popular"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={data.display_order}
                onChange={(e) => setData({ ...data, display_order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData({ ...data, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_featured}
                onChange={(e) => setData({ ...data, is_featured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary }}
            >
              {saving ? 'Saving...' : isNew ? 'Create Package' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Packages({ admin, packages: initialPackages, redirect }) {
  const [packages, setPackages] = useState(initialPackages || [])
  const [editingPackage, setEditingPackage] = useState(null)
  const [isNew, setIsNew] = useState(false)

  React.useEffect(() => {
    if (redirect) {
      router.visit(redirect)
    }
  }, [redirect])

  if (redirect) return null

  const canEdit = admin?.can_manage_packages || admin?.is_superadmin

  const handleSave = async (data, isNewPackage) => {
    try {
      const url = isNewPackage 
        ? '/backoffice/api/packages/'
        : `/backoffice/api/packages/${data.id}/`
      
      const { ok } = await securePost(url, data)

      if (ok) {
        setEditingPackage(null)
        router.reload()
      }
    } catch (e) {
      console.error('Save failed', e)
    }
  }

  return (
    <>
      <Head title="Packages - Backoffice" />
      <BackofficeLayout admin={admin}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Packages</h1>
            <p className="text-gray-500 mt-1">Manage subscription packages and pricing</p>
          </div>
          {canEdit && (
            <button
              onClick={() => { setIsNew(true); setEditingPackage({}) }}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: COLORS.primary }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Package
            </button>
          )}
        </div>

        {/* Package grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard 
              key={pkg.id} 
              pkg={pkg} 
              canEdit={canEdit}
              onEdit={(p) => { setIsNew(false); setEditingPackage(p) }}
            />
          ))}
        </div>

        {packages.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No packages yet</h3>
            <p className="text-gray-500 mb-4">Create your first subscription package</p>
            {canEdit && (
              <button
                onClick={() => { setIsNew(true); setEditingPackage({}) }}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: COLORS.primary }}
              >
                Create Package
              </button>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingPackage && (
          <PackageModal
            pkg={editingPackage}
            isNew={isNew}
            onClose={() => setEditingPackage(null)}
            onSave={handleSave}
          />
        )}
      </BackofficeLayout>
    </>
  )
}
