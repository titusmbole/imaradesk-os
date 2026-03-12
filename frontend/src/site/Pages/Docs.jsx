import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SiteLayout from '../components/SiteLayout'
import { COLORS } from '../constants/theme'

const DARK_THEME = {
  darkBg: '#0a1628',
  darkBgSecondary: '#0d2847',
  cardBg: 'rgba(13, 40, 71, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
}

const quickStartGuides = [
  { icon: '🚀', title: '5-Minute Setup', description: 'Get up and running in minutes', time: '5 min', link: '/docs/getting-started/quick-start/', gradient: 'from-purple-500 to-pink-500' },
  { icon: '🎫', title: 'Ticket Creation', description: 'Learn how to create and manage tickets', time: '10 min', link: '/docs/features/ticket-creation/', gradient: 'from-blue-500 to-cyan-500' },
  { icon: '📚', title: 'Knowledge Base', description: 'Set up self-service articles', time: '8 min', link: '/docs/features/knowledge-base/', gradient: 'from-amber-500 to-orange-500' },
  { icon: '⏱️', title: 'SLA Configuration', description: 'Configure service level agreements', time: '15 min', link: '/docs/features/sla-configuration/', gradient: 'from-green-500 to-emerald-500' },
]

const docSections = [
  {
    title: 'Getting Started',
    icon: '📖',
    description: 'Begin your journey with ImaraDesk',
    items: [
      { name: 'Quick Start Guide', icon: '🚀', slug: 'getting-started/quick-start' },
      { name: 'Installation', icon: '⚙️', slug: 'getting-started/installation' },
      { name: 'System Requirements', icon: '💻', slug: 'getting-started/system-requirements' },
      { name: 'Architecture Overview', icon: '🏗️', slug: 'getting-started/architecture' },
    ],
  },
  {
    title: 'Core Features',
    icon: '✨',
    description: 'Master the essential features',
    items: [
      { name: 'Ticket Creation', icon: '🎫', slug: 'features/ticket-creation' },
      { name: 'Ticket Management', icon: '📧', slug: 'features/ticket-management' },
      { name: 'SLA Configuration', icon: '⏱️', slug: 'features/sla-configuration' },
      { name: 'Knowledge Base', icon: '📚', slug: 'features/knowledge-base' },
      { name: 'Customer Portal', icon: '🏠', slug: 'features/customer-portal' },
      { name: 'Automation Rules', icon: '🤖', slug: 'features/automation' },
    ],
  },
  {
    title: 'Administration',
    icon: '⚙️',
    description: 'Configure and customize your instance',
    items: [
      { name: 'User Management', icon: '👤', slug: 'administration/user-management' },
      { name: 'Team Setup', icon: '👥', slug: 'administration/teams' },
      { name: 'Email Settings', icon: '📧', slug: 'administration/email' },
      { name: 'Security & SSO', icon: '🔐', slug: 'administration/security' },
    ],
  },
  {
    title: 'For Developers',
    icon: '👨‍💻',
    description: 'Extend and integrate ImaraDesk',
    items: [
      { name: 'REST API Reference', icon: '📡', slug: 'api/introduction' },
      { name: 'Webhooks', icon: '🔗', slug: 'api/webhooks' },
      { name: 'Custom Integrations', icon: '🔌', slug: 'api/integrations' },
      { name: 'SDK & Libraries', icon: '📦', slug: 'api/sdk' },
    ],
  },
]

const videoTutorials = [
  { title: 'Getting Started in 10 Minutes', duration: '10:23', thumbnail: '🎬', views: '12.5K', gradient: 'from-purple-600 to-pink-600' },
  { title: 'Advanced Automation Workflows', duration: '15:45', thumbnail: '🎥', views: '8.2K', gradient: 'from-blue-600 to-cyan-600' },
  { title: 'API Integration Tutorial', duration: '22:10', thumbnail: '📹', views: '5.7K', gradient: 'from-amber-600 to-orange-600' },
]

