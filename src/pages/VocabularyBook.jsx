import React, { useState } from 'react'
import { Search, Plus, Trash2, Calendar, BookOpen, Star } from 'lucide-react'
import { useStudy } from '../context/StudyContext'

function VocabularyBook() {
  const { vocabulary, addVocabulary, deleteVocabulary } = useStudy()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [newWord, setNewWord] = useState({
    word: '',
    definition: '',
    example: '',
    category: 'manual'
  })

  // Filter and search logic
  const filteredVocabulary = vocabulary.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort logic
  const sortedVocabulary = [...filteredVocabulary].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'alphabetical':
        return a.word.localeCompare(b.word)
      default:
        return 0
    }
  })

  const handleAddWord = (e) => {
    e.preventDefault()
    if (!newWord.word.trim() || !newWord.definition.trim()) return

    addVocabulary({
      ...newWord,
      createdAt: new Date().toISOString()
    })

    setNewWord({ word: '', definition: '', example: '', category: 'manual' })
    setShowAddForm(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vocabulary word?')) {
      deleteVocabulary(id)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      extracted: '🔍',
      manual: '✏️',
      imported: '📥'
    }
    return emojiMap[category] || '📝'
  }

  const getCategoryColor = (category) => {
    const colorMap = {
      extracted: 'bg-blue-100 text-blue-700',
      manual: 'bg-green-100 text-green-700',
      imported: 'bg-purple-100 text-purple-700'
    }
    return colorMap[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-4xl sm:text-5xl">📖</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">Vocabulary Book</h1>
        <p className="text-base sm:text-lg text-primary-600 px-4">
          Build your vocabulary and master new words!
        </p>
      </div>

      {/* Search and Controls */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          {/* Add New Word Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center justify-center space-x-2 sm:col-span-2 lg:col-span-1"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Word</span>
          </button>
        </div>

        {/* Add Word Form */}
        {showAddForm && (
          <form onSubmit={handleAddWord} className="mt-6 space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Vocabulary Word</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word *
                </label>
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                  placeholder="Enter the vocabulary word"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Definition *
                </label>
                <input
                  type="text"
                  value={newWord.definition}
                  onChange={(e) => setNewWord({...newWord, definition: e.target.value})}
                  placeholder="Enter the definition"
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Example Sentence (Optional)
              </label>
              <textarea
                value={newWord.example}
                onChange={(e) => setNewWord({...newWord, example: e.target.value})}
                placeholder="Enter an example sentence"
                className="input-field h-20 resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button type="submit" className="btn-primary">
                Add Word
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="text-xl sm:text-2xl font-bold text-primary-800">{vocabulary.length}</div>
          <div className="text-sm sm:text-base text-primary-600">Total Words</div>
        </div>
        <div className="card text-center bg-gradient-to-r from-secondary-50 to-secondary-100">
          <div className="text-xl sm:text-2xl font-bold text-secondary-800">
            {vocabulary.filter(w => w.category === 'extracted').length}
          </div>
          <div className="text-sm sm:text-base text-secondary-600">Auto-Extracted</div>
        </div>
        <div className="card text-center bg-gradient-to-r from-green-50 to-green-100">
          <div className="text-xl sm:text-2xl font-bold text-green-800">
            {vocabulary.filter(w => w.category === 'manual').length}
          </div>
          <div className="text-sm sm:text-base text-green-600">Manually Added</div>
        </div>
      </div>

      {/* Vocabulary List */}
      {sortedVocabulary.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {vocabulary.length === 0 ? 'No vocabulary words yet!' : 'No matches found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {vocabulary.length === 0 
              ? 'Start by uploading TOEIC questions or manually adding words to build your vocabulary.'
              : 'Try adjusting your search criteria.'
            }
          </p>
          {vocabulary.length === 0 && (
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <a href="/upload" className="btn-primary">
                Upload Questions 📤
              </a>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-secondary"
              >
                Add Manually ✏️
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedVocabulary.map((word) => (
            <div key={word.id} className="card hover:shadow-soft-lg transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryEmoji(word.category)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(word.category)}`}>
                    {word.category}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(word.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all"
                  title="Delete word"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Word */}
                <div>
                  <h3 className="text-xl font-bold text-primary-800 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    {word.word}
                  </h3>
                </div>

                {/* Definition */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Definition:</h4>
                  <p className="text-gray-800">{word.definition}</p>
                </div>

                {/* Example */}
                {word.example && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1 flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      Example:
                    </h4>
                    <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded-lg italic">
                      "{word.example}"
                    </p>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Added {formatDate(word.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Study Tips */}
      {vocabulary.length > 0 && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
            🎯 Vocabulary Study Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-indigo-700">
            <div>
              <h4 className="font-semibold mb-2">📝 Review Strategy:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Review 5-10 words daily</li>
                <li>• Create your own example sentences</li>
                <li>• Practice using words in context</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🧠 Memory Techniques:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Connect words to personal experiences</li>
                <li>• Group similar words together</li>
                <li>• Use spaced repetition for review</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VocabularyBook 