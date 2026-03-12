import React from 'react'
import { Head, Link } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import { THEME, COLORS } from '../constants/theme'

export default function TrialExpired({ app = {}, trial_ended_at, return_url = '/' }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <>
      <Head title={`${app.name || 'App'} - Trial Expired`} />
      <AppShell>
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full overflow-hidden ">
            {/* Header Banner */}
           
            
            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Trial Period Expired</h2>
                <p className="text-gray-600">
                  Your 14-day free trial for <strong>{app.name}</strong> ended on {formatDate(trial_ended_at)}.
                </p>
              </div>
              
              {/* Upgrade Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 mb-6 border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Upgrade to Continue
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {app.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${app.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Cancel anytime
                  </span>
                </div>
              </div>
              
              {/* Features List */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">What you'll get:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Full access to all {app.name} features
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Regular updates & new features
                  </li>
                </ul>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/settings/marketplace/?app=${app.slug}&upgrade=true`}
                  className="flex-1 text-center px-6 py-3 rounded-lg font-medium text-white"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Upgrade Now
                </Link>
                <Link
                  href={return_url}
                  className="flex-1 text-center px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Go Back
                </Link>
              </div>
              
              {/* Help Text */}
              <p className="text-xs text-gray-400 text-center mt-6">
                Questions about pricing?{' '}
                <a href="mailto:support@imaradesk.com" className="text-blue-600 hover:underline">
                  Contact our sales team
                </a>
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  )
}