export default function Docs() {
  const [scrollY, setScrollY] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head title="Documentation - ImaraDesk" />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(130, 80, 132, 0.4); }
          50% { box-shadow: 0 0 40px rgba(130, 80, 132, 0.7); }
        }
        @keyframes typing {
          0% { width: 0; }
          50% { width: 100%; }
          100% { width: 0; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        
        .gradient-text {
          background: linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.primaryActive} 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-card {
          background: rgba(13, 40, 71, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glass-card-hover:hover {
          background: rgba(13, 40, 71, 0.8);
          border-color: rgba(130, 80, 132, 0.5);
          transform: translateY(-4px);
        }
        
        .search-glow {
          box-shadow: 0 0 0 3px ${COLORS.primaryLight}30;
        }
        
        .code-window {
          background: #0d1117;
          border: 1px solid #30363d;
        }
        
        .code-header {
          background: #161b22;
          border-bottom: 1px solid #30363d;
        }
      `}</style>

      <SiteLayout scrollY={scrollY} darkMode={true}>
        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${DARK_THEME.darkBg} 0%, ${DARK_THEME.darkBgSecondary} 50%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float" 
                 style={{ background: `radial-gradient(circle, ${COLORS.primaryLight}, transparent)` }} />
            <div className="absolute bottom-20 left-20 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl" 
                 style={{ background: `radial-gradient(circle, ${COLORS.primaryActive}, transparent)` }} />
            {/* Code rain effect */}
            <div className="absolute inset-0 opacity-5 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute text-xs text-green-400 font-mono whitespace-nowrap"
                     style={{ left: `${i * 5}%`, top: `${(i * 7) % 100}%`, transform: `translateY(${Math.sin(i) * 50}px)` }}>
                  {'{'}docs{'}'}
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                Learn <span className="gradient-text">ImaraDesk</span>
              </h1>
              <p className="text-xl mb-12 animate-fadeInUp" style={{ color: DARK_THEME.textSecondary, animationDelay: '0.2s' }}>
                Everything you need to get started, configure, and master our helpdesk platform
              </p>

              {/* Search */}
              <div className="max-w-2xl mx-auto relative animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div className={`glass-card rounded-2xl p-2 transition-all duration-300 ${searchFocused ? 'search-glow' : ''}`}>
                  <div className="relative flex items-center">
                    <svg className="w-6 h-6 absolute left-4" style={{ color: searchFocused ? COLORS.primaryLight : DARK_THEME.textMuted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search documentation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      className="w-full px-6 py-4 pl-14 rounded-xl bg-transparent text-white placeholder-white/40 focus:outline-none text-lg"
                    />
                    <div className="hidden sm:flex items-center gap-1 mr-4">
                      <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: DARK_THEME.textMuted }}>⌘</kbd>
                      <kbd className="px-2 py-1 rounded text-xs font-mono" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: DARK_THEME.textMuted }}>K</kbd>
                    </div>
                  </div>
                </div>
                <p className="text-sm mt-3" style={{ color: DARK_THEME.textMuted }}>Try: "ticket creation", "API authentication", "webhooks"</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start Guides */}
        <section className="py-20" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Quick Start Guides</h2>
              <p style={{ color: DARK_THEME.textSecondary }}>Get productive fast with our step-by-step tutorials</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStartGuides.map((guide, idx) => (
                <Link
                  key={idx}
                  href={guide.link}
                  className="group glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-500 animate-fadeInUp"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`h-32 bg-gradient-to-br ${guide.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-5xl group-hover:scale-125 transition-transform duration-500">{guide.icon}</span>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90">{guide.title}</h3>
                    <p className="text-sm mb-4" style={{ color: DARK_THEME.textSecondary }}>{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: COLORS.primaryLight }}>Start →</span>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: DARK_THEME.textMuted }}>{guide.time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation Sections */}
        <section className="py-20" style={{ background: `linear-gradient(180deg, ${DARK_THEME.darkBg} 0%, ${DARK_THEME.darkBgSecondary} 100%)` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Browse <span className="gradient-text">Documentation</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {docSections.map((section, idx) => (
                <DocSection key={idx} section={section} delay={idx * 100} />
              ))}
            </div>
          </div>
        </section>

        {/* API Reference Highlight */}
        <section className="py-20" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slideInLeft">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" 
                      style={{ backgroundColor: `${COLORS.primaryLight}20`, color: COLORS.primaryLight }}>
                  FOR DEVELOPERS
                </span>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Powerful <span className="gradient-text">REST API</span>
                </h2>
                <p className="text-lg mb-8" style={{ color: DARK_THEME.textSecondary }}>
                  Build custom integrations, automate workflows, and extend functionality with our comprehensive API.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'RESTful endpoints for all resources',
                    'OAuth 2.0 and API key authentication',
                    'Webhooks for real-time events',
                    'Rate limiting with clear headers',
                    'OpenAPI specification available',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <svg className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.primaryLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/docs/api/introduction" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>
                  View API Docs →
                </Link>
              </div>

              {/* Code Example */}
              <div className="code-window rounded-2xl overflow-hidden animate-fadeInUp">
                <div className="code-header px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-auto text-xs" style={{ color: DARK_THEME.textMuted }}>example.js</span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm font-mono" style={{ color: '#c9d1d9' }}>
{`// Create a new ticket
const response = await fetch(
  'https://api.coredesk.pro/v1/tickets',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subject: 'Need help with billing',
      description: 'Customer inquiry...',
      priority: 'high',
      tags: ['billing', 'urgent']
    })
  }
)

const ticket = await response.json()
console.log('Ticket created:', ticket.id)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="py-20" style={{ background: `linear-gradient(180deg, ${DARK_THEME.darkBgSecondary} 0%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Video <span className="gradient-text">Tutorials</span>
              </h2>
              <p style={{ color: DARK_THEME.textSecondary }}>Learn visually with our video guides</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {videoTutorials.map((video, idx) => (
                <div key={idx} className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer hover:scale-[1.03] animate-fadeInUp" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className={`h-48 bg-gradient-to-br ${video.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-300">{video.thumbnail}</span>
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-semibold bg-black/70 text-white">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90">{video.title}</h3>
                    <p className="text-sm" style={{ color: DARK_THEME.textMuted }}>{video.views} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden" style={{ background: DARK_THEME.darkBg }}>
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center, ${COLORS.primary}40 0%, transparent 70%)` }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Need More Help?</h2>
            <p className="text-xl mb-10" style={{ color: DARK_THEME.textSecondary }}>
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 animate-pulse-glow" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>
                Contact Support →
              </Link>
              <a href="#" className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:bg-white/10" style={{ border: `2px solid ${COLORS.primaryLight}`, color: COLORS.primaryLight }}>
                Join Community
              </a>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}

function DocSection({ section, delay }) {
  return (
    <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:border-white/20 animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${COLORS.primary}30` }}>
          {section.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{section.title}</h3>
          <p className="text-sm" style={{ color: DARK_THEME.textMuted }}>{section.description}</p>
        </div>
      </div>
      <ul className="space-y-2 mt-6">
        {section.items.map((item, idx) => (
          <li key={idx}>
            <Link
              href={`/docs/${item.slug}/`}
              className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all group hover:bg-white/5"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1" style={{ color: DARK_THEME.textSecondary }}>{item.name}</span>
              <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" style={{ color: COLORS.primaryLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
