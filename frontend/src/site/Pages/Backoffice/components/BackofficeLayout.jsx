import React, { useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import { COLORS } from '../../../../constants/theme'
import { securePost } from '../utils/api'
import Modal, { ModalBody, ModalFooter } from '../../../../app/components/Modal'
import NetworkStatusModal from '../../../../app/components/NetworkStatusModal'
import questionImg from '../../../../site/assets/illustrations/question.jpg'
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  DollarSign, 
  Mail, 
  Clock, 
  FileText,
  LogOut,
  X,
  Menu,
  ChevronDown,
  ShieldCheck
} from 'lucide-react'

const iconClass = "w-5 h-5"

const NAV_ITEMS = [
  { 
    href: '/backoffice/', 
    label: 'Dashboard',
    icon: <LayoutDashboard className={iconClass} />
  },
  { 
    href: '/backoffice/businesses/', 
    label: 'Businesses',
    icon: <Building2 className={iconClass} />
  },
  { 
    href: '/backoffice/packages/', 
    label: 'Packages',
    icon: <Package className={iconClass} />
  },
  { 
    href: '/backoffice/billing/', 
    label: 'Billing',
    icon: <DollarSign className={iconClass} />
  },
  {
    href: '/backoffice/emails/',
    label: 'Emails',
    icon: <Mail className={iconClass} />
  },
  { 
    href: '/backoffice/activity/', 
    label: 'Activity',
    icon: <Clock className={iconClass} />
  },
  { 
    href: '/backoffice/logs/', 
    label: 'Logs',
    icon: <FileText className={iconClass} />
  },
]

export default function BackofficeLayout({ children, admin }) {
  const { url } = usePage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const isActive = (href) => {
    if (href === '/backoffice/') return url === '/backoffice/' || url === '/backoffice'
    return url.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await securePost('/backoffice/api/logout/')
      router.visit('/backoffice/login/')
    } catch (e) {
      console.error('Logout failed', e)
    }
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200" style={{ backgroundColor: COLORS.primary }}>
          <Link href="/backoffice/" className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-white" />
            <span className="text-lg font-bold text-white">Backoffice</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              style={isActive(item.href) ? { color: COLORS.primary, backgroundColor: `${COLORS.primary}10` } : {}}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: COLORS.primary }}>
              {admin?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{admin?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className={iconClass} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200" style={{ backgroundColor: COLORS.primary }}>
              <Link href="/backoffice/" className="flex items-center space-x-2">
                <ShieldCheck className="w-8 h-8 text-white" />
                <span className="text-lg font-bold text-white">Backoffice</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-white/80 hover:text-white">
                <X className={iconClass} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={isActive(item.href) ? { color: COLORS.primary, backgroundColor: `${COLORS.primary}10` } : {}}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: COLORS.primary }}>
                  {admin?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{admin?.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className={iconClass} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-gray-200 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:hidden pl-4">
            <h1 className="text-lg font-semibold" style={{ color: COLORS.primary }}>Backoffice</h1>
          </div>

          {/* Desktop user menu */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: COLORS.primary }}>
                  {admin?.full_name?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-medium text-gray-700">{admin?.full_name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{admin?.full_name}</p>
                      <p className="text-xs text-gray-500">{admin?.email}</p>
                    </div>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile user avatar */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Logout"
            >
              <LogOut className={iconClass} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>

    {/* Logout Confirmation Modal */}
    <Modal
      isOpen={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      title="Confirm Logout"
      maxWidth="max-w-md"
    >
      <ModalBody>
        <div className="flex justify-center mb-4">
          <img src={questionImg} alt="" className="w-32 h-32 object-contain" />
        </div>
        <p className="text-gray-600 text-center">Are you sure you want to log out?</p>
      </ModalBody>
      <ModalFooter className="justify-end">
        <button
          onClick={() => setShowLogoutModal(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </ModalFooter>
    </Modal>
    <NetworkStatusModal />
    </>
  )
}
