import React, { useState } from 'react'
import { Download, Upload, Trash2, AlertTriangle, CheckCircle, Plus, Edit2, X } from 'lucide-react'
import { useStudy } from '../context/StudyContext'

function Settings() {
  const { mistakes, vocabulary, questionTypes, addQuestionType, deleteQuestionType, updateQuestionType, exportData, importData, clearAllData, loading } = useStudy()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearType, setClearType] = useState('')
  const [showAddType, setShowAddType] = useState(false)
  const [newType, setNewType] = useState('')
  const [editingType, setEditingType] = useState(null)
  const [editedTypeName, setEditedTypeName] = useState('')

  const handleExportData = async () => {
    try {
      const data = await exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `toeic-study-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert('Data exported successfully!')
    } catch (error) {
      alert('Failed to export data. Please try again.')
      console.error('Export error:', error)
    }
  }

  const handleImportData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        await importData(data)
        alert('Data imported successfully!')
        
        // Reset the file input
        event.target.value = ''
      } catch (error) {
        alert('Error importing data. Please check the file format.')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
  }

  const clearData = (type) => {
    setClearType(type)
    setShowClearConfirm(true)
  }

  const confirmClear = async () => {
    try {
      if (clearType === 'all') {
        await clearAllData()
        alert('All data cleared successfully!')
      } else {
        // Individual clearing for specific data types
        if (clearType === 'mistakes') {
          await Promise.all(mistakes.map(mistake => deleteMistake(mistake.id)))
        } else if (clearType === 'vocabulary') {
          await Promise.all(vocabulary.map(word => deleteVocabulary(word.id)))
        }
        alert('Data cleared successfully!')
      }
    } catch (error) {
      alert('Failed to clear data. Please try again.')
      console.error('Clear error:', error)
    }
    
    setShowClearConfirm(false)
    setClearType('')
  }

  const handleAddType = async () => {
    if (newType.trim()) {
      const success = await addQuestionType(newType)
      if (success) {
        setNewType('')
        setShowAddType(false)
      } else {
        alert('This question type already exists!')
      }
    }
  }

  const handleDeleteType = async (type) => {
    const result = await deleteQuestionType(type)
    if (!result.success) {
      alert(result.message)
    }
  }

  const handleEditType = (type) => {
    setEditingType(type)
    setEditedTypeName(type)
  }

  const handleSaveEdit = async () => {
    if (editedTypeName.trim() && editedTypeName !== editingType) {
      const success = await updateQuestionType(editingType, editedTypeName)
      if (success) {
        setEditingType(null)
        setEditedTypeName('')
      } else {
        alert('This question type already exists!')
      }
    } else {
      setEditingType(null)
      setEditedTypeName('')
    }
  }

  const isDefaultType = (type) => {
    const defaultTypes = ['Grammar', 'Sentence Pattern', 'Vocabulary', 'Reading Comprehension', 'Listening']
    return defaultTypes.includes(type)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-5xl">⚙️</div>
        <h1 className="text-3xl font-bold text-primary-800">Settings</h1>
        <p className="text-lg text-primary-600">
          Manage your study data and app preferences
        </p>
      </div>

      {/* Data Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-4 flex items-center">
          📊 Your Study Data
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📚</span>
              <div>
                <div className="text-xl font-bold text-primary-800">{mistakes.length}</div>
                <div className="text-primary-600">Mistake entries</div>
              </div>
            </div>
          </div>
          <div className="bg-secondary-50 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📖</span>
              <div>
                <div className="text-xl font-bold text-secondary-800">{vocabulary.length}</div>
                <div className="text-secondary-600">Vocabulary words</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏷️</span>
              <div>
                <div className="text-xl font-bold text-purple-800">{questionTypes.length}</div>
                <div className="text-purple-600">Question types</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Types Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-4 flex items-center">
          🏷️ Manage Question Types
        </h2>
        
        {/* Add New Type */}
        <div className="mb-6">
          {!showAddType ? (
            <button
              onClick={() => setShowAddType(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Question Type</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Enter new question type..."
                className="input-field flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
              />
              <button
                onClick={handleAddType}
                className="btn-primary px-4"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddType(false)
                  setNewType('')
                }}
                className="btn-secondary px-4"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Question Types List */}
        <div className="space-y-2">
          {questionTypes.map((type) => (
            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              {editingType === type ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={editedTypeName}
                    onChange={(e) => setEditedTypeName(e.target.value)}
                    className="input-field flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="btn-primary px-3 py-1 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingType(null)
                      setEditedTypeName('')
                    }}
                    className="btn-secondary px-3 py-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-800">{type}</span>
                    {isDefaultType(type) && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Default
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      ({mistakes.filter(m => m.questionType === type).length} mistakes)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditType(type)}
                      className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                      title="Edit question type"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {!isDefaultType(type) && (
                      <button
                        onClick={() => handleDeleteType(type)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete question type"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> Default question types cannot be deleted but can be renamed. 
            Custom types can only be deleted if they're not being used by any existing mistakes.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary-800 mb-4 flex items-center">
          💾 Data Management
        </h2>
        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <Download className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Export Data</h3>
                <p className="text-green-600 text-sm">Download your study data as a JSON file</p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="btn-primary bg-green-500 hover:bg-green-600"
            >
              Export
            </button>
          </div>

          {/* Import Data */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <Upload className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Import Data</h3>
                <p className="text-blue-600 text-sm">Upload a previously exported JSON file</p>
              </div>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="btn-primary bg-blue-500 hover:bg-blue-600 cursor-pointer"
              >
                Import
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Data */}
      <div className="card border-red-200">
        <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2" />
          Danger Zone
        </h2>
        <p className="text-red-600 mb-4">
          These actions will permanently delete your data. Make sure to export your data first if you want to keep it.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => clearData('mistakes')}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear All Mistakes ({mistakes.length} items)</span>
          </button>
          <button
            onClick={() => clearData('vocabulary')}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear All Vocabulary ({vocabulary.length} items)</span>
          </button>
          <button
            onClick={() => clearData('question-types')}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Reset Question Types (back to defaults)</span>
          </button>
          <button
            onClick={() => clearData('all')}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h2 className="text-xl font-semibold text-purple-800 mb-4">
          ℹ️ About TOEIC Study App
        </h2>
        <div className="space-y-2 text-purple-700">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Features:</strong> Mistake tracking, Vocabulary extraction, Study progress, Custom question types</p>
          <p><strong>Data Storage:</strong> Local browser storage (your data stays private)</p>
          <p><strong>OCR/STT:</strong> Real OCR with Tesseract.js, Mock Speech-to-Text</p>
        </div>
        <div className="mt-4 p-3 bg-purple-100 rounded-lg">
          <p className="text-sm text-purple-800">
            💡 <strong>Tip:</strong> This app stores all your data locally in your browser. 
            Make sure to export your data regularly to avoid losing it if you clear your browser data.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
              <p className="text-gray-600">
                Are you sure you want to clear{' '}
                {clearType === 'all' ? 'all your data' : 
                 clearType === 'mistakes' ? 'all mistakes' : 
                 clearType === 'vocabulary' ? 'all vocabulary' :
                 clearType === 'question-types' ? 'all custom question types' : 'the selected data'}?
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClear}
                  className="flex-1 btn-primary bg-red-500 hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings 