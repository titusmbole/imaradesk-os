import React, { useState, useEffect, useRef } from 'react'
import { Head, Link } from '@inertiajs/react'
import SiteLayout from '../components/SiteLayout'
import { COLORS } from '../constants/theme'
import Modal from '../../app/components/Modal'
import dashboardImg from '../assets/dashboard.png'
import ticketsImg from '../assets/tickets.png'
import automationImg from '../assets/automation.png'
import slaImg from '../assets/sla.png'
import marketplaceImg from '../assets/marketplace.png'
import ticketviewImg from '../assets/ticketview.png'
import emailTemplatesImg from '../assets/emailTemplates.png'
import { 
  ArrowRight, 
  MoveRight, 
  Check, 
  Star, 
  ChevronDown, 
  BarChart3, 
  Ticket, 
  CheckCircle, 
  Zap,
  Sparkles
} from 'lucide-react'

// Modern color palette - dark backgrounds with purple theme accents
const MODERN_COLORS = {
  darkBg: '#0a1628',
  darkBgSecondary: '#0d2847',
  accent: COLORS.primaryLight,        // #825084
  accentLight: COLORS.primaryActive,  // #6e3770  
  accentDark: COLORS.primary,         // #4a154b
  gradientStart: COLORS.primaryLight, // #825084
  gradientMid: COLORS.primaryActive,  // #6e3770
  gradientEnd: COLORS.primary,        // #4a154b
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(13, 40, 71, 0.6)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
}

