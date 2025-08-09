import React, { createContext, useContext, useReducer, useEffect } from 'react'
import databaseService from '../services/database'

const StudyContext = createContext()

const initialState = {
  mistakes: [],
  vocabulary: [],
  questionTypes: [
    'Grammar',
    'Sentence Pattern', 
    'Vocabulary',
    'Reading Comprehension',
    'Listening'
  ],
  loading: false,
  error: null,
  isInitialized: false
}

function studyReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'ADD_MISTAKE':
      return { 
        ...state, 
        mistakes: [...state.mistakes, { ...action.payload, id: Date.now() }],
        loading: false,
        error: null
      }
    case 'ADD_VOCABULARY':
      return { 
        ...state, 
        vocabulary: [...state.vocabulary, { ...action.payload, id: Date.now() }],
        loading: false,
        error: null
      }
    case 'ADD_QUESTION_TYPE':
      return {
        ...state,
        questionTypes: [...state.questionTypes, action.payload]
      }
    case 'DELETE_QUESTION_TYPE':
      return {
        ...state,
        questionTypes: state.questionTypes.filter(type => type !== action.payload)
      }
    case 'UPDATE_QUESTION_TYPE':
      return {
        ...state,
        questionTypes: state.questionTypes.map(type => 
          type === action.payload.oldType ? action.payload.newType : type
        ),
        mistakes: state.mistakes.map(mistake =>
          mistake.questionType === action.payload.oldType 
            ? { ...mistake, questionType: action.payload.newType }
            : mistake
        )
      }
    case 'LOAD_DATA':
      return { 
        ...state, 
        mistakes: action.payload.mistakes || [],
        vocabulary: action.payload.vocabulary || [],
        questionTypes: action.payload.questionTypes || state.questionTypes,
        loading: false,
        isInitialized: true
      }
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload
      }
    case 'DELETE_MISTAKE':
      return {
        ...state,
        mistakes: state.mistakes.filter(mistake => mistake.id !== action.payload)
      }
    case 'DELETE_VOCABULARY':
      return {
        ...state,
        vocabulary: state.vocabulary.filter(word => word.id !== action.payload)
      }
    default:
      return state
  }
}

