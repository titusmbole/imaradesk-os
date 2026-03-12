import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SettingsSidenav from '../components/SettingsSidenav'
import { THEME } from '../constants/theme'

export default function EmailsAutomation({ automations = [] }) {
  const [sidenavOpen, setSidenavOpen] = useState(true)
  
  const defaultAutomations = automations.length > 0 ? automations : [
    { id: 1, name: 'New Ticket Auto-Response', trigger: 'Ticket Created', status: 'active', lastRun: '2 hours ago' },
    { id: 2, name: 'Ticket Follow-up', trigger: 'No Response 24h', status: 'active', lastRun: '5 hours ago' },
    { id: 3, name: 'Daily Digest', trigger: 'Daily at 9 AM', status: 'active', lastRun: '1 day ago' },
    { id: 4, name: 'SLA Breach Warning', trigger: 'SLA 80% Reached', status: 'active', lastRun: '3 hours ago' },
    { id: 5, name: 'Customer Satisfaction Survey', trigger: 'Ticket Closed', status: 'paused', lastRun: '2 days ago' },
  ]

  return (
    <>
      <Head title="Email Automation - Settings" />
      <AppShell active="settings">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {sidenavOpen && <SettingsSidenav activeSection="emails-automation" />}
          
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
                <h1 className="text-xl font-semibold text-gray-800">Email Automation</h1>
              </div>
              <button className={`${THEME.button.primary} px-4 py-2 rounded-lg flex items-center gap-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Automation
              </button>
            </div>

            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Automate email notifications based on triggers and conditions</p>
                  <div className="space-y-3">
                    {defaultAutomations.map((automation) => (
                      <div key={automation.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                automation.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {automation.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Trigger: {automation.trigger}</span>
                              <span>•</span>
                              <span>Last run: {automation.lastRun}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppShell>
    </>
  )
}
