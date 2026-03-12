import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SurveySidebar from '../components/SurveySidebar'
import { THEME } from '../constants/theme'
import { Check, Mail } from 'lucide-react'

export default function SurveySettings({
  settings = {},
  email_templates = [],
  sidebar = { views: [] },
}) {
  const [formData, setFormData] = useState({
    surveys_enabled: settings.surveys_enabled ?? true,
    default_survey_delay: settings.default_survey_delay || 24,
    max_surveys_per_customer: settings.max_surveys_per_customer || 3,
    survey_cooldown_days: settings.survey_cooldown_days || 7,
    auto_close_days: settings.auto_close_days || 30,
    reminder_enabled: settings.reminder_enabled ?? true,
    reminder_days: settings.reminder_days || 3,
    include_unsubscribe_link: settings.include_unsubscribe_link ?? true,
    track_opens: settings.track_opens ?? true,
  })

  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    
    router.put('/surveys/settings/', formData, {
      onSuccess: () => {
        setSaved(true)
        setSaving(false)
      },
      onError: () => {
        setSaving(false)
      },
    })
  }

  const tabs = [
    { id: 'general', label: 'General Settings' },
    { id: 'delivery', label: 'Survey Delivery' },
    { id: 'templates', label: 'Email Templates' },
  ]

  return (
    <>
      <Head title="Survey Settings" />
      <AppShell active="surveys">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <SurveySidebar 
            views={sidebar.views} 
            currentView="settings" 
            activePage="settings" 
          />

          {/* Main Content */}
          <main className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-800">Survey Settings</h1>
                {saved && (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Settings saved
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Tab Navigation */}
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex px-4">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                          activeTab === tab.id
                            ? 'border-[#4a154b] text-[#4a154b]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  {/* General Settings Tab */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      {/* Enable/Disable Surveys */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div>
                          <h3 className="font-medium text-gray-900">Enable Surveys</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            When disabled, no new surveys will be sent to customers
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.surveys_enabled}
                            onChange={(e) => handleChange('surveys_enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4a154b]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a154b]"></div>
                        </label>
                      </div>

                      {/* Max Surveys Per Customer */}
                      <div className="py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Max Surveys Per Customer</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Maximum number of active survey invitations per customer
                            </p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={formData.max_surveys_per_customer}
                            onChange={(e) => handleChange('max_surveys_per_customer', parseInt(e.target.value))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                          />
                        </div>
                      </div>

                      {/* Cooldown Period */}
                      <div className="py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Survey Cooldown Period</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Minimum days between surveys for the same customer
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="90"
                              value={formData.survey_cooldown_days}
                              onChange={(e) => handleChange('survey_cooldown_days', parseInt(e.target.value))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                            />
                            <span className="text-sm text-gray-500">days</span>
                          </div>
                        </div>
                      </div>

                      {/* Auto Close */}
                      <div className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Auto-Close Surveys</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Automatically expire unanswered survey invitations after
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="90"
                              value={formData.auto_close_days}
                              onChange={(e) => handleChange('auto_close_days', parseInt(e.target.value))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                            />
                            <span className="text-sm text-gray-500">days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Tab */}
                  {activeTab === 'delivery' && (
                    <div className="space-y-6">
                      {/* Default Delay */}
                      <div className="py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Default Survey Delay</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Hours to wait after trigger before sending survey
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="168"
                              value={formData.default_survey_delay}
                              onChange={(e) => handleChange('default_survey_delay', parseInt(e.target.value))}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                            />
                            <span className="text-sm text-gray-500">hours</span>
                          </div>
                        </div>
                      </div>

                      {/* Reminder Settings */}
                      <div className="py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">Send Reminders</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Send a reminder email if customer hasn't responded
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.reminder_enabled}
                              onChange={(e) => handleChange('reminder_enabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4a154b]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a154b]"></div>
                          </label>
                        </div>
                        {formData.reminder_enabled && (
                          <div className="flex items-center justify-between pl-4 border-l-2 border-gray-200 ml-4">
                            <span className="text-sm text-gray-600">Send reminder after</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="14"
                                value={formData.reminder_days}
                                onChange={(e) => handleChange('reminder_days', parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                              />
                              <span className="text-sm text-gray-500">days</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Include Unsubscribe Link */}
                      <div className="py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Include Unsubscribe Link</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Allow customers to opt-out of future surveys
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.include_unsubscribe_link}
                              onChange={(e) => handleChange('include_unsubscribe_link', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4a154b]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a154b]"></div>
                          </label>
                        </div>
                      </div>

                      {/* Track Opens */}
                      <div className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Track Email Opens</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Track when customers open survey emails
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.track_opens}
                              onChange={(e) => handleChange('track_opens', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4a154b]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a154b]"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Templates Tab */}
                  {activeTab === 'templates' && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        Configure email templates used for survey invitations and reminders.
                      </p>
                      {email_templates.length > 0 ? (
                        <div className="space-y-4">
                          {email_templates.map((template) => (
                            <div
                              key={template.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <div>
                                <h4 className="font-medium text-gray-900">{template.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  Type: {template.template_type} • Survey: {template.survey_name || 'Default'}
                                </p>
                              </div>
                              <button
                                type="button"
                                className="px-3 py-1.5 text-sm font-medium text-[#4a154b] hover:bg-[#4a154b]/5 rounded-md"
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-gray-200 border-dashed rounded-lg">
                          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                          <p className="text-gray-500 mb-2">No email templates configured</p>
                          <p className="text-sm text-gray-400">
                            Email templates are created automatically when you create surveys
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save Button */}
                  {activeTab !== 'templates' && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className={`px-6 py-2 rounded-md text-sm font-medium ${THEME.button.primary} disabled:opacity-50`}
                        >
                          {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </main>
        </div>
      </AppShell>
    </>
  )
}
