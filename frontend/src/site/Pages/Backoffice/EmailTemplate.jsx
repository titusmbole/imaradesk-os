import React, { useState, useEffect } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import BackofficeLayout from './components/BackofficeLayout'
import { COLORS } from '../../../constants/theme'
import { securePost } from './utils/api'

const CATEGORY_OPTIONS = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'new_release', label: 'New Release' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'tips', label: 'Tips & Tricks' },
  { value: 'security', label: 'Security Update' },
  { value: 'maintenance', label: 'Maintenance Notice' },
  { value: 'other', label: 'Other' },
]

const TYPE_OPTIONS = [
  { value: 'general', label: 'General (Broadcast)', description: 'No personalization, for marketing to all' },
  { value: 'business', label: 'Business Specific', description: 'Personalized with owner name like "Dear John,"' },
]

export default function EmailTemplate({ admin, template, redirect }) {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  
  const [formData, setFormData] = useState({
    name: template?.name || '',
    template_type: template?.template_type || 'general',
    category: template?.category || 'marketing',
    subject: template?.subject || '',
    html_content: template?.html_content || getDefaultHtml(),
    plain_text_content: template?.plain_text_content || '',
    preview_text: template?.preview_text || '',
    is_active: template?.is_active ?? true,
  })

  useEffect(() => {
    if (redirect) {
      router.visit(redirect)
    }
  }, [redirect])

  if (redirect) return null

  function getDefaultHtml() {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background-color: ${COLORS.primary}; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">ImaraDesk</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                {{#if business_specific}}Dear {{owner_name}},{{/if}}
              </p>
              
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                Your email content goes here...
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td style="background-color: ${COLORS.primary}; border-radius: 8px;">
                    <a href="#" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Learn More
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>The ImaraDesk Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                © 2024 ImaraDesk. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                You're receiving this email because you're a ImaraDesk customer.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const { ok } = await securePost(`/backoffice/api/emails/templates/${template.id}/`, formData)
      if (ok) {
        router.reload()
      }
    } catch (err) {
      console.error('Failed to save template', err)
      alert('Failed to save template')
    }
    
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template? This cannot be undone.')) return
    
    setDeleting(true)
    
    try {
      const { ok } = await securePost(`/backoffice/api/emails/templates/${template.id}/delete/`)
      if (ok) {
        router.visit('/backoffice/emails/')
      }
    } catch (err) {
      console.error('Failed to delete template', err)
      alert('Failed to delete template')
    }
    
    setDeleting(false)
  }

  const handlePreview = async () => {
    try {
      const res = await fetch(`/backoffice/api/emails/templates/${template.id}/preview/`)
      const data = await res.json()
      setPreviewHtml(data.html)
      setShowPreview(true)
    } catch (err) {
      console.error('Failed to load preview', err)
    }
  }

  const insertPlaceholder = (placeholder) => {
    const textarea = document.getElementById('html-content')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.html_content
      const newText = text.substring(0, start) + `{{${placeholder}}}` + text.substring(end)
      setFormData({ ...formData, html_content: newText })
    }
  }

  return (
    <>
      <Head title={`${template?.name || 'Template'} - Email Marketing`} />
      <BackofficeLayout admin={admin}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/backoffice/emails/" className="hover:text-gray-700">Emails</Link>
          <span>/</span>
          <span className="text-gray-900">{template?.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template?.name}</h1>
            {template?.is_default && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Default Template</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Preview
            </button>
            {!template?.is_default && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Settings */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.template_type}
                    onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {TYPE_OPTIONS.find(o => o.value === formData.template_type)?.description}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Exciting News from ImaraDesk!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preview Text</label>
                  <input
                    type="text"
                    value={formData.preview_text}
                    onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Text shown in inbox preview"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Placeholders */}
            {formData.template_type === 'business' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Placeholders</h2>
                <p className="text-sm text-gray-500 mb-3">Click to insert into HTML content:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => insertPlaceholder('owner_name')}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-mono"
                  >
                    {'{{owner_name}}'} <span className="text-gray-500">- First name</span>
                  </button>
                  <button
                    onClick={() => insertPlaceholder('business_name')}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-mono"
                  >
                    {'{{business_name}}'} <span className="text-gray-500">- Business name</span>
                  </button>
                  <button
                    onClick={() => insertPlaceholder('business_email')}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-mono"
                  >
                    {'{{business_email}}'} <span className="text-gray-500">- Owner email</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: HTML Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">HTML Content</h2>
              <textarea
                id="html-content"
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                className="w-full h-[500px] px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your HTML email content here..."
              />
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Plain Text (Optional)</h2>
              <textarea
                value={formData.plain_text_content}
                onChange={(e) => setFormData({ ...formData, plain_text_content: e.target.value })}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Plain text version for email clients that don't support HTML..."
              />
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPreview(false)} />
              
              <div className="relative bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div
                      className="bg-white rounded"
                      dangerouslySetInnerHTML={{ __html: previewHtml || formData.html_content }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </BackofficeLayout>
    </>
  )
}
