import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Upload from './pages/Upload'
import MistakeBook from './pages/MistakeBook'
import VocabularyBook from './pages/VocabularyBook'
import Settings from './pages/Settings'
import { StudyProvider } from './context/StudyContext'

function App() {
  return (
    <StudyProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/mistakes" element={<MistakeBook />} />
            <Route path="/vocabulary" element={<VocabularyBook />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </StudyProvider>
  )
}

export default App 