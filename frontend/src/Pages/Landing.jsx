import React, { useState, useEffect, useRef } from 'react'
import { Head, Link } from '@inertiajs/react'
import { THEME, COLORS } from '../constants/theme'

export default function Landing() {
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [activeTab, setActiveTab] = useState('tickets')
  const [stats, setStats] = useState({ tickets: 0, satisfaction: 0, response: 0, customers: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    
    // Animate counters
    const animateValue = (key, end, duration) => {
      const start = 0
      const range = end - start
      const increment = end > 0 ? 1 : -1
      const stepTime = Math.abs(Math.floor(duration / range))
      
      let current = start
      const timer = setInterval(() => {
        current += increment * Math.ceil(range / (duration / 10))
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          current = end
          clearInterval(timer)
        }
        setStats(prev => ({ ...prev, [key]: current }))
      }, stepTime)
    }
    
    setTimeout(() => {
      animateValue('tickets', 500, 2000)
      animateValue('satisfaction', 99, 2000)
      animateValue('response', 120, 2000)
      animateValue('customers', 10000, 2000)
    }, 500)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target.id) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Head title="Welcome to ImaraDesk - Modern Customer Support Software" />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        .animate-gradient { animation: gradient 15s ease infinite; background-size: 200% 200%; }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>
      
      {/* Particles Background Container */}
      <ParticlesBackground />
      
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300" style={{
        boxShadow: scrollY > 10 ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform hover:scale-110" style={{ backgroundColor: COLORS.primary }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">ImaraDesk</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">Reviews</a>
            </div>
            <div className="flex items-center space-x-4">
              
              <Link 
                href="/register" 
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: COLORS.primary, color: 'white' }}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white min-h-[90vh] flex items-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full filter blur-3xl animate-gradient" 
               style={{ background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.primaryLight})` }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full filter blur-3xl animate-gradient" 
               style={{ background: `linear-gradient(135deg, ${COLORS.primaryLight}, ${COLORS.primary})`, animationDelay: '2s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-6 animate-fadeInUp">
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Customer Support
                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r" 
                      style={{ backgroundImage: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.primaryLight})` }}>
                  Made Simple
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Everything your team needs to deliver exceptional customer experiences. 
                Manage tickets, collaborate seamlessly, and delight your customers—all in one beautiful platform.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                <Link 
                  href="/register" 
                  className="px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                  style={{ backgroundColor: COLORS.primary, color: 'white' }}
                >
                  Start Free Trial →
                </Link>
                <a 
                  href="#demo" 
                  className="px-8 py-4 rounded-xl text-lg font-semibold border-2 transition-all hover:shadow-lg transform hover:scale-105"
                  style={{ borderColor: COLORS.primary, color: COLORS.primary }}
                >
                  Watch Demo
                </a>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  14-day free trial
                </div>
              </div>
            </div>
            
            <div className="relative animate-float">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 relative" style={{ backgroundColor: COLORS.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value={stats.tickets} suffix="K+" label="Tickets Resolved" />
            <AnimatedStat value={stats.satisfaction} suffix="%" label="Customer Satisfaction" />
            <AnimatedStat value={stats.response} suffix="s" label="Avg Response Time" />
            <AnimatedStat value={stats.customers} suffix="+" label="Happy Customers" />
          </div>
        </div>
      </section>

      {/* Features Showcase with Tabs */}
      <section id="features" className="py-24 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need, Nothing You Don't
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make your support team more productive and your customers happier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <FeatureCard
              icon="📧"
              title="Smart Ticket Management"
              description="Organize, prioritize, and track every customer request from start to finish. Automated routing ensures tickets reach the right agent instantly."
              delay="0s"
            />
            <FeatureCard
              icon="👥"
              title="Team Collaboration"
              description="Work together seamlessly with internal notes, @mentions, and real-time updates. Everyone stays in sync, always."
              delay="0.1s"
            />
            <FeatureCard
              icon="⏱️"
              title="SLA Management"
              description="Set response and resolution targets. Get intelligent alerts before breaches so you never miss a deadline."
              delay="0.2s"
            />
            <FeatureCard
              icon="📚"
              title="Knowledge Base"
              description="Build a comprehensive self-service portal. Reduce ticket volume by up to 40% while empowering customers."
              delay="0.3s"
            />
            <FeatureCard
              icon="📊"
              title="Advanced Analytics"
              description="Beautiful dashboards with actionable insights. Track performance, identify trends, and make data-driven decisions."
              delay="0.4s"
            />
            <FeatureCard
              icon="🏢"
              title="Multi-Organization"
              description="Manage multiple brands or clients from one place. Complete isolation with shared resources when needed."
              delay="0.5s"
            />
          </div>

          {/* Interactive Feature Demo */}
          <div className="mt-20">
            <InteractiveFeatureDemo activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </section>

      {/* How It Works - Animated Steps */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)' }} data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              No complex setup. No training required. Just sign up and start supporting.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r" 
                 style={{ background: `linear-gradient(to right, ${COLORS.primary}40, ${COLORS.primary}, ${COLORS.primary}40)`, transform: 'translateY(-50%)' }} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <StepCard
                number="1"
                title="Sign Up & Customize"
                description="Create your account in 30 seconds. Customize your workspace, add your branding, and invite your team."
                icon="🚀"
              />
              <StepCard
                number="2"
                title="Connect & Import"
                description="Connect your email, integrate with your tools, or import existing tickets. Everything just works."
                icon="🔌"
              />
              <StepCard
                number="3"
                title="Start Supporting"
                description="Begin responding to tickets immediately. Watch your customer satisfaction scores soar from day one."
                icon="💬"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your team. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              name="Starter"
              price="$19"
              period="/agent/month"
              description="Perfect for small teams getting started"
              features={[
                "Unlimited tickets",
                "Email integration",
                "Basic reporting",
                "Mobile apps",
                "Community support",
                "99.9% uptime SLA"
              ]}
              highlighted={false}
            />
            <PricingCard
              name="Professional"
              price="$49"
              period="/agent/month"
              description="For growing teams that need more"
              features={[
                "Everything in Starter",
                "SLA management",
                "Advanced analytics",
                "Knowledge base",
                "Priority support",
                "API access",
                "Custom integrations",
                "Live chat widget"
              ]}
              highlighted={true}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              period=""
              description="For large teams with custom needs"
              features={[
                "Everything in Professional",
                "Dedicated success manager",
                "Custom development",
                "99.99% uptime SLA",
                "Advanced security & SSO",
                "Unlimited integrations",
                "Training & onboarding",
                "24/7 phone support"
              ]}
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="testimonials" className="py-24 relative overflow-hidden" style={{ backgroundColor: '#f9fafb' }} data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Support Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="ImaraDesk transformed how we handle customer issues. Response times dropped 60% and satisfaction scores are at an all-time high. It's been a game-changer."
              author="Sarah Chen"
              role="Support Manager"
              company="TechCorp Inc"
              avatar="👩‍💼"
              rating={5}
            />
            <TestimonialCard
              quote="Finally, a ticketing system that doesn't feel like it's from 2005. The UI is gorgeous, fast, and my team actually enjoys using it every day."
              author="Mike Rodriguez"
              role="Head of Customer Success"
              company="StartupXYZ"
              avatar="👨‍💻"
              rating={5}
            />
            <TestimonialCard
              quote="The SLA management saved our business. We went from missing 30% of our commitments to hitting 98%. Our enterprise clients can't believe the difference."
              author="Emily Parker"
              role="Operations Director"
              company="CloudServices Ltd"
              avatar="👩‍🔬"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-24 bg-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Integrates With Your Favorite Tools
            </h2>
            <p className="text-xl text-gray-600">
              Connect with the tools you already use, seamlessly
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {['Slack', 'Gmail', 'Outlook', 'Zoom', 'Teams', 'Salesforce', 'Jira', 'GitHub', 'Zapier', 'Stripe', 'Shopify', 'WordPress'].map((tool, idx) => (
              <div key={tool} className="flex items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                   style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="text-center">
                  <div className="text-3xl mb-2">🔌</div>
                  <div className="text-sm font-medium text-gray-700">{tool}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24" style={{ backgroundColor: '#f9fafb' }} data-animate>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <FAQItem 
              question="How long does it take to get started?"
              answer="You can be up and running in less than 5 minutes. Sign up, customize your workspace, invite your team, and start managing tickets immediately. No complex setup or training required."
            />
            <FAQItem 
              question="Can I migrate from my current helpdesk?"
              answer="Absolutely! We provide free migration assistance for all plans. Our team will help you import your existing tickets, customer data, and knowledge base articles seamlessly."
            />
            <FAQItem 
              question="What's included in the free trial?"
              answer="The 14-day free trial includes full access to all Professional plan features. No credit card required. You can invite your entire team and test everything before making a decision."
            />
            <FAQItem 
              question="Is my data secure?"
              answer="Yes! We use bank-level encryption (AES-256), regular security audits, and SOC 2 Type II compliance. Your data is backed up daily and stored in multiple secure data centers."
            />
            <FAQItem 
              question="Can I cancel anytime?"
              answer="Yes, you can cancel anytime with no penalties. If you cancel, you'll have access until the end of your billing period. We also offer a 30-day money-back guarantee."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join 10,000+ teams already delivering exceptional customer experiences with ImaraDesk
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="px-8 py-4 rounded-xl text-lg font-semibold bg-white transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              style={{ color: COLORS.primary }}
            >
              Start Free Trial →
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 rounded-xl text-lg font-semibold text-white border-2 border-white hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-white/80 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12" style={{ backgroundColor: COLORS.primaryDark }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill={COLORS.primary} viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">ImaraDesk</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Making customer support simple, effective, and dare we say—enjoyable.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Press Kit</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-8 text-center text-sm text-gray-300">
            <p>&copy; {new Date().getFullYear()} ImaraDesk. Built with ❤️ for support teams everywhere.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

// Particles Background Component
function ParticlesBackground() {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles = []
    const particleCount = 50
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      })
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(12, 58, 63, ${particle.opacity})`
        ctx.fill()
        
        particle.x += particle.dx
        particle.y += particle.dy
        
        if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1
      })
      
      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
          if (distance < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(12, 58, 63, ${0.1 * (1 - distance / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })
      })
      
      requestAnimationFrame(animate)
    }
    
    animate()
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.4 }} />
}

// Dashboard Preview Component
function DashboardPreview() {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="h-20 rounded-lg animate-pulse" style={{ backgroundColor: `${COLORS.primary}20`, animationDelay: '0.4s' }}></div>
            <div className="h-20 rounded-lg animate-pulse" style={{ backgroundColor: `${COLORS.primary}20`, animationDelay: '0.6s' }}></div>
          </div>
          <div className="h-32 rounded-lg mt-4 animate-pulse" style={{ backgroundColor: `${COLORS.primary}10`, animationDelay: '0.8s' }}></div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full filter blur-2xl opacity-50 animate-pulse" style={{ backgroundColor: COLORS.primary }}></div>
    </div>
  )
}

// Animated Stat Component
function AnimatedStat({ value, suffix, label }) {
  return (
    <div className="text-center text-white">
      <div className="text-4xl md:text-5xl font-bold mb-2">
        {Math.round(value)}{suffix}
      </div>
      <div className="text-white/80 font-medium">{label}</div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description, delay }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all hover:shadow-xl transform hover:-translate-y-2 duration-300 animate-fadeInUp"
         style={{ animationDelay: delay }}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

// Interactive Feature Demo Component
function InteractiveFeatureDemo({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'tickets', label: 'Ticket Management', icon: '📧' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'automation', label: 'Automation', icon: '⚡' }
  ]
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
      <div className="flex space-x-4 mb-8 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 animate-fadeIn" style={{ backgroundColor: COLORS.primary }}></div>
            )}
          </button>
        ))}
      </div>
      
      <div className="min-h-64">
        {activeTab === 'tickets' && (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Powerful Ticket Management</h3>
            <p className="text-gray-600 mb-6">Organize tickets by status, priority, assignee, and custom fields. Smart filters and saved views help you focus on what matters.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Open Tickets</div>
                <div className="text-3xl font-bold" style={{ color: COLORS.primary }}>127</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Avg Response</div>
                <div className="text-3xl font-bold" style={{ color: COLORS.primary }}>2.3h</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Actionable Insights</h3>
            <p className="text-gray-600 mb-6">Track team performance, identify bottlenecks, and make data-driven decisions with beautiful, real-time dashboards.</p>
            <div className="h-48 bg-gradient-to-br rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.primary}10, ${COLORS.primaryLight}10)` }}>
              <div className="text-center">
                <div className="text-5xl mb-2">📈</div>
                <div className="text-lg font-semibold text-gray-700">Performance trends and insights</div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'automation' && (
          <div className="animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Automation</h3>
            <p className="text-gray-600 mb-6">Automate repetitive tasks with powerful workflows. Route tickets, send notifications, and update fields automatically.</p>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mr-3">⚙️</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Auto-assign to best agent</div>
                  <div className="text-sm text-gray-500">Based on workload and expertise</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mr-3">🔔</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">SLA breach alerts</div>
                  <div className="text-sm text-gray-500">Never miss a deadline again</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Step Card Component
function StepCard({ number, title, description, icon }) {
  return (
    <div className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white relative"
           style={{ backgroundColor: COLORS.primary }}>
        {number}
        <div className="absolute -top-2 -right-2 text-4xl">{icon}</div>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

// Pricing Card Component
function PricingCard({ name, price, period, description, features, highlighted }) {
  return (
    <div 
      className={`rounded-2xl p-8 transition-all transform hover:-translate-y-2 ${
        highlighted 
          ? 'ring-2 shadow-2xl scale-105 bg-white' 
          : 'border border-gray-200 bg-white hover:shadow-xl'
      }`}
      style={{ ringColor: highlighted ? COLORS.primary : undefined }}
    >
      {highlighted && (
        <div 
          className="text-xs font-bold uppercase tracking-wide text-center mb-4 py-2 px-4 rounded-full inline-block"
          style={{ backgroundColor: `${COLORS.primary}`, color: 'white' }}
        >
          ⭐ Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 mb-4 h-12">{description}</p>
      <div className="mb-6">
        <span className="text-5xl font-bold text-gray-900">{price}</span>
        {period && <span className="text-gray-600 ml-1">{period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke={COLORS.primary} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block text-center px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
          highlighted ? 'shadow-lg hover:shadow-xl' : 'hover:shadow-lg'
        }`}
        style={{
          backgroundColor: highlighted ? COLORS.primary : 'white',
          border: highlighted ? 'none' : `2px solid ${COLORS.primary}`,
          color: highlighted ? 'white' : COLORS.primary
        }}
      >
        Get Started
      </Link>
    </div>
  )
}

// Testimonial Card Component
function TestimonialCard({ quote, author, role, company, avatar, rating }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl transition-all transform hover:-translate-y-2">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-700 leading-relaxed mb-6 italic text-lg">"{quote}"</p>
      <div className="flex items-center">
        <div className="text-4xl mr-4">{avatar}</div>
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-sm text-gray-600">{role}</div>
          <div className="text-sm text-gray-500">{company}</div>
        </div>
      </div>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600 leading-relaxed animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  )
}
