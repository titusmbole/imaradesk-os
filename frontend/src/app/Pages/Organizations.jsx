import React, { useState, useEffect } from 'react'
import { Head, Link, router, useForm } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import Drawer, { DrawerBody, DrawerFooter } from '../components/Drawer'
import { THEME } from '../constants/theme'

export default function Organizations({ organizations = [], errors: serverErrors = {} }) {
  const [loading, setLoading] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('create') // 'create' or 'edit'
  const [editingOrg, setEditingOrg] = useState(null)

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    domain: '',
    plan: 'basic',
  })

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleFinish = () => setLoading(false)
    
    const removeStartListener = router.on('start', handleStart)
    const removeFinishListener = router.on('finish', handleFinish)
    
    return () => {
      removeStartListener()
      removeFinishListener()
    }
  }, [])

  const openCreateDrawer = () => {
    reset()
    setDrawerMode('create')
    setEditingOrg(null)
    setDrawerOpen(true)
  }

  const openEditDrawer = (org) => {
    setData({
      name: org.name,
      domain: org.domain,
      plan: org.plan_value,
    })
    setDrawerMode('edit')
    setEditingOrg(org)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    reset()
    setEditingOrg(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const url = drawerMode === 'create' ? '/organizations/new/' : `/organizations/${editingOrg.id}/edit/`
    post(url, {
      headers: {
        'X-CSRFToken': window.csrfToken,
      },
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        closeDrawer()
      },
    })
  }

  const handleDelete = (orgId) => {
    if (!confirm('Are you sure you want to delete this organization? This will affect all associated users.')) return
    router.post(`/organizations/${orgId}/delete/`, {}, {
      headers: {
        'X-CSRFToken': window.csrfToken,
      },
      preserveScroll: true,
    })
  }

  return (
    <>
      <Head title="Organizations" />
      <AppShell active="building">
        <main className="flex-1 bg-gray-50">
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Organizations</h1>
            <div className="text-sm text-gray-600">
              {loading ? 'Loading…' : `${organizations.length} organization${organizations.length === 1 ? '' : 's'}`}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={`sk-${i}`} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
                      <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : organizations.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-500 mb-4">No organizations found.</p>
                <button onClick={openCreateDrawer} className={`${THEME.button.primary} px-4 py-2 rounded-lg`}>
                  Create your first organization
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => (
                  <div key={org.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4a154b] to-[#825084] flex items-center justify-center text-white font-bold text-xl">
                        {org.name.charAt(0)}
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-[#e6f0f1] text-[#4a154b]">
                        {org.plan}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{org.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{org.domain}.safaridesk.io</p>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Members</span>
                        <span className="font-medium text-gray-900">{org.members}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tickets</span>
                        <span className="font-medium text-gray-900">{org.tickets}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditDrawer(org)}
                        className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(org.id)}
                        className="px-3 py-2 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Drawer */}
        <Drawer
          isOpen={drawerOpen}
          onClose={closeDrawer}
          title={drawerMode === 'create' ? 'Add Organization' : `Edit ${editingOrg?.name || 'Organization'}`}
        >
          <DrawerBody>
            <form id="org-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors?.name || serverErrors?.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Acme Corporation"
                />
                {(errors?.name || serverErrors?.name) && (
                  <p className="mt-1 text-sm text-red-600">{errors?.name || serverErrors?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={data.domain}
                    onChange={(e) => setData('domain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors?.domain || serverErrors?.domain ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="acme"
                    disabled={drawerMode === 'edit'}
                  />
                  <span className="text-gray-500 font-medium">.safaridesk.io</span>
                </div>
                {(errors?.domain || serverErrors?.domain) && (
                  <p className="mt-1 text-sm text-red-600">{errors?.domain || serverErrors?.domain}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={data.plan}
                  onChange={(e) => setData('plan', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                >
                  <option value="basic">Basic</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </form>
          </DrawerBody>
          <DrawerFooter>
            <button
              type="button"
              onClick={closeDrawer}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={processing}
              className="px-4 py-2 bg-[#4a154b] text-white rounded-lg hover:bg-[#5a2a5b] disabled:bg-[#9a6a9b]"
            >
              {processing ? 'Saving…' : drawerMode === 'create' ? 'Create Organization' : 'Save Changes'}
            </button>
          </DrawerFooter>
        </Drawer>

        {/* Floating Action Button */}
        <button onClick={openCreateDrawer} className={THEME.fab} title="Add Organization">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </AppShell>
    </>
  )
}
