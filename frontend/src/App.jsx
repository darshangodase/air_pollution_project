import Recommend from './Recommend'
import Forecast from './Forecast'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import AirQuality from './pages/AirQuality'
import AQIInformationDashboard from './components/Importance'
import './App.css'

function App() {
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme) 
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Router>
      <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 pt-16">
          <Routes>
            <Route path="/" element={<Home theme={theme} />} />
            <Route path="/air-quality" element={<AirQuality theme={theme} />} />
            <Route path="/recommend" element={<Recommend theme={theme} />} />
            <Route path="/forecast" element={<Forecast theme={theme} />} />
            <Route path="/importance" element={<AQIInformationDashboard theme={theme} />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
