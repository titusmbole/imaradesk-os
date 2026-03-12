import React, { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
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

const contactMethods = [
  {
    icon: '📧',
    title: 'Email Us',
    value: 'support@imaradesk.com',
    description: 'We respond within 24 hours',
    action: 'mailto:support@imaradesk.com',
  },
  {
    icon: '📞',
    title: 'Call Us',
    value: '+254 (788) 994-249',
    description: 'Mon-Fri 9am-5pm EAT',
    action: 'tel:+254788994249',
  },
  {
    icon: '📍',
    title: 'Visit Us',
    value: 'Business Ave, Westlands 90',
    description: 'Nairobi, Kenya 00100',
    action: '#',
  },
  {
    icon: '💬',
    title: 'Live Chat',
    value: 'Start a conversation',
    description: 'Available 24/7',
    action: '#',
  },
]

const faqs = [
  {
    question: 'How quickly can I get started?',
    answer: 'You can sign up and start using ImaraDesk in minutes. Our onboarding process is designed to get you up and running quickly.',
  },
  {
    question: 'Do you offer custom integrations?',
    answer: 'Yes! We offer custom integration options for enterprise customers. Contact our sales team to discuss your specific needs.',
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We offer email support for all plans, with priority support and dedicated account managers available for enterprise customers.',
  },
  {
    question: 'Can I schedule a demo?',
    answer: 'Absolutely! Fill out the contact form or email us at sales@coredesk.pro to schedule a personalized demo.',
  },
]

export default function Contact() {
  const [scrollY, setScrollY] = useState(0)
  const [formData, setFormData] = useState({ name: '', email: '', company: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [activeMethod, setActiveMethod] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setFormData({ name: '', email: '', company: '', subject: '', message: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <>
      <Head title="Contact Us - ImaraDesk" />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
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
        @keyframes ripple {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; }
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
        
        .input-focus:focus {
          border-color: ${COLORS.primaryLight};
          box-shadow: 0 0 0 3px ${COLORS.primaryLight}30;
        }
        
        .contact-card-active {
          background: linear-gradient(135deg, rgba(74, 21, 75, 0.3) 0%, rgba(13, 40, 71, 0.8) 100%);
          border-color: ${COLORS.primaryLight};
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
            {/* Connection lines animation */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: COLORS.primaryLight, stopOpacity: 0.5 }} />
                  <stop offset="100%" style={{ stopColor: COLORS.primaryActive, stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="url(#lineGrad)" strokeWidth="0.2" />
              <path d="M0,30 Q35,50 70,30 T100,30" fill="none" stroke="url(#lineGrad)" strokeWidth="0.2" />
              <path d="M0,70 Q35,50 70,70 T100,70" fill="none" stroke="url(#lineGrad)" strokeWidth="0.2" />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              We'd love to
              <span className="gradient-text"> hear from you</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-12 animate-fadeInUp" style={{ color: DARK_THEME.textSecondary, animationDelay: '0.2s' }}>
              Have questions about ImaraDesk? Our team is here to help. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, idx) => (
                <a
                  key={idx}
                  href={method.action}
                  className={`glass-card rounded-2xl p-6 transition-all duration-300 cursor-pointer group animate-fadeInUp ${activeMethod === idx ? 'contact-card-active' : 'glass-card-hover'}`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onMouseEnter={() => setActiveMethod(idx)}
                  onMouseLeave={() => setActiveMethod(null)}
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-all duration-300 group-hover:scale-110" 
                         style={{ backgroundColor: `${COLORS.primary}30` }}>
                      {method.icon}
                    </div>
                    {activeMethod === idx && (
                      <div className="absolute top-0 left-0 w-16 h-16 rounded-2xl animate-ping" 
                           style={{ backgroundColor: `${COLORS.primaryLight}20` }} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{method.title}</h3>
                  <p className="font-medium mb-1" style={{ color: COLORS.primaryLight }}>{method.value}</p>
                  <p className="text-sm" style={{ color: DARK_THEME.textMuted }}>{method.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-20" style={{ background: `linear-gradient(180deg, ${DARK_THEME.darkBg} 0%, ${DARK_THEME.darkBgSecondary} 100%)` }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Form */}
              <div className="glass-card rounded-3xl p-8 lg:p-10 animate-fadeInUp">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Send us a Message</h2>
                  <p style={{ color: DARK_THEME.textSecondary }}>Fill out the form and we'll get back to you within 24 hours.</p>
                </div>

                {submitted && (
                  <div className="mb-6 p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: `${COLORS.primaryLight}20`, border: `1px solid ${COLORS.primaryLight}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.primaryLight }}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Message sent successfully!</p>
                      <p className="text-sm" style={{ color: DARK_THEME.textSecondary }}>We'll get back to you soon.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none input-focus transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none input-focus transition-all"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none input-focus transition-all"
                        placeholder="Your company"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Subject *</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none input-focus transition-all"
                      >
                        <option value="" className="bg-gray-900">Select a topic</option>
                        <option value="sales" className="bg-gray-900">Sales Inquiry</option>
                        <option value="support" className="bg-gray-900">Technical Support</option>
                        <option value="demo" className="bg-gray-900">Request a Demo</option>
                        <option value="partnership" className="bg-gray-900">Partnership</option>
                        <option value="other" className="bg-gray-900">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none input-focus transition-all resize-none"
                      placeholder="Tell us about your needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-white font-semibold transition-all transform hover:scale-[1.02] animate-pulse-glow"
                    style={{ backgroundColor: COLORS.primaryLight }}
                  >
                    Send Message →
                  </button>
                </form>
              </div>

              {/* Info Side */}
              <div className="space-y-8 animate-slideInRight">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Why Choose ImaraDesk?</h2>
                  <p className="text-lg" style={{ color: DARK_THEME.textSecondary }}>
                    We're not just another helpdesk. We're your partner in delivering exceptional customer experiences.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { number: '10K+', label: 'Happy Customers' },
                    { number: '1M+', label: 'Tickets Resolved' },
                    { number: '99.9%', label: 'Uptime SLA' },
                    { number: '24/7', label: 'Support Available' },
                  ].map((stat, idx) => (
                    <div key={idx} className="glass-card rounded-xl p-5 text-center">
                      <div className="text-3xl font-bold mb-1 gradient-text">{stat.number}</div>
                      <div className="text-sm" style={{ color: DARK_THEME.textMuted }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="glass-card rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    {['Twitter', 'LinkedIn', 'GitHub', 'YouTube'].map((social, idx) => (
                      <a key={idx} href="#" className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-110" 
                         style={{ backgroundColor: `${COLORS.primary}30` }}>
                        <span className="text-lg">{['🐦', '💼', '🐙', '📺'][idx]}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="glass-card rounded-xl overflow-hidden h-48 relative">
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${COLORS.primary}20 0%, ${COLORS.primaryLight}10 100%)` }}>
                    <div className="text-center">
                      <span className="text-5xl mb-2 block">🗺️</span>
                      <p className="text-white font-medium">Nairobi, Kenya</p>
                      <p className="text-sm" style={{ color: DARK_THEME.textMuted }}>Business Ave, Westlands</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20" style={{ background: DARK_THEME.darkBg }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Frequently <span className="gradient-text">Asked Questions</span>
              </h2>
              <p style={{ color: DARK_THEME.textSecondary }}>Quick answers to common questions</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="glass-card rounded-xl overflow-hidden animate-fadeInUp" style={{ animationDelay: `${idx * 100}ms` }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <span className="text-lg font-semibold text-white">{faq.question}</span>
                    <svg
                      className={`w-6 h-6 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}
                      style={{ color: COLORS.primaryLight }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 animate-fadeInUp" style={{ color: DARK_THEME.textSecondary }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${DARK_THEME.darkBgSecondary} 0%, ${DARK_THEME.darkBg} 100%)` }}>
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at center, ${COLORS.primary}40 0%, transparent 70%)` }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-10" style={{ color: DARK_THEME.textSecondary }}>
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/register" className="px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 animate-pulse-glow" style={{ backgroundColor: COLORS.primaryLight, color: 'white' }}>
                Start Free Trial →
              </a>
              <a href="/pricing" className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:bg-white/10" style={{ border: `2px solid ${COLORS.primaryLight}`, color: COLORS.primaryLight }}>
                View Pricing
              </a>
            </div>
          </div>
        </section>
      </SiteLayout>
    </>
  )
}
