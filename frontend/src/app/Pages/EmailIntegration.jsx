import React, { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SettingsSidenav from '../components/SettingsSidenav'
import { THEME } from '../constants/theme'

const emailProviders = [
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/>
        <path d="M2 8L12 14L22 8" stroke="white" strokeWidth="1.5"/>
        <ellipse cx="8" cy="12" rx="4" ry="3" fill="white" fillOpacity="0.3"/>
      </svg>
    ),
    color: '#0078D4',
    description: 'Integrate with Microsoft Outlook or Office 365 email accounts for seamless ticket management.',
    features: ['Office 365 integration', 'Exchange Online support', 'Calendar sync', 'Contact import'],
    status: 'available'
  },
  {
    id: 'imap',
    name: 'Custom IMAP/SMTP',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#6B7280"/>
        <path d="M2 8L12 14L22 8" stroke="white" strokeWidth="1.5"/>
        <path d="M6 17H18" stroke="white" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
      </svg>
    ),
    color: '#6B7280',
    description: 'Configure any email provider using standard IMAP/SMTP protocols for maximum flexibility.',
    features: ['Any email provider', 'Full protocol control', 'Custom port settings', 'SSL/TLS encryption'],
    status: 'available'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z" fill="#EA4335"/>
        <path d="M22 6L12 13L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6" fill="#FBBC05"/>
        <path d="M2 6L12 13L22 6" fill="#34A853"/>
        <rect x="2" y="6" width="20" height="14" rx="0" fill="white" fillOpacity="0.1"/>
      </svg>
    ),
    color: '#EA4335',
    description: 'Connect your Gmail account to automatically convert incoming emails into support tickets.',
    features: ['Auto-create tickets from emails', 'Reply to tickets via email', 'Thread synchronization', 'Attachment support'],
    status: 'coming-soon'
  },
  {
    id: 'yahoo',
    name: 'Yahoo Mail',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#6001D2"/>
        <path d="M7 9L12 14L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="16" r="1" fill="white"/>
      </svg>
    ),
    color: '#6001D2',
    description: 'Connect Yahoo Mail to receive and respond to support tickets through your Yahoo account.',
    features: ['IMAP/POP3 support', 'Email forwarding', 'Spam filtering', 'Multiple mailboxes'],
    status: 'coming-soon'
  },
  {
    id: 'zoho',
    name: 'Zoho Mail',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#C8202B"/>
        <text x="12" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">Z</text>
      </svg>
    ),
    color: '#C8202B',
    description: 'Integrate with Zoho Mail for businesses already using the Zoho ecosystem.',
    features: ['Zoho CRM sync', 'Team collaboration', 'Admin controls', 'Multi-domain support'],
    status: 'coming-soon'
  },
  {
    id: 'protonmail',
    name: 'ProtonMail',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#6D4AFF"/>
        <path d="M12 8L17 12L12 16L7 12L12 8Z" fill="white" fillOpacity="0.9"/>
      </svg>
    ),
    color: '#6D4AFF',
    description: 'Secure email integration with ProtonMail for privacy-focused organizations.',
    features: ['End-to-end encryption', 'Zero-access encryption', 'Swiss privacy laws', 'Anonymous sign-up'],
    status: 'coming-soon'
  }
]

export default function EmailIntegration({ connected_providers = [] }) {
  const [sidenavOpen, setSidenavOpen] = useState(true)

  const isProviderConnected = (providerId) => {
    return connected_providers.includes(providerId)
  }

  const hasConnectedProviders = connected_providers.length > 0

  return (
    <>
      <Head title="Email Integration - Settings" />
      <AppShell active="settings">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {sidenavOpen && <SettingsSidenav activeSection="integrations" />}

          <main className="flex-1 bg-gray-50">
            {/* Header Bar */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
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
                {/* Back Button */}
                <Link
                  href="/settings/integrations"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Back to Integrations"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">
                    📧
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-800">Email Integration</h1>
                    <p className="text-sm text-gray-600">Connect your email provider to create tickets from emails</p>
                  </div>
                </div>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-3">
                {hasConnectedProviders ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {connected_providers.length} Provider{connected_providers.length > 1 ? 's' : ''} Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 text-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Not Connected
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Email Provider</h2>
                    <p className="text-sm text-gray-600">
                      Choose the email service you want to integrate with your helpdesk
                    </p>
                  </div>

                  {/* Provider Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emailProviders.map((provider) => (
                      <Link
                        key={provider.id}
                        href={provider.status !== 'coming-soon' ? `/settings/integrations/email/${provider.id}/` : '#'}
                        className={`
                          relative bg-white border rounded-xl p-5 transition-all duration-200 block
                          ${provider.status === 'coming-soon' 
                            ? 'border-gray-200 opacity-60 cursor-not-allowed' 
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }
                        `}
                        onClick={(e) => provider.status === 'coming-soon' && e.preventDefault()}
                      >
                        {isProviderConnected(provider.id) && (
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ● Connected
                            </span>
                          </div>
                        )}
                        
                        {provider.status === 'coming-soon' && (
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Coming Soon
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${provider.color}15` }}
                          >
                            {provider.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {provider.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-1">
                            {provider.features.slice(0, 2).map((feature, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                              >
                                {feature}
                              </span>
                            ))}
                            {provider.features.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                                +{provider.features.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow indicator for available providers */}
                        {provider.status !== 'coming-soon' && (
                          <div className="absolute bottom-5 right-5">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Connected Providers Section */}
                  {hasConnectedProviders && (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Connected Accounts</h3>
                      <div className="space-y-2">
                        {connected_providers.map((providerId) => {
                          const provider = emailProviders.find(p => p.id === providerId)
                          if (!provider) return null
                          return (
                            <div key={providerId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${provider.color}15` }}>
                                  {provider.icon}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">{provider.name}</span>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    <span className="text-xs text-green-600">Active</span>
                                  </div>
                                </div>
                              </div>
                              <Link
                                href={`/settings/integrations/email/${providerId}/`}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                              >
                                Manage
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info Section */}
                  <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-blue-900">How Email Integration Works</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• Incoming emails to your connected address automatically create new tickets</li>
                          <li>• Replies from customers are added as comments to existing tickets</li>
                          <li>• Your team can respond to tickets, and replies are sent as emails</li>
                          <li>• Attachments are preserved and linked to the ticket</li>
                        </ul>
                      </div>
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
