import React, { useState } from 'react'
import { Head } from '@inertiajs/react'
import AppShell from '../components/AppShell'
import { THEME } from '../constants/theme'

export default function AI({ conversation = [] }) {
  const [messages, setMessages] = useState(conversation.length ? conversation : [
    { id: 1, role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { id: Date.now(), role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I understand your question. This is a placeholder response. In production, this would connect to your AI service.',
      }
      setMessages((prev) => [...prev, aiMessage])
      setLoading(false)
    }, 1200)
  }

  const suggestions = [
    'How do I create a ticket?',
    'What are the best practices for ticket management?',
    'Help me find information about SLA policies',
    'Summarize recent customer feedback',
  ]

  return (
    <>
      <Head title="AI Assistant" />
      <AppShell active="ai">
        <main className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4a154b] to-[#825084] flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">AI Assistant</h1>
                <p className="text-sm text-gray-500">Powered by advanced language models</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.length === 1 && (
              <div className="max-w-3xl mx-auto mb-8">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Quick suggestions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(sug)}
                      className="p-3 bg-white border border-gray-200 rounded-lg text-left text-sm text-gray-700 hover:border-[#4a154b] hover:bg-[#e6f0f1] transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#4a154b] text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-2xl px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a154b] focus:border-transparent disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`${THEME.button.primary} px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                Send
              </button>
            </form>
          </div>
        </main>
      </AppShell>
    </>
  )
}