export default function Landing() {
  const [scrollY, setScrollY] = useState(0)
  const [modalImage, setModalImage] = useState({ isOpen: false, src: '', alt: '' })
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [activeCapability, setActiveCapability] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Head title="ImaraDesk - Enterprise Service Management Platform" />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-2deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(130, 80, 132, 0.4); }
          50% { box-shadow: 0 0 40px rgba(130, 80, 132, 0.7); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes draw-infinity {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: floatReverse 7s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-shimmer { 
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
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
        
        .gradient-text {
          background: linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.primaryActive} 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .gradient-border {
          position: relative;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(135deg, ${COLORS.primaryLight}, ${COLORS.primaryActive}, ${COLORS.primary});
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>
      
      <SiteLayout scrollY={scrollY} darkMode={true}>
        
        {/* Hero Section - Dark Gradient with Infinity Loop */}
        <section className="relative min-h-screen overflow-hidden" style={{ background: `linear-gradient(135deg, ${MODERN_COLORS.darkBg} 0%, ${MODERN_COLORS.darkBgSecondary} 50%, ${MODERN_COLORS.darkBg} 100%)` }}>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Gradient Orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float" 
                 style={{ background: `radial-gradient(circle, ${MODERN_COLORS.gradientStart}, transparent)` }} />
            <div className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-float-reverse" 
                 style={{ background: `radial-gradient(circle, ${MODERN_COLORS.gradientEnd}, transparent)` }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10 blur-3xl" 
                 style={{ background: `radial-gradient(circle, ${MODERN_COLORS.gradientMid}, transparent)` }} />
            
            {/* Sparkle Elements */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 0L6.5 4.5L11 5L6.5 5.5L6 10L5.5 5.5L1 5L5.5 4.5L6 0Z" fill="white" fillOpacity="0.6"/>
                </svg>
              </div>
            ))}
          </div>
          
          {/* Infinity Loop SVG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg 
              viewBox="0 0 800 400" 
              className="w-full max-w-5xl opacity-30"
              style={{ filter: 'blur(1px)' }}
            >
              <defs>
                <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: MODERN_COLORS.gradientStart }} />
                  <stop offset="50%" style={{ stopColor: MODERN_COLORS.gradientEnd }} />
                  <stop offset="100%" style={{ stopColor: MODERN_COLORS.gradientStart }} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path 
                d="M200,200 C200,100 300,100 400,200 C500,300 600,300 600,200 C600,100 500,100 400,200 C300,300 200,300 200,200"
                fill="none" 
                stroke="url(#infinityGradient)" 
                strokeWidth="40"
                strokeLinecap="round"
                filter="url(#glow)"
                className="animate-gradient"
              />
            </svg>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 pt-32 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                  <span className="gradient-text italic">Bring autonomous workflows</span>
                  <br />
                  <span className="text-white">to every corner of your business</span>
                </h1>
                
                
                
                <p className="text-xl text-white/70 mb-10 max-w-xl animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  Transform your enterprise with intelligent automation. Connect teams, systems, 
                  and processes on a unified platform that delivers exceptional experiences.
                </p>
                
                <div className="flex flex-col sm:flex-row items-start gap-4 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                  <Link 
                    href="/register" 
                    className="group relative px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 overflow-hidden"
                    style={{ backgroundColor: MODERN_COLORS.accent, color: MODERN_COLORS.darkBg }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Register Today
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                  <button 
                    onClick={() => setShowVideoModal(true)}
                    className="px-8 py-4 rounded-full text-lg font-semibold text-white border border-white/30 hover:bg-white/10 transition-all"
                  >
                    Watch Demo
                  </button>
                </div>
              </div>
              
              {/* Right Side - Animated Dashboard */}
              <div className="relative animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <HeroDashboard />
              </div>
            </div>
          </div>
          
          {/* Capability Cards Row */}
          <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CapabilityCard 
                label="ANY DATA"
                title="Sense"
                description="Your enterprise data contextualized in real-time. Now AI understands your business, not just the internet."
                cta="Trust Every Insight"
                delay="0s"
              />
              <CapabilityCard 
                label="ANY AI MODEL"
                title="Decide"
                description="Any AI model, grounded in your rules and your data to make aligned, auditable decisions."
                cta="Make Confident Decisions"
                delay="0.1s"
              />
              <CapabilityCard 
                label="ANY WORKFLOW"
                title="Act"
                description="Autonomous workflows execute across every department, turning AI insight into real business outcomes."
                cta="Impact the Business"
                delay="0.2s"
              />
              <CapabilityCard 
                label="ANY SYSTEM"
                title="Govern"
                description="Built-in guardrails ensure every AI action is secure, compliant, and approved before it happens."
                cta="Secure Systems and Devices"
                delay="0.3s"
              />
            </div>
          </div>
        </section>

        {/* Platform Overview Section */}
        <section className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${MODERN_COLORS.darkBg} 0%, #0f172a 100%)` }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: `${MODERN_COLORS.accent}20`, color: MODERN_COLORS.accent }}>
                  PLATFORM OVERVIEW
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  One platform to rule
                  <span className="gradient-text"> all service operations</span>
                </h2>
                <p className="text-lg text-white/70 mb-8">
                  ImaraDesk unifies IT service management, customer support, and enterprise workflows 
                  into a single intelligent platform. Automate repetitive tasks, break down silos, 
                  and deliver faster resolutions with AI-powered intelligence.
                </p>
                
                <div className="space-y-4">
                  {[
                    { icon: '⚡', text: 'Reduce resolution time by 75%' },
                    { icon: '🎯', text: 'AI-powered ticket routing and prioritization' },
                    { icon: '🔄', text: 'Seamless integrations with 500+ tools' },
                    { icon: '📊', text: 'Real-time analytics and insights' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-white/80">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-lg">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <Link 
                  href="/features" 
                  className="inline-flex items-center gap-2 mt-8 text-lg font-medium transition-all hover:gap-3"
                  style={{ color: MODERN_COLORS.accent }}
                >
                  Explore Platform
                  <MoveRight className="w-5 h-5" />
                </Link>
              </div>
              
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden glass-card p-3 animate-float">
                  <img 
                    src={dashboardImg} 
                    alt="ImaraDesk Platform" 
                    className="w-full rounded-xl cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => setModalImage({ isOpen: true, src: dashboardImg, alt: 'ImaraDesk Platform' })}
                  />
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-5 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${MODERN_COLORS.accent}20` }}>
                      <span className="text-2xl">📈</span>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Response Time</p>
                      <p className="text-2xl font-bold text-white">-65%</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 glass-card rounded-full px-4 py-2 animate-float-reverse">
                  <span className="text-sm font-medium" style={{ color: MODERN_COLORS.accent }}>AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase - Bento Grid */}
        <section className="py-24 relative" style={{ background: `linear-gradient(180deg, #0f172a 0%, ${MODERN_COLORS.darkBg} 100%)` }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: `${MODERN_COLORS.accent}20`, color: MODERN_COLORS.accent }}>
                POWERFUL FEATURES
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Everything you need to
                <span className="gradient-text"> deliver excellence</span>
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                A comprehensive suite of tools designed for modern service teams
              </p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large Card - Ticket Management */}
              <div className="lg:col-span-2 glass-card glass-card-hover rounded-3xl p-8 transition-all duration-300 cursor-pointer group"
                   onClick={() => setModalImage({ isOpen: true, src: ticketviewImg, alt: 'Ticket Management' })}>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${MODERN_COLORS.accent}20` }}>
                      <span className="text-3xl">🎫</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Smart Ticket Management</h3>
                    <p className="text-white/60 mb-6">
                      Intelligent ticket routing, automated prioritization, and seamless collaboration 
                      tools that help your team resolve issues faster than ever.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {['Multi-channel', 'AI Routing', 'SLA Tracking', 'Automation'].map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <div className="rounded-xl overflow-hidden transform group-hover:scale-[1.02] transition-transform">
                      <img src={ticketviewImg} alt="Ticket Management" className="w-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Card */}
              <div className="glass-card glass-card-hover rounded-3xl p-8 transition-all duration-300 cursor-pointer group"
                   onClick={() => setModalImage({ isOpen: true, src: dashboardImg, alt: 'Analytics Dashboard' })}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(14, 165, 233, 0.2)' }}>
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
                <p className="text-white/60 mb-4">
                  Actionable insights and beautiful dashboards that help you make data-driven decisions.
                </p>
                <div className="rounded-xl overflow-hidden transform group-hover:scale-[1.02] transition-transform">
                  <img src={dashboardImg} alt="Analytics" className="w-full opacity-80" />
                </div>
              </div>

              {/* Automation Card */}
              <div className="glass-card glass-card-hover rounded-3xl p-8 transition-all duration-300 cursor-pointer group"
                   onClick={() => setModalImage({ isOpen: true, src: automationImg, alt: 'Automation' })}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Workflow Automation</h3>
                <p className="text-white/60 mb-4">
                  Automate repetitive tasks with powerful no-code workflow builder. Route, assign, and escalate automatically.
                </p>
                <div className="flex items-center gap-2 mt-auto" style={{ color: MODERN_COLORS.accent }}>
                  <span className="text-sm font-medium">Learn more</span>
                  <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* SLA Card */}
              <div className="glass-card glass-card-hover rounded-3xl p-8 transition-all duration-300 cursor-pointer group"
                   onClick={() => setModalImage({ isOpen: true, src: slaImg, alt: 'SLA Management' })}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }}>
                  <span className="text-3xl">⏱️</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">SLA Management</h3>
                <p className="text-white/60 mb-4">
                  Never miss a deadline with intelligent SLA tracking, breach warnings, and automatic escalations.
                </p>
                <div className="flex items-center gap-2 mt-auto" style={{ color: MODERN_COLORS.accent }}>
                  <span className="text-sm font-medium">Learn more</span>
                  <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Large Card - Integrations */}
              <div className="lg:col-span-2 glass-card glass-card-hover rounded-3xl p-8 transition-all duration-300 cursor-pointer group"
                   onClick={() => setModalImage({ isOpen: true, src: marketplaceImg, alt: 'Integrations' })}>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 relative order-2 lg:order-1">
                    <div className="rounded-xl overflow-hidden transform group-hover:scale-[1.02] transition-transform">
                      <img src={marketplaceImg} alt="Integrations" className="w-full" />
                    </div>
                  </div>
                  <div className="flex-1 order-1 lg:order-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)' }}>
                      <span className="text-3xl">🔗</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">500+ Integrations</h3>
                    <p className="text-white/60 mb-6">
                      Connect to your entire tech stack with pre-built integrations for the tools 
                      your organization already uses and loves.
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {['Slack', 'Jira', 'Teams', 'Salesforce', 'AWS', 'Azure', 'Okta', 'GitHub'].map((tool, idx) => (
                        <div key={idx} className="flex items-center justify-center p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <span className="text-xs text-white/70">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Insights Section */}
        <section className="py-24 relative" style={{ background: `linear-gradient(180deg, ${MODERN_COLORS.darkBg} 0%, #0d2847 100%)` }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  <span className="gradient-text italic">Latest insights</span>
                </h2>
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  and innovations
                </h2>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 rounded-full font-medium transition-all" style={{ backgroundColor: MODERN_COLORS.accent, color: MODERN_COLORS.darkBg }}>
                  View Blogs
                </button>
                <button className="px-6 py-3 rounded-full font-medium text-white border border-white/30 hover:bg-white/10 transition-all">
                  View Analyst Reports
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Featured Article */}
              <div className="glass-card glass-card-hover rounded-3xl overflow-hidden transition-all duration-300 group cursor-pointer">
                <div className="relative h-80 overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center rotate-12 transform group-hover:rotate-0 transition-transform" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <span className="text-5xl">✨</span>
                      </div>
                      <p className="text-white/80 text-lg">ImaraDesk's</p>
                      <p className="text-white text-2xl font-bold">Blueprint for Agentic Business</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium tracking-wider" style={{ color: MODERN_COLORS.accent }}>BLUEPRINT</span>
                  <h3 className="text-xl font-bold text-white mt-2 mb-3">ImaraDesk's Blueprint for Agentic Business</h3>
                  <p className="text-white/60 text-sm">
                    AI that's anchored inside workflows with operational context and governance is better positioned for enterprise success.
                  </p>
                </div>
              </div>

              {/* Side Articles */}
              <div className="space-y-6">
                <div className="glass-card glass-card-hover rounded-3xl overflow-hidden transition-all duration-300 flex group cursor-pointer">
                  <div className="w-48 h-48 flex-shrink-0 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.primaryActive} 100%)` }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl">🔒</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <span className="text-xs font-medium tracking-wider" style={{ color: MODERN_COLORS.accent }}>REPORT</span>
                    <h3 className="text-lg font-bold text-white mt-2 mb-2">2026 Risk and Security: How AI Is Reshaping the Enterprise Landscape</h3>
                    <div className="flex items-center gap-2 mt-auto" style={{ color: MODERN_COLORS.accent }}>
                      <span className="text-sm font-medium">Read Report</span>
                      <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>

                <div className="glass-card glass-card-hover rounded-3xl overflow-hidden transition-all duration-300 flex group cursor-pointer">
                  <div className="w-48 h-48 flex-shrink-0 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%)` }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl">📊</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <span className="text-xs font-medium tracking-wider" style={{ color: MODERN_COLORS.accent }}>REPORT</span>
                    <h3 className="text-lg font-bold text-white mt-2 mb-2">2025 Gartner® Magic Quadrant™ for the CRM Customer Engagement Center</h3>
                    <div className="flex items-center gap-2 mt-auto" style={{ color: MODERN_COLORS.accent }}>
                      <span className="text-sm font-medium">Read Report</span>
                      <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-24 relative overflow-hidden" style={{ background: `linear-gradient(180deg, #0d2847 0%, ${MODERN_COLORS.darkBg} 100%)` }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: `${MODERN_COLORS.accent}20`, color: MODERN_COLORS.accent }}>
                TRUSTED GLOBALLY
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                One platform,
                <span className="gradient-text"> every industry</span>
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                From healthcare to finance, retail to technology—organizations across every sector trust ImaraDesk to deliver exceptional service experiences.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: 'Healthcare', icon: '🏥' },
                { name: 'Finance', icon: '💳' },
                { name: 'Technology', icon: '💻' },
                { name: 'Retail', icon: '🛒' },
                { name: 'Manufacturing', icon: '🏭' },
                { name: 'Education', icon: '🎓' },
                { name: 'Government', icon: '🏛️' },
                { name: 'Telecom', icon: '📡' },
                { name: 'Insurance', icon: '🛡️' },
                { name: 'Energy', icon: '⚡' },
                { name: 'Logistics', icon: '🚚' },
              ].map((industry, idx) => (
                <button
                  key={industry.name}
                  className="group glass-card glass-card-hover rounded-full px-6 py-4 flex items-center gap-3 transition-all duration-300"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <span className="text-2xl">{industry.icon}</span>
                  <span className="text-white font-medium">{industry.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative" style={{ background: `linear-gradient(135deg, ${MODERN_COLORS.accent}10, ${MODERN_COLORS.darkBg})` }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatCard value="10K+" label="Enterprise Customers" />
              <StatCard value="500M+" label="Tickets Resolved" />
              <StatCard value="99.99%" label="Platform Uptime" />
              <StatCard value="4.9/5" label="Customer Rating" />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 relative" style={{ background: MODERN_COLORS.darkBg }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Trusted by
                <span className="gradient-text"> industry leaders</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard 
                quote="ImaraDesk transformed our IT operations. Resolution time dropped 75% and our team finally has time for strategic initiatives."
                author="Sarah Chen"
                role="CIO, TechCorp Global"
                rating={5}
              />
              <TestimonialCard 
                quote="The automation capabilities are game-changing. We went from 50 tickets per agent to 200 per day with better quality."
                author="Marcus Johnson"
                role="VP Operations, FinanceHub"
                rating={5}
              />
              <TestimonialCard 
                quote="Enterprise-grade security with consumer-grade simplicity. Onboarding took days, not months. Highly recommended."
                author="Elena Rodriguez"
                role="IT Director, HealthFirst"
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 relative" style={{ background: `linear-gradient(180deg, ${MODERN_COLORS.darkBg} 0%, #0d2847 100%)` }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: `${MODERN_COLORS.accent}20`, color: MODERN_COLORS.accent }}>
                PRICING
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Simple, transparent
                <span className="gradient-text"> pricing</span>
              </h2>
              <p className="text-xl text-white/60">
                Choose the plan that fits your team. Scale as you grow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <PricingCard 
                name="Starter"
                price="$19"
                period="/agent/month"
                description="Perfect for small teams"
                features={['Unlimited tickets', 'Email integration', 'Basic reporting', 'Mobile apps', '99.9% uptime']}
                highlighted={false}
              />
              <PricingCard 
                name="Professional"
                price="$49"
                period="/agent/month"
                description="For growing organizations"
                features={['Everything in Starter', 'SLA management', 'Advanced analytics', 'Knowledge base', 'API access', 'Live chat', 'Priority support']}
                highlighted={true}
              />
              <PricingCard 
                name="Enterprise"
                price="Custom"
                period=""
                description="For large organizations"
                features={['Everything in Pro', 'Dedicated manager', 'Custom development', '99.99% uptime SLA', 'SSO & security', '24/7 support']}
                highlighted={false}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 relative" style={{ background: `linear-gradient(180deg, #0d2847 0%, ${MODERN_COLORS.darkBg} 100%)` }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Frequently asked
                <span className="gradient-text"> questions</span>
              </h2>
            </div>

            <div className="space-y-4">
              <FAQItem 
                question="How long does it take to get started?"
                answer="You can be up and running in less than 5 minutes. Sign up, customize your workspace, invite your team, and start managing tickets immediately."
              />
              <FAQItem 
                question="Can I migrate from my current helpdesk?"
                answer="Absolutely! We provide free migration assistance for all plans. Our team will help you import your existing tickets, customer data, and knowledge base articles."
              />
              <FAQItem 
                question="What's included in the free trial?"
                answer="The 14-day free trial includes full access to all Professional plan features. No credit card required."
              />
              <FAQItem 
                question="Is my data secure?"
                answer="Yes! We use bank-level encryption (AES-256), regular security audits, and SOC 2 Type II compliance. Your data is backed up daily."
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${MODERN_COLORS.darkBg} 0%, #0d2847 50%, ${MODERN_COLORS.darkBg} 100%)` }}>
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
                 style={{ background: `radial-gradient(circle, ${MODERN_COLORS.accent}, transparent)` }} />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to transform your
              <span className="gradient-text"> service operations?</span>
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Join 10,000+ organizations already delivering exceptional experiences with ImaraDesk
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="group px-10 py-5 rounded-full text-xl font-semibold transition-all transform hover:scale-105 animate-pulse-glow"
                style={{ backgroundColor: MODERN_COLORS.accent, color: MODERN_COLORS.darkBg }}
              >
                <span className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link 
                href="/contact" 
                className="px-10 py-5 rounded-full text-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all"
              >
                Contact Sales
              </Link>
            </div>
            <p className="text-white/50 mt-8">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </SiteLayout>

      {/* Modals */}
      <Modal
        isOpen={modalImage.isOpen}
        onClose={() => setModalImage({ isOpen: false, src: '', alt: '' })}
        title={modalImage.alt}
        maxWidth="max-w-6xl"
      >
        <div className="p-2" style={{ backgroundColor: MODERN_COLORS.darkBg }}>
          <img 
            src={modalImage.src} 
            alt={modalImage.alt} 
            className="max-w-full h-auto rounded-lg"
            style={{ maxHeight: '80vh' }}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title="ImaraDesk Platform Demo"
        maxWidth="max-w-6xl"
      >
        <div style={{ backgroundColor: MODERN_COLORS.darkBg }}>
          <div className="relative" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={showVideoModal ? "https://www.youtube.com/embed/9xwazD5SyVg?autoplay=1&rel=0&modestbranding=1" : ""}
              title="ImaraDesk Platform Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded"
            />
          </div>
        </div>
      </Modal>
    </>
  )
}

// Component: Capability Card
function CapabilityCard({ label, title, description, cta, delay }) {
  return (
    <div 
      className="glass-card glass-card-hover rounded-2xl p-6 transition-all duration-300 animate-fadeInUp group cursor-pointer"
      style={{ animationDelay: delay }}
    >
      <span className="text-xs font-medium tracking-wider text-white/50 mb-3 block">{label}</span>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex items-center gap-2 transition-all group-hover:gap-3" style={{ color: MODERN_COLORS.accent }}>
        <span className="text-sm font-medium">{cta}</span>
        <MoveRight className="w-4 h-4" />
      </div>
    </div>
  )
}

// Component: Stat Card
function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: MODERN_COLORS.accent }}>{value}</div>
      <div className="text-white/70">{label}</div>
    </div>
  )
}

// Component: Testimonial Card
function TestimonialCard({ quote, author, role, rating }) {
  return (
    <div className="glass-card glass-card-hover rounded-3xl p-8 transition-all duration-300">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5" style={{ color: MODERN_COLORS.accent }} fill="currentColor" />
        ))}
      </div>
      <p className="text-white/80 text-lg leading-relaxed mb-6 italic">"{quote}"</p>
      <div>
        <p className="text-white font-semibold">{author}</p>
        <p className="text-white/50 text-sm">{role}</p>
      </div>
    </div>
  )
}

