import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Upload, BookOpen, Book, Settings, Menu, X } from 'lucide-react'
import { useStudy } from '../context/StudyContext'

function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { mistakes, vocabulary } = useStudy()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
    { path: '/upload', icon: Upload, label: 'Upload', emoji: '📤' },
    { path: '/mistakes', icon: BookOpen, label: 'Mistakes', emoji: '📚' },
    { path: '/vocabulary', icon: Book, label: 'Vocabulary', emoji: '📖' },
    { path: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
  ]

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl sm:text-3xl">📚</div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-primary-800">TOEIC Study App</h1>
                <p className="text-xs sm:text-sm text-primary-600 hidden sm:block">Your friendly study companion</p>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-primary-600 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Desktop Sidebar Navigation */}
        <nav className="hidden lg:block w-64 bg-white/60 backdrop-blur-sm border-r border-primary-100 min-h-[calc(100vh-4rem)] p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-soft'
                      : 'text-primary-700 hover:bg-primary-100 hover:text-primary-800'
                  }`
                }
              >
                <span className="text-xl">{item.emoji}</span>
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Study Stats */}
          <div className="mt-8 p-4 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl">
            <h3 className="font-semibold text-primary-800 mb-2">Study Progress 📊</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-primary-700">Mistakes logged:</span>
                <span className="font-semibold text-primary-800">{mistakes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Vocabulary words:</span>
                <span className="font-semibold text-primary-800">{vocabulary.length}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Sidebar Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50" 
              onClick={closeMobileMenu}
            ></div>
            <nav className="relative w-64 bg-white shadow-xl overflow-y-auto">
              <div className="p-4">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-primary-500 text-white shadow-soft'
                            : 'text-primary-700 hover:bg-primary-100 hover:text-primary-800'
                        }`
                      }
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  ))}
                </div>

                {/* Study Stats */}
                <div className="mt-8 p-4 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-xl">
                  <h3 className="font-semibold text-primary-800 mb-2">Study Progress 📊</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-primary-700">Mistakes logged:</span>
                      <span className="font-semibold text-primary-800">{mistakes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-700">Vocabulary words:</span>
                      <span className="font-semibold text-primary-800">{vocabulary.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-6 min-h-[calc(100vh-4rem)]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-primary-100 p-2 z-30">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`
              }
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="lg:hidden h-20"></div>
    </div>
  )
}

export default Layout 