export function StudyProvider({ children }) {
  const [state, dispatch] = useReducer(studyReducer, initialState)

  // Initialize database and load data on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        // Initialize database
        await databaseService.init()
        
        // Check if migration from localStorage is needed
        const needsMigration = await databaseService.needsMigration()
        if (needsMigration) {
          console.log('Migrating data from localStorage to IndexedDB...')
          await databaseService.migrateFromLocalStorage()
        }
        
        // Load data from database
        const [mistakes, vocabulary, questionTypes] = await Promise.all([
          databaseService.getMistakes(),
          databaseService.getVocabulary(),
          databaseService.getQuestionTypes()
        ])
        
        dispatch({ 
          type: 'LOAD_DATA', 
          payload: { mistakes, vocabulary, questionTypes }
        })
        
      } catch (error) {
        console.error('Failed to initialize app:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data. Please refresh the page.' })
      }
    }

    initializeApp()
  }, [])

  const addMistake = async (mistake) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const savedMistake = await databaseService.addMistake(mistake)
      dispatch({ type: 'ADD_MISTAKE', payload: savedMistake })
    } catch (error) {
      console.error('Failed to add mistake:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save mistake. Please try again.' })
    }
  }

  const addVocabulary = async (word) => {
    try {
      const savedWord = await databaseService.addVocabulary(word)
      dispatch({ type: 'ADD_VOCABULARY', payload: savedWord })
    } catch (error) {
      console.error('Failed to add vocabulary:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save vocabulary. Please try again.' })
    }
  }

  const deleteMistake = async (id) => {
    try {
      await databaseService.deleteMistake(id)
      dispatch({ type: 'DELETE_MISTAKE', payload: id })
    } catch (error) {
      console.error('Failed to delete mistake:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete mistake. Please try again.' })
    }
  }

  const deleteVocabulary = async (id) => {
    try {
      await databaseService.deleteVocabulary(id)
      dispatch({ type: 'DELETE_VOCABULARY', payload: id })
    } catch (error) {
      console.error('Failed to delete vocabulary:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete vocabulary. Please try again.' })
    }
  }

  const addQuestionType = async (type) => {
    try {
      if (type.trim() && !state.questionTypes.includes(type.trim())) {
        await databaseService.addQuestionType(type.trim())
        dispatch({ type: 'ADD_QUESTION_TYPE', payload: type.trim() })
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to add question type:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add question type. Please try again.' })
      return false
    }
  }

  const deleteQuestionType = async (type) => {
    try {
      // Don't allow deleting if it's being used by existing mistakes
      const isInUse = state.mistakes.some(mistake => mistake.questionType === type)
      if (isInUse) {
        return { success: false, message: 'Cannot delete: This type is used by existing mistakes' }
      }
      
      await databaseService.deleteQuestionType(type)
      dispatch({ type: 'DELETE_QUESTION_TYPE', payload: type })
      return { success: true }
    } catch (error) {
      console.error('Failed to delete question type:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete question type. Please try again.' })
      return { success: false, message: 'Failed to delete question type. Please try again.' }
    }
  }

  const updateQuestionType = async (oldType, newType) => {
    try {
      if (newType.trim() && !state.questionTypes.includes(newType.trim())) {
        await databaseService.updateQuestionType(oldType, newType.trim())
        dispatch({ type: 'UPDATE_QUESTION_TYPE', payload: { oldType, newType: newType.trim() } })
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update question type:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update question type. Please try again.' })
      return false
    }
  }

  const extractVocabulary = (text) => {
    // Mock vocabulary extraction - in real app would use NLP
    const commonWords = ['however', 'therefore', 'although', 'because', 'moreover', 'furthermore', 'nevertheless', 'consequently']
    const words = text.toLowerCase().split(/\W+/)
    const extractedWords = []
    
    words.forEach(word => {
      if (word.length > 6 || commonWords.includes(word)) {
        if (!state.vocabulary.find(v => v.word.toLowerCase() === word)) {
          extractedWords.push({
            word: word,
            definition: `Definition of "${word}" (mock)`,
            example: text,
            category: 'extracted',
            createdAt: new Date().toISOString()
          })
        }
      }
    })
    
    return extractedWords
  }

  // Export and import functions for GitHub sync
  const exportData = async () => {
    try {
      return await databaseService.exportAllData()
    } catch (error) {
      console.error('Failed to export data:', error)
      throw new Error('Failed to export data. Please try again.')
    }
  }

  const importData = async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await databaseService.importAllData(data)
      
      // Reload data after import
      const [mistakes, vocabulary, questionTypes] = await Promise.all([
        databaseService.getMistakes(),
        databaseService.getVocabulary(),
        databaseService.getQuestionTypes()
      ])
      
      dispatch({ 
        type: 'LOAD_DATA', 
        payload: { mistakes, vocabulary, questionTypes }
      })
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import data. Please check the file format.' })
      throw error
    }
  }

  const clearAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await Promise.all([
        databaseService.clear('mistakes'),
        databaseService.clear('vocabulary')
      ])
      
      // Reinitialize default question types
      await databaseService.initializeDefaultQuestionTypes()
      
      // Reload data
      const [mistakes, vocabulary, questionTypes] = await Promise.all([
        databaseService.getMistakes(),
        databaseService.getVocabulary(),
        databaseService.getQuestionTypes()
      ])
      
      dispatch({ 
        type: 'LOAD_DATA', 
        payload: { mistakes, vocabulary, questionTypes }
      })
      
      return true
    } catch (error) {
      console.error('Failed to clear data:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear data. Please try again.' })
      throw error
    }
  }

  const value = {
    ...state,
    addMistake,
    addVocabulary,
    deleteMistake,
    deleteVocabulary,
    addQuestionType,
    deleteQuestionType,
    updateQuestionType,
    extractVocabulary,
    exportData,
    importData,
    clearAllData
  }

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  )
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider')
  }
  return context
} 