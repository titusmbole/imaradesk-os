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

const FEATURES = {
  ticketing: [
    { icon: '📨', title: 'Multi-channel Support', description: 'Capture tickets from email, web forms, live chat, and social media in one unified inbox.' },
    { icon: '🔄', title: 'Smart Automation', description: 'Auto-assign tickets based on skills, workload, or custom rules. Trigger workflows automatically.' },
    { icon: '📊', title: 'SLA Management', description: 'Set response and resolution targets. Get alerts before breaches. Track SLA performance.' },
    { icon: '🏷️', title: 'Custom Fields & Tags', description: 'Categorize tickets your way with unlimited custom fields, tags, and ticket types.' },
    { icon: '💬', title: 'Internal Collaboration', description: 'Add private notes, @mention teammates, and escalate issues without leaving the ticket.' },
    { icon: '📝', title: 'Canned Responses', description: 'Save time with templated replies. Insert dynamic content and personalize at scale.' },
  ],
  analytics: [
    { icon: '📈', title: 'Real-time Dashboard', description: 'Monitor ticket volume, response times, and team performance in real-time.' },
    { icon: '🎯', title: 'Custom Reports', description: 'Build reports with drag-and-drop. Filter by any field. Schedule automated exports.' },
    { icon: '⏱️', title: 'Time Tracking', description: 'Track time spent on tickets. Analyze productivity. Bill clients accurately.' },
    { icon: '📉', title: 'Trend Analysis', description: 'Identify patterns in ticket types, peak hours, and seasonal variations.' },
  ],
  selfService: [
    { icon: '📚', title: 'Knowledge Base', description: 'Create and organize help articles. Let customers find answers instantly.' },
    { icon: '🔍', title: 'Smart Search', description: 'AI-powered search suggests relevant articles before ticket submission.' },
    { icon: '👤', title: 'Customer Portal', description: 'Branded portal where customers track tickets and access resources.' },
    { icon: '💡', title: 'Community Forums', description: 'Let customers help each other. Highlight best answers.' },
  ],
  integrations: [
    { name: 'Slack', icon: '💬', description: 'Create tickets from Slack. Get notifications in channels.' },
    { name: 'Jira', icon: '🔧', description: 'Sync with Jira issues. Link tickets to development work.' },
    { name: 'Salesforce', icon: '☁️', description: 'View customer data. Create tickets from Salesforce.' },
    { name: 'GitHub', icon: '🐙', description: 'Link tickets to commits and PRs. Auto-close resolved issues.' },
    { name: 'Zapier', icon: '⚡', description: 'Connect to 5000+ apps with no-code automations.' },
    { name: 'API', icon: '🔌', description: 'Build custom integrations with our REST API.' },
  ],
}

