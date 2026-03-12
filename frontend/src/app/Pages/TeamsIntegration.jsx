import React, { useState, useEffect } from 'react'
import { Head, useForm, Link, router } from '@inertiajs/react'
import toast from 'react-hot-toast'
import AppShell from '../components/AppShell'
import SettingsSidenav from '../components/SettingsSidenav'
import Select from '../components/SearchableSelect'
import ConfirmDialog from '../components/ConfirmDialog'
import { THEME } from '../constants/theme'

export default function TeamsIntegration({ integration = {}, workspace = {}, is_connected = false }) {
  const [sidenavOpen, setSidenavOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(is_connected ? 2 : 1)
  const [isConnected, setIsConnected] = useState(is_connected)
  const [testingConnection, setTestingConnection] = useState(false)
  const [teams, setTeams] = useState([])
  const [channels, setChannels] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingChannels, setLoadingChannels] = useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)

  const { data, setData, post, processing, errors } = useForm({
    default_team_id: integration.default_team_id || '',
    default_team_name: integration.default_team_name || '',
    default_channel_id: integration.default_channel_id || '',
    default_channel_name: integration.default_channel_name || '',
    webhook_url: integration.webhook_url || '',
    notify_new_ticket: integration.notify_new_ticket ?? true,
    notify_ticket_assigned: integration.notify_ticket_assigned ?? true,
    notify_ticket_resolved: integration.notify_ticket_resolved ?? true,
    notify_sla_breach: integration.notify_sla_breach ?? true,
    notify_new_comment: integration.notify_new_comment ?? false,
    test_team: '',
    test_channel: ''
  })

  // Check for connection success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('connected') === 'true') {
      setIsConnected(true)
      setCurrentStep(2)
      toast.success('Successfully connected to Microsoft Teams!')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (urlParams.get('error')) {
      toast.error('Failed to connect to Teams. Please try again.')
    }
    
    // Fetch teams if already connected
    if (is_connected) {
      fetchTeams()
    }
  }, [])

  // Fetch teams when connection status changes
  useEffect(() => {
    if (isConnected && teams.length === 0) {
      fetchTeams()
    }
  }, [isConnected])

  // Fetch channels when team is selected
  useEffect(() => {
    if (data.default_team_id) {
      fetchChannels(data.default_team_id)
    }
  }, [data.default_team_id])

  const fetchTeams = async () => {
    setLoadingTeams(true)
    try {
      const response = await fetch('/api/integrations/teams/teams/', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.teams) {
          setTeams(result.teams.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description
          })))
        }
      } else {
        const result = await response.json()
        if (result.needs_reconnect) {
          toast.error('Teams permissions outdated. Please reconnect.')
        } else {
          toast.error(result.error || 'Failed to fetch teams')
        }
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setLoadingTeams(false)
    }
  }

  const fetchChannels = async (teamId) => {
    setLoadingChannels(true)
    try {
      const response = await fetch(`/api/integrations/teams/channels/?team_id=${teamId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.channels) {
          setChannels(result.channels.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description
          })))
        }
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to fetch channels')
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error)
    } finally {
      setLoadingChannels(false)
    }
  }

  // Listen for OAuth callback message from popup
  useEffect(() => {
    // Check URL params for connection status
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('connected') === 'true') {
      setIsConnected(true)
      setCurrentStep(2)
      toast.success('Successfully connected to Microsoft Teams!')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
      fetchTeams()
    }
  }, [])

  const handleConnectTeams = () => {
    // Direct redirect to OAuth - simple approach
    window.location.href = '/api/integrations/teams/connect/'
  }

  const handleTestConnection = async () => {
    if (!data.test_team || !data.test_channel) {
      toast.error('Please select a team and channel to test')
      return
    }
    
    setTestingConnection(true)
    const loadingToast = toast.loading('Sending test message to Teams...')
    
    try {
      const response = await fetch('/api/integrations/teams/test/', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken,
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          team_id: data.test_team,
          channel_id: data.test_channel,
          message: '🎉 ImaraDesk Teams integration is working! This is a test message.'
        })
      })
      
      const result = await response.json()
      toast.dismiss(loadingToast)
      
      if (result.success) {
        toast.success('Test message sent! Check your Teams channel.')
      } else {
        toast.error(result.error || 'Failed to send test message')
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Failed to send test message:', error)
      toast.error('Failed to send test message')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    toast.promise(
      new Promise((resolve, reject) => {
        post('/api/integrations/teams/configure/', {
          headers: {
            'X-CSRFToken': window.csrfToken,
          },
          preserveScroll: true,
          onSuccess: () => {
            router.visit('/settings/integrations/')
            resolve()
          },
          onError: () => reject(),
        })
      }),
      {
        loading: 'Configuring Teams integration...',
        success: 'Teams integration configured successfully!',
        error: 'Configuration failed',
      }
    )
  }

  const handleNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (currentStep === 1) {
      if (!isConnected) {
        toast.error('Please connect to Microsoft Teams first')
        return false
      }
      setCurrentStep(2)
      return false
    }
    if (currentStep === 2) {
      if (!data.default_team_id || !data.default_channel_id) {
        toast.error('Please select a default team and channel')
        return false
      }
      setCurrentStep(3)
    }
    return false
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/integrations/teams/disconnect/', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken,
        },
        credentials: 'same-origin'
      })
      
      if (response.ok) {
        setIsConnected(false)
        setCurrentStep(1)
        setTeams([])
        setChannels([])
        toast.success('Teams disconnected successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to disconnect Teams')
      }
    } catch (error) {
      console.error('Failed to disconnect Teams:', error)
      toast.error('Failed to disconnect Teams')
    }
  }

  const handleBack = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
    return false
  }

  const handleTeamSelect = (teamId) => {
    const team = teams.find(t => t.id === teamId)
    setData(prev => ({
      ...prev,
      default_team_id: teamId,
      default_team_name: team ? team.name : '',
      default_channel_id: '',
      default_channel_name: ''
    }))
    setChannels([])
  }

  const handleChannelSelect = (channelId) => {
    const channel = channels.find(c => c.id === channelId)
    setData(prev => ({
      ...prev,
      default_channel_id: channelId,
      default_channel_name: channel ? channel.name : ''
    }))
  }

  return (
    <>
      <Head title="Microsoft Teams Integration - Setup" />
      <AppShell active="settings">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {sidenavOpen && <SettingsSidenav activeSection="integrations" />}

          <main className="flex-1 bg-gray-50">
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
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#5558AF] rounded-lg flex items-center justify-center text-white text-lg">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.5 3.5h-6.1c-.4-1.2-1.5-2-2.9-2s-2.5.8-2.9 2H1.5C.7 3.5 0 4.2 0 5v14c0 .8.7 1.5 1.5 1.5h18c.8 0 1.5-.7 1.5-1.5V5c0-.8-.7-1.5-1.5-1.5zM10.5 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm9 16h-18V5h3.1c.2.9 1 1.5 1.9 1.5h8c.9 0 1.7-.6 1.9-1.5h3.1v14z"/>
                      <path d="M7.5 13h6v1.5h-6zm0-3h9v1.5h-9zm0 6h4.5v1.5H7.5z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-800">Microsoft Teams Integration</h1>
                    <p className="text-sm text-gray-600">Connect ImaraDesk with your Teams workspace</p>
                  </div>
                </div>
              </div>
              
              {/* Connection Status & Actions */}
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Connected
                    </div>
                    <button
                      type="button"
                      onClick={handleConnectTeams}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reconnect
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDisconnectDialog(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Disconnect
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 text-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Not Connected
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-0">
              {/* Vertical Step Indicators */}
              <div className="w-64 flex-shrink-0 border-r border-gray-200 p-6">
                <div className="sticky top-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">Setup Steps</h3>
                  <div className="space-y-4">
                    
                    {/* Step 1: Connect */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                        currentStep === 1 ? 'bg-gray-900 text-white' : currentStep > 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > 1 ? '✓' : '1'}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className={`text-sm font-medium ${currentStep === 1 ? 'text-gray-900' : currentStep > 1 ? 'text-green-600' : 'text-gray-500'}`}>
                          Connect to Teams
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Authorize ImaraDesk access</p>
                      </div>
                    </div>

                    {/* Connector Line */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        <div className={`w-0.5 h-8 ${currentStep > 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </div>

                    {/* Step 2: Configure */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                        currentStep === 2 ? 'bg-gray-900 text-white' : currentStep > 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > 2 ? '✓' : '2'}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className={`text-sm font-medium ${currentStep === 2 ? 'text-gray-900' : currentStep > 2 ? 'text-green-600' : 'text-gray-500'}`}>
                          Configure Channels
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Set up notifications</p>
                      </div>
                    </div>

                    {/* Connector Line */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        <div className={`w-0.5 h-8 ${currentStep > 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                    </div>

                    {/* Step 3: Test & Complete */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                        currentStep === 3 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        3
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className={`text-sm font-medium ${currentStep === 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                          Test & Complete
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Verify setup works</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 p-6">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                  
                  {/* Step 1: Connect to Teams */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-[#5558AF] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.5 3.5h-6.1c-.4-1.2-1.5-2-2.9-2s-2.5.8-2.9 2H1.5C.7 3.5 0 4.2 0 5v14c0 .8.7 1.5 1.5 1.5h18c.8 0 1.5-.7 1.5-1.5V5c0-.8-.7-1.5-1.5-1.5zM10.5 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm9 16h-18V5h3.1c.2.9 1 1.5 1.9 1.5h8c.9 0 1.7-.6 1.9-1.5h3.1v14z"/>
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect to Microsoft Teams</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Authorize ImaraDesk to send notifications to your Teams workspace. 
                          We'll need permission to post messages and read team/channel information.
                        </p>
                        
                        {!isConnected ? (
                          <button
                            type="button"
                            onClick={handleConnectTeams}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5558AF] hover:bg-[#464994] text-white rounded-lg font-medium transition-colors"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.5 3.5h-6.1c-.4-1.2-1.5-2-2.9-2s-2.5.8-2.9 2H1.5C.7 3.5 0 4.2 0 5v14c0 .8.7 1.5 1.5 1.5h18c.8 0 1.5-.7 1.5-1.5V5c0-.8-.7-1.5-1.5-1.5z"/>
                            </svg>
                            Connect with Microsoft
                          </button>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Connected to {workspace.name || 'Microsoft Teams'}
                            </div>
                            {workspace.user_email && (
                              <p className="text-sm text-gray-500">Signed in as {workspace.user_email}</p>
                            )}
                            <button
                              type="button"
                              onClick={() => setShowDisconnectDialog(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Disconnect Teams
                            </button>
                          </div>
                        )}
                      </div>

                      {isConnected && (
                        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <h4 className="font-medium text-green-900">Successfully Connected!</h4>
                              <p className="text-sm text-green-700 mt-1">
                                ImaraDesk is now connected to your Microsoft Teams. Click "Next" to configure your notification settings.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Configure Teams and Channels */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Notifications</h3>
                        <p className="text-gray-600 mb-6">
                          Choose which team and channel should receive notifications and what types of events to send.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Team* <span className="text-xs text-gray-500">(required)</span>
                        </label>
                        {loadingTeams ? (
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            Loading teams...
                          </div>
                        ) : (
                          <Select
                            value={data.default_team_id}
                            onChange={handleTeamSelect}
                            options={teams}
                            placeholder="Search and select a team..."
                            displayKey="name"
                            valueKey="id"
                            searchable={true}
                            error={errors?.default_team_id}
                            required={true}
                          />
                        )}
                        {errors?.default_team_id && <p className="mt-1 text-sm text-red-600">{errors.default_team_id}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Channel* <span className="text-xs text-gray-500">(required)</span>
                        </label>
                        {loadingChannels ? (
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            Loading channels...
                          </div>
                        ) : (
                          <Select
                            value={data.default_channel_id}
                            onChange={handleChannelSelect}
                            options={channels}
                            placeholder={data.default_team_id ? "Search and select a channel..." : "Select a team first..."}
                            displayKey="name"
                            valueKey="id"
                            searchable={true}
                            error={errors?.default_channel_id}
                            required={true}
                            disabled={!data.default_team_id}
                          />
                        )}
                        {errors?.default_channel_id && <p className="mt-1 text-sm text-red-600">{errors.default_channel_id}</p>}
                        <p className="text-xs text-gray-500 mt-1">This channel will receive all enabled notifications</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Notification Types
                        </label>
                        <div className="space-y-3 border border-gray-200 rounded-md p-4">
                          {[
                            { key: 'notify_new_ticket', label: 'New Tickets', description: 'When new tickets are created' },
                            { key: 'notify_ticket_assigned', label: 'Assignments', description: 'When tickets are assigned or reassigned' },
                            { key: 'notify_ticket_resolved', label: 'Status Updates', description: 'When ticket is resolved' },
                            { key: 'notify_sla_breach', label: 'SLA Breaches', description: 'When SLA is breached' },
                            { key: 'notify_new_comment', label: 'Comments', description: 'When new comments are added' },
                          ].map((notificationType) => (
                            <div key={notificationType.key} className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                id={notificationType.key}
                                checked={data[notificationType.key]}
                                onChange={(e) => setData(notificationType.key, e.target.checked)}
                                className="mt-1 rounded border-gray-300"
                              />
                              <div className="flex-1">
                                <label htmlFor={notificationType.key} className="text-sm font-medium text-gray-700 cursor-pointer">
                                  {notificationType.label}
                                </label>
                                <p className="text-xs text-gray-500">{notificationType.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Optional: Webhook URL for incoming webhooks */}
                      <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Incoming Webhook URL <span className="text-xs text-gray-500">(optional)</span>
                        </label>
                        <input
                          type="url"
                          value={data.webhook_url}
                          onChange={(e) => setData('webhook_url', e.target.value)}
                          placeholder="https://your-org.webhook.office.com/..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Alternatively, you can use an Incoming Webhook connector for simpler setup
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Test & Complete */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Your Configuration</h3>
                        <p className="text-gray-600 mb-6">
                          Send a test notification to verify everything is working correctly.
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 mb-4">Configuration Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Default Team:</span>
                            <span className="font-medium">{data.default_team_name || data.default_team_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Default Channel:</span>
                            <span className="font-medium">{data.default_channel_name || data.default_channel_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Notifications Enabled:</span>
                            <span className="font-medium">
                              {[data.notify_new_ticket, data.notify_ticket_assigned, data.notify_ticket_resolved, data.notify_sla_breach, data.notify_new_comment].filter(Boolean).length} types
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Test Team
                        </label>
                        <Select
                          value={data.test_team}
                          onChange={(value) => {
                            setData('test_team', value)
                            setData('test_channel', '')
                            if (value) fetchChannels(value)
                          }}
                          options={teams}
                          placeholder="Select a team to test..."
                          displayKey="name"
                          valueKey="id"
                          searchable={true}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Test Channel
                        </label>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Select
                              value={data.test_channel}
                              onChange={(value) => setData('test_channel', value)}
                              options={channels}
                              placeholder={data.test_team ? "Select a channel to test..." : "Select a team first..."}
                              displayKey="name"
                              valueKey="id"
                              searchable={true}
                              disabled={!data.test_team}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testingConnection || !data.test_team || !data.test_channel}
                            className={`px-4 py-2 rounded-md ${THEME.button.secondary} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                          >
                            {testingConnection ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            )}
                            Test Message
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h4 className="font-medium text-blue-900">Ready to Complete!</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Once you click "Complete Setup", your Teams integration will be active and ready to send notifications.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div>
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={handleBack}
                          className={`px-4 py-2 rounded-md ${THEME.button.secondary}`}
                        >
                          Back
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/settings/integrations/"
                        className={`px-4 py-2 rounded-md ${THEME.button.secondary}`}
                      >
                        Cancel
                      </Link>
                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className={`px-4 py-2 rounded-md ${THEME.button.primary}`}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={processing}
                          className={`px-4 py-2 rounded-md ${THEME.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Complete Setup
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </AppShell>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDisconnectDialog}
        onClose={() => setShowDisconnectDialog(false)}
        onConfirm={handleDisconnect}
        title="Disconnect Microsoft Teams?"
        message="Are you sure you want to disconnect Teams? This will remove all notification settings and stop sending ticket updates to your Teams channels. You can reconnect at any time."
        confirmText="Yes, Disconnect"
        cancelText="Cancel"
        confirmStyle="danger"
      />
    </>
  )
}
