import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaLeaf, FaSearch, FaSpinner } from 'react-icons/fa';

const Navbar = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Step 1: Get coordinates using OpenStreetMap Nominatim API
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      
      if (!geocodeResponse.ok) {
        throw new Error('Failed to get location coordinates');
      }
      
      const places = await geocodeResponse.json();
      
      if (places.length === 0) {
        throw new Error('Location not found. Please try a different place name.');
      }
      
      const { lat, lon } = places[0];
      
      // Step 2: Navigate to air quality page with coordinates as query parameters
      navigate(`/air-quality?lat=${lat}&lon=${lon}&place=${encodeURIComponent(searchQuery)}`);
      
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
      setSearchQuery('');
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled ? 
          (theme === 'dark' ? 'bg-gray-800 shadow-lg shadow-gray-700/20' : 'bg-white shadow-lg') 
        : (theme === 'dark' ? 'bg-transparent' : 'bg-transparent')
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">
              <FaLeaf className={`inline-block ${theme === 'dark' ? 'text-green-400' : 'text-green-500'} animate-pulse`} />
            </span>
            <span className="font-bold text-xl tracking-tight transition-all">
              <span className={`${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>AirHealth</span>
              <span className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Monitor</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`py-1 px-3 pr-10 rounded-full text-sm focus:outline-none focus:ring-2 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 text-white focus:ring-green-500 border-gray-600' 
                      : 'bg-gray-100 text-gray-800 focus:ring-green-400 border-gray-200'
                  } border transition-all`}
                />
                <button 
                  type="submit" 
                  className={`absolute right-2 p-1 rounded-full ${
                    theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'
                  }`}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSearch />
                  )}
                </button>
              </div>
              {searchError && (
                <div className="absolute left-0 right-0 mt-1 p-2 text-xs text-white bg-red-500 rounded">
                  {searchError}
                </div>
              )}
            </form>
            
            <Link 
              to="/" 
              className={`transition-all duration-300 hover:text-green-500 ${
                location.pathname === '/' ? 
                  (theme === 'dark' ? 'text-green-400' : 'text-green-600') : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/air-quality" 
              className={`transition-all duration-300 hover:text-green-500 ${
                location.pathname === '/air-quality' ? 
                  (theme === 'dark' ? 'text-green-400' : 'text-green-600') : ''
              }`}
            >
              Air Quality
            </Link>
            <button 
              onClick={toggleTheme}
              className="rounded-full p-2 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FaSun className="text-yellow-300 hover:text-yellow-200 animate-spin-slow" />
              ) : (
                <FaMoon className="text-gray-700 hover:text-gray-500 animate-bounce-slow" />
              )}
            </button>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleTheme} 
              className="mr-4"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FaSun className="text-yellow-300" />
              ) : (
                <FaMoon className="text-gray-700" />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'h-auto opacity-100' : 'h-0 opacity-0 invisible'}`}>
        <div className={`px-4 py-3 space-y-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Mobile Search Form */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2 px-4 pr-10 rounded-full text-sm focus:outline-none focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-white focus:ring-green-500 border-gray-600' 
                    : 'bg-gray-100 text-gray-800 focus:ring-green-400 border-gray-200'
                } border transition-all`}
              />
              <button 
                type="submit" 
                className={`absolute right-3 p-1 rounded-full ${
                  theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-500'
                }`}
                disabled={isSearching}
              >
                {isSearching ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSearch />
                )}
              </button>
            </div>
            {searchError && (
              <div className="mt-1 p-2 text-xs text-white bg-red-500 rounded">
                {searchError}
              </div>
            )}
          </form>
          
          <Link
            to="/"
            className={`block transition-all duration-300 hover:text-green-500 ${
              location.pathname === '/' ? 
                (theme === 'dark' ? 'text-green-400' : 'text-green-600') : ''
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/air-quality"
            className={`block transition-all duration-300 hover:text-green-500 ${
              location.pathname === '/air-quality' ? 
                (theme === 'dark' ? 'text-green-400' : 'text-green-600') : ''
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Air Quality
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 