import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSun, FaMoon, FaLeaf, FaWind } from 'react-icons/fa';

const Navbar = ({ theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
          <div className="hidden md:flex items-center space-x-8">
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