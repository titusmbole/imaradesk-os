import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import SiteLayout from '../components/SiteLayout'
import { COLORS } from '../constants/theme'

// Dark backgrounds with purple theme accents
const DARK_THEME = {
  darkBg: '#0a1628',
  darkBgSecondary: '#0d2847',
  cardBg: 'rgba(13, 40, 71, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
}

export default function Pricing() {
  const [scrollY, setScrollY] = useState(0)
  const [billingPeriod, setBillingPeriod] = useState('monthly')

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head title="Pricing - ImaraDesk" />
      
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(130, 80, 132, 0.4); }
          50% { box-shadow: 0 0 40px rgba(130, 80, 132, 0.7); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
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
        
        .card-popular {
          background: linear-gradient(135deg, rgba(13, 40, 71, 0.8) 0%, rgba(74, 21, 75, 0.3) 100%);
          border: 2px solid ${COLORS.primaryLight};
        }
      `}</style>

      <SiteLayout scrollY={scrollY} darkMode={true}>
        {/* Hero Section */}
        <section className="relative py-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${DARK_THEME.darkBg} 0%, ${DARK_THEME.darkBgSecondary} 50%, ${DARK_THEME.darkBg} 100%)` }}>
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl" 
                 style={{ background: `radial-gradient(circle, ${COLORS.primaryLight}, transparent)` }} />
            <div className="absolute bottom-20 left-20 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl" 
                 style={{ background: `radial-gradient(circle, ${COLORS.primaryActive}, transparent)` }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Simple, transparent
              <span className="gradient-text"> pricing</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-12" style={{ color: DARK_THEME.textSecondary }}>
              Choose the perfect plan for your team. Scale as you grow with flexible pricing that makes sense.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-2 p-2 rounded-2xl glass-card">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${billingPeriod === 'monthly' ? 'text-white' : ''}`}
                style={billingPeriod === 'monthly' ? { backgroundColor: COLORS.primary } : { color: DARK_THEME.textSecondary }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${billingPeriod === 'annual' ? 'text-white' : ''}`}
                style={billingPeriod === 'annual' ? { backgroundColor: COLORS.primary } : { color: DARK_THEME.textSecondary }}
              >
                Annual
                <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <PricingCard
                name="Starter"
                price={billingPeriod === 'monthly' ? 19 : 15}
                originalPrice={19}
                period={billingPeriod === 'monthly' ? '/agent/month' : '/agent/month billed annually'}
                description="Perfect for small teams getting started"
                features={['Up to 10 agents', 'Unlimited tickets', 'Email integration', 'Basic reporting', 'Mobile apps', 'Community support', '99.9% uptime SLA', '5 GB storage']}
                highlighted={false}
                billingPeriod={billingPeriod}
              />
              <PricingCard
                name="Professional"
                price={billingPeriod === 'monthly' ? 49 : 39}
                originalPrice={49}
                period={billingPeriod === 'monthly' ? '/agent/month' : '/agent/month billed annually'}
                description="For growing teams that need more power"
                features={['Everything in Starter', 'Unlimited agents', 'SLA management', 'Advanced analytics', 'Knowledge base', 'Priority support', 'API access', 'Custom integrations', 'Live chat widget', '50 GB storage']}
                highlighted={true}
                billingPeriod={billingPeriod}
              />
              <PricingCard
                name="Enterprise"
                price="Custom"
                period=""
                description="For large organizations with custom needs"
                features={['Everything in Professional', 'Unlimited everything', 'Dedicated success manager', 'Custom development', '99.99% uptime SLA', 'Advanced security & SSO', 'Unlimited integrations', 'Training & onboarding', '24/7 phone support', 'Unlimited storage']}
                highlighted={false}
                billingPeriod={billingPeriod}
              />
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-24" style={{ background: `linear-gradient(180deg, ${DARK_THEME.darkBg} 0%, ${DARK_THEME.darkBgSecondary} 100%)` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Compare <span className="gradient-text">Plans</span>
              </h2>
              <p className="text-xl" style={{ color: DARK_THEME.textSecondary }}>See what's included in each plan</p>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: `${COLORS.primary}30` }}>
                    <tr>
                      <th className="text-left py-5 px-6 font-semibold text-white">Features</th>
                      <th className="text-center py-5 px-6 font-semibold text-white">Starter</th>
                      <th className="text-center py-5 px-6 font-semibold text-white relative">
                        Professional
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>Popular</span>
                      </th>
                      <th className="text-center py-5 px-6 font-semibold text-white">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ComparisonRow feature="Agents" starter="Up to 10" pro="Unlimited" enterprise="Unlimited" />
                    <ComparisonRow feature="Tickets" starter="Unlimited" pro="Unlimited" enterprise="Unlimited" />
                    <ComparisonRow feature="Email Integration" starter={true} pro={true} enterprise={true} />
                    <ComparisonRow feature="Mobile Apps" starter={true} pro={true} enterprise={true} />
                    <ComparisonRow feature="SLA Management" starter={false} pro={true} enterprise={true} />
                    <ComparisonRow feature="Knowledge Base" starter={false} pro={true} enterprise={true} />
                    <ComparisonRow feature="Advanced Analytics" starter={false} pro={true} enterprise={true} />
                    <ComparisonRow feature="API Access" starter={false} pro={true} enterprise={true} />
                    <ComparisonRow feature="Dedicated Manager" starter={false} pro={false} enterprise={true} />
                    <ComparisonRow feature="SSO & Advanced Security" starter={false} pro={false} enterprise={true} />
                    <ComparisonRow feature="24/7 Phone Support" starter={false} pro={false} enterprise={true} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Pricing <span className="gradient-text">FAQs</span>
              </h2>
            </div>

            <div className="space-y-4">
              <FAQItem question="Can I change plans at any time?" answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits on your next bill." />
              <FAQItem question="What happens if I go over my agent limit?" answer="On the Starter plan, you'll be prompted to upgrade to Professional. We'll never cut off your service unexpectedly." />
              <FAQItem question="Do you offer discounts for nonprofits or education?" answer="Yes! We offer 25% discounts for registered nonprofits and educational institutions. Contact our sales team for details." />
              <FAQItem question="What payment methods do you accept?" answer="We accept all major credit cards (Visa, MasterCard, Amex) and can set up ACH transfers for annual Enterprise plans." />
              <FAQItem question="Is there a setup fee?" answer="No setup fees, ever. The price you see is the price you pay." />
              <FAQItem question="What's your refund policy?" answer="We offer a 30-day money-back guarantee on all plans. If you're not satisfied, we'll refund your payment, no questions asked." />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${DARK_THEME.darkBgSecondary} 0%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center, ${COLORS.primary}40 0%, transparent 70%)` }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-10" style={{ color: DARK_THEME.textSecondary }}>Start your 14-day free trial today. No credit card required.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 animate-pulse-glow" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>
                Start Free Trial →
              </Link>
              <Link href="/contact" className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:bg-white/10" style={{ border: `2px solid ${COLORS.primaryLight}`, color: COLORS.primaryLight }}>
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}

