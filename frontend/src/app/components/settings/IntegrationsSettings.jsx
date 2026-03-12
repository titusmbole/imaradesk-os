import React from 'react'
import { Link } from '@inertiajs/react'
import { THEME } from '../../constants/theme'
import * as LucideIcons from 'lucide-react'

// Helper function to render Lucide icon by name
const IntegrationIcon = ({ name, className = "w-6 h-6", style = {} }) => {
  // Get the icon component from lucide-react
  const IconComponent = LucideIcons[name]
  
  if (IconComponent) {
    return <IconComponent className={className} style={style} />
  }
  
  // Fallback to a default icon if not found
  return <LucideIcons.Puzzle className={className} style={style} />
}

export default function IntegrationsSettings({ integrations, integrationsLoading }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Integrations</h2>
        <p className="text-sm text-gray-600">Connect your favorite tools and services to streamline your workflow</p>
      </div>
      
      {integrationsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              
              <div className="flex justify-end">
                <div className="h-7 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div key={integration.name} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: integration.color ? `${integration.color}15` : '#f3f4f6' }}
                  >
                    <IntegrationIcon 
                      name={integration.icon} 
                      className="w-6 h-6"
                      style={{ color: integration.color || '#6b7280' }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <div className="flex items-center mt-1">
                      {integration.is_integrated && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ● Connected
                        </span>
                      )}
                      {!integration.is_integrated && integration.status === 'available' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Available
                        </span>
                      )}
                      {integration.status === 'coming-soon' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {integration.description}
              </p>
              
              {/* Connected providers badges for Email Providers */}
              {integration.name === 'Email Providers' && integration.connected_providers && integration.connected_providers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {integration.connected_providers.map((provider) => (
                    <span 
                      key={provider.name}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      {provider.name} ({provider.count})
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end">
                {integration.is_integrated && (
                  <Link
                    href={
                      integration.name === 'Slack' ? '/settings/integrations/slack/' :
                      integration.name === 'Microsoft Teams' ? '/settings/integrations/teams/' :
                      integration.name === 'Email Providers' ? '/settings/integrations/email/' :
                      integration.name === 'Telegram' ? '/settings/integrations/telegram/' :
                      integration.name === 'WhatsApp' ? '/settings/integrations/whatsapp/' :
                      '#'
                    }
                    className="px-4 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-block text-center"
                  >
                    {integration.name === 'Email Providers' ? 'Go to Providers' : 'Configure'}
                  </Link>
                )}
                {!integration.is_integrated && integration.status === 'available' && (
                  <Link
                    href={
                      integration.name === 'Slack' ? '/settings/integrations/slack/' :
                      integration.name === 'Microsoft Teams' ? '/settings/integrations/teams/' :
                      integration.name === 'Email Providers' ? '/settings/integrations/email/' :
                      integration.name === 'Telegram' ? '/settings/integrations/telegram/' :
                      integration.name === 'WhatsApp' ? '/settings/integrations/whatsapp/' :
                      '#'
                    }
                    className={`px-4 py-1.5 text-xs ${THEME.button.primary} rounded-lg transition-colors inline-block text-center`}
                  >
                    {integration.name === 'Email Providers' ? 'Go to Providers' : 'Connect'}
                  </Link>
                )}
                {integration.status === 'coming-soon' && (
                  <button 
                    disabled
                    className="px-4 py-1.5 text-xs bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Need a custom integration?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Our API allows you to build custom integrations for your specific needs.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors">
              View API Docs
            </button>
            <button className={`px-4 py-2 text-sm ${THEME.button.primary} rounded-lg`}>
              Request Integration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