// Component: Pricing Card
function PricingCard({ name, price, period, description, features, highlighted }) {
  return (
    <div 
      className={`rounded-3xl p-8 transition-all duration-300 transform hover:-translate-y-2 ${
        highlighted 
          ? 'scale-105 relative' 
          : 'glass-card glass-card-hover'
      }`}
      style={highlighted ? { 
        background: `linear-gradient(135deg, ${MODERN_COLORS.darkBgSecondary}, ${MODERN_COLORS.darkBg})`,
        border: `2px solid ${MODERN_COLORS.accent}`
      } : {}}
    >
      {highlighted && (
        <div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: MODERN_COLORS.accent, color: MODERN_COLORS.darkBg }}
        >
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
      <p className="text-white/60 mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-5xl font-bold text-white">{price}</span>
        {period && <span className="text-white/50">{period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-white/80">
            <Check className="w-5 h-5 flex-shrink-0" style={{ color: MODERN_COLORS.accent }} />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`block text-center px-6 py-4 rounded-full font-semibold transition-all ${
          highlighted ? 'hover:opacity-90' : 'hover:bg-white/10'
        }`}
        style={highlighted 
          ? { backgroundColor: MODERN_COLORS.accent, color: MODERN_COLORS.darkBg }
          : { border: `1px solid ${MODERN_COLORS.accent}`, color: MODERN_COLORS.accent }
        }
      >
        Get Started
      </Link>
    </div>
  )
}

// Component: FAQ Item
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="text-lg font-semibold text-white">{question}</span>
        <ChevronDown 
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: MODERN_COLORS.accent }}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-5 text-white/70 leading-relaxed animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  )
}

