import React, { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import BackofficeLayout from './components/BackofficeLayout'
import { COLORS } from '../../../constants/theme'
import { securePost } from './utils/api'

// Category colors
const CATEGORY_COLORS = {
  marketing: 'bg-purple-100 text-purple-700',
  announcement: 'bg-blue-100 text-blue-700',
  new_release: 'bg-green-100 text-green-700',
  newsletter: 'bg-teal-100 text-teal-700',
  tips: 'bg-yellow-100 text-yellow-700',
  security: 'bg-red-100 text-red-700',
  maintenance: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

function TemplateCard({ template }) {
  return (
    <Link
      href={`/backoffice/emails/templates/${template.id}/`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-500 truncate">{template.subject}</p>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${CATEGORY_COLORS[template.category] || CATEGORY_COLORS.other}`}>
          {template.category_display}
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2 py-1 rounded ${template.template_type === 'business' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>
          {template.template_type_display}
        </span>
        {template.is_default && (
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-600">Default</span>
        )}
      </div>
    </Link>
  )
}

function CampaignRow({ campaign }) {
  return (
    <Link
      href={`/backoffice/emails/campaigns/${campaign.id}/`}
      className="block hover:bg-gray-50 transition-colors"
    >
      <div className="px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{campaign.name}</p>
          <p className="text-sm text-gray-500 truncate">{campaign.template_name}</p>
        </div>
        <div className="text-sm text-gray-500">
          {campaign.target_type_display}
        </div>
        <div className="text-sm text-center">
          <span className="font-medium text-gray-900">{campaign.sent_count}</span>
          <span className="text-gray-400">/{campaign.total_recipients}</span>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_COLORS[campaign.status] || STATUS_COLORS.draft}`}>
          {campaign.status_display}
        </span>
        <div className="text-xs text-gray-400">
          {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : new Date(campaign.created_at).toLocaleDateString()}
        </div>
      </div>
    </Link>
  )
}

function NewTemplateModal({ isOpen, onClose, categories, templateTypes }) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    template_type: 'general',
    category: 'marketing',
    subject: '',
    preview_text: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const { ok, template_id } = await securePost('/backoffice/api/emails/templates/', formData)
      if (ok) {
        router.visit(`/backoffice/emails/templates/${template_id}/`)
      }
    } catch (err) {
      console.error('Failed to create template', err)
    }
    
    setSaving(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Template</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Product Update Announcement"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.template_type}
                  onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {templateTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Exciting New Features Just Landed!"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preview Text (optional)</label>
              <input
                type="text"
                value={formData.preview_text}
                onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Text shown in email inbox preview"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.name}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: COLORS.primary }}
              >
                {saving ? 'Creating...' : 'Create & Edit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function NewCampaignModal({ isOpen, onClose, templates, targetStats }) {
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)
  const [businesses, setBusinesses] = useState([])
  const [loadingBusinesses, setLoadingBusinesses] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    template_id: '',
    target_type: 'all',
    selected_businesses: [],
  })

  const fetchBusinesses = async () => {
    if (businesses.length > 0) return
    setLoadingBusinesses(true)
    try {
      const res = await fetch('/backoffice/api/emails/businesses/')
      const data = await res.json()
      setBusinesses(data.businesses || [])
    } catch (err) {
      console.error('Failed to load businesses', err)
    }
    setLoadingBusinesses(false)
  }

  const handleSubmit = async (sendNow = false) => {
    setSaving(true)
    
    try {
      const payload = { ...formData, send_now: sendNow }
      const { ok, message, campaign_id, sent_count, failed_count, status } = await securePost('/backoffice/api/emails/campaigns/', payload)
      if (ok) {
        if (sendNow) {
          alert(message || 'Campaign queued for sending!')
        }
        router.reload()
        onClose()
      }
    } catch (err) {
      console.error('Failed to create campaign', err)
    }
    
    setSaving(false)
  }

  const selectedTemplate = templates.find(t => t.id === parseInt(formData.template_id))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {step === 1 ? 'Create Campaign - Select Template' : 'Create Campaign - Choose Recipients'}
          </h2>
          
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., February Newsletter"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                  {templates.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.template_id === String(t.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        value={t.id}
                        checked={formData.template_id === String(t.id)}
                        onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{t.name}</p>
                        <p className="text-sm text-gray-500 truncate">{t.subject}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-1 rounded text-xs ${CATEGORY_COLORS[t.category]}`}>
                        {t.category_display}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (formData.template_id) {
                      setStep(2)
                      if (formData.target_type === 'selected') fetchBusinesses()
                    }
                  }}
                  disabled={!formData.template_id}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value="all"
                      checked={formData.target_type === 'all'}
                      onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">All Businesses</p>
                      <p className="text-sm text-gray-500">{targetStats.all} businesses</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value="active"
                      checked={formData.target_type === 'active'}
                      onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Active Businesses Only</p>
                      <p className="text-sm text-gray-500">{targetStats.active} businesses</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value="trial"
                      checked={formData.target_type === 'trial'}
                      onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Trial Businesses Only</p>
                      <p className="text-sm text-gray-500">{targetStats.trial} businesses</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="target"
                      value="selected"
                      checked={formData.target_type === 'selected'}
                      onChange={(e) => {
                        setFormData({ ...formData, target_type: e.target.value })
                        fetchBusinesses()
                      }}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Select Specific Businesses</p>
                      <p className="text-sm text-gray-500">Choose individual recipients</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {formData.target_type === 'selected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Businesses ({formData.selected_businesses.length} selected)
                  </label>
                  {loadingBusinesses ? (
                    <div className="text-center py-4 text-gray-500">Loading businesses...</div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      {businesses.map((b) => (
                        <label
                          key={b.schema_name}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selected_businesses.includes(b.schema_name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selected_businesses: [...formData.selected_businesses, b.schema_name]
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  selected_businesses: formData.selected_businesses.filter(s => s !== b.schema_name)
                                })
                              }
                            }}
                            className="text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{b.name}</p>
                            <p className="text-xs text-gray-500 truncate">{b.owner_email || 'No email'}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {selectedTemplate?.template_type === 'business' && (
                <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700">
                  <strong>Note:</strong> This is a business-specific template. Emails will be personalized with the business owner's name (e.g., "Dear John,").
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to send this campaign now?')) {
                        handleSubmit(true)
                      }
                    }}
                    disabled={saving || (formData.target_type === 'selected' && formData.selected_businesses.length === 0)}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    {saving ? 'Sending...' : 'Send Now'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Emails({ admin, templates, campaigns, target_stats, template_types, categories }) {
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [activeTab, setActiveTab] = useState('templates')

  return (
    <>
      <Head title="Email Marketing - Backoffice" />
      <BackofficeLayout admin={admin}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
            <p className="text-gray-500 mt-1">Send emails to businesses for marketing, announcements, and updates</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewTemplate(true)}
              className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Template
            </button>
            <button
              onClick={() => setShowNewCampaign(true)}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2"
              style={{ backgroundColor: COLORS.primary }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              New Campaign
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'templates'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'templates' ? { borderColor: COLORS.primary, color: COLORS.primary } : {}}
            >
              Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'campaigns'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              style={activeTab === 'campaigns' ? { borderColor: COLORS.primary, color: COLORS.primary } : {}}
            >
              Campaigns ({campaigns.length})
            </button>
          </nav>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            {templates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-500 mb-4">Create your first email template or seed default templates</p>
                <button
                  onClick={() => setShowNewTemplate(true)}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Create Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-500 mb-4">Create your first email campaign to reach your businesses</p>
                <button
                  onClick={() => setShowNewCampaign(true)}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Create Campaign
                </button>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <div>Campaign</div>
                  <div>Target</div>
                  <div className="text-center">Sent</div>
                  <div>Status</div>
                  <div>Date</div>
                </div>
                <div className="divide-y divide-gray-100">
                  {campaigns.map((campaign) => (
                    <CampaignRow key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Modals */}
        <NewTemplateModal
          isOpen={showNewTemplate}
          onClose={() => setShowNewTemplate(false)}
          categories={categories}
          templateTypes={template_types}
        />
        
        <NewCampaignModal
          isOpen={showNewCampaign}
          onClose={() => setShowNewCampaign(false)}
          templates={templates}
          targetStats={target_stats}
        />
      </BackofficeLayout>
    </>
  )
}
