// Database service using IndexedDB for mobile-friendly persistent storage
// This provides a robust database solution that works offline and on mobile devices

const DB_NAME = 'TOEICStudyApp'
const DB_VERSION = 1

// Database store names
const STORES = {
  MISTAKES: 'mistakes',
  VOCABULARY: 'vocabulary',
  QUESTION_TYPES: 'questionTypes',
  SETTINGS: 'settings'
}

class DatabaseService {
  constructor() {
    this.db = null
    this.isInitialized = false
  }

  // Initialize the database
  async init() {
    if (this.isInitialized) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Database failed to open')
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        console.log('Database opened successfully')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        console.log('Database upgrade needed')

        // Create mistakes store
        if (!db.objectStoreNames.contains(STORES.MISTAKES)) {
          const mistakesStore = db.createObjectStore(STORES.MISTAKES, { keyPath: 'id' })
          mistakesStore.createIndex('questionType', 'questionType', { unique: false })
          mistakesStore.createIndex('createdAt', 'createdAt', { unique: false })
          mistakesStore.createIndex('source', 'source', { unique: false })
        }

        // Create vocabulary store
        if (!db.objectStoreNames.contains(STORES.VOCABULARY)) {
          const vocabularyStore = db.createObjectStore(STORES.VOCABULARY, { keyPath: 'id' })
          vocabularyStore.createIndex('word', 'word', { unique: false })
          vocabularyStore.createIndex('category', 'category', { unique: false })
          vocabularyStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // Create question types store
        if (!db.objectStoreNames.contains(STORES.QUESTION_TYPES)) {
          const questionTypesStore = db.createObjectStore(STORES.QUESTION_TYPES, { keyPath: 'id' })
          questionTypesStore.createIndex('name', 'name', { unique: true })
        }

        // Create settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
        }
      }
    })
  }

  // Generic method to get all items from a store
  async getAll(storeName) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Generic method to add an item to a store
  async add(storeName, item) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      // Generate ID if not provided
      if (!item.id) {
        item.id = Date.now() + Math.random()
      }
      
      const request = store.add(item)

      request.onsuccess = () => resolve(item)
      request.onerror = () => reject(request.error)
    })
  }

  // Generic method to update an item in a store
  async update(storeName, item) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onsuccess = () => resolve(item)
      request.onerror = () => reject(request.error)
    })
  }

  // Generic method to delete an item from a store
  async delete(storeName, id) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  // Generic method to clear all items from a store
  async clear(storeName) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  // MISTAKES METHODS
  async getMistakes() {
    return this.getAll(STORES.MISTAKES)
  }

  async addMistake(mistake) {
    const mistakeWithDefaults = {
      ...mistake,
      createdAt: mistake.createdAt || new Date().toISOString(),
      source: mistake.source || 'Manual Entry'
    }
    return this.add(STORES.MISTAKES, mistakeWithDefaults)
  }

  async deleteMistake(id) {
    return this.delete(STORES.MISTAKES, id)
  }

  async updateMistake(mistake) {
    return this.update(STORES.MISTAKES, mistake)
  }

  // VOCABULARY METHODS
  async getVocabulary() {
    return this.getAll(STORES.VOCABULARY)
  }

  async addVocabulary(word) {
    const wordWithDefaults = {
      ...word,
      createdAt: word.createdAt || new Date().toISOString(),
      category: word.category || 'general'
    }
    return this.add(STORES.VOCABULARY, wordWithDefaults)
  }

  async deleteVocabulary(id) {
    return this.delete(STORES.VOCABULARY, id)
  }

  async updateVocabulary(word) {
    return this.update(STORES.VOCABULARY, word)
  }

  // QUESTION TYPES METHODS
  async getQuestionTypes() {
    const types = await this.getAll(STORES.QUESTION_TYPES)
    // Return just the names for backward compatibility
    return types.map(type => type.name)
  }

  async addQuestionType(typeName) {
    const type = {
      id: Date.now(),
      name: typeName,
      createdAt: new Date().toISOString()
    }
    await this.add(STORES.QUESTION_TYPES, type)
    return typeName
  }

  async deleteQuestionType(typeName) {
    const types = await this.getAll(STORES.QUESTION_TYPES)
    const type = types.find(t => t.name === typeName)
    if (type) {
      await this.delete(STORES.QUESTION_TYPES, type.id)
    }
    return true
  }

  async updateQuestionType(oldName, newName) {
    const types = await this.getAll(STORES.QUESTION_TYPES)
    const type = types.find(t => t.name === oldName)
    if (type) {
      type.name = newName
      await this.update(STORES.QUESTION_TYPES, type)
      
      // Update all mistakes that use this question type
      const mistakes = await this.getMistakes()
      const mistakesToUpdate = mistakes.filter(m => m.questionType === oldName)
      
      for (const mistake of mistakesToUpdate) {
        mistake.questionType = newName
        await this.updateMistake(mistake)
      }
    }
    return true
  }

  // Initialize default question types
  async initializeDefaultQuestionTypes() {
    const existingTypes = await this.getAll(STORES.QUESTION_TYPES)
    
    if (existingTypes.length === 0) {
      const defaultTypes = [
        'Grammar',
        'Sentence Pattern',
        'Vocabulary',
        'Reading Comprehension',
        'Listening'
      ]
      
      for (const typeName of defaultTypes) {
        await this.addQuestionType(typeName)
      }
    }
  }

  // MIGRATION METHODS - To migrate from localStorage
  async migrateFromLocalStorage() {
    try {
      console.log('Starting migration from localStorage...')
      
      // Migrate mistakes
      const localMistakes = JSON.parse(localStorage.getItem('toeic-mistakes') || '[]')
      if (localMistakes.length > 0) {
        console.log(`Migrating ${localMistakes.length} mistakes...`)
        for (const mistake of localMistakes) {
          await this.addMistake(mistake)
        }
      }

      // Migrate vocabulary
      const localVocabulary = JSON.parse(localStorage.getItem('toeic-vocabulary') || '[]')
      if (localVocabulary.length > 0) {
        console.log(`Migrating ${localVocabulary.length} vocabulary items...`)
        for (const word of localVocabulary) {
          await this.addVocabulary(word)
        }
      }

      // Migrate question types
      const localQuestionTypes = JSON.parse(localStorage.getItem('toeic-question-types') || 'null')
      if (localQuestionTypes && Array.isArray(localQuestionTypes)) {
        console.log(`Migrating ${localQuestionTypes.length} question types...`)
        // Clear existing types first
        await this.clear(STORES.QUESTION_TYPES)
        for (const typeName of localQuestionTypes) {
          await this.addQuestionType(typeName)
        }
      } else {
        // Initialize default types if none exist
        await this.initializeDefaultQuestionTypes()
      }

      console.log('Migration completed successfully!')
      
      // Mark migration as completed
      await this.setSetting('migrationCompleted', true)
      
    } catch (error) {
      console.error('Migration failed:', error)
      throw error
    }
  }

  // SETTINGS METHODS
  async getSetting(key) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SETTINGS], 'readonly')
      const store = transaction.objectStore(STORES.SETTINGS)
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async setSetting(key, value) {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SETTINGS], 'readwrite')
      const store = transaction.objectStore(STORES.SETTINGS)
      const request = store.put({ key, value })

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  // EXPORT/IMPORT METHODS for GitHub sync
  async exportAllData() {
    const [mistakes, vocabulary, questionTypes] = await Promise.all([
      this.getMistakes(),
      this.getVocabulary(),
      this.getQuestionTypes()
    ])

    return {
      mistakes,
      vocabulary,
      questionTypes,
      exportDate: new Date().toISOString(),
      version: '2.0', // Updated version for IndexedDB
      source: 'IndexedDB'
    }
  }

  async importAllData(data) {
    try {
      // Clear existing data
      await Promise.all([
        this.clear(STORES.MISTAKES),
        this.clear(STORES.VOCABULARY),
        this.clear(STORES.QUESTION_TYPES)
      ])

      // Import question types first
      if (data.questionTypes && Array.isArray(data.questionTypes)) {
        for (const typeName of data.questionTypes) {
          await this.addQuestionType(typeName)
        }
      }

      // Import mistakes
      if (data.mistakes && Array.isArray(data.mistakes)) {
        for (const mistake of data.mistakes) {
          await this.addMistake(mistake)
        }
      }

      // Import vocabulary
      if (data.vocabulary && Array.isArray(data.vocabulary)) {
        for (const word of data.vocabulary) {
          await this.addVocabulary(word)
        }
      }

      console.log('Data import completed successfully!')
      return true
    } catch (error) {
      console.error('Data import failed:', error)
      throw error
    }
  }

  // Check if migration is needed
  async needsMigration() {
    const migrationCompleted = await this.getSetting('migrationCompleted')
    const hasLocalStorageData = localStorage.getItem('toeic-mistakes') || 
                               localStorage.getItem('toeic-vocabulary') || 
                               localStorage.getItem('toeic-question-types')
    
    return !migrationCompleted && hasLocalStorageData
  }
}

// Create a singleton instance
const databaseService = new DatabaseService()

export default databaseService