// Component: Hero Dashboard
function HeroDashboard() {
  return (
    <div className="relative">
      {/* Main Dashboard Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 transform hover:scale-[1.02] transition-all duration-500" style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.3)' }}>
        {/* Dashboard Header */}
        <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: MODERN_COLORS.accentDark }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold text-lg">Dashboard Overview</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/40"></div>
              <div className="w-3 h-3 rounded-full bg-white/40"></div>
              <div className="w-3 h-3 rounded-full bg-white/40"></div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">24</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Open Tickets</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">186</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Resolved</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">2.4M</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Responses</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 w-10">High</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full animate-pulse" style={{ width: '85%', backgroundColor: MODERN_COLORS.accentDark }}></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 w-10">Med</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full animate-pulse" style={{ width: '65%', backgroundColor: MODERN_COLORS.accent, animationDelay: '0.2s' }}></div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 w-10">Low</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full animate-pulse" style={{ width: '45%', backgroundColor: MODERN_COLORS.accentLight, animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${MODERN_COLORS.accent}20` }}>
            <Ticket className="w-5 h-5" style={{ color: MODERN_COLORS.accent }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">Ticket #1247 resolved</div>
            <div className="text-xs text-gray-500">Support Team · Just now</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>

      {/* Floating Badge - Uptime */}
      <div className="absolute -top-2 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 animate-float" style={{ animationDelay: '0s' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${MODERN_COLORS.accent}15` }}>
          <CheckCircle className="w-5 h-5" style={{ color: MODERN_COLORS.accent }} />
        </div>
        <span className="text-sm font-semibold text-gray-900">99.9% Uptime</span>
      </div>

      {/* Floating Badge - Instant Setup */}
      <div className="absolute top-1/3 -right-8 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${MODERN_COLORS.accent}15` }}>
          <Zap className="w-5 h-5" style={{ color: MODERN_COLORS.accent }} />
        </div>
        <span className="text-sm font-semibold text-gray-900">Instant Setup</span>
      </div>

      {/* Floating Badge - Live Analytics */}
      <div className="absolute -bottom-4 right-12 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${MODERN_COLORS.accent}15` }}>
          <BarChart3 className="w-5 h-5" style={{ color: MODERN_COLORS.accent }} />
        </div>
        <span className="text-sm font-semibold text-gray-900">Live Analytics</span>
      </div>

      {/* Background Glow Effect */}
      <div className="absolute -inset-8 -z-10 opacity-30 blur-3xl rounded-full" style={{ background: `radial-gradient(circle, ${MODERN_COLORS.accent}, transparent)` }}></div>
    </div>
  )
}
