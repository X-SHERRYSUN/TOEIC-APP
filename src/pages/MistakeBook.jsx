import React, { useState } from 'react'
import { Search, Filter, Trash2, Calendar, Tag, FileText, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useStudy } from '../context/StudyContext'

function MistakeBook() {
  const { mistakes, deleteMistake, questionTypes } = useStudy()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [hiddenAnswers, setHiddenAnswers] = useState(new Set())

  // Filter and search logic
  const filteredMistakes = mistakes.filter(mistake => {
    const matchesSearch = mistake.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mistake.userNotes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || mistake.questionType === filterType
    return matchesSearch && matchesFilter
  })

  // Sort logic
  const sortedMistakes = [...filteredMistakes].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'type':
        return a.questionType.localeCompare(b.questionType)
      default:
        return 0
    }
  })

  const allFilterTypes = ['all', ...questionTypes]

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this mistake? This action cannot be undone.')) {
      deleteMistake(id)
    }
  }

  const toggleAnswer = (mistakeId) => {
    const newHiddenAnswers = new Set(hiddenAnswers)
    if (newHiddenAnswers.has(mistakeId)) {
      newHiddenAnswers.delete(mistakeId)
    } else {
      newHiddenAnswers.add(mistakeId)
    }
    setHiddenAnswers(newHiddenAnswers)
  }

  const toggleAllAnswers = () => {
    if (hiddenAnswers.size === sortedMistakes.length) {
      // If all are hidden, show all
      setHiddenAnswers(new Set())
    } else {
      // Hide all
      setHiddenAnswers(new Set(sortedMistakes.map(m => m.id)))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMistakeReasonEmoji = (reason) => {
    const emojiMap = {
      vocabulary: '📝',
      grammar: '📖',
      'time-pressure': '⏰',
      misread: '👀',
      careless: '🤔',
      pattern: '🧩'
    }
    return emojiMap[reason] || '❓'
  }

  const getMistakeReasonText = (reason) => {
    const textMap = {
      vocabulary: "Didn't know vocabulary",
      grammar: 'Grammar confusion',
      'time-pressure': 'Time pressure',
      misread: 'Misread the question',
      careless: 'Careless mistake',
      pattern: 'Unfamiliar pattern'
    }
    return textMap[reason] || reason
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-5xl">📚</div>
        <h1 className="text-3xl font-bold text-primary-800">Mistake Book</h1>
        <p className="text-lg text-primary-600">
          Learn from your mistakes and track your progress!
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search mistakes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              {allFilterTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="type">Sort by Type</option>
          </select>

          {/* Toggle All Answers */}
          <button
            onClick={toggleAllAnswers}
            className="btn-secondary flex items-center justify-center space-x-2"
            title={hiddenAnswers.size === sortedMistakes.length ? 'Show all answers' : 'Hide all answers'}
          >
            {hiddenAnswers.size === sortedMistakes.length ? (
              <>
                <Eye className="w-4 h-4" />
                <span>Show All</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="text-2xl font-bold text-primary-800">{mistakes.length}</div>
          <div className="text-primary-600">Total Mistakes</div>
        </div>
        <div className="card text-center bg-gradient-to-r from-secondary-50 to-secondary-100">
          <div className="text-2xl font-bold text-secondary-800">{filteredMistakes.length}</div>
          <div className="text-secondary-600">Filtered Results</div>
        </div>
        <div className="card text-center bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="text-2xl font-bold text-purple-800">
            {new Set(mistakes.map(m => m.questionType)).size}
          </div>
          <div className="text-purple-600">Question Types</div>
        </div>
        <div className="card text-center bg-gradient-to-r from-green-50 to-green-100">
          <div className="text-2xl font-bold text-green-800">
            {hiddenAnswers.size}
          </div>
          <div className="text-green-600">Answers Hidden</div>
        </div>
      </div>

      {/* Mistakes List */}
      {sortedMistakes.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {mistakes.length === 0 ? 'No mistakes yet!' : 'No matches found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {mistakes.length === 0 
              ? 'Start by uploading your first TOEIC question to begin learning.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {mistakes.length === 0 && (
            <a href="/upload" className="btn-primary">
              Upload Your First Question 📤
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMistakes.map((mistake) => (
            <div key={mistake.id} className="card hover:shadow-soft-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMistakeReasonEmoji(mistake.mistakeReason)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-primary-500" />
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {mistake.questionType}
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {getMistakeReasonText(mistake.mistakeReason)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(mistake.createdAt)}</span>
                      <span>•</span>
                      <span>From {mistake.source}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Toggle Answer Button */}
                  <button
                    onClick={() => toggleAnswer(mistake.id)}
                    className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title={hiddenAnswers.has(mistake.id) ? 'Show answer' : 'Hide answer'}
                  >
                    {hiddenAnswers.has(mistake.id) ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(mistake.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete mistake"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Question:
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm">
                    {mistake.questionText}
                  </pre>
                </div>
              </div>

              {/* Correct Answer */}
              {mistake.correctAnswer && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Correct Answer:
                    </h4>
                    <button
                      onClick={() => toggleAnswer(mistake.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center space-x-1"
                    >
                      {hiddenAnswers.has(mistake.id) ? (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Show Answer</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          <span>Hide Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {hiddenAnswers.has(mistake.id) ? (
                    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-center">
                      <div className="text-gray-500 italic">
                        🔒 Answer hidden - click "Show Answer" to reveal
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <pre className="whitespace-pre-wrap font-sans text-green-800 text-sm">
                        {mistake.correctAnswer}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* User Notes */}
              {mistake.userNotes && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Your Notes:</h4>
                  <p className="text-gray-700 bg-primary-50 p-3 rounded-lg">
                    {mistake.userNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Study Tips */}
      {mistakes.length > 0 && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
            💡 Study Tips for Review
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-orange-700">
            <div>
              <h4 className="font-semibold mb-2">🔄 Active Review:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Hide answers and try to solve again</li>
                <li>• Focus on understanding why you made mistakes</li>
                <li>• Review your most common mistake type: <strong>
                  {mistakes.length > 0 && 
                    Object.entries(
                      mistakes.reduce((acc, m) => {
                        acc[m.questionType] = (acc[m.questionType] || 0) + 1
                        return acc
                      }, {})
                    ).sort(([,a], [,b]) => b - a)[0]?.[0]
                  }
                </strong></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📚 Study Strategy:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Use the hide/show toggle for self-testing</li>
                <li>• Review mistakes before taking practice tests</li>
                <li>• Create patterns from similar question types</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MistakeBook 