export default function Features() {
  const [scrollY, setScrollY] = useState(0)
  const [activeTab, setActiveTab] = useState('ticketing')
  const [version, setVersion] = useState('cloud')

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head title="Features - ImaraDesk" />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(130, 80, 132, 0.4); }
          50% { box-shadow: 0 0 40px rgba(130, 80, 132, 0.7); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
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
      `}</style>

      <SiteLayout scrollY={scrollY} darkMode={true}>
        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${DARK_THEME.darkBg} 0%, ${DARK_THEME.darkBgSecondary} 50%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float" 
                 style={{ background: `radial-gradient(circle, ${COLORS.primaryLight}, transparent)` }} />
            <div className="absolute bottom-20 left-20 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl" 
                 style={{ background: `radial-gradient(circle, ${COLORS.primaryActive}, transparent)`, animationDelay: '2s' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Everything you need for
              <span className="gradient-text"> world-class support</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-12" style={{ color: DARK_THEME.textSecondary }}>
              From ticket management to analytics, automation to integrations — ImaraDesk has all the tools to deliver exceptional customer experiences.
            </p>

            {/* Version Toggle */}
            <div className="inline-flex items-center gap-2 p-2 rounded-2xl glass-card">
              <button
                onClick={() => setVersion('cloud')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${version === 'cloud' ? 'text-white' : ''}`}
                style={version === 'cloud' ? { backgroundColor: COLORS.primary } : { color: DARK_THEME.textSecondary }}
              >
                ☁️ Cloud
              </button>
              <button
                onClick={() => setVersion('opensource')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${version === 'opensource' ? 'text-white' : ''}`}
                style={version === 'opensource' ? { backgroundColor: COLORS.primary } : { color: DARK_THEME.textSecondary }}
              >
                🔓 Open Source
              </button>
            </div>
          </div>
        </section>

        {/* Feature Categories */}
        <section className="py-24" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {[
                { id: 'ticketing', label: '📨 Ticketing', desc: 'Core features' },
                { id: 'analytics', label: '📊 Analytics', desc: 'Insights & reports' },
                { id: 'selfService', label: '📚 Self-Service', desc: 'Knowledge base' },
                { id: 'integrations', label: '🔌 Integrations', desc: 'Connect apps' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 rounded-xl transition-all ${activeTab === tab.id ? '' : 'glass-card hover:bg-white/10'}`}
                  style={activeTab === tab.id ? { backgroundColor: COLORS.primary, color: 'white' } : { color: DARK_THEME.textSecondary }}
                >
                  <div className="text-lg font-semibold">{tab.label}</div>
                  <div className="text-sm opacity-70">{tab.desc}</div>
                </button>
              ))}
            </div>

            {/* Feature Grid */}
            <div className={`grid gap-6 ${activeTab === 'integrations' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {activeTab === 'integrations' 
                ? FEATURES.integrations.map((item, idx) => (
                    <IntegrationCard key={idx} {...item} />
                  ))
                : FEATURES[activeTab].map((feature, idx) => (
                    <FeatureCard key={idx} {...feature} delay={idx * 100} />
                  ))
              }
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24" style={{ background: `linear-gradient(180deg, ${DARK_THEME.darkBg} 0%, ${DARK_THEME.darkBgSecondary} 100%)` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Cloud vs <span className="gradient-text">Open Source</span>
              </h2>
              <p className="text-xl" style={{ color: DARK_THEME.textSecondary }}>Choose the deployment that works for your organization</p>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: `${COLORS.primary}30` }}>
                    <tr>
                      <th className="text-left py-5 px-6 font-semibold text-white">Feature</th>
                      <th className="text-center py-5 px-6 font-semibold text-white">☁️ Cloud</th>
                      <th className="text-center py-5 px-6 font-semibold text-white">🔓 Open Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ComparisonRow feature="Hosting" cloud="Managed by us" opensource="Self-hosted" />
                    <ComparisonRow feature="Setup" cloud="Instant" opensource="Manual" />
                    <ComparisonRow feature="Updates" cloud="Automatic" opensource="Manual" />
                    <ComparisonRow feature="Support" cloud="Priority 24/7" opensource="Community" />
                    <ComparisonRow feature="Core Features" cloud={true} opensource={true} />
                    <ComparisonRow feature="Advanced Analytics" cloud={true} opensource={false} />
                    <ComparisonRow feature="Premium Integrations" cloud={true} opensource={false} />
                    <ComparisonRow feature="Custom Branding" cloud={true} opensource={true} />
                    <ComparisonRow feature="SSL Certificate" cloud="Included" opensource="Own" />
                    <ComparisonRow feature="Database Access" cloud="Read-only" opensource="Full" />
                    <ComparisonRow feature="Source Code Access" cloud={false} opensource={true} />
                    <ComparisonRow feature="Cost" cloud="Subscription" opensource="Free*" />
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-center mt-6 text-sm" style={{ color: DARK_THEME.textMuted }}>
              * Open source is free to use. Support and premium features available separately.
            </p>
          </div>
        </section>

        {/* Highlight Features */}
        <section className="py-24" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Built for <span className="gradient-text">Scale</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard number="99.99%" label="Uptime SLA" desc="Enterprise-grade reliability" />
              <StatCard number="<100ms" label="Response Time" desc="Lightning-fast performance" />
              <StatCard number="1M+" label="Tickets/Day" desc="Handles any volume" />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-24" style={{ background: `linear-gradient(180deg, ${DARK_THEME.darkBgSecondary} 0%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" 
                      style={{ backgroundColor: `${COLORS.primaryLight}20`, color: COLORS.primaryLight }}>
                  ENTERPRISE SECURITY
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Security you can <span className="gradient-text">trust</span>
                </h2>
                <p className="text-lg mb-8" style={{ color: DARK_THEME.textSecondary }}>
                  We take security seriously. ImaraDesk is built with industry-leading security practices to keep your data safe.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: '🔒', text: 'SOC 2 Type II Certified' },
                    { icon: '🔐', text: 'End-to-end encryption' },
                    { icon: '🛡️', text: 'GDPR & HIPAA compliant' },
                    { icon: '👤', text: 'SSO & 2FA support' },
                    { icon: '📋', text: 'Role-based access control' },
                    { icon: '🔍', text: 'Audit logs & activity tracking' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-lg text-white">
                      <span className="text-2xl">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="glass-card rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Uptime', value: '99.99%' },
                      { label: 'Data Centers', value: '3+ regions' },
                      { label: 'Backups', value: 'Real-time' },
                      { label: 'Encryption', value: 'AES-256' },
                    ].map((stat, idx) => (
                      <div key={idx} className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="text-3xl font-bold mb-1" style={{ color: COLORS.primaryLight }}>{stat.value}</div>
                        <div className="text-sm" style={{ color: DARK_THEME.textMuted }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden" style={{ background: DARK_THEME.darkBg }}>
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center, ${COLORS.primary}40 0%, transparent 70%)` }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your support?
            </h2>
            <p className="text-xl mb-10" style={{ color: DARK_THEME.textSecondary }}>
              Start your 14-day free trial. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 animate-pulse-glow" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>
                Start Free Trial →
              </Link>
              <Link href="/pricing" className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:bg-white/10" style={{ border: `2px solid ${COLORS.primaryLight}`, color: COLORS.primaryLight }}>
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}

function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-8 transition-all duration-300" style={{ animationDelay: `${delay}ms` }}>
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-6" style={{ backgroundColor: `${COLORS.primary}30` }}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p style={{ color: DARK_THEME.textSecondary }}>{description}</p>
    </div>
  )
}

function IntegrationCard({ name, icon, description }) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${COLORS.primary}30` }}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white">{name}</h3>
      </div>
      <p className="text-sm" style={{ color: DARK_THEME.textSecondary }}>{description}</p>
    </div>
  )
}

function ComparisonRow({ feature, cloud, opensource }) {
  const renderCell = (value) => {
    if (typeof value === 'boolean') {
      return value 
        ? <svg className="w-6 h-6 mx-auto" fill="none" stroke={COLORS.primaryLight} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-6 h-6 mx-auto" fill="none" stroke="rgba(255,255,255,0.3)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
    }
    return <span className="text-white font-medium">{value}</span>
  }

  return (
    <tr className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <td className="py-4 px-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{feature}</td>
      <td className="py-4 px-6 text-center" style={{ backgroundColor: `${COLORS.primary}10` }}>{renderCell(cloud)}</td>
      <td className="py-4 px-6 text-center">{renderCell(opensource)}</td>
    </tr>
  )
}

function StatCard({ number, label, desc }) {
  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <div className="text-5xl font-bold mb-2 gradient-text">{number}</div>
      <div className="text-xl font-semibold text-white mb-2">{label}</div>
      <div style={{ color: DARK_THEME.textMuted }}>{desc}</div>
    </div>
  )
}
