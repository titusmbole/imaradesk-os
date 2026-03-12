import React, { useState, useEffect } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import SiteLayout from '../components/SiteLayout'
import { COLORS } from '../constants/theme'
import { docsNavigation, getDocBySlug, getDocNavigation } from '../docs/navigation'

// Simple markdown-like content renderer
function ContentRenderer({ content }) {
  // This would normally use a markdown parser
  // For now, we'll render pre-processed content
  return (
    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-a:text-[#4a154b] prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:rounded-xl prose-table:border-collapse prose-th:border prose-th:border-gray-200 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2">
      {content}
    </div>
  )
}

// Documentation content components
const docsContent = {
  'getting-started/quick-start': QuickStartContent,
  'getting-started/installation': InstallationContent,
  'getting-started/system-requirements': SystemRequirementsContent,
  'features/ticket-creation': TicketCreationContent,
  'features/ticket-management': TicketManagementContent,
  'features/knowledge-base': KnowledgeBaseContent,
  'features/customer-portal': CustomerPortalContent,
  'configuration/general-settings': GeneralSettingsContent,
  'configuration/notifications': NotificationsContent,
  'configuration/security': SecuritySettingsContent,
  'configuration/custom-domains': CustomDomainsContent,
  'configuration/email-templates': EmailTemplatesContent,
  'configuration/smtp': SMTPConfigContent,
  'configuration/integrations': IntegrationsContent,
  'sla/overview': SLAOverviewContent,
  'sla/policies': SLAPoliciesContent,
  'sla/business-hours': BusinessHoursContent,
  'sla/holidays': HolidaysContent,
  'team/users': TeamUsersContent,
  'team/roles': TeamRolesContent,
  'team/groups': TeamGroupsContent,
  'modules/tickets': TicketsModuleContent,
  'modules/assets': AssetsModuleContent,
  'modules/tasks': TasksModuleContent,
  'modules/knowledge-base': KBModuleContent,
  'modules/surveys': SurveysModuleContent,
  'modules/customer-portal': CustomerPortalModuleContent,
  'modules/sla': SLAModuleContent,
  'modules/integrations': IntegrationsModuleContent,
  'modules/people': PeopleModuleContent,
  'api/introduction': APIIntroductionContent,
}

export default function DocsPage() {
  const { slug } = usePage().props
  const [scrollY, setScrollY] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const currentDoc = getDocBySlug(slug)
  const { prev, next } = getDocNavigation(slug)
  const ContentComponent = docsContent[slug]

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head title={currentDoc ? `${currentDoc.title} - Docs` : 'Documentation'} />
      
      <SiteLayout scrollY={scrollY}>
        <div className="flex bg-gray-50">
          {/* Sidebar */}
          <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 transition-all duration-300`}>
            <div className="w-72 h-[calc(100vh-64px)] bg-white border-r border-gray-200 overflow-y-auto sticky top-16">
              <div className="p-6">
                <Link href="/docs" className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-6 hover:text-[#4a154b] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Documentation
                </Link>
                
                <nav className="space-y-6">
                  {docsNavigation.map((section, idx) => (
                    <div key={idx}>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                        <span>{section.icon}</span>
                        {section.title}
                      </h3>
                      <ul className="space-y-1 ml-6">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              href={`/docs/${item.slug}/`}
                              className={`block py-2 px-3 rounded-lg text-sm transition-all ${
                                slug === item.slug
                                  ? 'bg-[#4a154b]/10 text-[#4a154b] font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              {item.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className=" px-8 py-12">
              {/* Breadcrumb */}
              {currentDoc && (
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                  <Link href="/docs" className="hover:text-[#4a154b]">Docs</Link>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-400">{currentDoc.section}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">{currentDoc.title}</span>
                </nav>
              )}

              {/* Content */}
              <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                {ContentComponent ? (
                  <ContentComponent />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📄</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                    <p className="text-gray-600 mb-6">The documentation page you're looking for doesn't exist.</p>
                    <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all" style={{ backgroundColor: COLORS.primary }}>
                      Back to Docs
                    </Link>
                  </div>
                )}
              </article>

              {/* Prev/Next Navigation */}
              {(prev || next) && (
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                  {prev ? (
                    <Link href={`/docs/${prev.slug}/`} className="group flex items-center gap-3 text-gray-600 hover:text-[#4a154b] transition-colors">
                      <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Previous</div>
                        <div className="font-medium">{prev.title}</div>
                      </div>
                    </Link>
                  ) : <div />}
                  
                  {next ? (
                    <Link href={`/docs/${next.slug}/`} className="group flex items-center gap-3 text-gray-600 hover:text-[#4a154b] transition-colors text-right">
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">Next</div>
                        <div className="font-medium">{next.title}</div>
                      </div>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : <div />}
                </div>
              )}
            </div>
          </main>
        </div>
      </SiteLayout>
    </>
  )
}

// ============================================
// Documentation Content Components
// ============================================

function QuickStartContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Quick Start Guide</h1>
      <p className="text-lg text-gray-600 mb-8">Get up and running with ImaraDesk in just 5 minutes! This guide will walk you through the essential steps to start managing your support tickets.</p>
      
      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Prerequisites</h2>
      <p className="text-gray-600 mb-4">Before you begin, ensure you have:</p>
      <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Admin access to your ImaraDesk instance</li>
        <li>A valid email address for notifications</li>
        <li>Basic understanding of help desk operations</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 1: Access Your Dashboard</h2>
      <p className="text-gray-600 mb-4">After logging in, you'll land on the Dashboard which provides an overview of:</p>
      <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li><strong>Active Tickets</strong> - Current open tickets requiring attention</li>
        <li><strong>Response Time Metrics</strong> - Average first response time</li>
        <li><strong>Resolution Metrics</strong> - Ticket resolution statistics</li>
        <li><strong>Team Performance</strong> - Agent workload distribution</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 2: Create Your First Ticket</h2>
      <p className="text-gray-600 mb-4">Navigate to <strong>Tickets</strong> in the sidebar and click <strong>+ New Ticket</strong>.</p>
      
      <div className="bg-gray-50 rounded-xl p-6 my-6">
        <h4 className="font-semibold text-gray-900 mb-4">Required Fields:</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Field</th>
                <th className="text-left px-4 py-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Subject</td><td className="px-4 py-3 text-gray-600">Brief summary of the issue</td></tr>
              <tr><td className="px-4 py-3">Description</td><td className="px-4 py-3 text-gray-600">Detailed explanation of the problem</td></tr>
              <tr><td className="px-4 py-3">Priority</td><td className="px-4 py-3 text-gray-600">Low, Normal, High, or Urgent</td></tr>
              <tr><td className="px-4 py-3">Type</td><td className="px-4 py-3 text-gray-600">Question, Incident, Problem, or Task</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 3: Configure Notifications</h2>
      <p className="text-gray-600 mb-4">Go to <strong>Settings &gt; Notifications</strong> to set up email alerts for:</p>
      <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>New ticket creation</li>
        <li>Ticket assignments</li>
        <li>Status changes</li>
        <li>SLA warnings</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Step 4: Invite Your Team</h2>
      <p className="text-gray-600 mb-4">Navigate to <strong>Settings &gt; Users</strong> to:</p>
      <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
        <li>Click <strong>+ Add User</strong></li>
        <li>Enter team member's email</li>
        <li>Assign a role (Admin, Agent, or Viewer)</li>
        <li>Send invitation</li>
      </ol>

      <div className="bg-[#4a154b]/5 border border-[#4a154b]/20 rounded-xl p-6 my-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Pro Tip</h4>
            <p className="text-gray-600 text-sm">Use keyboard shortcuts for faster navigation: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">N</code> for new ticket, <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">S</code> for search, <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">/</code> for global search, and <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">?</code> to show all shortcuts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InstallationContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Installation Guide</h1>
      <p className="text-lg text-gray-600 mb-8">This guide covers the various deployment options for ImaraDesk, including cloud and self-hosted installations.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Cloud Deployment (Recommended)</h2>
      <p className="text-gray-600 mb-4">The fastest way to get started is with our cloud-hosted solution.</p>
      
      <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
        <li>Visit <a href="#" className="text-[#4a154b] hover:underline">coredesk.pro/register</a></li>
        <li>Create your organization account</li>
        <li>Choose your plan (Free tier available)</li>
        <li>Complete the onboarding wizard</li>
      </ol>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6 my-6">
        <h4 className="font-semibold text-green-900 mb-2">Benefits of Cloud</h4>
        <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
          <li><strong>Zero maintenance</strong> - We handle updates and backups</li>
          <li><strong>Automatic scaling</strong> - Handle traffic spikes effortlessly</li>
          <li><strong>99.9% uptime SLA</strong> - Enterprise-grade reliability</li>
          <li><strong>Daily backups</strong> - Your data is always safe</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Self-Hosted Installation</h2>
      <p className="text-gray-600 mb-4">For organizations requiring on-premise deployment.</p>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">System Requirements</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Component</th>
              <th className="text-left px-4 py-3 font-semibold">Minimum</th>
              <th className="text-left px-4 py-3 font-semibold">Recommended</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3">CPU</td><td className="px-4 py-3 text-gray-600">2 cores</td><td className="px-4 py-3 text-gray-600">4+ cores</td></tr>
            <tr><td className="px-4 py-3">RAM</td><td className="px-4 py-3 text-gray-600">4 GB</td><td className="px-4 py-3 text-gray-600">8+ GB</td></tr>
            <tr><td className="px-4 py-3">Storage</td><td className="px-4 py-3 text-gray-600">20 GB SSD</td><td className="px-4 py-3 text-gray-600">50+ GB SSD</td></tr>
            <tr><td className="px-4 py-3">Python</td><td className="px-4 py-3 text-gray-600">3.10+</td><td className="px-4 py-3 text-gray-600">3.12</td></tr>
            <tr><td className="px-4 py-3">Database</td><td className="px-4 py-3 text-gray-600">PostgreSQL 13+</td><td className="px-4 py-3 text-gray-600">PostgreSQL 15+</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Docker Installation</h3>
      <p className="text-gray-600 mb-4">The recommended method for self-hosted deployments:</p>
      
      <div className="bg-gray-900 rounded-xl p-6 my-4 overflow-x-auto">
        <pre className="text-gray-300 text-sm"><code>{`# Clone the repository
git clone https://github.com/coredesk/coredesk.git
cd coredesk

# Create environment file
cp .env.example .env

# Start with Docker Compose
docker-compose up -d`}</code></pre>
      </div>
    </div>
  )
}

function SystemRequirementsContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">System Requirements</h1>
      <p className="text-lg text-gray-600 mb-8">This page outlines the hardware, software, and network requirements for running ImaraDesk.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Cloud Deployment</h2>
      <p className="text-gray-600 mb-4">For cloud-hosted customers, ImaraDesk handles all infrastructure requirements. You only need:</p>
      <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li><strong>Web Browser</strong>: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</li>
        <li><strong>Internet Connection</strong>: Stable broadband (1 Mbps minimum)</li>
        <li><strong>Display</strong>: 1280x720 minimum resolution</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Self-Hosted Requirements</h2>
      
      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Hardware Requirements</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Component</th>
              <th className="text-left px-4 py-3 font-semibold">Minimum</th>
              <th className="text-left px-4 py-3 font-semibold">Recommended</th>
              <th className="text-left px-4 py-3 font-semibold">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3">CPU</td><td className="px-4 py-3 text-gray-600">2 cores</td><td className="px-4 py-3 text-gray-600">4 cores</td><td className="px-4 py-3 text-gray-600">8+ cores</td></tr>
            <tr><td className="px-4 py-3">RAM</td><td className="px-4 py-3 text-gray-600">4 GB</td><td className="px-4 py-3 text-gray-600">8 GB</td><td className="px-4 py-3 text-gray-600">16+ GB</td></tr>
            <tr><td className="px-4 py-3">Storage</td><td className="px-4 py-3 text-gray-600">20 GB SSD</td><td className="px-4 py-3 text-gray-600">50 GB SSD</td><td className="px-4 py-3 text-gray-600">100+ GB NVMe</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Software Requirements</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Software</th>
              <th className="text-left px-4 py-3 font-semibold">Version</th>
              <th className="text-left px-4 py-3 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3">Python</td><td className="px-4 py-3 text-gray-600">3.10+</td><td className="px-4 py-3 text-gray-600">3.12 recommended</td></tr>
            <tr><td className="px-4 py-3">Node.js</td><td className="px-4 py-3 text-gray-600">18+</td><td className="px-4 py-3 text-gray-600">For frontend builds</td></tr>
            <tr><td className="px-4 py-3">PostgreSQL</td><td className="px-4 py-3 text-gray-600">13+</td><td className="px-4 py-3 text-gray-600">15+ recommended</td></tr>
            <tr><td className="px-4 py-3">Redis</td><td className="px-4 py-3 text-gray-600">6+</td><td className="px-4 py-3 text-gray-600">Optional, for caching</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Browser Support</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {[
          { name: 'Chrome', version: '90+' },
          { name: 'Firefox', version: '88+' },
          { name: 'Safari', version: '14+' },
          { name: 'Edge', version: '90+' },
        ].map((browser, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <div className="font-semibold text-gray-900">{browser.name}</div>
            <div className="text-sm text-gray-500">{browser.version}</div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 my-6">
        <p className="text-yellow-800 text-sm"><strong>⚠️ Note:</strong> Internet Explorer is not supported.</p>
      </div>
    </div>
  )
}

function TicketCreationContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Ticket Creation</h1>
      <p className="text-lg text-gray-600 mb-8">Learn how to create, manage, and track support tickets in ImaraDesk. This guide covers all aspects of ticket creation for both agents and customers.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Ticket Sources</h2>
      <p className="text-gray-600 mb-4">Tickets can be created from multiple channels:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {[
          { icon: '🌐', title: 'Web Portal', desc: 'Customer creates via self-service portal' },
          { icon: '📧', title: 'Email', desc: 'Automatic conversion from incoming emails' },
          { icon: '👤', title: 'Agent Created', desc: 'Support team creates on behalf of customer' },
          { icon: '🔌', title: 'API', desc: 'Programmatically via REST API' },
          { icon: '💬', title: 'Live Chat', desc: 'Converted from chat conversations' },
          { icon: '🏠', title: 'Customer Portal', desc: 'Via the customer portal interface' },
        ].map((source, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
            <span className="text-2xl">{source.icon}</span>
            <div>
              <div className="font-semibold text-gray-900">{source.title}</div>
              <div className="text-sm text-gray-600">{source.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Creating a Ticket</h2>
      <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
        <li>Click <strong>+ New Ticket</strong> button in the header or press <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">N</code></li>
        <li>Fill in the required fields</li>
        <li>Click <strong>Create Ticket</strong></li>
      </ol>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Required Fields</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Field</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Subject</td><td className="px-4 py-3 text-gray-600">Brief summary of the issue</td><td className="px-4 py-3 text-gray-500">"Cannot login to account"</td></tr>
            <tr><td className="px-4 py-3 font-medium">Description</td><td className="px-4 py-3 text-gray-600">Detailed explanation</td><td className="px-4 py-3 text-gray-500">Steps to reproduce, errors</td></tr>
            <tr><td className="px-4 py-3 font-medium">Priority</td><td className="px-4 py-3 text-gray-600">Urgency level</td><td className="px-4 py-3 text-gray-500">Low, Normal, High, Urgent</td></tr>
            <tr><td className="px-4 py-3 font-medium">Type</td><td className="px-4 py-3 text-gray-600">Category of issue</td><td className="px-4 py-3 text-gray-500">Question, Incident, Problem, Task</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Priority Levels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {[
          { color: 'green', level: 'Low', desc: 'Non-urgent issues', time: '24-48 hours' },
          { color: 'blue', level: 'Normal', desc: 'Standard requests', time: '8-24 hours' },
          { color: 'orange', level: 'High', desc: 'Important issues', time: '2-8 hours' },
          { color: 'red', level: 'Urgent', desc: 'Critical business impact', time: '< 1 hour' },
        ].map((priority, idx) => (
          <div key={idx} className={`border-l-4 border-${priority.color}-500 bg-${priority.color}-50 rounded-r-lg p-4`} style={{ borderLeftColor: priority.color === 'green' ? '#22c55e' : priority.color === 'blue' ? '#3b82f6' : priority.color === 'orange' ? '#f97316' : '#ef4444' }}>
            <div className="font-semibold text-gray-900">{priority.level}</div>
            <div className="text-sm text-gray-600">{priority.desc}</div>
            <div className="text-xs text-gray-500 mt-1">Response: {priority.time}</div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Status Workflow</h2>
      <div className="flex flex-wrap items-center gap-2 my-6">
        {['New', 'Open', 'In Progress', 'Pending', 'Resolved', 'Closed'].map((status, idx) => (
          <React.Fragment key={idx}>
            <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">{status}</span>
            {idx < 5 && <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function TicketManagementContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Ticket Management</h1>
      <p className="text-lg text-gray-600 mb-8">Learn how to efficiently manage, organize, and resolve support tickets in ImaraDesk.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Ticket List Views</h2>
      <p className="text-gray-600 mb-4">ImaraDesk provides powerful filtering and view options to manage your ticket queue effectively.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">View</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Your Unsolved</td><td className="px-4 py-3 text-gray-600">Tickets assigned to you that are open</td></tr>
            <tr><td className="px-4 py-3 font-medium">Unassigned</td><td className="px-4 py-3 text-gray-600">Tickets without an assigned agent</td></tr>
            <tr><td className="px-4 py-3 font-medium">All Unsolved</td><td className="px-4 py-3 text-gray-600">All open tickets across the team</td></tr>
            <tr><td className="px-4 py-3 font-medium">Recently Updated</td><td className="px-4 py-3 text-gray-600">Tickets updated in the last 7 days</td></tr>
            <tr><td className="px-4 py-3 font-medium">Pending</td><td className="px-4 py-3 text-gray-600">Tickets waiting for customer response</td></tr>
            <tr><td className="px-4 py-3 font-medium">Recently Solved</td><td className="px-4 py-3 text-gray-600">Resolved tickets from the past week</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Working with Tickets</h2>
      
      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
        {[
          { icon: '👤', action: 'Assign', desc: 'Change ticket owner' },
          { icon: '📊', action: 'Status', desc: 'Update ticket status' },
          { icon: '⚡', action: 'Priority', desc: 'Escalate or de-escalate' },
          { icon: '🔗', action: 'Merge', desc: 'Combine duplicates' },
          { icon: '✂️', action: 'Split', desc: 'Create new from thread' },
          { icon: '🏷️', action: 'Tag', desc: 'Add labels' },
        ].map((item, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 text-center">
            <span className="text-2xl">{item.icon}</span>
            <div className="font-semibold text-gray-900 mt-2">{item.action}</div>
            <div className="text-xs text-gray-500">{item.desc}</div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Keyboard Shortcuts</h2>
      <div className="bg-gray-50 rounded-xl p-6 my-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'J', action: 'Next ticket' },
            { key: 'K', action: 'Previous ticket' },
            { key: 'N', action: 'New ticket' },
            { key: 'R', action: 'Reply' },
            { key: 'I', action: 'Internal note' },
            { key: 'A', action: 'Assign' },
            { key: 'S', action: 'Change status' },
            { key: '/', action: 'Search' },
          ].map((shortcut, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono shadow-sm">{shortcut.key}</kbd>
              <span className="text-gray-600 text-sm">{shortcut.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KnowledgeBaseContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Knowledge Base</h1>
      <p className="text-lg text-gray-600 mb-8">Create and manage self-service documentation to help customers find answers without submitting tickets.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Overview</h2>
      <p className="text-gray-600 mb-4">The Knowledge Base module allows you to:</p>
      <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Create searchable articles</li>
        <li>Organize content by categories</li>
        <li>Track article performance</li>
        <li>Enable customer self-service</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Creating Categories</h2>
      <p className="text-gray-600 mb-4">Categories help organize articles by topic:</p>
      <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
        <li>Go to <strong>Knowledge Base &gt; Categories</strong></li>
        <li>Click <strong>+ New Category</strong></li>
        <li>Fill in name, description, and icon</li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Creating Articles</h2>
      
      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Article Fields</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Field</th>
              <th className="text-left px-4 py-3 font-semibold">Required</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Title</td><td className="px-4 py-3 text-green-600">Yes</td><td className="px-4 py-3 text-gray-600">Article headline</td></tr>
            <tr><td className="px-4 py-3 font-medium">Category</td><td className="px-4 py-3 text-green-600">Yes</td><td className="px-4 py-3 text-gray-600">Parent category</td></tr>
            <tr><td className="px-4 py-3 font-medium">Summary</td><td className="px-4 py-3 text-gray-400">No</td><td className="px-4 py-3 text-gray-600">Brief description for search</td></tr>
            <tr><td className="px-4 py-3 font-medium">Content</td><td className="px-4 py-3 text-green-600">Yes</td><td className="px-4 py-3 text-gray-600">Full article (Markdown)</td></tr>
            <tr><td className="px-4 py-3 font-medium">Tags</td><td className="px-4 py-3 text-gray-400">No</td><td className="px-4 py-3 text-gray-600">Keywords for search</td></tr>
            <tr><td className="px-4 py-3 font-medium">Status</td><td className="px-4 py-3 text-green-600">Yes</td><td className="px-4 py-3 text-gray-600">Draft, Pending, Published</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Article Status</h2>
      <div className="flex flex-wrap items-center gap-2 my-6">
        {[
          { status: 'Draft', color: 'gray' },
          { status: 'Pending Review', color: 'yellow' },
          { status: 'Published', color: 'green' },
        ].map((item, idx) => (
          <React.Fragment key={idx}>
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${item.color === 'gray' ? 'bg-gray-100 text-gray-700' : item.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{item.status}</span>
            {idx < 2 && <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function SLAConfigurationContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">SLA Configuration</h1>
      <p className="text-lg text-gray-600 mb-8">Configure Service Level Agreements to ensure timely response and resolution of customer tickets.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Overview</h2>
      <p className="text-gray-600 mb-4">SLA policies define target response and resolution times based on ticket priority. ImaraDesk automatically tracks SLA compliance and alerts agents when targets are at risk.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {[
          { icon: '🎯', title: 'Accountability', desc: 'Clear expectations' },
          { icon: '👁️', title: 'Visibility', desc: 'Dashboard metrics' },
          { icon: '⚡', title: 'Automation', desc: 'Auto escalation' },
          { icon: '📈', title: 'Reporting', desc: 'Track compliance' },
        ].map((benefit, idx) => (
          <div key={idx} className="bg-[#4a154b]/5 rounded-lg p-4 text-center">
            <span className="text-2xl">{benefit.icon}</span>
            <div className="font-semibold text-gray-900 mt-2">{benefit.title}</div>
            <div className="text-xs text-gray-500">{benefit.desc}</div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Enabling SLA</h2>
      <p className="text-gray-600 mb-4">Navigate to <strong>Settings &gt; SLA</strong> to configure:</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Setting</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Enable SLA</td><td className="px-4 py-3 text-gray-600">Turn SLA tracking on/off globally</td></tr>
            <tr><td className="px-4 py-3 font-medium">Auto-pause on Resolved</td><td className="px-4 py-3 text-gray-600">Stop clock when ticket resolved</td></tr>
            <tr><td className="px-4 py-3 font-medium">Auto-resume on Reopen</td><td className="px-4 py-3 text-gray-600">Restart clock when reopened</td></tr>
            <tr><td className="px-4 py-3 font-medium">Escalation Enabled</td><td className="px-4 py-3 text-gray-600">Enable automatic escalations</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Recommended SLA Targets</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Priority</th>
              <th className="text-left px-4 py-3 font-semibold">First Response</th>
              <th className="text-left px-4 py-3 font-semibold">Resolution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3"><span className="text-red-500">🔴</span> Critical</td><td className="px-4 py-3 text-gray-600">15 minutes</td><td className="px-4 py-3 text-gray-600">1 hour</td></tr>
            <tr><td className="px-4 py-3"><span className="text-orange-500">🟠</span> High</td><td className="px-4 py-3 text-gray-600">1 hour</td><td className="px-4 py-3 text-gray-600">4 hours</td></tr>
            <tr><td className="px-4 py-3"><span className="text-blue-500">🔵</span> Normal</td><td className="px-4 py-3 text-gray-600">4 hours</td><td className="px-4 py-3 text-gray-600">24 hours</td></tr>
            <tr><td className="px-4 py-3"><span className="text-green-500">🟢</span> Low</td><td className="px-4 py-3 text-gray-600">8 hours</td><td className="px-4 py-3 text-gray-600">72 hours</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SLA Status Indicators</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="font-semibold text-green-800">On Track</span>
          </div>
          <p className="text-sm text-green-700">Within SLA targets, no immediate action needed</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="font-semibold text-yellow-800">Warning</span>
          </div>
          <p className="text-sm text-yellow-700">Approaching breach (80% elapsed), prioritize this ticket</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="font-semibold text-red-800">Breached</span>
          </div>
          <p className="text-sm text-red-700">SLA target missed, requires immediate attention</p>
        </div>
      </div>
    </div>
  )
}

function CustomerPortalContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Customer Portal</h1>
      <p className="text-lg text-gray-600 mb-8">Configure and manage the self-service customer portal for your organization.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Overview</h2>
      <p className="text-gray-600 mb-4">The Customer Portal provides your customers with:</p>
      <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
        <li>Self-service ticket submission</li>
        <li>Ticket status tracking</li>
        <li>Knowledge base access</li>
        <li>Account management</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Portal Setup</h2>
      <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
        <li>Go to <strong>Settings &gt; Customer Portal</strong></li>
        <li>Toggle <strong>Enable Customer Portal</strong></li>
        <li>Configure portal settings</li>
        <li>Save changes</li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Portal Configuration</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Setting</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Portal Name</td><td className="px-4 py-3 text-gray-600">Display name (e.g., "Acme Support Center")</td></tr>
            <tr><td className="px-4 py-3 font-medium">Welcome Message</td><td className="px-4 py-3 text-gray-600">Homepage greeting text</td></tr>
            <tr><td className="px-4 py-3 font-medium">Allow Registration</td><td className="px-4 py-3 text-gray-600">Let customers create accounts</td></tr>
            <tr><td className="px-4 py-3 font-medium">Require Approval</td><td className="px-4 py-3 text-gray-600">Admin approval for new accounts</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Feature Toggles</h2>
      <div className="grid grid-cols-2 gap-4 my-6">
        {[
          { icon: '🎫', feature: 'Ticket Creation', desc: 'Allow customers to submit tickets' },
          { icon: '📚', feature: 'Knowledge Base', desc: 'Show KB articles to customers' },
          { icon: '📜', feature: 'Ticket History', desc: 'Let customers view past tickets' },
          { icon: '📎', feature: 'File Attachments', desc: 'Enable attachment uploads' },
        ].map((item, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
            <span className="text-xl">{item.icon}</span>
            <div>
              <div className="font-semibold text-gray-900">{item.feature}</div>
              <div className="text-sm text-gray-600">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UserManagementContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">User Management</h1>
      <p className="text-lg text-gray-600 mb-8">Learn how to manage users, roles, and permissions in ImaraDesk.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">User Types</h2>
      
      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Agent Roles</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Role</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Admin</td><td className="px-4 py-3 text-gray-600">Full system access, all settings</td></tr>
            <tr><td className="px-4 py-3 font-medium">Agent</td><td className="px-4 py-3 text-gray-600">Ticket management, customer interaction</td></tr>
            <tr><td className="px-4 py-3 font-medium">Viewer</td><td className="px-4 py-3 text-gray-600">Read-only access</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Adding Users</h2>
      <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
        <li>Navigate to <strong>Settings &gt; Users</strong></li>
        <li>Click <strong>+ Add User</strong></li>
        <li>Fill in user details (email, name, role)</li>
        <li>Click <strong>Send Invitation</strong></li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Role Permissions</h2>
      
      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Administrator</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Permission</th>
              <th className="text-left px-4 py-3 font-semibold">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3">Tickets</td><td className="px-4 py-3 text-green-600">Full CRUD</td></tr>
            <tr><td className="px-4 py-3">Users</td><td className="px-4 py-3 text-green-600">Manage all users</td></tr>
            <tr><td className="px-4 py-3">Settings</td><td className="px-4 py-3 text-green-600">All settings</td></tr>
            <tr><td className="px-4 py-3">Reports</td><td className="px-4 py-3 text-green-600">All reports</td></tr>
            <tr><td className="px-4 py-3">API</td><td className="px-4 py-3 text-green-600">Full API access</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Two-Factor Authentication</h2>
      <ol className="list-decimal list-inside text-gray-600 mb-6 space-y-2">
        <li>Go to <strong>Profile &gt; Security</strong></li>
        <li>Click <strong>Enable 2FA</strong></li>
        <li>Scan QR code with authenticator app</li>
        <li>Enter verification code</li>
        <li>Save backup codes</li>
      </ol>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-6">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔐</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Security Tip</h4>
            <p className="text-sm text-blue-800">Enable two-factor authentication for all admin accounts to protect your help desk from unauthorized access.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function APIIntroductionContent() {
  return (
    <div className="doc-content">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">REST API Reference</h1>
      <p className="text-lg text-gray-600 mb-8">Integrate ImaraDesk with your applications using our comprehensive REST API.</p>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Base URL</h2>
      <div className="bg-gray-900 rounded-xl p-4 my-4">
        <code className="text-gray-300 text-sm">https://api.coredesk.pro/v1</code>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Authentication</h2>
      <p className="text-gray-600 mb-4">Include your API key in the request header:</p>
      <div className="bg-gray-900 rounded-xl p-4 my-4 overflow-x-auto">
        <pre className="text-gray-300 text-sm"><code>Authorization: Bearer YOUR_API_KEY</code></pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Rate Limits</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Plan</th>
              <th className="text-left px-4 py-3 font-semibold">Requests/minute</th>
              <th className="text-left px-4 py-3 font-semibold">Requests/day</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3">Free</td><td className="px-4 py-3 text-gray-600">60</td><td className="px-4 py-3 text-gray-600">1,000</td></tr>
            <tr><td className="px-4 py-3">Pro</td><td className="px-4 py-3 text-gray-600">300</td><td className="px-4 py-3 text-gray-600">10,000</td></tr>
            <tr><td className="px-4 py-3">Enterprise</td><td className="px-4 py-3 text-gray-600">1,000</td><td className="px-4 py-3 text-gray-600">Unlimited</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Create Ticket</h2>
      <div className="bg-gray-900 rounded-xl p-4 my-4 overflow-x-auto">
        <pre className="text-gray-300 text-sm"><code>{`POST /v1/tickets
Content-Type: application/json

{
  "subject": "Need help with billing",
  "description": "I have a question...",
  "priority": "normal",
  "type": "question",
  "requester_email": "customer@example.com"
}`}</code></pre>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Response</h3>
      <div className="bg-gray-900 rounded-xl p-4 my-4 overflow-x-auto">
        <pre className="text-gray-300 text-sm"><code>{`{
  "id": 1234,
  "ticket_number": "INC04E5B",
  "status": "new",
  "subject": "Need help with billing",
  "created_at": "2024-01-15T12:00:00Z"
}`}</code></pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">List Tickets</h2>
      <div className="bg-gray-900 rounded-xl p-4 my-4 overflow-x-auto">
        <pre className="text-gray-300 text-sm"><code>{`GET /v1/tickets?status=open&page=1&per_page=25`}</code></pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">HTTP Status Codes</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Code</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-mono text-green-600">200</td><td className="px-4 py-3 text-gray-600">Success</td></tr>
            <tr><td className="px-4 py-3 font-mono text-green-600">201</td><td className="px-4 py-3 text-gray-600">Created</td></tr>
            <tr><td className="px-4 py-3 font-mono text-red-600">400</td><td className="px-4 py-3 text-gray-600">Bad Request</td></tr>
            <tr><td className="px-4 py-3 font-mono text-red-600">401</td><td className="px-4 py-3 text-gray-600">Unauthorized</td></tr>
            <tr><td className="px-4 py-3 font-mono text-red-600">404</td><td className="px-4 py-3 text-gray-600">Not Found</td></tr>
            <tr><td className="px-4 py-3 font-mono text-red-600">429</td><td className="px-4 py-3 text-gray-600">Rate Limited</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================
// CONFIGURATION CONTENT COMPONENTS
// ============================================

function GeneralSettingsContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">General Settings</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        General Settings allow you to configure the core aspects of your ImaraDesk helpdesk instance. These settings affect 
        how your helpdesk appears and operates across your organization.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → General</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Organization Information</h2>
      <p className="text-gray-600 mb-4">Configure your organization's basic details:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Organization Name:</strong> Your company or team name displayed in the helpdesk</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Support Email:</strong> Primary email address for support communications</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Logo:</strong> Upload your organization's logo for branding</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Timezone:</strong> Default timezone for all timestamps and SLA calculations</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Date Format:</strong> Choose how dates are displayed (DD/MM/YYYY, MM/DD/YYYY, etc.)</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Ticket Settings</h2>
      <p className="text-gray-600 mb-4">Customize default ticket behavior:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Setting</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Default Priority</td><td className="px-4 py-3 text-gray-600">Set the default priority for new tickets</td></tr>
            <tr><td className="px-4 py-3 font-medium">Default Status</td><td className="px-4 py-3 text-gray-600">Initial status when tickets are created</td></tr>
            <tr><td className="px-4 py-3 font-medium">Auto-Assignment</td><td className="px-4 py-3 text-gray-600">Enable round-robin or load-based assignment</td></tr>
            <tr><td className="px-4 py-3 font-medium">Ticket Prefix</td><td className="px-4 py-3 text-gray-600">Customize ticket number prefix (e.g., INC, TKT)</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Customer Portal Settings</h2>
      <p className="text-gray-600 mb-4">Configure the customer-facing portal:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Portal Title:</strong> Name displayed on the customer portal</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Welcome Message:</strong> Greeting shown to customers</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Allow Registration:</strong> Enable/disable customer self-registration</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Require Email Verification:</strong> Verify customer emails before access</li>
      </ul>
    </div>
  )
}

function NotificationsContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Notification Settings</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Configure how and when ImaraDesk sends notifications to agents, customers, and administrators. Proper notification 
        settings ensure timely communication while avoiding notification fatigue.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Notifications</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Agent Notifications</h2>
      <p className="text-gray-600 mb-4">Configure when agents receive notifications:</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Event</th>
              <th className="text-left px-4 py-3 font-semibold">Email</th>
              <th className="text-left px-4 py-3 font-semibold">In-App</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 font-medium">New Ticket</td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3 text-gray-600">When a new ticket is created</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Ticket Assigned</td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3 text-gray-600">When a ticket is assigned to you</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Customer Reply</td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3 text-gray-600">When customer adds a comment</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">SLA Warning</td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3 text-gray-600">When SLA is about to breach</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">SLA Breach</td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3 text-gray-600">When SLA has been breached</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium">Internal Note</td>
              <td className="px-4 py-3"><span className="text-gray-400">○</span></td>
              <td className="px-4 py-3"><span className="text-green-600">✓</span></td>
              <td className="px-4 py-3 text-gray-600">When internal note is added</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Customer Notifications</h2>
      <p className="text-gray-600 mb-4">Configure notifications sent to customers:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Ticket Confirmation:</strong> Email when ticket is successfully submitted</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Status Updates:</strong> Notify when ticket status changes</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Agent Responses:</strong> Email when agent replies to ticket</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Resolution Notice:</strong> Confirm when ticket is resolved</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Satisfaction Survey:</strong> Send survey after ticket closure</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Notification Channels</h2>
      <p className="text-gray-600 mb-4">ImaraDesk supports multiple notification channels:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📧 Email</h4>
          <p className="text-sm text-gray-600">Traditional email notifications via SMTP. Highly reliable and universal.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔔 In-App</h4>
          <p className="text-sm text-gray-600">Real-time notifications within the ImaraDesk interface.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">💬 Slack</h4>
          <p className="text-sm text-gray-600">Push notifications to Slack channels (requires integration).</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔷 Microsoft Teams</h4>
          <p className="text-sm text-gray-600">Send alerts to Teams channels (requires integration).</p>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 rounded-r-lg">
        <p className="text-yellow-800 font-medium">Best Practice</p>
        <p className="text-yellow-700 text-sm">Balance notification frequency to keep agents informed without causing alert fatigue. Critical events like SLA breaches should always trigger notifications.</p>
      </div>
    </div>
  )
}

function SecuritySettingsContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Security Settings</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Security Settings provide comprehensive controls to protect your helpdesk data and ensure compliance with 
        security standards. Configure authentication policies, access controls, and audit logging to safeguard your organization.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Security</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Two-Factor Authentication (2FA)</h2>
      <p className="text-gray-600 mb-4">Add an extra layer of security with 2FA:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Setting</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Require for Admins</td><td className="px-4 py-3 text-gray-600">Force 2FA for all administrator accounts</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">Off</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Require for All Users</td><td className="px-4 py-3 text-gray-600">Enforce 2FA for entire organization</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">Off</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Remember Device</td><td className="px-4 py-3 text-gray-600">Allow trusted device trust for 30 days</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">On</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Password Policies</h2>
      <p className="text-gray-600 mb-4">Enforce strong password requirements:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Minimum Length:</strong> Set minimum password length (8-32 characters, default: 8)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Require Uppercase:</strong> At least one uppercase letter (A-Z)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Require Lowercase:</strong> At least one lowercase letter (a-z)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Require Numbers:</strong> At least one numeric digit (0-9)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Require Special Characters:</strong> At least one special character (!@#$%^&*)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Password Expiry:</strong> Days until password expires (0 = never, default: 90 days)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Prevent Reuse:</strong> Block reusing last 5 passwords</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Session Management</h2>
      <p className="text-gray-600 mb-4">Control user session behavior:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Setting</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Session Timeout</td><td className="px-4 py-3 text-gray-600">Auto-logout after inactivity (minutes)</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">480 (8 hours)</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Max Concurrent Sessions</td><td className="px-4 py-3 text-gray-600">Limit simultaneous logins per user</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">5</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Logout on Browser Close</td><td className="px-4 py-3 text-gray-600">End session when browser closes</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">Off</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Login Security</h2>
      <p className="text-gray-600 mb-4">Protect against unauthorized access attempts:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Max Login Attempts:</strong> Failed attempts before lockout (default: 5)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Lockout Duration:</strong> Account lockout time (default: 30 minutes)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>CAPTCHA Protection:</strong> Show CAPTCHA after 3 failed attempts</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Suspicious Login Alerts:</strong> Email user on login from new device/location</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">IP Access Control</h2>
      <p className="text-gray-600 mb-4">Restrict access by IP address:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-green-50 p-4 rounded-xl">
          <h4 className="font-semibold text-green-900 mb-2">✅ IP Whitelist</h4>
          <p className="text-sm text-green-700">Allow access only from specific IP addresses or ranges. Ideal for office networks.</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl">
          <h4 className="font-semibold text-red-900 mb-2">🚫 IP Blacklist</h4>
          <p className="text-sm text-red-700">Block specific IP addresses from accessing your helpdesk.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Audit & Logging</h2>
      <p className="text-gray-600 mb-4">Track all security-relevant activities:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Audit Logging:</strong> Log all user actions for compliance</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Failed Login Logging:</strong> Track authentication failures</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Permission Changes:</strong> Log role and permission updates</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Data Exports:</strong> Record all data export activities</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Log Retention:</strong> Days to retain logs (default: 365)</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">API Security</h2>
      <p className="text-gray-600 mb-4">Secure API access:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Rate Limiting:</strong> Limit API requests per minute (default: 60)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>API Key Authentication:</strong> Require API keys for all API access</li>
      </ul>

      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6 rounded-r-lg">
        <p className="text-red-800 font-medium">⚠️ Important</p>
        <p className="text-red-700 text-sm">Changes to security settings take effect immediately for new sessions. Existing sessions may need to re-authenticate.</p>
      </div>
    </div>
  )
}

function CustomDomainsContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Custom Domains</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Custom domains allow you to use your own branded URLs for your helpdesk and customer portal. Instead of 
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">yourcompany.coredesk.pro</code>, customers can access 
        support at <code className="bg-gray-100 px-2 py-1 rounded text-sm">support.yourcompany.com</code>.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Custom Domains</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Adding a Custom Domain</h2>
      <p className="text-gray-600 mb-4">Follow these steps to configure a custom domain:</p>
      
      <div className="space-y-4 my-6">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-[#4a154b] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
          <div>
            <h4 className="font-semibold text-gray-900">Enter Your Domain</h4>
            <p className="text-gray-600 text-sm">Click "Add Domain" and enter your subdomain (e.g., support.yourcompany.com)</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-[#4a154b] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
          <div>
            <h4 className="font-semibold text-gray-900">Configure DNS Records</h4>
            <p className="text-gray-600 text-sm">Add a CNAME record pointing to ImaraDesk's servers</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-[#4a154b] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
          <div>
            <h4 className="font-semibold text-gray-900">Verify Ownership</h4>
            <p className="text-gray-600 text-sm">ImaraDesk will verify your DNS configuration automatically</p>
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-[#4a154b] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
          <div>
            <h4 className="font-semibold text-gray-900">SSL Certificate</h4>
            <p className="text-gray-600 text-sm">Free SSL certificate is automatically provisioned via Let's Encrypt</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">DNS Configuration</h2>
      <p className="text-gray-600 mb-4">Add this CNAME record to your DNS provider:</p>
      <div className="bg-gray-900 rounded-xl p-4 my-4 overflow-x-auto">
        <pre className="text-gray-300 text-sm"><code>{`Type:  CNAME
Host:  support (or your subdomain)
Value: proxy.coredesk.pro
TTL:   3600 (or "Automatic")`}</code></pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Domain Purposes</h2>
      <p className="text-gray-600 mb-4">Each domain can be assigned a specific purpose:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Purpose</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Helpdesk</td><td className="px-4 py-3 text-gray-600">Agent interface for ticket management</td><td className="px-4 py-3"><code className="text-xs">desk.company.com</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Customer Portal</td><td className="px-4 py-3 text-gray-600">Customer-facing support portal</td><td className="px-4 py-3"><code className="text-xs">support.company.com</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Knowledge Base</td><td className="px-4 py-3 text-gray-600">Public KB and help articles</td><td className="px-4 py-3"><code className="text-xs">help.company.com</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Domain Status</h2>
      <p className="text-gray-600 mb-4">Monitor your domain status:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-yellow-50 p-4 rounded-xl">
          <h4 className="font-semibold text-yellow-900 mb-2">🟡 Pending</h4>
          <p className="text-sm text-yellow-700">DNS verification in progress. Can take up to 48 hours.</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <h4 className="font-semibold text-green-900 mb-2">🟢 Active</h4>
          <p className="text-sm text-green-700">Domain is verified and SSL certificate is active.</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl">
          <h4 className="font-semibold text-red-900 mb-2">🔴 Failed</h4>
          <p className="text-sm text-red-700">DNS verification failed. Check your CNAME configuration.</p>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 rounded-r-lg">
        <p className="text-yellow-800 font-medium">DNS Propagation</p>
        <p className="text-yellow-700 text-sm">DNS changes can take up to 48 hours to propagate globally. If verification fails, wait and try again.</p>
      </div>
    </div>
  )
}

function EmailTemplatesContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Email Templates</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Email templates define the content and appearance of all automated emails sent by ImaraDesk. Customize templates 
        to match your brand voice and provide consistent communication with customers and agents.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Emails → Templates</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Template Categories</h2>
      
      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Ticket Templates</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Template</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Recipient</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Ticket Created</td><td className="px-4 py-3 text-gray-600">Confirmation when ticket is submitted</td><td className="px-4 py-3">Customer</td></tr>
            <tr><td className="px-4 py-3 font-medium">Ticket Assigned</td><td className="px-4 py-3 text-gray-600">Notification when ticket is assigned</td><td className="px-4 py-3">Agent</td></tr>
            <tr><td className="px-4 py-3 font-medium">Ticket Resolved</td><td className="px-4 py-3 text-gray-600">Notice when ticket is resolved</td><td className="px-4 py-3">Customer</td></tr>
            <tr><td className="px-4 py-3 font-medium">Ticket Closed</td><td className="px-4 py-3 text-gray-600">Confirmation of ticket closure</td><td className="px-4 py-3">Customer</td></tr>
            <tr><td className="px-4 py-3 font-medium">New Activity Notice</td><td className="px-4 py-3 text-gray-600">Alert for new ticket activity</td><td className="px-4 py-3">Customer</td></tr>
            <tr><td className="px-4 py-3 font-medium">Overdue Alert</td><td className="px-4 py-3 text-gray-600">Warning for overdue tickets</td><td className="px-4 py-3">Agent</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">SLA Templates</h3>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>SLA Reminder:</strong> Warning before SLA breach</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>SLA Escalation Notice:</strong> Notification when ticket escalates</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>First Response Breach:</strong> Alert for first response SLA violation</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Resolution Breach:</strong> Alert for resolution time SLA violation</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">User Templates</h3>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Welcome Email:</strong> Sent to new users upon registration</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Password Reset:</strong> Link to reset forgotten password</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Template Variables</h2>
      <p className="text-gray-600 mb-4">Use these placeholders in your templates (wrapped in double curly braces):</p>
      <div className="bg-gray-900 rounded-xl p-4 my-4 overflow-x-auto">
        <pre className="text-gray-300 text-sm"><code>{`{{ticket_number}}    - Ticket reference number
{{ticket_subject}}   - Ticket title/subject
{{ticket_status}}    - Current ticket status
{{ticket_priority}}  - Ticket priority level
{{customer_name}}    - Customer's full name
{{customer_email}}   - Customer's email address
{{agent_name}}       - Assigned agent's name
{{organization}}     - Your organization name
{{portal_url}}       - Link to customer portal
{{ticket_url}}       - Direct link to ticket`}</code></pre>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Editing Templates</h2>
      <p className="text-gray-600 mb-4">Each template has these editable fields:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Subject Line:</strong> Email subject with variable support</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>HTML Body:</strong> Rich HTML content for the email body</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Plain Text:</strong> Fallback text version for email clients</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Status:</strong> Active, Draft, or Archived</li>
      </ul>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r-lg">
        <p className="text-green-800 font-medium">Pro Tip</p>
        <p className="text-green-700 text-sm">Always include a plain text version for better email deliverability and accessibility.</p>
      </div>
    </div>
  )
}

function SMTPConfigContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SMTP Configuration</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Configure your SMTP settings to enable outbound email delivery from ImaraDesk. This includes notifications, 
        ticket updates, and all automated communications. You can use your own mail server or a third-party service.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Emails → SMTP</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SMTP Settings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Field</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">SMTP Host</td><td className="px-4 py-3 text-gray-600">Mail server hostname</td><td className="px-4 py-3"><code className="text-xs">smtp.gmail.com</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">SMTP Port</td><td className="px-4 py-3 text-gray-600">Server port (587 for TLS, 465 for SSL)</td><td className="px-4 py-3"><code className="text-xs">587</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Username</td><td className="px-4 py-3 text-gray-600">SMTP authentication username</td><td className="px-4 py-3"><code className="text-xs">noreply@company.com</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Password</td><td className="px-4 py-3 text-gray-600">SMTP authentication password</td><td className="px-4 py-3"><code className="text-xs">••••••••</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Use TLS</td><td className="px-4 py-3 text-gray-600">Enable TLS encryption (recommended)</td><td className="px-4 py-3"><code className="text-xs">Yes</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Use SSL</td><td className="px-4 py-3 text-gray-600">Enable SSL encryption</td><td className="px-4 py-3"><code className="text-xs">No</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Default From Email</td><td className="px-4 py-3 text-gray-600">Sender email address</td><td className="px-4 py-3"><code className="text-xs">support@company.com</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Sender Name</td><td className="px-4 py-3 text-gray-600">Display name for outgoing emails</td><td className="px-4 py-3"><code className="text-xs">Company Support</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Reply-To Email</td><td className="px-4 py-3 text-gray-600">Email for customer replies</td><td className="px-4 py-3"><code className="text-xs">help@company.com</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Popular SMTP Providers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Gmail / Google Workspace</h4>
          <p className="text-sm text-gray-600 mb-2">Host: smtp.gmail.com | Port: 587 (TLS)</p>
          <p className="text-xs text-gray-500">Requires App Password with 2FA enabled</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Microsoft 365</h4>
          <p className="text-sm text-gray-600 mb-2">Host: smtp.office365.com | Port: 587 (TLS)</p>
          <p className="text-xs text-gray-500">Use full email as username</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">SendGrid</h4>
          <p className="text-sm text-gray-600 mb-2">Host: smtp.sendgrid.net | Port: 587 (TLS)</p>
          <p className="text-xs text-gray-500">Username: apikey, Password: your API key</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Amazon SES</h4>
          <p className="text-sm text-gray-600 mb-2">Host: email-smtp.region.amazonaws.com | Port: 587</p>
          <p className="text-xs text-gray-500">Use IAM SMTP credentials</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Testing Your Configuration</h2>
      <p className="text-gray-600 mb-4">After configuring SMTP, use the "Send Test Email" button to verify:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Connection to SMTP server</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Authentication credentials</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Email delivery to recipient</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Correct sender information</li>
      </ul>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 rounded-r-lg">
        <p className="text-yellow-800 font-medium">Security Note</p>
        <p className="text-yellow-700 text-sm">SMTP credentials are stored encrypted. Never share your SMTP password. Use app-specific passwords when available.</p>
      </div>
    </div>
  )
}

function IntegrationsContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Integrations</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Connect ImaraDesk with your favorite tools and services to streamline workflows, improve team collaboration, 
        and automate repetitive tasks. Each integration extends ImaraDesk's capabilities.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Integrations</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Slack Integration</h2>
      <p className="text-gray-600 mb-4">Connect Slack to receive ticket notifications in your channels:</p>
      
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Setup Steps</h3>
      <ol className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">1.</span>Click "Connect to Slack" to authorize ImaraDesk</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">2.</span>Select your Slack workspace</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">3.</span>Choose a default channel for notifications</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">4.</span>Configure notification preferences</li>
      </ol>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Notification Options</h3>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>New Ticket:</strong> Alert when new tickets are created</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Ticket Assigned:</strong> Notify when tickets are assigned</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Ticket Resolved:</strong> Celebrate resolved tickets</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>SLA Breach:</strong> Critical alerts for SLA violations</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>New Comment:</strong> Optional comment notifications</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Microsoft Teams Integration</h2>
      <p className="text-gray-600 mb-4">Integrate with Microsoft Teams for enterprise environments:</p>
      
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Setup Steps</h3>
      <ol className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">1.</span>Sign in with your Microsoft work account</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">2.</span>Grant necessary permissions</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">3.</span>Select your Team and Channel</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">4.</span>Configure notification settings</li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Available Integrations</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Integration</th>
              <th className="text-left px-4 py-3 font-semibold">Category</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">💬 Slack</td><td className="px-4 py-3 text-gray-600">Communication</td><td className="px-4 py-3 text-gray-600">Team notifications and collaboration</td></tr>
            <tr><td className="px-4 py-3 font-medium">🔷 Microsoft Teams</td><td className="px-4 py-3 text-gray-600">Communication</td><td className="px-4 py-3 text-gray-600">Enterprise team notifications</td></tr>
            <tr><td className="px-4 py-3 font-medium">📧 Email</td><td className="px-4 py-3 text-gray-600">Communication</td><td className="px-4 py-3 text-gray-600">Email-to-ticket and notifications</td></tr>
            <tr><td className="px-4 py-3 font-medium">🔗 Webhooks</td><td className="px-4 py-3 text-gray-600">Automation</td><td className="px-4 py-3 text-gray-600">Custom HTTP callbacks</td></tr>
            <tr><td className="px-4 py-3 font-medium">📊 Analytics</td><td className="px-4 py-3 text-gray-600">Reporting</td><td className="px-4 py-3 text-gray-600">Export data to analytics platforms</td></tr>
          </tbody>
        </table>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r-lg">
        <p className="text-green-800 font-medium">Marketplace</p>
        <p className="text-green-700 text-sm">Visit the App Marketplace to discover more integrations and extend ImaraDesk functionality.</p>
      </div>
    </div>
  )
}

// ============================================
// SLA CONTENT COMPONENTS
// ============================================

function SLAOverviewContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SLA Overview</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Service Level Agreements (SLAs) define the expected response and resolution times for support tickets. 
        ImaraDesk's SLA system helps you meet customer expectations, track performance, and identify areas for improvement.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → SLA</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What is an SLA?</h2>
      <p className="text-gray-600 mb-4">
        An SLA is a commitment between a service provider and customer that defines the level of service expected. 
        In helpdesk terms, SLAs typically measure:
      </p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>First Response Time:</strong> Maximum time to acknowledge a ticket</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Resolution Time:</strong> Maximum time to fully resolve a ticket</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Global SLA Settings</h2>
      <p className="text-gray-600 mb-4">Configure how SLA tracking works across your helpdesk:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Setting</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">SLA Enabled</td><td className="px-4 py-3 text-gray-600">Enable/disable SLA tracking globally</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">Off</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Auto-Pause on Resolved</td><td className="px-4 py-3 text-gray-600">Pause SLA timer when ticket is resolved</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">On</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Auto-Resume on Reopen</td><td className="px-4 py-3 text-gray-600">Resume SLA when ticket is reopened</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">On</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Escalation Enabled</td><td className="px-4 py-3 text-gray-600">Auto-escalate on SLA breach</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">On</code></td></tr>
            <tr><td className="px-4 py-3 font-medium">Send Notifications</td><td className="px-4 py-3 text-gray-600">Alert on SLA warnings and breaches</td><td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded text-xs">On</code></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SLA Components</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📋 Policies</h4>
          <p className="text-sm text-gray-600">Define time targets per priority level (Critical, High, Medium, Low).</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🕐 Business Hours</h4>
          <p className="text-sm text-gray-600">Set operating hours. SLA only counts during work hours.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🏖️ Holidays</h4>
          <p className="text-sm text-gray-600">Define holidays to exclude from SLA calculations.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SLA Status Indicators</h2>
      <p className="text-gray-600 mb-4">Tickets display real-time SLA status:</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <span className="text-2xl">🟢</span>
          <p className="font-semibold text-green-900 mt-2">On Track</p>
          <p className="text-xs text-green-700">Within SLA limits</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-xl text-center">
          <span className="text-2xl">🟡</span>
          <p className="font-semibold text-yellow-900 mt-2">At Risk</p>
          <p className="text-xs text-yellow-700">Approaching deadline</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl text-center">
          <span className="text-2xl">🔴</span>
          <p className="font-semibold text-red-900 mt-2">Breached</p>
          <p className="text-xs text-red-700">SLA has been violated</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-xl text-center">
          <span className="text-2xl">⏸️</span>
          <p className="font-semibold text-gray-900 mt-2">Paused</p>
          <p className="text-xs text-gray-600">Timer stopped</p>
        </div>
      </div>
    </div>
  )
}

function SLAPoliciesContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SLA Policies</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        SLA policies define specific response and resolution time targets based on ticket priority. Each priority level 
        can have its own policy with customized time limits.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → SLA → Policies</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Default SLA Policies</h2>
      <p className="text-gray-600 mb-4">ImaraDesk comes with recommended SLA targets for each priority:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Priority</th>
              <th className="text-left px-4 py-3 font-semibold">First Response</th>
              <th className="text-left px-4 py-3 font-semibold">Resolution Time</th>
              <th className="text-left px-4 py-3 font-semibold">Use Case</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-red-50"><td className="px-4 py-3 font-medium text-red-700">🔴 Critical</td><td className="px-4 py-3 text-gray-600">15 minutes</td><td className="px-4 py-3 text-gray-600">2 hours</td><td className="px-4 py-3 text-gray-600">System outages, security breaches</td></tr>
            <tr className="bg-orange-50"><td className="px-4 py-3 font-medium text-orange-700">🟠 High</td><td className="px-4 py-3 text-gray-600">1 hour</td><td className="px-4 py-3 text-gray-600">4 hours</td><td className="px-4 py-3 text-gray-600">Major functionality blocked</td></tr>
            <tr className="bg-yellow-50"><td className="px-4 py-3 font-medium text-yellow-700">🟡 Medium</td><td className="px-4 py-3 text-gray-600">4 hours</td><td className="px-4 py-3 text-gray-600">24 hours</td><td className="px-4 py-3 text-gray-600">Standard requests, minor issues</td></tr>
            <tr className="bg-green-50"><td className="px-4 py-3 font-medium text-green-700">🟢 Low</td><td className="px-4 py-3 text-gray-600">8 hours</td><td className="px-4 py-3 text-gray-600">72 hours</td><td className="px-4 py-3 text-gray-600">General inquiries, feature requests</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Creating a Policy</h2>
      <p className="text-gray-600 mb-4">When creating or editing an SLA policy, configure these settings:</p>
      
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Basic Settings</h3>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Name:</strong> Descriptive policy name (e.g., "Critical Priority SLA")</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Priority:</strong> Which ticket priority this policy applies to</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Description:</strong> Optional notes about the policy</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Status:</strong> Active or Inactive</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Time Targets</h3>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>First Response Time:</strong> Maximum time for initial agent response (in minutes)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Resolution Time:</strong> Maximum time to resolve the ticket (in minutes)</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Policy Options</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Option</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Apply Business Hours</td><td className="px-4 py-3 text-gray-600">Only count time during configured business hours</td></tr>
            <tr><td className="px-4 py-3 font-medium">Apply Holidays</td><td className="px-4 py-3 text-gray-600">Exclude defined holidays from SLA calculation</td></tr>
            <tr><td className="px-4 py-3 font-medium">Auto-Apply to New Tickets</td><td className="px-4 py-3 text-gray-600">Automatically assign this policy to matching tickets</td></tr>
            <tr><td className="px-4 py-3 font-medium">Send Escalation Emails</td><td className="px-4 py-3 text-gray-600">Email notifications when SLA is at risk</td></tr>
            <tr><td className="px-4 py-3 font-medium">Pause on Pending</td><td className="px-4 py-3 text-gray-600">Stop timer when ticket is in pending status</td></tr>
            <tr><td className="px-4 py-3 font-medium">Notify Before Breach</td><td className="px-4 py-3 text-gray-600">Send warning X minutes before SLA breach</td></tr>
          </tbody>
        </table>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r-lg">
        <p className="text-green-800 font-medium">Best Practice</p>
        <p className="text-green-700 text-sm">Set realistic SLA targets based on your team's capacity. Start conservative and adjust based on actual performance data.</p>
      </div>
    </div>
  )
}

function BusinessHoursContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Business Hours</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Business hours define your organization's operating schedule. When SLA policies apply business hours, 
        the SLA timer only runs during these defined working hours.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → SLA → Business Hours</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Configuring Business Hours</h2>
      <p className="text-gray-600 mb-4">Set your operating hours for each day of the week:</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Day</th>
              <th className="text-left px-4 py-3 font-semibold">Enabled</th>
              <th className="text-left px-4 py-3 font-semibold">Start Time</th>
              <th className="text-left px-4 py-3 font-semibold">End Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Monday</td><td className="px-4 py-3"><span className="text-green-600">✓</span></td><td className="px-4 py-3 text-gray-600">9:00 AM</td><td className="px-4 py-3 text-gray-600">5:00 PM</td></tr>
            <tr><td className="px-4 py-3 font-medium">Tuesday</td><td className="px-4 py-3"><span className="text-green-600">✓</span></td><td className="px-4 py-3 text-gray-600">9:00 AM</td><td className="px-4 py-3 text-gray-600">5:00 PM</td></tr>
            <tr><td className="px-4 py-3 font-medium">Wednesday</td><td className="px-4 py-3"><span className="text-green-600">✓</span></td><td className="px-4 py-3 text-gray-600">9:00 AM</td><td className="px-4 py-3 text-gray-600">5:00 PM</td></tr>
            <tr><td className="px-4 py-3 font-medium">Thursday</td><td className="px-4 py-3"><span className="text-green-600">✓</span></td><td className="px-4 py-3 text-gray-600">9:00 AM</td><td className="px-4 py-3 text-gray-600">5:00 PM</td></tr>
            <tr><td className="px-4 py-3 font-medium">Friday</td><td className="px-4 py-3"><span className="text-green-600">✓</span></td><td className="px-4 py-3 text-gray-600">9:00 AM</td><td className="px-4 py-3 text-gray-600">5:00 PM</td></tr>
            <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Saturday</td><td className="px-4 py-3"><span className="text-gray-400">○</span></td><td className="px-4 py-3 text-gray-400">—</td><td className="px-4 py-3 text-gray-400">—</td></tr>
            <tr className="bg-gray-50"><td className="px-4 py-3 font-medium">Sunday</td><td className="px-4 py-3"><span className="text-gray-400">○</span></td><td className="px-4 py-3 text-gray-400">—</td><td className="px-4 py-3 text-gray-400">—</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Settings</h2>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Name:</strong> Label for this schedule (e.g., "Default Business Hours")</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Timezone:</strong> Timezone for all time calculations (important for global teams)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Pause Outside Hours:</strong> Stop SLA timer outside business hours</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Exclude Holidays:</strong> Pause SLA on defined holidays</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How It Works</h2>
      <div className="bg-gray-50 p-6 rounded-xl my-6">
        <h4 className="font-semibold text-gray-900 mb-3">Example Scenario:</h4>
        <p className="text-gray-600 text-sm mb-3">Business hours: Mon-Fri, 9:00 AM - 5:00 PM</p>
        <p className="text-gray-600 text-sm mb-3">A ticket with a 4-hour SLA is created at 4:00 PM on Friday.</p>
        <p className="text-gray-600 text-sm mb-2"><strong>Without business hours:</strong> SLA due at 8:00 PM Friday</p>
        <p className="text-gray-600 text-sm"><strong>With business hours:</strong> 1 hour counts Friday, remaining 3 hours count Monday. SLA due at 12:00 PM Monday.</p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 rounded-r-lg">
        <p className="text-yellow-800 font-medium">Timezone Note</p>
        <p className="text-yellow-700 text-sm">Set your timezone correctly to ensure accurate SLA calculations. All times are converted to the configured timezone.</p>
      </div>
    </div>
  )
}

function HolidaysContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Holidays</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Define company holidays to exclude from SLA calculations. When a holiday is active, SLA timers pause 
        just like outside business hours.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → SLA → Holidays</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Managing Holidays</h2>
      <p className="text-gray-600 mb-4">Add holidays that your team observes:</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Holiday</th>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Recurring</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">🎄 Christmas Day</td><td className="px-4 py-3 text-gray-600">December 25</td><td className="px-4 py-3"><span className="text-green-600">✓ Yearly</span></td><td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span></td></tr>
            <tr><td className="px-4 py-3 font-medium">🎆 New Year's Day</td><td className="px-4 py-3 text-gray-600">January 1</td><td className="px-4 py-3"><span className="text-green-600">✓ Yearly</span></td><td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span></td></tr>
            <tr><td className="px-4 py-3 font-medium">🦃 Thanksgiving</td><td className="px-4 py-3 text-gray-600">4th Thursday, Nov</td><td className="px-4 py-3"><span className="text-green-600">✓ Yearly</span></td><td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span></td></tr>
            <tr><td className="px-4 py-3 font-medium">🏢 Company Day</td><td className="px-4 py-3 text-gray-600">March 15, 2026</td><td className="px-4 py-3"><span className="text-gray-400">One-time</span></td><td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Adding a Holiday</h2>
      <p className="text-gray-600 mb-4">When creating a holiday, specify:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Name:</strong> Holiday name (e.g., "Independence Day")</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Date:</strong> The date the holiday falls on</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Recurring:</strong> Whether this holiday repeats annually</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Status:</strong> Active or Inactive</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Holiday Types</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔁 Recurring Holidays</h4>
          <p className="text-sm text-gray-600">Automatically repeat every year on the same date. Ideal for fixed holidays like Christmas or New Year's.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📅 One-Time Holidays</h4>
          <p className="text-sm text-gray-600">Single occurrence holidays for company events, floating holidays, or special occasions.</p>
        </div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r-lg">
        <p className="text-green-800 font-medium">Pro Tip</p>
        <p className="text-green-700 text-sm">Set up your holidays at the beginning of each year to ensure accurate SLA calculations throughout the year.</p>
      </div>
    </div>
  )
}

// ============================================
// TEAM MANAGEMENT CONTENT COMPONENTS
// ============================================

function TeamUsersContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Team Users</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Manage all users in your helpdesk system including agents, administrators, and customers. 
        Control access, assign roles, and organize users into groups.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Team → Users</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">User Types</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Type</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">👑 Administrator</td><td className="px-4 py-3 text-gray-600">Full system access and configuration rights</td><td className="px-4 py-3 text-gray-600">All areas</td></tr>
            <tr><td className="px-4 py-3 font-medium">🎧 Agent</td><td className="px-4 py-3 text-gray-600">Support staff handling tickets</td><td className="px-4 py-3 text-gray-600">Tickets, KB, Reports</td></tr>
            <tr><td className="px-4 py-3 font-medium">👤 User</td><td className="px-4 py-3 text-gray-600">End users/customers submitting tickets</td><td className="px-4 py-3 text-gray-600">Customer Portal only</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Adding Users</h2>
      <p className="text-gray-600 mb-4">Create new users with the following information:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Username:</strong> Unique identifier for login</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Email:</strong> User's email address</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Full Name:</strong> Display name</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Organization:</strong> Company/team the user belongs to</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Role:</strong> Permission role to assign</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Groups:</strong> Teams the user is part of</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Is Agent:</strong> Whether user can handle tickets</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">User Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Edit User</h4>
          <p className="text-sm text-gray-600">Update user information, role, and group memberships.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Reset Password</h4>
          <p className="text-sm text-gray-600">Send password reset email to the user.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">Deactivate</h4>
          <p className="text-sm text-gray-600">Disable user account without deleting data.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">View Activity</h4>
          <p className="text-sm text-gray-600">See user's ticket history and recent actions.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Bulk Import</h2>
      <p className="text-gray-600 mb-4">Import multiple users via CSV file with columns:</p>
      <div className="bg-gray-900 rounded-xl p-4 my-4 overflow-x-auto">
        <pre className="text-gray-300 text-sm"><code>username,email,full_name,organization,role,is_agent
jdoe,john@company.com,John Doe,Acme Corp,Agent,true
jsmith,jane@company.com,Jane Smith,Acme Corp,Admin,true</code></pre>
      </div>
    </div>
  )
}

function TeamRolesContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Roles & Permissions</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Roles define what users can see and do within ImaraDesk. Create custom roles to match your 
        organization's structure and security requirements.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Team → Roles</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Default Roles</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Role</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">System Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Administrator</td><td className="px-4 py-3 text-gray-600">Full access to all features and settings</td><td className="px-4 py-3"><span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">Yes</span></td></tr>
            <tr><td className="px-4 py-3 font-medium">Agent</td><td className="px-4 py-3 text-gray-600">Standard support agent with ticket access</td><td className="px-4 py-3"><span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">Yes</span></td></tr>
            <tr><td className="px-4 py-3 font-medium">Supervisor</td><td className="px-4 py-3 text-gray-600">Team lead with reporting capabilities</td><td className="px-4 py-3"><span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">Yes</span></td></tr>
            <tr><td className="px-4 py-3 font-medium">Read Only</td><td className="px-4 py-3 text-gray-600">View-only access for auditors</td><td className="px-4 py-3"><span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">Yes</span></td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Permission Categories</h2>
      
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Ticket Permissions</h3>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.view</code> - View tickets</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.create</code> - Create new tickets</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.edit</code> - Edit ticket details</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.delete</code> - Delete tickets</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.assign</code> - Assign tickets to agents</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.merge</code> - Merge duplicate tickets</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Knowledge Base Permissions</h3>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">kb.view</code> - View KB articles</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">kb.create</code> - Create articles</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">kb.edit</code> - Edit articles</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">kb.publish</code> - Publish/unpublish articles</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">kb.approve</code> - Approve pending articles</li>
      </ul>

      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Admin Permissions</h3>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">admin.settings</code> - Access settings</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">admin.users</code> - Manage users</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">admin.roles</code> - Manage roles</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">admin.reports</code> - Access reports</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Creating Custom Roles</h2>
      <p className="text-gray-600 mb-4">Create roles tailored to your team structure:</p>
      <ol className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">1.</span>Click "Add Role"</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">2.</span>Enter role name and description</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">3.</span>Select permissions from the checkbox list</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">4.</span>Save the role</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">5.</span>Assign to users</li>
      </ol>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 rounded-r-lg">
        <p className="text-yellow-800 font-medium">Note</p>
        <p className="text-yellow-700 text-sm">System roles cannot be deleted but can be modified. Custom roles can be fully managed.</p>
      </div>
    </div>
  )
}

function TeamGroupsContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Groups</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        Groups organize users into teams for ticket assignment, notifications, and reporting. 
        Create groups based on expertise, department, or region.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Access Path</p>
        <p className="text-blue-700 text-sm">Settings → Team → Groups</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why Use Groups?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🎯 Ticket Routing</h4>
          <p className="text-sm text-gray-600">Assign tickets to groups instead of individuals. Any member can pick up the ticket.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📊 Team Metrics</h4>
          <p className="text-sm text-gray-600">Track performance metrics by team or department.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔔 Group Notifications</h4>
          <p className="text-sm text-gray-600">Send notifications to entire teams at once.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">⚖️ Load Balancing</h4>
          <p className="text-sm text-gray-600">Auto-assign tickets across group members evenly.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Example Groups</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Group</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Use Case</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">🖥️ Technical Support</td><td className="px-4 py-3 text-gray-600">IT and technical issues</td><td className="px-4 py-3 text-gray-600">Software bugs, system errors</td></tr>
            <tr><td className="px-4 py-3 font-medium">💰 Billing</td><td className="px-4 py-3 text-gray-600">Payment and invoice queries</td><td className="px-4 py-3 text-gray-600">Refunds, payment issues</td></tr>
            <tr><td className="px-4 py-3 font-medium">📦 Sales</td><td className="px-4 py-3 text-gray-600">Pre-sales inquiries</td><td className="px-4 py-3 text-gray-600">Pricing, demos, quotes</td></tr>
            <tr><td className="px-4 py-3 font-medium">🌍 EMEA Support</td><td className="px-4 py-3 text-gray-600">European customers</td><td className="px-4 py-3 text-gray-600">Regional support team</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Creating Groups</h2>
      <p className="text-gray-600 mb-4">To create a new group:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Name:</strong> Group identifier (e.g., "Level 2 Support")</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Description:</strong> What this group handles</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Members:</strong> Add users to the group</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Managing Members</h2>
      <p className="text-gray-600 mb-4">Users can belong to multiple groups. Manage membership by:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Adding members from the group detail page</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Editing user profiles to assign groups</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Bulk import with group assignments via CSV</li>
      </ul>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r-lg">
        <p className="text-green-800 font-medium">Pro Tip</p>
        <p className="text-green-700 text-sm">Create skill-based groups (e.g., "API Experts", "Mobile Specialists") to route complex tickets to the right specialists.</p>
      </div>
    </div>
  )
}

// ==================== MODULE DOCUMENTATION ====================

function TicketsModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tickets Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The Tickets module is the core of ImaraDesk, providing comprehensive ticket management
        for customer support operations. Handle inquiries, issues, and requests efficiently
        with powerful workflow automation and collaboration tools.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🎫</div>
            <div className="text-sm font-medium text-gray-700">Ticket Management</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🔄</div>
            <div className="text-sm font-medium text-gray-700">Workflow Automation</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-medium text-gray-700">Analytics</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">👥</div>
            <div className="text-sm font-medium text-gray-700">Collaboration</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Key Features</h2>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Ticket Lifecycle</h3>
      <p className="text-gray-600 mb-4">Tickets flow through defined statuses to track progress:</p>
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">New</span>
        <span className="text-gray-400">→</span>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Open</span>
        <span className="text-gray-400">→</span>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">In Progress</span>
        <span className="text-gray-400">→</span>
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">Pending</span>
        <span className="text-gray-400">→</span>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Resolved</span>
        <span className="text-gray-400">→</span>
        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Closed</span>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Ticket Properties</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Property</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Priority</td><td className="px-4 py-3 text-gray-600">Urgency level</td><td className="px-4 py-3 text-gray-600">Low, Medium, High, Urgent</td></tr>
            <tr><td className="px-4 py-3 font-medium">Type</td><td className="px-4 py-3 text-gray-600">Issue category</td><td className="px-4 py-3 text-gray-600">Question, Incident, Problem, Task</td></tr>
            <tr><td className="px-4 py-3 font-medium">Source</td><td className="px-4 py-3 text-gray-600">Origin channel</td><td className="px-4 py-3 text-gray-600">Email, Portal, Phone, Chat, API</td></tr>
            <tr><td className="px-4 py-3 font-medium">Assignee</td><td className="px-4 py-3 text-gray-600">Responsible agent</td><td className="px-4 py-3 text-gray-600">User or Group</td></tr>
            <tr><td className="px-4 py-3 font-medium">Tags</td><td className="px-4 py-3 text-gray-600">Labels for filtering</td><td className="px-4 py-3 text-gray-600">Custom tags</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Ticket Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">💬 Reply</h4>
          <p className="text-sm text-gray-600">Send public responses to customers. Supports rich text, attachments, and canned responses.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📝 Note</h4>
          <p className="text-sm text-gray-600">Add internal notes visible only to agents. Great for handoffs and documentation.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">↪️ Forward</h4>
          <p className="text-sm text-gray-600">Forward tickets to external parties or third-party vendors for collaboration.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔀 Merge</h4>
          <p className="text-sm text-gray-600">Combine duplicate tickets into a single thread to avoid confusion.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">✂️ Split</h4>
          <p className="text-sm text-gray-600">Split a conversation into separate tickets if multiple issues exist.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔗 Link</h4>
          <p className="text-sm text-gray-600">Link related tickets together for better context and tracking.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Views & Filters</h2>
      <p className="text-gray-600 mb-4">Organize tickets with powerful filtering:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>My Tickets:</strong> Tickets assigned to you</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Unassigned:</strong> Tickets waiting for assignment</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>All Open:</strong> All tickets in open statuses</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Overdue:</strong> Tickets past SLA deadlines</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Custom Views:</strong> Save your own filter combinations</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Automation Rules</h2>
      <p className="text-gray-600 mb-4">Automate repetitive tasks with rules:</p>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono mb-6">
        <div className="text-green-400">// Example: Auto-assign to group based on subject</div>
        <div className="mt-2">IF ticket.subject CONTAINS "billing"</div>
        <div>THEN assign_to_group("Billing Team")</div>
        <div className="mt-2 text-green-400">// Example: Escalate overdue tickets</div>
        <div className="mt-2">IF ticket.sla_status = "breached"</div>
        <div>THEN set_priority("Urgent"), notify_manager()</div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Related Documentation</p>
        <p className="text-blue-700 text-sm">See <Link href="/docs/features/ticket-creation/" className="underline">Ticket Creation</Link> and <Link href="/docs/features/ticket-management/" className="underline">Ticket Management</Link> for detailed guides.</p>
      </div>
    </div>
  )
}

function AssetsModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Assets Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The Assets module provides comprehensive IT asset management integrated with your
        help desk. Track hardware, software, and other organizational assets while
        linking them to tickets and users for complete visibility.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">💻</div>
            <div className="text-sm font-medium text-gray-700">Hardware</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📀</div>
            <div className="text-sm font-medium text-gray-700">Software</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🔗</div>
            <div className="text-sm font-medium text-gray-700">Relationships</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📋</div>
            <div className="text-sm font-medium text-gray-700">Inventory</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Asset Types</h2>
      <p className="text-gray-600 mb-4">ImaraDesk supports multiple asset categories:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🖥️ Hardware</h4>
          <p className="text-sm text-gray-600">Computers, laptops, monitors, peripherals, network equipment, mobile devices.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📦 Software</h4>
          <p className="text-sm text-gray-600">Licenses, subscriptions, installed applications, and software inventory.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🏢 Infrastructure</h4>
          <p className="text-sm text-gray-600">Servers, storage systems, networking equipment, cloud resources.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📄 Contracts</h4>
          <p className="text-sm text-gray-600">Warranty information, maintenance contracts, vendor agreements.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Asset Properties</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Field</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
              <th className="text-left px-4 py-3 font-semibold">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Asset Tag</td><td className="px-4 py-3 text-gray-600">Unique identifier</td><td className="px-4 py-3 text-gray-600">AST-2024-001234</td></tr>
            <tr><td className="px-4 py-3 font-medium">Name</td><td className="px-4 py-3 text-gray-600">Descriptive name</td><td className="px-4 py-3 text-gray-600">MacBook Pro 16" - Dev Team</td></tr>
            <tr><td className="px-4 py-3 font-medium">Type</td><td className="px-4 py-3 text-gray-600">Asset category</td><td className="px-4 py-3 text-gray-600">Laptop</td></tr>
            <tr><td className="px-4 py-3 font-medium">Status</td><td className="px-4 py-3 text-gray-600">Current state</td><td className="px-4 py-3 text-gray-600">In Use, Available, Retired</td></tr>
            <tr><td className="px-4 py-3 font-medium">Assigned To</td><td className="px-4 py-3 text-gray-600">User or department</td><td className="px-4 py-3 text-gray-600">John Smith (Engineering)</td></tr>
            <tr><td className="px-4 py-3 font-medium">Location</td><td className="px-4 py-3 text-gray-600">Physical location</td><td className="px-4 py-3 text-gray-600">HQ - Floor 3</td></tr>
            <tr><td className="px-4 py-3 font-medium">Purchase Date</td><td className="px-4 py-3 text-gray-600">Acquisition date</td><td className="px-4 py-3 text-gray-600">2024-01-15</td></tr>
            <tr><td className="px-4 py-3 font-medium">Warranty Expiry</td><td className="px-4 py-3 text-gray-600">Warranty end date</td><td className="px-4 py-3 text-gray-600">2027-01-15</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Asset-Ticket Integration</h2>
      <p className="text-gray-600 mb-4">Link assets to tickets for better context:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Attach assets to tickets to see full history</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>View all tickets related to a specific asset</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Auto-suggest assets based on ticket requester</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Track recurring issues with specific assets</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Importing Assets</h2>
      <p className="text-gray-600 mb-4">Bulk import assets via CSV file:</p>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono mb-6">
        <div className="text-green-400"># CSV Format Example</div>
        <div>asset_tag,name,type,status,assigned_to,location</div>
        <div>AST-001,Dell XPS 15,Laptop,In Use,john@company.com,HQ Floor 2</div>
        <div>AST-002,HP Monitor 27",Monitor,In Use,jane@company.com,HQ Floor 2</div>
        <div>AST-003,Cisco Switch,Network,In Use,IT Room,Server Room</div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 rounded-r-lg">
        <p className="text-yellow-800 font-medium">Best Practice</p>
        <p className="text-yellow-700 text-sm">Establish a consistent asset tagging convention early. Include location codes and asset categories in your tags for easier filtering.</p>
      </div>
    </div>
  )
}

function TasksModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tasks Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The Tasks module extends ticket functionality with structured task management.
        Break down complex tickets into actionable tasks, assign to team members, and
        track progress with checklists and due dates.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">✅</div>
            <div className="text-sm font-medium text-gray-700">Task Lists</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📅</div>
            <div className="text-sm font-medium text-gray-700">Due Dates</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">👤</div>
            <div className="text-sm font-medium text-gray-700">Assignments</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-medium text-gray-700">Progress</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Task Types</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🎫 Ticket Tasks</h4>
          <p className="text-sm text-gray-600">Sub-tasks attached to tickets. Complete all tasks before resolving the parent ticket.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📋 Standalone Tasks</h4>
          <p className="text-sm text-gray-600">Independent tasks not linked to tickets. Perfect for internal projects and maintenance.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔁 Recurring Tasks</h4>
          <p className="text-sm text-gray-600">Automatically created on a schedule. Great for maintenance windows and audits.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📝 Template Tasks</h4>
          <p className="text-sm text-gray-600">Pre-defined task lists applied to tickets. Ensures consistent processes.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Task Properties</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Property</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Title</td><td className="px-4 py-3 text-gray-600">Brief description of the task</td></tr>
            <tr><td className="px-4 py-3 font-medium">Description</td><td className="px-4 py-3 text-gray-600">Detailed instructions and context</td></tr>
            <tr><td className="px-4 py-3 font-medium">Due Date</td><td className="px-4 py-3 text-gray-600">Deadline for completion</td></tr>
            <tr><td className="px-4 py-3 font-medium">Assignee</td><td className="px-4 py-3 text-gray-600">Person responsible for the task</td></tr>
            <tr><td className="px-4 py-3 font-medium">Status</td><td className="px-4 py-3 text-gray-600">Not Started, In Progress, Completed</td></tr>
            <tr><td className="px-4 py-3 font-medium">Priority</td><td className="px-4 py-3 text-gray-600">Low, Medium, High, Urgent</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Use Cases</h2>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Onboarding:</strong> Create task checklist for new employee setup (email, hardware, access)</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Change Requests:</strong> Break down changes into approval, implementation, and verification tasks</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Maintenance:</strong> Schedule recurring tasks for backups, updates, and audits</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Escalations:</strong> Define escalation tasks when tickets are breached</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Task Templates</h2>
      <p className="text-gray-600 mb-4">Create reusable task templates for common processes:</p>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono mb-6">
        <div className="text-green-400"># New Employee Onboarding Template</div>
        <div>☐ Create email account</div>
        <div>☐ Assign laptop from inventory</div>
        <div>☐ Configure VPN access</div>
        <div>☐ Add to relevant groups</div>
        <div>☐ Schedule orientation meeting</div>
        <div>☐ Provide documentation</div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r-lg">
        <p className="text-green-800 font-medium">Pro Tip</p>
        <p className="text-green-700 text-sm">Link task templates to specific ticket types. When an "Onboarding" ticket is created, automatically apply the onboarding task list.</p>
      </div>
    </div>
  )
}

function KBModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Knowledge Base Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The Knowledge Base module provides self-service documentation for customers and
        internal teams. Create, organize, and publish articles to deflect tickets and
        empower users to find answers independently.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📖</div>
            <div className="text-sm font-medium text-gray-700">Articles</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📁</div>
            <div className="text-sm font-medium text-gray-700">Categories</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🔍</div>
            <div className="text-sm font-medium text-gray-700">Search</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-medium text-gray-700">Analytics</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Article Management</h2>
      
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Creating Articles</h3>
      <p className="text-gray-600 mb-4">Articles support rich content formatting:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Rich text editor with formatting options</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Code blocks with syntax highlighting</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Image and file attachments</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Embedded videos and media</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Tables and structured content</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Internal linking between articles</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Article Properties</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Property</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Title</td><td className="px-4 py-3 text-gray-600">Article headline (searchable)</td></tr>
            <tr><td className="px-4 py-3 font-medium">Category</td><td className="px-4 py-3 text-gray-600">Folder/category assignment</td></tr>
            <tr><td className="px-4 py-3 font-medium">Status</td><td className="px-4 py-3 text-gray-600">Draft, Published, Archived</td></tr>
            <tr><td className="px-4 py-3 font-medium">Visibility</td><td className="px-4 py-3 text-gray-600">Public, Logged-in Users, Internal Only</td></tr>
            <tr><td className="px-4 py-3 font-medium">Tags</td><td className="px-4 py-3 text-gray-600">Keywords for better searchability</td></tr>
            <tr><td className="px-4 py-3 font-medium">SEO Meta</td><td className="px-4 py-3 text-gray-600">Meta description for search engines</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Category Organization</h2>
      <p className="text-gray-600 mb-4">Organize articles into a logical hierarchy:</p>
      <div className="bg-gray-50 p-4 rounded-xl text-sm font-mono mb-6">
        <div>📁 Getting Started</div>
        <div className="ml-4">├── 📄 Account Setup</div>
        <div className="ml-4">├── 📄 First Steps</div>
        <div className="ml-4">└── 📄 Quick Start Guide</div>
        <div>📁 Troubleshooting</div>
        <div className="ml-4">├── 📄 Common Errors</div>
        <div className="ml-4">├── 📄 Password Reset</div>
        <div className="ml-4">└── 📄 Connection Issues</div>
        <div>📁 FAQs</div>
        <div className="ml-4">├── 📄 Billing Questions</div>
        <div className="ml-4">└── 📄 Feature Requests</div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">KB Analytics</h2>
      <p className="text-gray-600 mb-4">Track knowledge base effectiveness:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📈 View Count</h4>
          <p className="text-sm text-gray-600">Track which articles are most popular and trending.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">👍 Helpfulness</h4>
          <p className="text-sm text-gray-600">User ratings indicate article quality and usefulness.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔍 Search Terms</h4>
          <p className="text-sm text-gray-600">See what users search for to identify content gaps.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🎫 Ticket Deflection</h4>
          <p className="text-sm text-gray-600">Measure how many tickets were avoided via self-service.</p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Integration with Tickets</p>
        <p className="text-blue-700 text-sm">Agents can link KB articles to tickets and suggest articles to customers. The system also suggests relevant articles when creating tickets.</p>
      </div>
    </div>
  )
}

function SurveysModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Surveys Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The Surveys module enables customer satisfaction measurement through automated
        surveys. Collect feedback after ticket resolution, measure CSAT and NPS scores,
        and identify areas for improvement.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">⭐</div>
            <div className="text-sm font-medium text-gray-700">CSAT</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-medium text-gray-700">NPS</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📝</div>
            <div className="text-sm font-medium text-gray-700">Feedback</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📈</div>
            <div className="text-sm font-medium text-gray-700">Reports</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Survey Types</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">⭐ CSAT Survey</h4>
          <p className="text-sm text-gray-600 mb-2">Customer Satisfaction Score. Simple rating (1-5 stars or emoji scale).</p>
          <div className="flex gap-1 text-lg">⭐⭐⭐⭐⭐</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📊 NPS Survey</h4>
          <p className="text-sm text-gray-600 mb-2">Net Promoter Score. Scale of 0-10 measuring likelihood to recommend.</p>
          <div className="flex gap-0.5 text-xs">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <span key={n} className={`w-5 h-5 flex items-center justify-center rounded ${n < 7 ? 'bg-red-100 text-red-800' : n < 9 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{n}</span>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📝 Custom Surveys</h4>
          <p className="text-sm text-gray-600">Create custom questions with multiple response types (text, rating, multiple choice).</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🎯 CES Survey</h4>
          <p className="text-sm text-gray-600">Customer Effort Score. Measure how easy it was to get help.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Survey Triggers</h2>
      <p className="text-gray-600 mb-4">Configure when surveys are automatically sent:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Ticket Closed:</strong> Send survey when a ticket is closed</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Ticket Resolved:</strong> Send immediately upon resolution</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Time Delay:</strong> Send X hours/days after closure</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Manual:</strong> Agents trigger surveys manually</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Survey Configuration</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Setting</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Survey Title</td><td className="px-4 py-3 text-gray-600">Name displayed to customers</td></tr>
            <tr><td className="px-4 py-3 font-medium">Description</td><td className="px-4 py-3 text-gray-600">Brief intro text for the survey</td></tr>
            <tr><td className="px-4 py-3 font-medium">Questions</td><td className="px-4 py-3 text-gray-600">Rating questions and optional text feedback</td></tr>
            <tr><td className="px-4 py-3 font-medium">Thank You Message</td><td className="px-4 py-3 text-gray-600">Message shown after submission</td></tr>
            <tr><td className="px-4 py-3 font-medium">Expiry</td><td className="px-4 py-3 text-gray-600">Days until survey link expires</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Analyzing Results</h2>
      <p className="text-gray-600 mb-4">Access survey analytics to understand customer sentiment:</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-green-600">4.5</div>
          <div className="text-sm text-gray-600">Average CSAT</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-blue-600">72</div>
          <div className="text-sm text-gray-600">NPS Score</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <div className="text-3xl font-bold text-purple-600">85%</div>
          <div className="text-sm text-gray-600">Response Rate</div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 rounded-r-lg">
        <p className="text-yellow-800 font-medium">Best Practice</p>
        <p className="text-yellow-700 text-sm">Keep surveys short (1-3 questions) for higher response rates. Always include an optional text field for detailed feedback.</p>
      </div>
    </div>
  )
}

function CustomerPortalModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Portal Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The Customer Portal provides a branded self-service interface for your customers.
        They can submit tickets, track status, browse the knowledge base, and manage their
        profile without contacting support directly.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🎫</div>
            <div className="text-sm font-medium text-gray-700">Submit Tickets</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📋</div>
            <div className="text-sm font-medium text-gray-700">Track Status</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📖</div>
            <div className="text-sm font-medium text-gray-700">Knowledge Base</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">👤</div>
            <div className="text-sm font-medium text-gray-700">Profile</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Portal Features</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🎫 Ticket Submission</h4>
          <p className="text-sm text-gray-600">Customers submit tickets with customizable forms. Support file attachments and custom fields.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📜 Ticket History</h4>
          <p className="text-sm text-gray-600">View all past and current tickets with full conversation history.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📖 Knowledge Base</h4>
          <p className="text-sm text-gray-600">Access public articles with search and categories. Deflect tickets with self-service.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">💬 Live Updates</h4>
          <p className="text-sm text-gray-600">Real-time ticket updates and agent responses without page refresh.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">🔔 Notifications</h4>
          <p className="text-sm text-gray-600">Email notifications for ticket updates and resolution.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">👤 Profile Management</h4>
          <p className="text-sm text-gray-600">Update contact info, change password, and manage preferences.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Portal Customization</h2>
      <p className="text-gray-600 mb-4">Brand your portal to match your company identity:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span><strong>Logo:</strong> Upload your company logo</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span><strong>Colors:</strong> Match your brand colors</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span><strong>Custom Domain:</strong> Use portal.yourcompany.com</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span><strong>Welcome Message:</strong> Personalized greeting</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span><strong>Footer Links:</strong> Add privacy policy, terms, etc.</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Access Control</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Mode</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Open Registration</td><td className="px-4 py-3 text-gray-600">Anyone can create an account</td></tr>
            <tr><td className="px-4 py-3 font-medium">Invitation Only</td><td className="px-4 py-3 text-gray-600">Only invited users can register</td></tr>
            <tr><td className="px-4 py-3 font-medium">Domain Restriction</td><td className="px-4 py-3 text-gray-600">Limit registration to specific email domains</td></tr>
            <tr><td className="px-4 py-3 font-medium">SSO</td><td className="px-4 py-3 text-gray-600">Authenticate via Google, Microsoft, etc.</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Custom Ticket Forms</h2>
      <p className="text-gray-600 mb-4">Create different submission forms for different request types:</p>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono mb-6">
        <div className="text-green-400"># Example: Bug Report Form</div>
        <div>- Subject (required)</div>
        <div>- Description (required)</div>
        <div>- Steps to Reproduce (text area)</div>
        <div>- Expected Behavior (text area)</div>
        <div>- Actual Behavior (text area)</div>
        <div>- Browser/OS (dropdown)</div>
        <div>- Screenshot (file upload)</div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Related Documentation</p>
        <p className="text-blue-700 text-sm">See <Link href="/docs/features/customer-portal/" className="underline">Customer Portal Features</Link> for detailed configuration options.</p>
      </div>
    </div>
  )
}

function SLAModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">SLA Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The SLA (Service Level Agreement) module helps you define and enforce response
        and resolution time commitments. Track SLA compliance, automate escalations,
        and ensure consistent service quality.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">⏱️</div>
            <div className="text-sm font-medium text-gray-700">Response Time</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">✅</div>
            <div className="text-sm font-medium text-gray-700">Resolution Time</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🚨</div>
            <div className="text-sm font-medium text-gray-700">Escalations</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📊</div>
            <div className="text-sm font-medium text-gray-700">Compliance</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SLA Targets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">⏱️ First Response Time</h4>
          <p className="text-sm text-gray-600">Time until the first agent response. Critical for customer perception.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">✅ Resolution Time</h4>
          <p className="text-sm text-gray-600">Total time to fully resolve the ticket. Includes all interactions.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">💬 Next Reply Time</h4>
          <p className="text-sm text-gray-600">Time between customer message and agent follow-up.</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">📞 Operational Hours</h4>
          <p className="text-sm text-gray-600">SLA timers only run during business hours.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SLA Policy Example</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Priority</th>
              <th className="text-left px-4 py-3 font-semibold">First Response</th>
              <th className="text-left px-4 py-3 font-semibold">Resolution</th>
              <th className="text-left px-4 py-3 font-semibold">Business Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-red-50"><td className="px-4 py-3 font-medium text-red-800">🔴 Urgent</td><td className="px-4 py-3">30 minutes</td><td className="px-4 py-3">4 hours</td><td className="px-4 py-3">24/7</td></tr>
            <tr className="bg-orange-50"><td className="px-4 py-3 font-medium text-orange-800">🟠 High</td><td className="px-4 py-3">1 hour</td><td className="px-4 py-3">8 hours</td><td className="px-4 py-3">24/7</td></tr>
            <tr className="bg-yellow-50"><td className="px-4 py-3 font-medium text-yellow-800">🟡 Medium</td><td className="px-4 py-3">4 hours</td><td className="px-4 py-3">24 hours</td><td className="px-4 py-3">Business</td></tr>
            <tr className="bg-green-50"><td className="px-4 py-3 font-medium text-green-800">🟢 Low</td><td className="px-4 py-3">8 hours</td><td className="px-4 py-3">48 hours</td><td className="px-4 py-3">Business</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Escalation Rules</h2>
      <p className="text-gray-600 mb-4">Configure automatic escalations when SLAs are at risk:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Warning (75%):</strong> Notify assigned agent</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Critical (90%):</strong> Notify agent + team lead</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Breached (100%):</strong> Notify manager, auto-escalate priority</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><strong>Post-Breach:</strong> Continue notifications every X hours</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Business Hours</h2>
      <p className="text-gray-600 mb-4">Define when SLA timers are active:</p>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono mb-6">
        <div className="text-green-400"># Standard Business Hours</div>
        <div>Monday-Friday: 9:00 AM - 6:00 PM</div>
        <div>Saturday: 10:00 AM - 2:00 PM</div>
        <div>Sunday: Closed</div>
        <div className="mt-2 text-green-400"># Timezone: America/New_York</div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">SLA Status Indicators</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">🟢 On Track</span>
        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">🟡 At Risk (75%+)</span>
        <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">🟠 Critical (90%+)</span>
        <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">🔴 Breached</span>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Related Documentation</p>
        <p className="text-blue-700 text-sm">See <Link href="/docs/sla/policies/" className="underline">SLA Policies</Link>, <Link href="/docs/sla/business-hours/" className="underline">Business Hours</Link>, and <Link href="/docs/sla/holidays/" className="underline">Holidays</Link> for detailed configuration.</p>
      </div>
    </div>
  )
}

function IntegrationsModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Integrations Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The Integrations module connects ImaraDesk with your existing tools and services.
        Sync data, automate workflows, and provide seamless experiences across your
        technology stack.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Integrations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">💬</div>
            <div className="text-sm font-medium text-gray-700">Slack</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">👥</div>
            <div className="text-sm font-medium text-gray-700">MS Teams</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📧</div>
            <div className="text-sm font-medium text-gray-700">Email</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🔗</div>
            <div className="text-sm font-medium text-gray-700">Webhooks</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Slack Integration</h2>
      <p className="text-gray-600 mb-4">Connect Slack for real-time notifications and ticket management:</p>
      <ul className="space-y-2 text-gray-600 mb-6">
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Receive ticket notifications in channels</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Create tickets from Slack messages</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Reply to tickets without leaving Slack</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Get alerts for SLA breaches and escalations</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Use slash commands (/ticket, /status)</li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Setup Steps</h3>
      <ol className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">1.</span>Go to Settings → Integrations → Slack</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">2.</span>Click "Connect to Slack"</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">3.</span>Authorize ImaraDesk in your Slack workspace</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">4.</span>Select channels for notifications</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">5.</span>Configure notification preferences</li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Microsoft Teams Integration</h2>
      <p className="text-gray-600 mb-4">Integrate with Microsoft Teams for enterprise collaboration:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Teams channel notifications</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Adaptive cards for ticket details</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Bot commands for quick actions</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>SSO with Microsoft accounts</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Email Integration</h2>
      <p className="text-gray-600 mb-4">Configure email channels for ticket creation:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Feature</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Incoming Email</td><td className="px-4 py-3 text-gray-600">Emails to support@yourcompany.com create tickets</td></tr>
            <tr><td className="px-4 py-3 font-medium">Email Threading</td><td className="px-4 py-3 text-gray-600">Replies update existing tickets automatically</td></tr>
            <tr><td className="px-4 py-3 font-medium">Attachments</td><td className="px-4 py-3 text-gray-600">Email attachments saved to tickets</td></tr>
            <tr><td className="px-4 py-3 font-medium">Multiple Addresses</td><td className="px-4 py-3 text-gray-600">Different emails for different categories</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Webhooks</h2>
      <p className="text-gray-600 mb-4">Build custom integrations with webhooks:</p>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-sm font-mono mb-6">
        <div className="text-green-400"># Webhook Payload Example</div>
        <div>{'{'}</div>
        <div className="ml-4">"event": "ticket.created",</div>
        <div className="ml-4">"ticket": {'{'}</div>
        <div className="ml-8">"id": 12345,</div>
        <div className="ml-8">"subject": "Cannot login",</div>
        <div className="ml-8">"priority": "high",</div>
        <div className="ml-8">"status": "new"</div>
        <div className="ml-4">{'}'},</div>
        <div className="ml-4">"timestamp": "2026-02-20T10:30:00Z"</div>
        <div>{'}'}</div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Available Events</h3>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.created</code></li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.updated</code></li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.resolved</code></li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">ticket.closed</code></li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">sla.breached</code></li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span><code className="bg-gray-100 px-2 py-1 rounded text-xs">survey.completed</code></li>
      </ul>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded-r-lg">
        <p className="text-blue-800 font-medium">Related Documentation</p>
        <p className="text-blue-700 text-sm">See <Link href="/docs/configuration/integrations/" className="underline">Integrations Configuration</Link> for setup details.</p>
      </div>
    </div>
  )
}

function PeopleModuleContent() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">People Module</h1>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        The People module manages contacts, customers, and organizations in your help desk.
        Maintain a comprehensive database of everyone who interacts with your support team
        for better context and relationship management.
      </p>

      <div className="bg-gradient-to-r from-[#4a154b]/10 to-purple-100 p-6 rounded-xl my-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">👤</div>
            <div className="text-sm font-medium text-gray-700">Contacts</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🏢</div>
            <div className="text-sm font-medium text-gray-700">Organizations</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">📋</div>
            <div className="text-sm font-medium text-gray-700">History</div>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <div className="text-2xl">🏷️</div>
            <div className="text-sm font-medium text-gray-700">Segments</div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Contacts</h2>
      <p className="text-gray-600 mb-4">Individual people who submit tickets or interact with support:</p>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Contact Properties</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Field</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Name</td><td className="px-4 py-3 text-gray-600">Full name of the contact</td></tr>
            <tr><td className="px-4 py-3 font-medium">Email</td><td className="px-4 py-3 text-gray-600">Primary email address (unique identifier)</td></tr>
            <tr><td className="px-4 py-3 font-medium">Phone</td><td className="px-4 py-3 text-gray-600">Contact phone number</td></tr>
            <tr><td className="px-4 py-3 font-medium">Organization</td><td className="px-4 py-3 text-gray-600">Company they belong to</td></tr>
            <tr><td className="px-4 py-3 font-medium">Title</td><td className="px-4 py-3 text-gray-600">Job title or role</td></tr>
            <tr><td className="px-4 py-3 font-medium">Tags</td><td className="px-4 py-3 text-gray-600">Labels for segmentation</td></tr>
            <tr><td className="px-4 py-3 font-medium">Notes</td><td className="px-4 py-3 text-gray-600">Internal notes about the contact</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Contact Timeline</h3>
      <p className="text-gray-600 mb-4">View complete interaction history for each contact:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>All tickets submitted by this contact</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Conversation history across tickets</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Survey responses and satisfaction scores</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Assets assigned to the contact</li>
        <li className="flex items-start gap-2"><span className="text-green-600">✓</span>Notes added by agents</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Organizations</h2>
      <p className="text-gray-600 mb-4">Companies or groups that contacts belong to:</p>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Organization Properties</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Field</th>
              <th className="text-left px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="px-4 py-3 font-medium">Name</td><td className="px-4 py-3 text-gray-600">Organization name</td></tr>
            <tr><td className="px-4 py-3 font-medium">Domain</td><td className="px-4 py-3 text-gray-600">Email domain (auto-associate contacts)</td></tr>
            <tr><td className="px-4 py-3 font-medium">Industry</td><td className="px-4 py-3 text-gray-600">Business sector</td></tr>
            <tr><td className="px-4 py-3 font-medium">Size</td><td className="px-4 py-3 text-gray-600">Number of employees</td></tr>
            <tr><td className="px-4 py-3 font-medium">SLA Policy</td><td className="px-4 py-3 text-gray-600">Custom SLA for this organization</td></tr>
            <tr><td className="px-4 py-3 font-medium">Account Manager</td><td className="px-4 py-3 text-gray-600">Assigned team member</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Automatic Contact Creation</h2>
      <p className="text-gray-600 mb-4">Contacts are automatically created when:</p>
      <ul className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span>A new email is received from an unknown sender</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span>Someone registers on the customer portal</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span>Tickets are created via API with new requester</li>
        <li className="flex items-start gap-2"><span className="text-[#4a154b]">•</span>Bulk import via CSV file</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Merge Contacts</h2>
      <p className="text-gray-600 mb-4">Combine duplicate contacts to maintain clean data:</p>
      <ol className="space-y-2 text-gray-600">
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">1.</span>Select duplicate contacts</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">2.</span>Choose primary contact to keep</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">3.</span>All tickets and history merge automatically</li>
        <li className="flex items-start gap-2"><span className="font-semibold text-[#4a154b]">4.</span>Duplicate is removed</li>
      </ol>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 rounded-r-lg">
        <p className="text-green-800 font-medium">Pro Tip</p>
        <p className="text-green-700 text-sm">Use organization domains to automatically associate contacts. Anyone emailing from @company.com will be linked to that organization.</p>
      </div>
    </div>
  )
}
