import React from 'react'
import { Link } from 'react-router-dom'
import { Upload, BookOpen, Book, TrendingUp } from 'lucide-react'
import { useStudy } from '../context/StudyContext'

function Home() {
  const { mistakes, vocabulary } = useStudy()

  const quickActions = [
    {
      title: 'Upload New Question',
      description: 'Add a TOEIC question to your mistake book',
      icon: Upload,
      emoji: '📤',
      path: '/upload',
      color: 'from-primary-400 to-primary-600'
    },
    {
      title: 'Review Mistakes',
      description: 'Study your previous mistakes',
      icon: BookOpen,
      emoji: '📚',
      path: '/mistakes',
      color: 'from-secondary-400 to-secondary-600'
    },
    {
      title: 'Study Vocabulary',
      description: 'Practice your vocabulary words',
      icon: Book,
      emoji: '📖',
      path: '/vocabulary',
      color: 'from-purple-400 to-purple-600'
    }
  ]

  const encouragementMessages = [
    "You're doing great! 🌟",
    "Every mistake is a step towards success! 💪",
    "Keep up the fantastic work! 🎉",
    "Learning English is a journey, enjoy it! 🚀",
    "You're getting stronger every day! ⭐"
  ]

  const todayMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="text-4xl sm:text-6xl mb-4">🌟</div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-800 mb-2">
          Welcome Back, TOEIC Star!
        </h1>
        <p className="text-lg sm:text-xl text-primary-600 max-w-2xl mx-auto px-4">
          {todayMessage} Ready to boost your TOEIC score today?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="card text-center">
          <div className="text-3xl sm:text-4xl mb-3">📚</div>
          <div className="text-xl sm:text-2xl font-bold text-primary-800">{mistakes.length}</div>
          <div className="text-sm sm:text-base text-primary-600">Mistakes Logged</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl sm:text-4xl mb-3">📖</div>
          <div className="text-xl sm:text-2xl font-bold text-primary-800">{vocabulary.length}</div>
          <div className="text-sm sm:text-base text-primary-600">Vocabulary Words</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl sm:text-4xl mb-3">🎯</div>
          <div className="text-xl sm:text-2xl font-bold text-primary-800">{mistakes.length + vocabulary.length}</div>
          <div className="text-sm sm:text-base text-primary-600">Total Progress</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-primary-800 text-center px-4">
          What would you like to do today? 🤔
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="group block"
            >
              <div className="card hover:shadow-soft-lg transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-center space-y-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-xl sm:text-2xl">{action.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <div className="text-center space-y-4">
          <div className="text-3xl sm:text-4xl">💡</div>
          <h3 className="text-lg sm:text-xl font-semibold text-primary-800">Daily Study Tip</h3>
          <p className="text-sm sm:text-base text-primary-700 max-w-3xl mx-auto px-4">
            Try to review your mistakes for just 10 minutes each day. Consistent practice with your weak points 
            is more effective than long cramming sessions! Remember to note why you made each mistake - 
            understanding the pattern helps prevent similar errors in the future.
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      {(mistakes.length > 0 || vocabulary.length > 0) && (
        <div className="card">
          <h3 className="text-xl font-semibold text-primary-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {mistakes.slice(-3).map((mistake, index) => (
              <div key={mistake.id} className="flex items-center space-x-3 p-3 bg-primary-50 rounded-xl">
                <span className="text-lg">❌</span>
                <div>
                  <div className="font-medium text-gray-800">New mistake logged</div>
                  <div className="text-sm text-gray-600">{mistake.questionType} question</div>
                </div>
              </div>
            ))}
            {vocabulary.slice(-3).map((word, index) => (
              <div key={word.id} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-xl">
                <span className="text-lg">📝</span>
                <div>
                  <div className="font-medium text-gray-800">New vocabulary: {word.word}</div>
                  <div className="text-sm text-gray-600">Added to your collection</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home 