function PricingCard({ name, price, originalPrice, period, description, features, highlighted, billingPeriod }) {
  const showDiscount = billingPeriod === 'annual' && typeof price === 'number'
  
  return (
    <div className={`rounded-2xl p-8 transition-all duration-300 ${highlighted ? 'card-popular scale-105' : 'glass-card glass-card-hover'}`}>
      {highlighted && (
        <div className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>
          ⭐ Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <p className="mb-4 h-12" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{description}</p>
      <div className="mb-6">
        {showDiscount && <div className="text-sm line-through mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>${originalPrice}</div>}
        <span className="text-5xl font-bold text-white">{typeof price === 'number' ? `$${price}` : price}</span>
        {period && <span className="ml-1 text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke={COLORS.primaryLight} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/register" className={`block text-center px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${highlighted ? 'animate-pulse-glow' : ''}`}
        style={{ backgroundColor: highlighted ? COLORS.primaryLight : 'transparent', border: highlighted ? 'none' : `2px solid ${COLORS.primaryLight}`, color: highlighted ? 'white' : COLORS.primaryLight }}>
        {name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
      </Link>
    </div>
  )
}

function ComparisonRow({ feature, starter, pro, enterprise }) {
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
      <td className="py-4 px-6 text-center">{renderCell(starter)}</td>
      <td className="py-4 px-6 text-center" style={{ backgroundColor: `${COLORS.primary}10` }}>{renderCell(pro)}</td>
      <td className="py-4 px-6 text-center">{renderCell(enterprise)}</td>
    </tr>
  )
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors">
        <span className="text-lg font-semibold text-white">{question}</span>
        <svg className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: COLORS.primaryLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-6 pb-5 animate-fadeInUp" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{answer}</div>}
    </div>
  )
}
