import React, { useState, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import toast from 'react-hot-toast'
import AppShell from '../components/AppShell'
import SettingsSidenav from '../components/SettingsSidenav'
import Select from '../components/SearchableSelect'
import ConfirmDialog from '../components/ConfirmDialog'
import { Send, ChevronRight } from 'lucide-react'

export default function TelegramIntegration({ 
  integration = {}, 
  bot_info = {}, 
  is_connected = false,
  webhook_preview = '',
  priorities = []
}) {
  const [sidenavOpen, setSidenavOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(is_connected ? 2 : 1)
  const [isConnected, setIsConnected] = useState(is_connected)
  const [connecting, setConnecting] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const [botUsername, setBotUsername] = useState(bot_info.username || '')

  const { data, setData, post, processing, errors } = useForm({
    bot_token: '',
    auto_create_tickets: integration.auto_create_tickets ?? true,
    default_priority: integration.default_priority || 'normal',
    welcome_message: integration.welcome_message || 'Hello! Welcome to our support. Send a message to create a support ticket.',
    notify_new_ticket: integration.notify_new_ticket ?? true,
    notify_ticket_resolved: integration.notify_ticket_resolved ?? true,
    notify_new_comment: integration.notify_new_comment ?? true,
  })

  // Check for connection success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('connected') === 'true') {
      setIsConnected(true)
      setCurrentStep(2)
      toast.success('Successfully connected to Telegram!')
    }
  }, [])

  const handleConnectBot = async () => {
    if (!data.bot_token.trim()) {
      toast.error('Please enter your bot token')
      return
    }

    setConnecting(true)
    const loadingToast = toast.loading('Connecting to Telegram bot...')

    try {
      const response = await fetch('/api/integrations/telegram/connect/', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken,
        },
        credentials: 'same-origin',
        body: JSON.stringify({ bot_token: data.bot_token })
      })

      const result = await response.json()
      toast.dismiss(loadingToast)

      if (result.success) {
        setIsConnected(true)
        setBotUsername(result.bot_username)
        setCurrentStep(2)
        toast.success(`Connected to @${result.bot_username}!`)
      } else {
        toast.error(result.error || 'Failed to connect to Telegram bot')
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Failed to connect to Telegram:', error)
      toast.error('Failed to connect to Telegram bot')
    } finally {
      setConnecting(false)
    }
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    const loadingToast = toast.loading('Testing Telegram bot...')

    try {
      const response = await fetch('/api/integrations/telegram/test/', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken,
        },
        credentials: 'same-origin',
        body: JSON.stringify({})
      })

      const result = await response.json()
      toast.dismiss(loadingToast)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error || 'Test failed')
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Failed to test Telegram:', error)
      toast.error('Failed to test Telegram connection')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    toast.promise(
      new Promise((resolve, reject) => {
        fetch('/api/integrations/telegram/configure/', {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'X-CSRFToken': window.csrfToken,
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            auto_create_tickets: data.auto_create_tickets,
            default_priority: data.default_priority,
            welcome_message: data.welcome_message,
            notify_new_ticket: data.notify_new_ticket,
            notify_ticket_resolved: data.notify_ticket_resolved,
            notify_new_comment: data.notify_new_comment,
          })
        })
        .then(response => response.json())
        .then(result => {
          if (result.status === 'success') {
            router.visit('/settings/integrations/')
            resolve()
          } else {
            reject(result.message)
          }
        })
        .catch(reject)
      }),
      {
        loading: 'Saving configuration...',
        success: 'Telegram integration configured successfully!',
        error: 'Configuration failed',
      }
    )
  }

  const handleNext = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (currentStep === 1) {
      if (!isConnected) {
        toast.error('Please connect your Telegram bot first')
        return false
      }
      setCurrentStep(2)
      return false
    }
    if (currentStep === 2) {
      setCurrentStep(3)
    }
    return false
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/integrations/telegram/disconnect/', {
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
        setBotUsername('')
        setData('bot_token', '')
        toast.success('Telegram bot disconnected')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to disconnect')
      }
    } catch (error) {
      console.error('Failed to disconnect Telegram:', error)
      toast.error('Failed to disconnect Telegram')
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

  return (
    <>
      <Head title="Telegram Integration - Setup" />
      <AppShell active="settings">
        <div className="flex flex-1 min-h-[calc(100vh-3rem)]">
          {sidenavOpen && <SettingsSidenav activeSection="integrations" />}

          <main className="flex-1 bg-gray-50">
            {/* Header */}
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
                  <div className="w-8 h-8 bg-[#0088CC] rounded-lg flex items-center justify-center text-white">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-800">Telegram Integration</h1>
                    <p className="text-sm text-gray-600">Connect your Telegram bot for ticket support</p>
                  </div>
                </div>
              </div>

              {/* Connection Status & Actions */}
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Connected {botUsername && `to @${botUsername}`}
                    </div>
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

                    {/* Step 1: Connect Bot */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                        currentStep === 1 ? 'bg-gray-900 text-white' : currentStep > 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {currentStep > 1 ? '✓' : '1'}
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className={`text-sm font-medium ${currentStep === 1 ? 'text-gray-900' : currentStep > 1 ? 'text-green-600' : 'text-gray-500'}`}>
                          Connect Bot
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Enter your bot token</p>
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
                          Configure Settings
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Set up ticket behavior</p>
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

                  {/* Step 1: Connect Bot */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-[#0088CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Send className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Telegram Bot</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Create a bot using <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[#0088CC] hover:underline">@BotFather</a> on Telegram
                          and enter the bot token below.
                        </p>

                        {!isConnected ? (
                          <div className="max-w-md mx-auto space-y-4">
                            <div className="text-left">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bot Token from @BotFather
                              </label>
                              <input
                                type="password"
                                value={data.bot_token}
                                onChange={(e) => setData('bot_token', e.target.value)}
                                placeholder="123456789:ABCdefGhIJKlmNOPQRsTUVwxyZ..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0088CC] focus:border-transparent"
                              />
                              <p className="text-xs text-gray-500 mt-2">
                                Your token is securely stored and only used to connect to your bot.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleConnectBot}
                              disabled={connecting || !data.bot_token.trim()}
                              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0088CC] hover:bg-[#006699] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {connecting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1.01.54-1.45.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.07-.78 4.17-1.82 6.94-3.02 8.32-3.61 3.96-1.66 4.78-1.95 5.32-1.96.12 0 .38.03.55.18.14.12.18.29.2.45-.01.06.01.24 0 .38z"/>
                                  </svg>
                                  Connect Telegram Bot
                                </>
                              )}
                            </button>

                            {/* Instructions */}
                            <div className="text-left bg-gray-50 rounded-lg p-4 mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">How to create a Telegram bot:</h4>
                              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                                <li>Open Telegram and search for <span className="font-mono text-[#0088CC]">@BotFather</span></li>
                                <li>Send <span className="font-mono bg-gray-200 px-1 rounded">/newbot</span> command</li>
                                <li>Follow the prompts to name your bot</li>
                                <li>Copy the API token and paste it above</li>
                              </ol>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Connected to @{botUsername}
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowDisconnectDialog(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors text-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Disconnect Bot
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
                              <h4 className="font-medium text-green-900">Bot Connected Successfully!</h4>
                              <p className="text-sm text-green-700 mt-1">
                                Your Telegram bot is ready. Click "Next" to configure how tickets are created.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Configure Settings */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Ticket Settings</h3>
                        <p className="text-gray-600 mb-6">
                          Set up how tickets are created from Telegram messages and configure notifications.
                        </p>
                      </div>

                      {/* Auto Create Tickets */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Auto-create Tickets</h4>
                            <p className="text-sm text-gray-500 mt-1">Automatically create support tickets from new Telegram conversations</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={data.auto_create_tickets}
                              onChange={(e) => setData('auto_create_tickets', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Default Priority */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Ticket Priority
                        </label>
                        <Select
                          value={data.default_priority}
                          onChange={(value) => setData('default_priority', value)}
                          options={priorities.length > 0 ? priorities : [
                            { id: 'low', name: 'Low' },
                            { id: 'normal', name: 'Normal' },
                            { id: 'high', name: 'High' },
                            { id: 'urgent', name: 'Urgent' },
                          ]}
                          placeholder="Select priority..."
                          displayKey="name"
                          valueKey="id"
                        />
                        <p className="text-xs text-gray-500 mt-1">Priority assigned to tickets created from Telegram</p>
                      </div>

                      {/* Welcome Message */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Welcome Message
                        </label>
                        <textarea
                          value={data.welcome_message}
                          onChange={(e) => setData('welcome_message', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Hello! Welcome to our support..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Sent when a user starts a conversation with your bot</p>
                      </div>

                      {/* Notification Settings */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Notification Settings
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={data.notify_new_ticket}
                              onChange={(e) => setData('notify_new_ticket', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Confirm ticket creation to user</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={data.notify_ticket_resolved}
                              onChange={(e) => setData('notify_ticket_resolved', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Notify user when ticket is resolved</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={data.notify_new_comment}
                              onChange={(e) => setData('notify_new_comment', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Send agent replies to Telegram</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Test & Complete */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Test & Complete Setup</h3>
                        <p className="text-gray-600 mb-6">
                          Test your Telegram bot integration before finishing setup.
                        </p>
                      </div>

                      {/* Summary Card */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-medium text-gray-900 mb-4">Configuration Summary</h4>
                        <dl className="space-y-3">
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Bot</dt>
                            <dd className="text-sm font-medium text-gray-900">@{botUsername}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Auto-create tickets</dt>
                            <dd className="text-sm font-medium text-gray-900">{data.auto_create_tickets ? 'Enabled' : 'Disabled'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Default priority</dt>
                            <dd className="text-sm font-medium text-gray-900 capitalize">{data.default_priority}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Reply notifications</dt>
                            <dd className="text-sm font-medium text-gray-900">{data.notify_new_comment ? 'Enabled' : 'Disabled'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Test Bot */}
                      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                        <h4 className="font-medium text-blue-900 mb-2">Test Your Bot</h4>
                        <p className="text-sm text-blue-700 mb-4">
                          Open Telegram and send a message to <span className="font-mono">@{botUsername}</span> to test ticket creation.
                        </p>
                        <div className="flex gap-3">
                          <a
                            href={`https://t.me/${botUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088CC] hover:bg-[#006699] text-white rounded-lg font-medium transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1.01.54-1.45.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.07-.78 4.17-1.82 6.94-3.02 8.32-3.61 3.96-1.66 4.78-1.95 5.32-1.96.12 0 .38.03.55.18.14.12.18.29.2.45-.01.06.01.24 0 .38z"/>
                            </svg>
                            Open @{botUsername}
                          </a>
                          <button
                            type="button"
                            onClick={handleTestConnection}
                            disabled={testingConnection}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
                          >
                            {testingConnection ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Testing...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Verify Connection
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Webhook Info */}
                      {webhook_preview && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                          <h4 className="font-medium text-gray-700 mb-2 text-sm">Webhook URL (Auto-configured)</h4>
                          <code className="text-xs text-gray-600 break-all">{webhook_preview}</code>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentStep === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ← Back
                    </button>

                    <div className="flex gap-3">
                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={currentStep === 1 && !isConnected}
                          className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={processing}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {processing ? 'Saving...' : 'Complete Setup'}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>

        {/* Disconnect Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDisconnectDialog}
          onClose={() => setShowDisconnectDialog(false)}
          onConfirm={() => {
            setShowDisconnectDialog(false)
            handleDisconnect()
          }}
          title="Disconnect Telegram Bot"
          message="Are you sure you want to disconnect this Telegram bot? Users will no longer be able to create tickets via Telegram."
          confirmText="Disconnect"
          confirmVariant="danger"
        />
      </AppShell>
    </>
  )
}
