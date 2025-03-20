import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaTemperatureHigh, FaWind, FaTint, FaCompress, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

const AirQuality = ({ theme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [airData, setAirData] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Parse query parameters for lat/lon if available
  const queryParams = new URLSearchParams(location.search);
  const lat = queryParams.get('lat');
  const lon = queryParams.get('lon');
  const placeName = queryParams.get('place');

  const getAqiColor = (aqi) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-900';
  };

  const getAqiLevel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getWeatherIcon = (icon) => {
    switch(icon) {
      case '01d': return '☀️';
      case '01n': return '🌙';
      case '02d': case '02n': return '⛅';
      case '03d': case '03n': return '☁️';
      case '04d': case '04n': return '☁️';
      case '09d': case '09n': return '🌧️';
      case '10d': case '10n': return '🌦️';
      case '11d': case '11n': return '⛈️';
      case '13d': case '13n': return '❄️';
      case '50d': case '50n': return '🌫️';
      default: return '☁️';
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get coordinates using OpenStreetMap Nominatim API
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
      
      // Fetch air quality data for these coordinates
      await fetchAirQualityData(lat, lon);
      
      // Update the URL without reloading
      const url = new URL(window.location);
      url.searchParams.set('lat', lat);
      url.searchParams.set('lon', lon);
      url.searchParams.set('place', searchQuery);
      window.history.pushState({}, '', url);
      
      setSearchQuery('');
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAirQualityData = async (latitude, longitude) => {
    try {
      setLoading(true);
      
      // Build the API URL based on whether coordinates are provided
      let apiUrl = 'https://api.airvisual.com/v2/nearest_city?key=7b81d64b-eed1-4b4c-9706-5358994490ba';
      
      if (latitude && longitude) {
        apiUrl = `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=7b81d64b-eed1-4b4c-9706-5358994490ba`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch air quality data');
      }
      
      const data = await response.json();
      setAirData(data);
      setLoading(false);
      
      // Start animations after data is loaded
      setTimeout(() => {
        setAnimate(true);
      }, 300);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const navigateToRecommendations = () => {
    navigate('/recommend', { state: { airData } });
  };

  const navigateToForecast = async () => {
    // Get coordinates from URL parameters first
    const url = new URL(window.location.href);
    const urlLat = url.searchParams.get("lat");
    const urlLon = url.searchParams.get("lon");
    
    console.log("Latitude:", urlLat, "Longitude:", urlLon);
    
    

    console.log("urlLat, urlLon", urlLat, urlLon);


    const lat = urlLat || "19.0760";
    const lon = urlLon || "72.8777";
    
    // Pass both the airData and explicit coordinates
    navigate(`/forecast?lat=${lat}&lon=${lon}`, { 
      state: { 
        airData,
        coordinates: {
          lat,
          lon
        }
      } 
    });
  };

  useEffect(() => {
    // If lat and lon are in URL, use them, otherwise fetch for current location
    if (lat && lon) {
      fetchAirQualityData(lat, lon);
    } else {
      fetchAirQualityData();
    }
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${theme === 'dark' ? 'border-green-400' : 'border-green-600'}`}></div>
          <p className="text-lg">Loading air quality data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center max-w-md mx-auto p-6 rounded-xl bg-red-100 dark:bg-red-900/30">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm opacity-80">Please try again later or search for a different location.</p>
          
          {/* Search form for error state */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Try another location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 rounded-l-lg border-r-0 focus:outline-none"
              />
              <button 
                type="submit" 
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-r-lg"
              >
                <FaSearch />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (airData) {
    return (
      <div className="min-h-screen pt-16">
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Location search form */}
              <div className="mb-8">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder="Search for a location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full py-3 px-4 pr-10 rounded-lg text-sm ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-white text-gray-800 border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-green-500`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <FaMapMarkerAlt className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className={`py-3 px-6 rounded-lg font-medium ${
                      theme === 'dark' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    } transition-all`}
                  >
                    Check Air Quality
                  </button>
                </form>
              </div>
              
              {/* Search result indicator */}
              {placeName && (
                <div className={`mb-6 p-3 rounded-lg text-center ${
                  theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}>
                  <p>Showing results for: <strong>{placeName}</strong></p>
                </div>
              )}

              <div 
                className={`rounded-xl overflow-hidden shadow-xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } transition-all duration-500 transform ${
                  animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                    <div className="mb-4 md:mb-0">
                      <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FaMapMarkerAlt className={theme === 'dark' ? 'text-red-400' : 'text-red-500'} />
                        {airData.data.city}, {airData.data.state}, {airData.data.country}
                      </h1>
                      <p className="text-sm opacity-80 mt-1">
                        Last updated: {new Date(airData.data.current.pollution.ts).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AQI Card */}
                    <div 
                      className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} transition-all duration-300 transform hover:scale-105`}
                    >
                      <h3 className="text-xl font-semibold mb-4">Air Quality Index</h3>
                      <div className="flex items-center space-x-6">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl ${getAqiColor(airData.data.current.pollution.aqius)}`}>
                          {airData.data.current.pollution.aqius}
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{getAqiLevel(airData.data.current.pollution.aqius)}</p>
                          <p className="text-sm opacity-80">
                            {airData.data.current.pollution.aqius <= 50 
                              ? "Air quality is satisfactory, and air pollution poses little or no risk."
                              : airData.data.current.pollution.aqius <= 100
                                ? "Air quality is acceptable. However, some pollutants may be a concern for a small number of people."
                                : airData.data.current.pollution.aqius <= 150
                                  ? "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
                                  : airData.data.current.pollution.aqius <= 200
                                    ? "Some members of the general public may experience health effects; members of sensitive groups may experience more serious effects."
                                    : airData.data.current.pollution.aqius <= 300
                                      ? "Health alert: The risk of health effects is increased for everyone."
                                      : "Health warning of emergency conditions: everyone is more likely to be affected."
                            }
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm">
                          <span className="font-semibold">Main Pollutant:</span> {airData.data.current.pollution.mainus}
                        </p>
                       
                      </div>
                    </div>

                    {/* Weather Card */}
                    <div 
                      className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} transition-all duration-300 transform hover:scale-105`}
                    >
                      <h3 className="text-xl font-semibold mb-4">Weather Conditions</h3>
                      <div className="flex justify-between">
                        <div>
                          <div className="text-4xl font-bold">
                            {airData.data.current.weather.tp}°C
                          </div>
                          <div className="flex items-center mt-2">
                            <span className="text-3xl mr-2">
                              {getWeatherIcon(airData.data.current.weather.ic)}
                            </span>
                            <span>
                              {airData.data.current.weather.ic.includes('d') ? 'Day' : 'Night'}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <FaTint className="mr-2 text-blue-500" />
                            <span>{airData.data.current.weather.hu}% Humidity</span>
                          </div>
                          <div className="flex items-center">
                            <FaWind className="mr-2 text-gray-500" />
                            <span>{airData.data.current.weather.ws} m/s</span>
                          </div>
                          <div className="flex items-center">
                            <FaCompress className="mr-2 text-purple-500" />
                            <span>{airData.data.current.weather.pr} hPa</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Section */}
                  <div 
                    className={`mt-6 p-6 rounded-xl ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} transition-all duration-500 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  >
                    <h3 className="text-xl font-semibold mb-3">Health Recommendations</h3>
                    <p>
                      {airData.data.current.pollution.aqius <= 50 
                        ? "Air quality is good. It's a great day for outdoor activities!"
                        : airData.data.current.pollution.aqius <= 100
                          ? "Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion."
                          : airData.data.current.pollution.aqius <= 150
                            ? "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
                            : airData.data.current.pollution.aqius <= 200
                              ? "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects."
                              : airData.data.current.pollution.aqius <= 300
                                ? "Health alert: The risk of health effects is increased for everyone. Avoid outdoor activities."
                                : "Health warning of emergency conditions: everyone is more likely to be affected. Stay indoors and keep windows closed."
                      }
                    </p>
                    
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4">
                      <button
                        onClick={navigateToRecommendations}
                        className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                          theme === 'dark' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        Get Detailed Recommendations
                      </button>
                      
                      <button
                        onClick={navigateToForecast}
                        className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                          theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        View Pollution Forecast
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
};

export default AirQuality; 