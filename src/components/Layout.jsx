import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Upload, BookOpen, Book, Settings } from 'lucide-react'

function Layout({ children }) {
  const navItems = [
    { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
    { path: '/upload', icon: Upload, label: 'Upload', emoji: '📤' },
    { path: '/mistakes', icon: BookOpen, label: 'Mistakes', emoji: '📚' },
    { path: '/vocabulary', icon: Book, label: 'Vocabulary', emoji: '📖' },
    { path: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">📚</div>
              <div>
                <h1 className="text-xl font-bold text-primary-800">TOEIC Study App</h1>
                <p className="text-sm text-primary-600">Your friendly study companion</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white/60 backdrop-blur-sm border-r border-primary-100 min-h-[calc(100vh-4rem)] p-4">
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
                <span className="font-semibold text-primary-800">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary-700">Vocabulary words:</span>
                <span className="font-semibold text-primary-800">0</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 