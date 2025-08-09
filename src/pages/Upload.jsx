import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, Image, Mic, FileText, Send, Loader2, Plus, X, CheckCircle, MicOff, RefreshCw } from 'lucide-react'
import { useStudy } from '../context/StudyContext'
import { createWorker } from 'tesseract.js'

function Upload() {
  const navigate = useNavigate()
  const { addMistake, extractVocabulary, addVocabulary, loading, questionTypes, addQuestionType } = useStudy()
  const [activeTab, setActiveTab] = useState('image')
  const [questionText, setQuestionText] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [userNotes, setUserNotes] = useState('')
  const [questionType, setQuestionType] = useState(questionTypes[0] || 'Grammar')
  const [mistakeReason, setMistakeReason] = useState('')
  const [processingOCR, setProcessingOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [showAddType, setShowAddType] = useState(false)
  const [newType, setNewType] = useState('')
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [speechError, setSpeechError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const recognitionRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true)
      initializeSpeechRecognition()
    }
  }, [])

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.maxAlternatives = 1
    
    recognitionRef.current.onstart = () => {
      setSpeechError(null)
      setRetryCount(0)
    }
    
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = ''
      let newFinalTranscript = finalTranscript
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          newFinalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }
      
      setFinalTranscript(newFinalTranscript)
      setTranscript(newFinalTranscript + interimTranscript)
    }
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      const errorMessages = {
        'network': 'Network error occurred. Please check your internet connection and try again.',
        'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
        'no-speech': 'No speech detected. Please speak clearly and try again.',
        'audio-capture': 'Audio capture failed. Please check your microphone and try again.',
        'service-not-allowed': 'Speech recognition service not allowed. Please try again.',
        'bad-grammar': 'Speech recognition failed. Please try speaking more clearly.',
        'language-not-supported': 'Language not supported. Please check your browser settings.',
        'aborted': 'Speech recognition was aborted. You can try again.'
      }
      
      const errorMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`
      setSpeechError({ type: event.error, message: errorMessage })
      
      // Auto-retry for network errors up to 3 times
      if (event.error === 'network' && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          startListening()
        }, 2000)
      }
    }
    
    recognitionRef.current.onend = () => {
      setIsListening(false)
    }
  }

  // Real OCR function using Tesseract.js
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setProcessingOCR(true)
    setOcrProgress(0)
    
    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100))
          }
        }
      })

      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      if (text.trim()) {
        setQuestionText(text.trim())
      } else {
        alert('No text was detected in the image. Please try with a clearer image or use the text input option.')
      }
    } catch (error) {
      console.error('OCR Error:', error)
      alert('Failed to process the image. Please try again or use the text input option.')
    } finally {
      setProcessingOCR(false)
      setOcrProgress(0)
    }
  }

  // Speech recognition functions
  const startListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }
    
    if (recognitionRef.current && !isListening) {
      setSpeechError(null)
      setIsListening(true)
      
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start speech recognition:', error)
        setIsListening(false)
        setSpeechError({ 
          type: 'start-failed', 
          message: 'Failed to start speech recognition. Please try again.' 
        })
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const retryListening = () => {
    setSpeechError(null)
    setRetryCount(0)
    // Reinitialize speech recognition
    initializeSpeechRecognition()
    // Wait a moment then start
    setTimeout(() => {
      startListening()
    }, 500)
  }

  const useTranscript = () => {
    if (transcript.trim()) {
      setQuestionText(transcript.trim())
      setTranscript('')
      setFinalTranscript('')
      setSpeechError(null)
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setFinalTranscript('')
    setSpeechError(null)
  }

  const handleAddType = () => {
    if (newType.trim()) {
      const success = addQuestionType(newType)
      if (success) {
        setQuestionType(newType.trim())
        setNewType('')
        setShowAddType(false)
      } else {
        alert('This question type already exists!')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!questionText.trim()) {
      alert('Please add a question first!')
      return
    }

    if (!correctAnswer.trim()) {
      alert('Please provide the correct answer!')
      return
    }

    // Create mistake entry
    const mistake = {
      questionText,
      correctAnswer,
      questionType,
      mistakeReason,
      userNotes,
      createdAt: new Date().toISOString(),
      source: activeTab
    }

    // Extract and add vocabulary
    const extractedWords = extractVocabulary(questionText)
    extractedWords.forEach(word => addVocabulary(word))

    // Add mistake
    addMistake(mistake)
    
    // Reset form
    setQuestionText('')
    setCorrectAnswer('')
    setUserNotes('')
    setMistakeReason('')
    setTranscript('')
    setFinalTranscript('')
    setSpeechError(null)
    
    // Navigate to mistakes page
    setTimeout(() => {
      navigate('/mistakes')
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-5xl">📤</div>
        <h1 className="text-3xl font-bold text-primary-800">Upload New Question</h1>
        <p className="text-lg text-primary-600">
          Add a TOEIC question to your mistake book and build your vocabulary!
        </p>
      </div>

      {/* Upload Tabs */}
      <div className="card">
        <div className="flex space-x-1 mb-6 bg-primary-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'image'
                ? 'bg-white text-primary-700 shadow-soft'
                : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            <Image className="w-5 h-5" />
            <span>📷 Image Upload (Real OCR)</span>
          </button>
          <button
            onClick={() => setActiveTab('speech')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'speech'
                ? 'bg-white text-primary-700 shadow-soft'
                : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>🎤 Speech Input (Live STT)</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'text'
                ? 'bg-white text-primary-700 shadow-soft'
                : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>✏️ Type Text</span>
          </button>
        </div>

        {/* Upload Content */}
        <div className="space-y-6">
          {activeTab === 'image' && (
            <div className="text-center">
              <div className="border-2 border-dashed border-primary-300 rounded-2xl p-8 hover:border-primary-400 transition-colors">
                <UploadIcon className="w-12 h-12 mx-auto text-primary-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Question Image</h3>
                <p className="text-gray-600 mb-4">
                  Take a photo or upload an image of your TOEIC question - now with real OCR!
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={processingOCR}
                />
                <label
                  htmlFor="image-upload"
                  className={`btn-primary cursor-pointer inline-block ${processingOCR ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processingOCR ? 'Processing...' : 'Choose Image'}
                </label>
                <div className="mt-4 text-sm text-gray-500">
                  <p>📝 Supported formats: JPG, PNG, GIF, BMP</p>
                  <p>💡 For best results, use clear, high-contrast images</p>
                </div>
              </div>
              {processingOCR && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-primary-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Reading text from image... 🔍</span>
                  </div>
                  {ocrProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      ></div>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    Progress: {ocrProgress}% - This may take a few moments for the first use
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'speech' && (
            <div className="text-center">
              <div className="border-2 border-dashed border-primary-300 rounded-2xl p-8 hover:border-primary-400 transition-colors">
                <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-primary-400'
                }`}>
                  {isListening ? (
                    <MicOff className="w-12 h-12 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {isListening ? 'Listening...' : 'Speak Your Question'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isListening 
                    ? 'Speak clearly and we\'ll convert your speech to text' 
                    : 'Click the microphone button and read your TOEIC question aloud'
                  }
                </p>
                
                {!speechSupported ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-red-700">
                      ❌ Speech recognition is not supported in this browser. 
                      Please use Chrome, Edge, or Safari for speech input.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Error Display */}
                    {speechError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="text-red-700 font-medium">Speech Recognition Error:</p>
                            <p className="text-red-600 text-sm">{speechError.message}</p>
                            {retryCount > 0 && (
                              <p className="text-red-500 text-xs mt-1">
                                Retry attempt: {retryCount}/3
                              </p>
                            )}
                          </div>
                          <button
                            onClick={retryListening}
                            className="btn-secondary px-3 py-1 text-sm flex items-center space-x-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Retry</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`btn-primary ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
                      disabled={speechError && speechError.type === 'not-allowed'}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-5 h-5 mr-2" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 mr-2" />
                          Start Speaking
                        </>
                      )}
                    </button>
                    
                    {transcript && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">Live Transcript:</h4>
                          <div className="space-x-2">
                            <button
                              onClick={useTranscript}
                              className="btn-primary px-3 py-1 text-sm"
                            >
                              Use This Text
                            </button>
                            <button
                              onClick={clearTranscript}
                              className="btn-secondary px-3 py-1 text-sm"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-800">{transcript}</p>
                        {isListening && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            Keep speaking to add more text...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>🎤 Speak clearly and at a moderate pace</p>
                  <p>🌐 Requires internet connection for speech processing</p>
                  <p>🔊 Make sure your microphone is working</p>
                  <p>📝 Text accumulates as you speak - no need to speak continuously</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type your question directly:
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Paste or type your TOEIC question here..."
                className="input-field h-32 resize-none"
              />
            </div>
          )}

          {/* Question Text Display - Always Editable */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text:
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Your question text will appear here. You can edit it directly..."
                className="input-field h-32 resize-none"
              />
              <div className="mt-2 text-sm text-gray-600">
                💡 This text is fully editable - you can modify it after OCR/speech recognition or type directly
              </div>
            </div>

            {/* Only show the rest of the form if there's question text */}
            {questionText.trim() && (
              <>
                {/* Correct Answer Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Correct Answer *
                  </label>
                  <textarea
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="Enter the correct answer and explanation (e.g., 'A - expand. The sentence requires a verb in base form...')"
                    className="input-field h-24 resize-none"
                    required
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    💡 Include both the answer choice and explanation to help with future review
                  </div>
                </div>

                {/* Question Details Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type:
                      </label>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <select
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            className="input-field flex-1"
                          >
                            {questionTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setShowAddType(!showAddType)}
                            className="btn-secondary px-3 py-2 flex items-center space-x-1"
                            title="Add new question type"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                        
                        {showAddType && (
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
                              type="button"
                              onClick={handleAddType}
                              className="btn-primary px-3 py-2"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddType(false)
                                setNewType('')
                              }}
                              className="btn-secondary px-3 py-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Why did you get this wrong?
                      </label>
                      <select
                        value={mistakeReason}
                        onChange={(e) => setMistakeReason(e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">Select reason...</option>
                        <option value="vocabulary">Didn't know vocabulary</option>
                        <option value="grammar">Grammar confusion</option>
                        <option value="time-pressure">Time pressure</option>
                        <option value="misread">Misread the question</option>
                        <option value="careless">Careless mistake</option>
                        <option value="pattern">Unfamiliar pattern</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional):
                    </label>
                    <textarea
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      placeholder="Add any notes about this question, what you learned, etc..."
                      className="input-field h-24 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !questionText.trim() || !mistakeReason || !correctAnswer.trim()}
                    className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Save to Mistake Book 📚</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="card bg-gradient-to-r from-secondary-50 to-primary-50 border-secondary-200">
        <h3 className="text-lg font-semibold text-primary-800 mb-3 flex items-center">
          💡 Tips for Better Input Results
        </h3>
        <ul className="space-y-2 text-primary-700">
          <li className="flex items-start space-x-2">
            <span>📸</span>
            <span>For images: Use clear, well-lit photos with good contrast</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>🎤</span>
            <span>For speech: Speak clearly - text accumulates so you can pause between sentences</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>✏️</span>
            <span>All text is editable - fix any mistakes from OCR or speech recognition</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>🌐</span>
            <span>Speech recognition requires internet connection - check your network if errors occur</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>🔄</span>
            <span>Use the retry button if speech recognition fails</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Upload 