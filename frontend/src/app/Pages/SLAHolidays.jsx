import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SettingsSidenav from '../components/SettingsSidenav'
import Modal from '../components/Modal'
import Select from '../components/SearchableSelect'
import { THEME } from '../constants/theme'
import { toast } from 'react-hot-toast'

export default function SLAHolidays({ holidays = [], slaEnabled = false }) {
  const [sidenavOpen, setSidenavOpen] = useState(true)
  const [holidaysList, setHolidaysList] = useState(holidays)
  const [showModal, setShowModal] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const statusOptions = [
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
  ]
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    recurring: false,
    status: 'active',
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddHoliday = () => {
    setEditingHoliday(null)
    setFormData({
      name: '',
      date: '',
      recurring: false,
      status: 'active',
    })
    setShowModal(true)
  }

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday)
    setFormData({
      name: holiday.name,
      date: holiday.date,
      recurring: holiday.recurring,
      status: holiday.status,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingHoliday
        ? `/sla/api/holidays/${editingHoliday.id}/update/`
        : '/sla/api/holidays/create/'
      
      const method = editingHoliday ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Holiday saved successfully')
        
        // Update the list
        if (editingHoliday) {
          setHolidaysList(prev => prev.map(h => h.id === editingHoliday.id ? data.holiday : h))
        } else {
          setHolidaysList(prev => [...prev, data.holiday])
        }
        
        setShowModal(false)
      } else {
        toast.error(data.message || 'Failed to save holiday')
      }
    } catch (error) {
      console.error('Error saving holiday:', error)
      toast.error('An error occurred while saving holiday')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (holidayId) => {
    if (!confirm('Are you sure you want to delete this holiday?')) {
      return
    }

    try {
      const response = await fetch(`/sla/api/holidays/${holidayId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || 'Holiday deleted successfully')
        setHolidaysList(prev => prev.filter(h => h.id !== holidayId))
      } else {
        toast.error(data.message || 'Failed to delete holiday')
      }
    } catch (error) {
      console.error('Error deleting holiday:', error)
      toast.error('An error occurred while deleting holiday')
    }
  }

  return (
    <>
      <Head title="Holidays - Settings" />
      <AppShell active="settings">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {sidenavOpen && <SettingsSidenav activeSection="sla-holidays" slaEnabled={slaEnabled} />}
          
          <main className="flex-1 bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                <h1 className="text-xl font-semibold text-gray-800">Holidays</h1>
              </div>
              <button 
                onClick={handleAddHoliday}
                className={`${THEME.button.primary} px-4 py-2 rounded-lg flex items-center gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Holiday
              </button>
            </div>

            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Define holidays when SLA timers will be paused</p>
                  
                  {holidaysList.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No holidays</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding a holiday.</p>
                      <div className="mt-6">
                        <button
                          onClick={handleAddHoliday}
                          className={`${THEME.button.primary} px-4 py-2 rounded-lg inline-flex items-center gap-2`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Holiday
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holiday Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {holidaysList.map((holiday) => (
                            <tr key={holiday.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{holiday.name}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-600">
                                  {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  holiday.recurring 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {holiday.recurring ? 'Recurring' : 'One-time'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  holiday.status === 'active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {holiday.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-sm">
                                <button 
                                  onClick={() => handleEdit(holiday)}
                                  className="text-[#4a154b] hover:text-[#5a235c] mr-3"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDelete(holiday.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Add/Edit Holiday Modal */}
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
          >
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Holiday Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a154b]"
                  placeholder="e.g., New Year's Day"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a154b]"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => handleInputChange('recurring', e.target.checked)}
                    className="w-4 h-4 text-[#4a154b] focus:ring-[#4a154b]"
                  />
                  <span className="text-sm text-gray-700">Recurring annually</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  If checked, this holiday will repeat every year on the same date
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                  displayKey="name"
                  valueKey="id"
                  placeholder="Select status..."
                  allowClear={false}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
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
                    editingHoliday ? 'Update Holiday' : 'Add Holiday'
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AppShell>
    </>
  )
}
