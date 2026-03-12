import React, { useState } from 'react'
import { Head, useForm, Link, router } from '@inertiajs/react'
import toast from 'react-hot-toast'
import AppShell from '../components/AppShell'
import AssetSidebar from '../components/AssetSidebar'
import Select from '../components/SearchableSelect'
import { THEME } from '../constants/theme'

export default function AssetForm({
  mode = 'add',
  asset = null,
  categories = [],
  locations = [],
  vendors = [],
  departments = [],
  users = [],
  statuses = [],
  conditions = [],
  errors: serverErrors = {},
  sidebar = { views: [] }
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const { data, setData, post, processing, errors } = useForm({
    name: asset?.name || '',
    description: asset?.description || '',
    category: asset?.category?.id || '',
    asset_type: asset?.asset_type || '',
    serial_number: asset?.serial_number || '',
    tag_number: asset?.tag_number || '',
    barcode: asset?.barcode || '',
    assigned_user: asset?.assigned_user?.id || '',
    department: asset?.department?.id || '',
    location: asset?.location?.id || '',
    vendor: asset?.vendor?.id || '',
    status: asset?.status || 'in_stock',
    condition: asset?.condition || 'new',
    purchase_date: asset?.purchase_date || '',
    warranty_expiry_date: asset?.warranty_expiry_date || '',
    end_of_life_date: asset?.end_of_life_date || '',
    purchase_cost: asset?.purchase_cost || '',
    current_value: asset?.current_value || '',
    invoice_number: asset?.invoice_number || '',
    po_number: asset?.po_number || '',
    support_contract: asset?.support_contract || '',
    support_expiry_date: asset?.support_expiry_date || '',
    notes: asset?.notes || '',
    specifications: JSON.stringify(asset?.specifications || {}),
    tags: JSON.stringify(asset?.tags || []),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const url = mode === 'add' ? '/assets/new/' : `/assets/${asset.id}/edit/`
    const successMsg = mode === 'add' ? 'Asset created successfully!' : 'Asset updated successfully!'

    toast.promise(
      new Promise((resolve, reject) => {
        post(url, {
          headers: { 'X-CSRFToken': window.csrfToken },
          forceFormData: true,
          preserveScroll: true,
          onSuccess: () => {
            router.visit('/assets/')
            resolve()
          },
          onError: () => reject(),
        })
      }),
      {
        loading: mode === 'add' ? 'Creating asset...' : 'Updating asset...',
        success: successMsg,
        error: 'Operation failed',
      }
    )
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (currentStep === 1) {
      if (!data.name) {
        toast.error('Asset name is required')
        return
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = (e) => {
    e.preventDefault()
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const allErrors = { ...serverErrors, ...errors }

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Name, category, and identification' },
    { number: 2, title: 'Assignment', description: 'User, department, and location' },
    { number: 3, title: 'Lifecycle', description: 'Dates and warranty information' },
    { number: 4, title: 'Financial', description: 'Cost and contract details' },
  ]

  return (
    <>
      <Head title={mode === 'add' ? 'Add Asset' : 'Edit Asset'} />
      <AppShell active="assets">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          <AssetSidebar views={sidebar.views} currentView="" activePage={mode === 'add' ? 'new-asset' : 'edit-asset'} />
          <main className="flex-1 bg-gray-50">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <Link href="/assets/" className="text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-xl font-semibold text-gray-800">
                  {mode === 'add' ? 'Add New Asset' : `Edit Asset: ${asset?.asset_id}`}
                </h1>
              </div>
            </div>

            <div className="flex gap-0">
            {/* Vertical Step Indicators */}
            <div className="w-64 flex-shrink-0 border-r border-gray-200 p-6">
              <div className="sticky top-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">Steps</h3>
                <div className="space-y-0">
                  {steps.map((step, index) => (
                    <div key={step.number}>
                      {/* Step */}
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                          currentStep === step.number
                            ? 'bg-gray-900 text-white'
                            : currentStep > step.number
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                        }`}>
                          {currentStep > step.number ? '✓' : step.number}
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className={`text-sm font-medium ${
                            currentStep === step.number
                              ? 'text-gray-900'
                              : currentStep > step.number
                                ? 'text-green-600'
                                : 'text-gray-500'
                          }`}>
                            {step.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                        </div>
                      </div>

                      {/* Connector Line (except after last step) */}
                      {index < steps.length - 1 && (
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-8 flex justify-center">
                            <div className={`w-0.5 h-8 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 p-6">
              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="rounded-lg p-6">
                  {/* Step 1: Basic Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-lg font-medium text-gray-900 border-b pb-3">Basic Information</h2>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Asset Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="e.g., Dell Latitude 5520"
                          />
                          {allErrors.name && <p className="mt-1 text-sm text-red-600">{allErrors.name}</p>}
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Detailed description of the asset..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <Select
                            value={data.category}
                            onChange={(val) => setData('category', val)}
                            options={categories}
                            placeholder="Select category..."
                            searchable={true}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type / Model</label>
                          <input
                            type="text"
                            value={data.asset_type}
                            onChange={(e) => setData('asset_type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="e.g., Laptop, Server, Monitor"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                          <input
                            type="text"
                            value={data.serial_number}
                            onChange={(e) => setData('serial_number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Manufacturer serial number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag Number</label>
                          <input
                            type="text"
                            value={data.tag_number}
                            onChange={(e) => setData('tag_number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Internal tag number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Barcode / QR Code</label>
                          <input
                            type="text"
                            value={data.barcode}
                            onChange={(e) => setData('barcode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Barcode value"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Supplier</label>
                          <Select
                            value={data.vendor}
                            onChange={(val) => setData('vendor', val)}
                            options={vendors}
                            placeholder="Select vendor..."
                            searchable={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Assignment */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-lg font-medium text-gray-900 border-b pb-3">Assignment & Location</h2>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned User</label>
                          <Select
                            value={data.assigned_user}
                            onChange={(val) => setData('assigned_user', val)}
                            options={users}
                            placeholder="Unassigned"
                            searchable={true}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <Select
                            value={data.department}
                            onChange={(val) => setData('department', val)}
                            options={departments}
                            placeholder="Select department..."
                            searchable={true}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <Select
                            value={data.location}
                            onChange={(val) => setData('location', val)}
                            options={locations}
                            placeholder="Select location..."
                            searchable={true}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <Select
                            value={data.status}
                            onChange={(val) => setData('status', val)}
                            options={statuses}
                            displayKey="label"
                            valueKey="value"
                            placeholder="Select status..."
                            allowClear={false}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                          <Select
                            value={data.condition}
                            onChange={(val) => setData('condition', val)}
                            options={conditions}
                            displayKey="label"
                            valueKey="value"
                            placeholder="Select condition..."
                            allowClear={false}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Lifecycle */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-lg font-medium text-gray-900 border-b pb-3">Lifecycle & Warranty</h2>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                          <input
                            type="date"
                            value={data.purchase_date}
                            onChange={(e) => setData('purchase_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry Date</label>
                          <input
                            type="date"
                            value={data.warranty_expiry_date}
                            onChange={(e) => setData('warranty_expiry_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End of Life Date</label>
                          <input
                            type="date"
                            value={data.end_of_life_date}
                            onChange={(e) => setData('end_of_life_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Support Contract</label>
                          <input
                            type="text"
                            value={data.support_contract}
                            onChange={(e) => setData('support_contract', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Contract ID or reference"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Support Expiry Date</label>
                          <input
                            type="date"
                            value={data.support_expiry_date}
                            onChange={(e) => setData('support_expiry_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Financial */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <h2 className="text-lg font-medium text-gray-900 border-b pb-3">Financial Information</h2>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={data.purchase_cost}
                              onChange={(e) => setData('purchase_cost', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={data.current_value}
                              onChange={(e) => setData('current_value', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                          <input
                            type="text"
                            value={data.invoice_number}
                            onChange={(e) => setData('invoice_number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Invoice reference"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                          <input
                            type="text"
                            value={data.po_number}
                            onChange={(e) => setData('po_number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Purchase order number"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                          <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4a154b] focus:border-transparent"
                            placeholder="Additional notes about this asset..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        ← Back
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/assets/"
                      className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Link>
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className={`px-6 py-2 rounded-md text-sm font-medium ${THEME.button.primary}`}
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={processing}
                        className={`px-6 py-2 rounded-md text-sm font-medium ${THEME.button.primary} ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {processing ? 'Saving...' : (mode === 'add' ? 'Create Asset' : 'Update Asset')}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
          </main>
        </div>
      </AppShell>
    </>
  )
}

