import React, { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SettingsSidenav from '../components/SettingsSidenav'
import Select from '../components/SearchableSelect'
import { THEME } from '../constants/theme'
import { toast } from 'react-hot-toast'

export default function SLABusinessHours({ business_hours = null, slaEnabled = false }) {
  const [sidenavOpen, setSidenavOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [timezones, setTimezones] = useState([])
  const [loadingTimezones, setLoadingTimezones] = useState(true)
  
  const [formData, setFormData] = useState({
    name: business_hours?.name || 'Default Business Hours',
    timezone: business_hours?.timezone || 'America/New_York',
    monday_enabled: business_hours?.monday_enabled ?? true,
    monday_start: business_hours?.monday_start || '09:00',
    monday_end: business_hours?.monday_end || '17:00',
    tuesday_enabled: business_hours?.tuesday_enabled ?? true,
    tuesday_start: business_hours?.tuesday_start || '09:00',
    tuesday_end: business_hours?.tuesday_end || '17:00',
    wednesday_enabled: business_hours?.wednesday_enabled ?? true,
    wednesday_start: business_hours?.wednesday_start || '09:00',
    wednesday_end: business_hours?.wednesday_end || '17:00',
    thursday_enabled: business_hours?.thursday_enabled ?? true,
    thursday_start: business_hours?.thursday_start || '09:00',
    thursday_end: business_hours?.thursday_end || '17:00',
    friday_enabled: business_hours?.friday_enabled ?? true,
    friday_start: business_hours?.friday_start || '09:00',
    friday_end: business_hours?.friday_end || '17:00',
    saturday_enabled: business_hours?.saturday_enabled ?? false,
    saturday_start: business_hours?.saturday_start || '09:00',
    saturday_end: business_hours?.saturday_end || '17:00',
    sunday_enabled: business_hours?.sunday_enabled ?? false,
    sunday_start: business_hours?.sunday_start || '09:00',
    sunday_end: business_hours?.sunday_end || '17:00',
    pause_outside_hours: business_hours?.pause_outside_hours ?? false,
    exclude_holidays: business_hours?.exclude_holidays ?? true,
    is_active: true,
  })

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ]

  // Load timezones on mount
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const response = await fetch('/sla/api/timezones/')
        const data = await response.json()
        if (data.success) {
          setTimezones(data.timezones)
        }
      } catch (error) {
        console.error('Error loading timezones:', error)
        toast.error('Failed to load timezones')
      } finally {
        setLoadingTimezones(false)
      }
    }
    fetchTimezones()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/sla/api/business-hours/save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Business hours saved successfully')
        // Optionally reload the page to refresh data
        window.location.reload()
      } else {
        toast.error(data.message || 'Failed to save business hours')
      }
    } catch (error) {
      console.error('Error saving business hours:', error)
      toast.error('An error occurred while saving business hours')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head title="Business Hours - Settings" />
      <AppShell active="settings">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {sidenavOpen && <SettingsSidenav activeSection="sla-business-hours" slaEnabled={slaEnabled} />}
          
          <main className="flex-1 bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              {!sidenavOpen && (
                <button
                  className="p-2 rounded-md hover:bg-gray-100"
                  title="Show Settings Menu"
                  onClick={() => setSidenavOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-500">
                    <path d="M13.5 6 21 12l-7.5 6v-4.5H3v-3h10.5V6z"/>
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-semibold text-gray-800">Business Hours</h1>
            </div>

            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-6">Configure your support team's business hours for SLA calculations</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Timezone */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      {loadingTimezones ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading timezones...
                        </div>
                      ) : (
                        <Select
                          value={formData.timezone}
                          onChange={(value) => handleInputChange('timezone', value)}
                          options={timezones}
                          displayKey="name"
                          valueKey="id"
                          placeholder="Select timezone..."
                          searchable={true}
                          allowClear={false}
                        />
                      )}
                    </div>

                    {/* Weekly Schedule */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
                      <div className="space-y-3">
                        {days.map((day) => (
                          <div key={day.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="w-32">
                              <label className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  checked={formData[`${day.key}_enabled`]}
                                  onChange={(e) => handleInputChange(`${day.key}_enabled`, e.target.checked)}
                                  className="w-4 h-4 text-[#4a154b] focus:ring-[#4a154b]"
                                />
                                <span className="font-medium text-gray-900">{day.label}</span>
                              </label>
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Start:</label>
                                <input 
                                  type="time" 
                                  value={formData[`${day.key}_start`]}
                                  onChange={(e) => handleInputChange(`${day.key}_start`, e.target.value)}
                                  disabled={!formData[`${day.key}_enabled`]}
                                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a154b] disabled:bg-gray-100"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">End:</label>
                                <input 
                                  type="time" 
                                  value={formData[`${day.key}_end`]}
                                  onChange={(e) => handleInputChange(`${day.key}_end`, e.target.value)}
                                  disabled={!formData[`${day.key}_enabled`]}
                                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a154b] disabled:bg-gray-100"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Additional Options</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={formData.pause_outside_hours}
                            onChange={(e) => handleInputChange('pause_outside_hours', e.target.checked)}
                            className="w-4 h-4 text-[#4a154b] focus:ring-[#4a154b]" 
                          />
                          <span className="text-sm text-gray-700">Pause SLA timer outside business hours</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={formData.exclude_holidays}
                            onChange={(e) => handleInputChange('exclude_holidays', e.target.checked)}
                            className="w-4 h-4 text-[#4a154b] focus:ring-[#4a154b]" 
                          />
                          <span className="text-sm text-gray-700">Exclude holidays from SLA calculations</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className={`${THEME.button.primary} px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppShell>
    </>
  )
}
