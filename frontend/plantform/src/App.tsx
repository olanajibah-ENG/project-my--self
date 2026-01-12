import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<div className="p-8"><h1 className="text-3xl font-bold text-brand-600">OlaLearn</h1><p className="mt-2 text-gray-600">Coming soon...</p></div>} />
      </Routes>
    </div>
  )
}

export default App
