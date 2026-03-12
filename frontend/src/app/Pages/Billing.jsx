import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SettingsSidenav from '../components/SettingsSidenav'
import { THEME } from '../constants/theme'

export default function Billing({ subscription = {}, invoices = [] }) {
  const [sidenavOpen, setSidenavOpen] = useState(true)
  
  const defaultSubscription = {
    plan: subscription.plan || 'Professional',
    status: subscription.status || 'active',
    price: subscription.price || '$49',
    billing_cycle: subscription.billing_cycle || 'monthly',
    next_billing_date: subscription.next_billing_date || '2026-03-06',
    seats: subscription.seats || 10,
    used_seats: subscription.used_seats || 7,
  }

  const defaultInvoices = invoices.length > 0 ? invoices : [
    { id: 'INV-2026-001', date: '2026-02-01', amount: '$49.00', status: 'paid', download_url: '#' },
    { id: 'INV-2026-002', date: '2026-01-01', amount: '$49.00', status: 'paid', download_url: '#' },
    { id: 'INV-2025-012', date: '2025-12-01', amount: '$49.00', status: 'paid', download_url: '#' },
    { id: 'INV-2025-011', date: '2025-11-01', amount: '$49.00', status: 'paid', download_url: '#' },
  ]

  return (
    <>
      <Head title="Billing - Settings" />
      <AppShell active="settings">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {sidenavOpen && <SettingsSidenav activeSection="billing" />}
          
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
              <h1 className="text-xl font-semibold text-gray-800">Billing & Subscription</h1>
            </div>

            <div className="p-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6 space-y-6">
                  <p className="text-sm text-gray-600">Manage your subscription plan and billing information</p>

                  {/* Current Plan */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{defaultSubscription.plan} Plan</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            defaultSubscription.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {defaultSubscription.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            Billed {defaultSubscription.billing_cycle}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{defaultSubscription.price}</div>
                        <div className="text-sm text-gray-600">per month</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Next billing date</div>
                        <div className="font-semibold text-gray-900">{defaultSubscription.next_billing_date}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Seats</div>
                        <div className="font-semibold text-gray-900">
                          {defaultSubscription.used_seats} / {defaultSubscription.seats} used
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button className={`${THEME.button.primary} px-4 py-2 rounded-lg`}>
                        Upgrade Plan
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        Manage Seats
                      </button>
                      <button className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-12" fill="none" viewBox="0 0 48 32">
                          <rect width="48" height="32" rx="4" fill="#1434CB"/>
                          <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">VISA</text>
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900">Visa ending in 4242</div>
                          <div className="text-sm text-gray-600">Expires 12/2027</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-[#4a154b] hover:text-[#5a235c]">
                        Update
                      </button>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Billing Address</h3>
                      <button className="px-4 py-2 text-sm font-medium text-[#4a154b] hover:text-[#5a235c]">
                        Edit
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>ImaraDesk Inc.</div>
                      <div>123 Business Street</div>
                      <div>San Francisco, CA 94102</div>
                      <div>United States</div>
                    </div>
                  </div>

                  {/* Invoice History */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Invoice History</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {defaultInvoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{invoice.date}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{invoice.amount}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                  {invoice.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button className="text-sm text-[#4a154b] hover:text-[#5a235c]">
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
