import React, { useState, useEffect } from 'react'
import { Head, router } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import SettingsSidenav from '../components/SettingsSidenav'
import { THEME } from '../constants/theme'

export default function CustomDomains({ domains = [], cnameTarget = 'tenant.coredesk.pro' }) {
  const [sidenavOpen, setSidenavOpen] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    domain: '',
    purpose: 'all'
  })
  const [domainList, setDomainList] = useState(domains)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [dnsRecords, setDnsRecords] = useState([])

  // Auto-hide messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/settings/domains/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
        body: JSON.stringify({
          domain: formData.domain,
          purpose: formData.purpose,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setDomainList([...domainList, data.domain])
        setShowAddModal(false)
        setFormData({ domain: '', purpose: 'all' })
        setSuccessMessage('Domain added successfully! Configure DNS records to verify ownership.')
        
        // Open verification modal for the new domain
        setSelectedDomain(data.domain)
        setShowVerificationModal(true)
      } else {
        setError(data.error || 'Failed to add domain')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this domain? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/settings/domains/${id}/delete/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
      })

      const data = await response.json()

      if (data.success) {
        setDomainList(domainList.filter(d => d.id !== id))
        setSuccessMessage(data.message || 'Domain removed successfully')
      } else {
        setError(data.error || 'Failed to remove domain')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleVerify = async (domain) => {
    setSelectedDomain(domain)
    setShowVerificationModal(true)
    
    // Fetch DNS records for this domain
    try {
      const response = await fetch(`/api/settings/domains/${domain.id}/dns-records/`, {
        headers: {
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
      })
      const data = await response.json()
      if (data.success) {
        setDnsRecords(data.records)
      }
    } catch (err) {
      console.error('Failed to fetch DNS records:', err)
    }
  }

  const handleVerifyNow = async () => {
    if (!selectedDomain) return
    
    setVerifying(true)
    setError('')

    try {
      const response = await fetch(`/api/settings/domains/${selectedDomain.id}/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
      })

      const data = await response.json()

      if (data.success) {
        // Update domain in list
        setDomainList(domainList.map(d => 
          d.id === selectedDomain.id 
            ? { ...d, ...data.domain, verified: true }
            : d
        ))
        setSelectedDomain({ ...selectedDomain, ...data.domain, verified: true })
        setSuccessMessage(data.message || 'Domain verified successfully!')
      } else {
        setError(data.message || 'Verification failed. Please check your DNS records.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleProvisionSSL = async (domainId) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/settings/domains/${domainId}/provision-ssl/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
      })

      const data = await response.json()

      if (data.success) {
        setDomainList(domainList.map(d => 
          d.id === domainId 
            ? { ...d, sslStatus: data.domain?.sslStatus || 'provisioning' }
            : d
        ))
        setSuccessMessage(data.message || 'SSL provisioning started')
      } else {
        setError(data.error || 'Failed to enable SSL')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckSSLStatus = async (domainId) => {
    try {
      const response = await fetch(`/api/settings/domains/${domainId}/check-ssl/`, {
        method: 'GET',
        headers: {
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
      })

      const data = await response.json()

      if (data.success) {
        setDomainList(domainList.map(d => 
          d.id === domainId 
            ? { ...d, sslStatus: data.domain?.sslStatus || d.sslStatus }
            : d
        ))
        if (data.domain?.sslStatus === 'active') {
          setSuccessMessage('SSL certificate is now active!')
        } else {
          setSuccessMessage(`SSL status: ${data.domain?.cloudflareStatus || data.domain?.sslStatus}`)
        }
      } else {
        setError(data.error || 'Failed to check SSL status')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleSetPrimary = async (domainId) => {
    try {
      const response = await fetch(`/api/settings/domains/${domainId}/set-primary/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '',
        },
      })

      const data = await response.json()

      if (data.success) {
        setDomainList(domainList.map(d => ({
          ...d,
          isPrimary: d.id === domainId
        })))
        setSuccessMessage(data.message || 'Primary domain updated')
      } else {
        setError(data.error || 'Failed to set primary domain')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    }
    return styles[status] || styles.pending
  }

  const getDnsStatusBadge = (status) => {
    const styles = {
      verified: { class: 'bg-green-100 text-green-800', label: 'Verified' },
      pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { class: 'bg-red-100 text-red-800', label: 'Failed' }
    }
    return styles[status] || styles.pending
  }

  const getSslStatusBadge = (status) => {
    const styles = {
      active: { class: 'bg-green-100 text-green-800', label: 'Active', icon: 'shield-check' },
      provisioning: { class: 'bg-blue-100 text-blue-800', label: 'Provisioning', icon: 'loading' },
      pending: { class: 'bg-gray-100 text-gray-600', label: 'Pending', icon: 'clock' },
      failed: { class: 'bg-red-100 text-red-800', label: 'Failed', icon: 'x-circle' },
      expired: { class: 'bg-orange-100 text-orange-800', label: 'Expired', icon: 'exclamation' }
    }
    return styles[status] || styles.pending
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setSuccessMessage('Copied to clipboard!')
  }

  return (
    <>
      <Head title="Custom Domains - Settings" />
      <AppShell active="settings">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {sidenavOpen && <SettingsSidenav activeSection="custom-domains" />}

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
                <h1 className="text-xl font-semibold text-gray-800">Custom Domains</h1>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className={`${THEME.button.primary} px-4 py-2 rounded-lg flex items-center gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Domain
              </button>
            </div>

            <div className="p-6">
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-green-800">{successMessage}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}

              {/* Info Banner */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">About Custom Domains</h3>
                    <p className="text-sm text-blue-800">
                      Connect your own domain to provide a branded experience for your customers. You'll need to configure DNS records to verify ownership and enable the custom domain. SSL certificates are automatically provisioned once DNS is verified.
                    </p>
                  </div>
                </div>
              </div>

              {/* Domains List */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNS Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SSL</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {domainList.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto mb-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                            </svg>
                            <p className="text-gray-500 text-sm">No custom domains added yet</p>
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Add your first domain →
                            </button>
                          </td>
                        </tr>
                      ) : (
                        domainList.map((domain) => (
                          <tr key={domain.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                </svg>
                                <div>
                                  <span className="font-medium text-gray-900">{domain.domain}</span>
                                  {domain.isPrimary && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      Primary
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {domain.purposeDisplay || domain.purpose}
                            </td>
                            <td className="px-6 py-4">
                              {domain.dnsStatus === 'verified' ? (
                                <span className="flex items-center gap-1 text-sm text-green-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Verified
                                </span>
                              ) : domain.dnsStatus === 'failed' ? (
                                <span className="flex items-center gap-1 text-sm text-red-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                  </svg>
                                  Failed
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleVerify(domain)}
                                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  Configure →
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {(() => {
                                const sslBadge = getSslStatusBadge(domain.sslStatus)
                                if (domain.sslStatus === 'active') {
                                  return (
                                    <span className="flex items-center gap-1 text-sm text-green-600">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                      </svg>
                                      Active
                                    </span>
                                  )
                                } else if (domain.sslStatus === 'provisioning') {
                                  return (
                                    <div className="flex items-center gap-2">
                                      <span className="flex items-center gap-1 text-sm text-blue-600">
                                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Provisioning
                                      </span>
                                      <button
                                        onClick={() => handleCheckSSLStatus(domain.id)}
                                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                                        title="Check SSL Status"
                                      >
                                        Check
                                      </button>
                                    </div>
                                  )
                                } else if (domain.dnsStatus === 'verified') {
                                  return (
                                    <button
                                      onClick={() => handleProvisionSSL(domain.id)}
                                      className={`text-sm font-medium ${domain.sslStatus === 'failed' ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
                                      title={domain.sslErrorMessage || ''}
                                      disabled={loading}
                                    >
                                      {domain.sslStatus === 'failed' ? 'Retry SSL →' : 'Enable SSL →'}
                                    </button>
                                  )
                                } else {
                                  return <span className="text-sm text-gray-400">-</span>
                                }
                              })()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(domain.status)}`}>
                                {domain.statusDisplay || domain.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{domain.createdAt}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleVerify(domain)}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="View DNS Settings"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </button>
                                {domain.dnsStatus === 'verified' && (
                                  <button
                                    onClick={() => handleVerify(domain)}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Re-verify Domain"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                  </button>
                                )}
                                {domain.dnsStatus === 'verified' && !domain.isPrimary && (
                                  <button
                                    onClick={() => handleSetPrimary(domain.id)}
                                    className="text-purple-600 hover:text-purple-700"
                                    title="Set as Primary"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(domain.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete Domain"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Add Domain Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Add Custom Domain</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name *
                  </label>
                  <input
                    type="text"
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleChange}
                    placeholder="support.yourdomain.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter the subdomain you want to use (e.g., support.example.com)</p>
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose *
                  </label>
                  <select
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Services</option>
                    <option value="helpdesk">Helpdesk / Support Portal</option>
                    <option value="knowledge_base">Knowledge Base</option>
                    <option value="customer_portal">Customer Portal</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Tip:</strong> We recommend using a subdomain (e.g., support.example.com, help.example.com) instead of a root domain. Root domains (e.g., example.com) have CNAME limitations that may cause issues.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${THEME.button.primary} px-4 py-2 rounded-lg flex items-center gap-2`}
                    disabled={loading}
                  >
                    {loading && (
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Add Domain
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        {showVerificationModal && selectedDomain && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">DNS Configuration</h2>
                <button
                  onClick={() => {
                    setShowVerificationModal(false)
                    setSelectedDomain(null)
                    setDnsRecords([])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Domain: {selectedDomain.domain}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedDomain.status)}`}>
                      {selectedDomain.statusDisplay || selectedDomain.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add the following DNS records to your domain provider to verify ownership and activate your custom domain.
                  </p>
                </div>

                {/* Error Message */}
                {selectedDomain.dnsErrorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-semibold text-red-900">Verification Error</h4>
                        <p className="text-xs text-red-800 mt-1">{selectedDomain.dnsErrorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* CNAME Record */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Step 1
                      </span>
                      Add CNAME Record
                    </h4>
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-500 text-xs">Type</span>
                          <p className="font-semibold font-mono">CNAME</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Name / Host</span>
                          <p className="font-semibold font-mono break-all">{selectedDomain.domain}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">Value / Target</span>
                            <button
                              onClick={() => copyToClipboard(selectedDomain.requiredCnameRecord || cnameTarget)}
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="font-semibold font-mono break-all">{selectedDomain.requiredCnameRecord || cnameTarget}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TXT Record */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Step 2
                      </span>
                      Add TXT Record for Verification
                    </h4>
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <span className="text-gray-500 text-xs">Type</span>
                          <p className="font-semibold font-mono">TXT</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">Name / Host</span>
                            <button
                              onClick={() => copyToClipboard(`_coredesk.${selectedDomain.domain}`)}
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="font-semibold font-mono break-all">_coredesk.{selectedDomain.domain}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">Value</span>
                            <button
                              onClick={() => copyToClipboard(selectedDomain.requiredTxtRecord)}
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="font-semibold font-mono break-all text-sm">{selectedDomain.requiredTxtRecord}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Important Notes:</h4>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>DNS changes can take up to 48 hours to propagate, but usually complete within a few minutes to hours</li>
                    <li>Make sure to add both records to your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.)</li>
                    <li>After adding the records, click "Verify DNS" to check if the configuration is correct</li>
                    <li>SSL certificates will be automatically provisioned once DNS verification is complete</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-900 mb-2">About CNAME at Root Domains:</h4>
                  <ul className="text-xs text-orange-800 space-y-1 list-disc list-inside">
                    <li>If using a root domain (e.g., example.com), you may see a warning about CNAME records - this is normal</li>
                    <li>DNS providers like Cloudflare use "CNAME flattening" which automatically resolves CNAME to A records</li>
                    <li>For best results, we recommend using a subdomain (e.g., support.example.com) instead</li>
                    <li>If you see "CNAME flattening" or similar warning, DNS verification should still work</li>
                  </ul>
                </div>

                {selectedDomain.verified ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">DNS verified successfully!</span>
                    </div>
                    {selectedDomain.sslStatus === 'active' ? (
                      <p className="text-sm text-green-700 mt-2">SSL certificate is active. Your domain is fully configured.</p>
                    ) : selectedDomain.sslStatus === 'provisioning' ? (
                      <p className="text-sm text-green-700 mt-2">SSL certificate is being provisioned. This may take a few minutes.</p>
                    ) : (
                      <p className="text-sm text-green-700 mt-2">SSL certificate will be provisioned automatically.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowVerificationModal(false)
                        setSelectedDomain(null)
                        setDnsRecords([])
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleVerifyNow}
                      disabled={verifying}
                      className={`${THEME.button.primary} px-4 py-2 rounded-lg flex items-center gap-2`}
                    >
                      {verifying && (
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      Verify DNS
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </>
  )
}
