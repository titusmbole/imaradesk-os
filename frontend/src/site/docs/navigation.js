// Documentation navigation structure
export const docsNavigation = [
  {
    title: 'Getting Started',
    icon: '🚀',
    items: [
      { title: 'Quick Start Guide', slug: 'getting-started/quick-start' },
      { title: 'Installation', slug: 'getting-started/installation' },
      { title: 'System Requirements', slug: 'getting-started/system-requirements' },
    ]
  },
  {
    title: 'Features',
    icon: '✨',
    items: [
      { title: 'Ticket Creation', slug: 'features/ticket-creation' },
      { title: 'Ticket Management', slug: 'features/ticket-management' },
      { title: 'Knowledge Base', slug: 'features/knowledge-base' },
      { title: 'Customer Portal', slug: 'features/customer-portal' },
    ]
  },
  {
    title: 'Configuration',
    icon: '⚙️',
    items: [
      { title: 'General Settings', slug: 'configuration/general-settings' },
      { title: 'Notifications', slug: 'configuration/notifications' },
      { title: 'Security Settings', slug: 'configuration/security' },
      { title: 'Custom Domains', slug: 'configuration/custom-domains' },
      { title: 'Email Templates', slug: 'configuration/email-templates' },
      { title: 'SMTP Configuration', slug: 'configuration/smtp' },
      { title: 'Integrations', slug: 'configuration/integrations' },
    ]
  },
  {
    title: 'SLA Management',
    icon: '⏱️',
    items: [
      { title: 'SLA Overview', slug: 'sla/overview' },
      { title: 'SLA Policies', slug: 'sla/policies' },
      { title: 'Business Hours', slug: 'sla/business-hours' },
      { title: 'Holidays', slug: 'sla/holidays' },
    ]
  },
  {
    title: 'Team Management',
    icon: '👥',
    items: [
      { title: 'Users', slug: 'team/users' },
      { title: 'Roles & Permissions', slug: 'team/roles' },
      { title: 'Groups', slug: 'team/groups' },
    ]
  },
  {
    title: 'Modules',
    icon: '📦',
    items: [
      { title: 'Tickets Module', slug: 'modules/tickets' },
      { title: 'Assets Module', slug: 'modules/assets' },
      { title: 'Tasks Module', slug: 'modules/tasks' },
      { title: 'Knowledge Base Module', slug: 'modules/knowledge-base' },
      { title: 'Surveys Module', slug: 'modules/surveys' },
      { title: 'Customer Portal Module', slug: 'modules/customer-portal' },
      { title: 'SLA Module', slug: 'modules/sla' },
      { title: 'Integrations Module', slug: 'modules/integrations' },
      { title: 'People Module', slug: 'modules/people' },
    ]
  },
  {
    title: 'API Reference',
    icon: '🔌',
    items: [
      { title: 'REST API', slug: 'api/introduction' },
    ]
  },
]

// Get all doc slugs for easy lookup
export const getAllDocSlugs = () => {
  const slugs = []
  docsNavigation.forEach(section => {
    section.items.forEach(item => {
      slugs.push(item.slug)
    })
  })
  return slugs
}

// Get doc by slug
export const getDocBySlug = (slug) => {
  for (const section of docsNavigation) {
    for (const item of section.items) {
      if (item.slug === slug) {
        return { ...item, section: section.title }
      }
    }
  }
  return null
}

// Get previous and next docs for navigation
export const getDocNavigation = (currentSlug) => {
  const slugs = getAllDocSlugs()
  const currentIndex = slugs.indexOf(currentSlug)
  
  return {
    prev: currentIndex > 0 ? getDocBySlug(slugs[currentIndex - 1]) : null,
    next: currentIndex < slugs.length - 1 ? getDocBySlug(slugs[currentIndex + 1]) : null
  }
}
