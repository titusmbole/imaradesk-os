import React, { useState, useEffect } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { COLORS } from '../constants/theme'
import faviconLogo from '../assets/favicon/favicon.ico'

export default function SiteLayout({ children, scrollY = 0, darkMode = false }) {
  const { url } = usePage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Dark mode colors
  const darkModeColors = {
    navBg: scrollY > 50 ? 'rgba(10, 22, 40, 0.95)' : 'transparent',
    accent: '#22c55e'
  }

  // // Tawk.to Live Chat
  // useEffect(() => {
  //   if (window.Tawk_API) return // Already loaded
    
  //   window.Tawk_API = window.Tawk_API || {}
  //   window.Tawk_LoadStart = new Date()
    
  //   const script = document.createElement('script')
  //   script.async = true
  //   script.src = 'https://embed.tawk.to/6997f933f5855a1c32c07e42/1jhsqasif'
  //   script.charset = 'UTF-8'
  //   script.setAttribute('crossorigin', '*')
  //   document.head.appendChild(script)
    
  //   return () => {
  //     // Cleanup on unmount if needed
  //     if (window.Tawk_API && window.Tawk_API.hideWidget) {
  //       window.Tawk_API.hideWidget()
  //     }
  //   }
  // }, [])

  // CoreChat Widget
useEffect(() => {
  if (window.Safari_API) return; // Already loaded

  window.Safari_API = window.Safari_API || {};
  window.Safari_LoadStart = new Date();

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://embed.powervestpdm.site/widget/sdk.js";
  script.charset = "UTF-8";
  script.setAttribute("crossorigin", "*");
  script.setAttribute("data-widget-id", "1");
  script.setAttribute(
    "data-business-token",
    "b1297901-7260-40ce-9193-e110a2867017"
  );

  document.head.appendChild(script);

  return () => {
    // Optional cleanup if your SDK exposes destroy/remove
    if (window.Safari_API && window.Safari_API.hideWidget) {
      window.Safari_API.hideWidget();
    }
  };
}, []);
  
  const isActive = (path) => {
    if (path === '/') return url === '/'
    return url.startsWith(path)
  }

  const NavLink = ({ href, icon, children, mobile = false }) => {
    const active = isActive(href)
    return (
      <Link 
        href={href}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg ${
          active 
            ? 'bg-white/20 text-white' 
            : mobile 
              ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              : 'text-white/90 hover:text-white hover:bg-white/10'
        }`}
      >
        {icon}
        {children}
      </Link>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a1628]' : 'bg-white'}`}>
      {/* Navigation */}
      <nav className="backdrop-blur-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
        backgroundColor: darkMode ? darkModeColors.navBg : COLORS.primary,
        boxShadow: scrollY > 10 ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
      }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform hover:scale-110">
                  <img src={faviconLogo} alt="ImaraDesk Logo" className="w-9 h-9 rounded-lg" />
                </div>
                <span className="text-xl font-semibold text-white">ImaraDesk</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink 
                href="/features" 
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              >
                Features
              </NavLink>
              <NavLink 
                href="/pricing" 
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                Pricing
              </NavLink>
              <NavLink 
                href="/blog" 
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                }
              >
                Blog
              </NavLink>
              <NavLink 
                href="/docs" 
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              >
                Docs
              </NavLink>
              <NavLink 
                href="/contact" 
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              >
                Contact
              </NavLink>
            </div>
            
            <div className="flex items-center space-x-4">
              
              <Link 
                href="/register" 
                className="hidden sm:block px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: darkMode ? darkModeColors.accent : 'white',
                  color: darkMode ? '#0a1628' : COLORS.primary
                }}
              >
                Get Started Free
              </Link>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <NavLink 
                  href="/features"
                  mobile
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                >
                  Features
                </NavLink>
                <NavLink 
                  href="/pricing"
                  mobile
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                >
                  Pricing
                </NavLink>
                <NavLink 
                  href="/blog"
                  mobile
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  }
                >
                  Blog
                </NavLink>
                <NavLink 
                  href="/docs"
                  mobile
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }
                >
                  Docs
                </NavLink>
                <NavLink 
                  href="/contact"
                  mobile
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  Contact
                </NavLink>
              </div>
              
              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                
                <Link 
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className={`border-t py-12 ${darkMode ? 'border-white/10' : 'border-gray-200'}`} style={{ backgroundColor: darkMode ? '#0a1628' : COLORS.primaryDark }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
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
                <li><Link href="/features" className="text-gray-300 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="text-gray-300 hover:text-white transition-colors">Documentation</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
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
                <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-8 text-center text-sm text-gray-300">
            <p>&copy; {new Date().getFullYear()} ImaraDesk. Built with ❤️ for support teams everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
