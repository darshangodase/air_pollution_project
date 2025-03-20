import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaChartLine, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';

function Forecast({ theme }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('hourly');
  const location = useLocation();
  const airData = location.state?.airData;

  useEffect(() => {
    async function fetchForecastData() {
      if (!airData) {
        setError("No location data provided. Please go back and try again.");
        setLoading(false);
        return;
      }

      try {
        console.log('Air data received:', airData);
        
        // Extract coordinates from airData (handling multiple possible structures)
        let lat, lon;
        
        // Check for URL params first (these might be passed from AirQuality.jsx)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLat = urlParams.get('lat');
        const urlLon = urlParams.get('lon');
        
        if (urlLat && urlLon) {
          lat = urlLat;
          lon = urlLon;
        }
        // Handle the specific structure from IQAir API
        else if (airData?.data?.current) {
          // Try to get from URL parameters in AirQuality page
          const queryParams = new URLSearchParams(location.search);
          const paramLat = queryParams.get('lat');
          const paramLon = queryParams.get('lon');
          
          if (paramLat && paramLon) {
            lat = paramLat;
            lon = paramLon;
          }
          // Extract directly from location state if available
          else if (location.state && location.state.coordinates) {
            lat = location.state.coordinates.lat;
            lon = location.state.coordinates.lon;
          }
          // Fallback for Mumbai coordinates as a last resort
          else {
            console.log('Using fallback coordinates for Mumbai');
            lat = 19.0760;
            lon = 72.8777;
          }
        }
        // If we still don't have coordinates, use Mumbai as default
        if (!lat || !lon) {
          console.log('Using default coordinates for Mumbai');
          lat = 19.0760;
          lon = 72.8777;
        }
        
        console.log('Using coordinates:', lat, lon);
        
        // Use OpenWeatherMap API for detailed pollutant forecasts
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=854565a612835d02b77ba54949cd7b35`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch forecast data');
        }

        const data = await response.json();
        console.log('Forecast data:', data);
        setForecastData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching forecast data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchForecastData();
  }, [airData, location.state]);

  // Helper function to get pollutant level classification
  const getPollutantLevel = (pollutant, value) => {
    const levels = {
      pm2_5: [
        { max: 12, level: 'Good', color: 'bg-green-500' },
        { max: 35.4, level: 'Moderate', color: 'bg-yellow-500' },
        { max: 55.4, level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500' },
        { max: 150.4, level: 'Unhealthy', color: 'bg-red-500' },
        { max: 250.4, level: 'Very Unhealthy', color: 'bg-purple-500' },
        { max: Infinity, level: 'Hazardous', color: 'bg-red-900' },
      ],
      pm10: [
        { max: 54, level: 'Good', color: 'bg-green-500' },
        { max: 154, level: 'Moderate', color: 'bg-yellow-500' },
        { max: 254, level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500' },
        { max: 354, level: 'Unhealthy', color: 'bg-red-500' },
        { max: 424, level: 'Very Unhealthy', color: 'bg-purple-500' },
        { max: Infinity, level: 'Hazardous', color: 'bg-red-900' },
      ],
      o3: [
        { max: 54, level: 'Good', color: 'bg-green-500' },
        { max: 124, level: 'Moderate', color: 'bg-yellow-500' },
        { max: 164, level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500' },
        { max: 204, level: 'Unhealthy', color: 'bg-red-500' },
        { max: 404, level: 'Very Unhealthy', color: 'bg-purple-500' },
        { max: Infinity, level: 'Hazardous', color: 'bg-red-900' },
      ],
      // Default thresholds for other pollutants
      default: [
        { max: 50, level: 'Good', color: 'bg-green-500' },
        { max: 100, level: 'Moderate', color: 'bg-yellow-500' },
        { max: 150, level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500' },
        { max: 200, level: 'Unhealthy', color: 'bg-red-500' },
        { max: 300, level: 'Very Unhealthy', color: 'bg-purple-500' },
        { max: Infinity, level: 'Hazardous', color: 'bg-red-900' },
      ]
    };

    const thresholds = levels[pollutant] || levels.default;
    const result = thresholds.find(t => value <= t.max);
    return result;
  };

  // Get AQI text and color from numerical value
  const getAqiInfo = (aqi) => {
    switch(aqi) {
      case 1: return { text: 'Good', color: 'bg-green-500' };
      case 2: return { text: 'Fair', color: 'bg-lime-500' };
      case 3: return { text: 'Moderate', color: 'bg-yellow-500' };
      case 4: return { text: 'Poor', color: 'bg-orange-500' };
      case 5: return { text: 'Very Poor', color: 'bg-red-500' };
      default: return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  // Group forecast by days
  const groupByDay = (list) => {
    const days = {};
    
    list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString();
      
      if (!days[dayKey]) {
        days[dayKey] = [];
      }
      
      days[dayKey].push(item);
    });
    
    return Object.entries(days).map(([day, items]) => {
      // Calculate average AQI for the day
      const avgAqi = Math.round(items.reduce((sum, item) => sum + item.main.aqi, 0) / items.length);
      
      // Calculate max values for each pollutant
      const maxValues = {};
      const pollutants = ['pm2_5', 'pm10', 'o3', 'no2', 'so2', 'co'];
      
      pollutants.forEach(pollutant => {
        maxValues[pollutant] = Math.max(...items.map(item => item.components[pollutant]));
      });
      
      return {
        day,
        date: new Date(items[0].dt * 1000),
        avgAqi,
        maxValues,
        items
      };
    });
  };

  // Function to format the date in a readable way
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to format time (hourly view)
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`pt-16 min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center">
            <Link 
              to="/air-quality" 
              className={`flex items-center mr-4 px-3 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
              } transition-colors`}
            >
              <FaArrowLeft className="mr-2" />
              <span>Back to Air Quality</span>
            </Link>
            <h1 className="text-3xl font-bold">Air Pollution Forecast</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4 ${
                theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
              <p className="text-lg">Loading forecast data...</p>
            </div>
          ) : error ? (
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'} mb-6`}>
              <FaExclamationTriangle className={`text-3xl mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error}</p>
            </div>
          ) : forecastData ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`p-6 rounded-xl shadow-md mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <FaChartLine className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                  Forecast for {airData.data.city}, {airData.data.country}
                </h2>

                {/* Tab Navigation */}
                <div className="flex border-b mb-6">
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'hourly' 
                        ? theme === 'dark' 
                          ? 'border-b-2 border-blue-400 text-blue-400' 
                          : 'border-b-2 border-blue-500 text-blue-600'
                        : ''
                    }`}
                    onClick={() => setActiveTab('hourly')}
                  >
                    Hourly Forecast
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'daily' 
                        ? theme === 'dark' 
                          ? 'border-b-2 border-blue-400 text-blue-400' 
                          : 'border-b-2 border-blue-500 text-blue-600'
                        : ''
                    }`}
                    onClick={() => setActiveTab('daily')}
                  >
                    Daily Summary
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'pollutants' 
                        ? theme === 'dark' 
                          ? 'border-b-2 border-blue-400 text-blue-400' 
                          : 'border-b-2 border-blue-500 text-blue-600'
                        : ''
                    }`}
                    onClick={() => setActiveTab('pollutants')}
                  >
                    Pollutant Trends
                  </button>
                </div>

                {/* Hourly Forecast View */}
                {activeTab === 'hourly' && (
                  <div>
                    <div className="overflow-x-auto">
                      <table className={`min-w-full ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                        <thead>
                          <tr className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}>
                            <th className="px-4 py-2 text-left">Time</th>
                            <th className="px-4 py-2 text-left">AQI</th>
                            <th className="px-4 py-2 text-left">PM2.5</th>
                            <th className="px-4 py-2 text-left">PM10</th>
                            <th className="px-4 py-2 text-left">O3</th>
                            <th className="px-4 py-2 text-left">NO2</th>
                            <th className="px-4 py-2 text-left">SO2</th>
                            <th className="px-4 py-2 text-left">CO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {forecastData.list.slice(0, 24).map((item, index) => {
                            const aqiInfo = getAqiInfo(item.main.aqi);
                            return (
                              <tr key={index} className={index % 2 === 0 ? (theme === 'dark' ? 'bg-gray-800' : 'bg-white') : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
                                <td className="px-4 py-3 border-b border-gray-700">{formatTime(item.dt)}</td>
                                <td className="px-4 py-3 border-b border-gray-700">
                                  <span className={`px-2 py-1 rounded-full text-xs text-white ${aqiInfo.color}`}>
                                    {aqiInfo.text}
                                  </span>
                                </td>
                                <td className="px-4 py-3 border-b border-gray-700">{item.components.pm2_5.toFixed(1)}</td>
                                <td className="px-4 py-3 border-b border-gray-700">{item.components.pm10.toFixed(1)}</td>
                                <td className="px-4 py-3 border-b border-gray-700">{item.components.o3.toFixed(1)}</td>
                                <td className="px-4 py-3 border-b border-gray-700">{item.components.no2.toFixed(1)}</td>
                                <td className="px-4 py-3 border-b border-gray-700">{item.components.so2.toFixed(1)}</td>
                                <td className="px-4 py-3 border-b border-gray-700">{item.components.co.toFixed(1)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4 text-sm opacity-70">Showing next 24 hours of forecast data</p>
                  </div>
                )}

                {/* Daily Summary View */}
                {activeTab === 'daily' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupByDay(forecastData.list).map((day, index) => {
                      const aqiInfo = getAqiInfo(day.avgAqi);
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg">{formatDate(day.date)}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs text-white ${aqiInfo.color}`}>
                              {aqiInfo.text}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>PM2.5:</span>
                              <span className="font-medium">{day.maxValues.pm2_5.toFixed(1)} µg/m³</span>
                            </div>
                            <div className="flex justify-between">
                              <span>PM10:</span>
                              <span className="font-medium">{day.maxValues.pm10.toFixed(1)} µg/m³</span>
                            </div>
                            <div className="flex justify-between">
                              <span>O3:</span>
                              <span className="font-medium">{day.maxValues.o3.toFixed(1)} µg/m³</span>
                            </div>
                            <div className="flex justify-between">
                              <span>NO2:</span>
                              <span className="font-medium">{day.maxValues.no2.toFixed(1)} µg/m³</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-600">
                            <p className="text-sm">
                              {day.avgAqi <= 2 
                                ? "Air quality is good. A great day for outdoor activities." 
                                : day.avgAqi === 3
                                  ? "Air quality is moderate. Consider reducing prolonged outdoor activities if sensitive."
                                  : day.avgAqi === 4
                                    ? "Poor air quality. Limit outdoor activities, especially for sensitive groups."
                                    : "Very poor air quality. Avoid outdoor activities when possible."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pollutant Trends View */}
                {activeTab === 'pollutants' && (
                  <div>
                    {/* Simple visualization for each pollutant */}
                    <div className="space-y-6">
                      {['pm2_5', 'pm10', 'o3', 'no2', 'so2', 'co'].map((pollutant) => (
                        <div key={pollutant} className="mb-6">
                          <h3 className="font-semibold mb-2 capitalize">{pollutant.replace('_', '.')}</h3>
                          <div className="relative h-10 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                            <div className="flex h-full">
                              {forecastData.list.slice(0, 24).map((item, index) => {
                                const value = item.components[pollutant];
                                const levelInfo = getPollutantLevel(pollutant, value);
                                return (
                                  <div 
                                    key={index}
                                    className={`h-full flex-1 ${levelInfo.color} border-r border-opacity-20 border-white`}
                                    title={`${formatTime(item.dt)}: ${value.toFixed(1)} - ${levelInfo.level}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                          {/* Legend */}
                          <div className="flex text-xs mt-1 justify-between">
                            <span>Now</span>
                            <span>+24h</span>
                          </div>
                          <div className="flex mt-2 text-xs">
                            <div className="flex items-center mr-2">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                              <span>Good</span>
                            </div>
                            <div className="flex items-center mr-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                              <span>Moderate</span>
                            </div>
                            <div className="flex items-center mr-2">
                              <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                              <span>Unhealthy</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                              <span>Very Unhealthy</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Forecast Explanation */}
              <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  About This Forecast
                </h3>
                <p className="mb-3">
                  This forecast uses data from OpenWeatherMap's Air Pollution API to predict air quality conditions for the coming days.
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>AQI Levels:</strong> 1 (Good), 2 (Fair), 3 (Moderate), 4 (Poor), 5 (Very Poor)</p>
                  <p><strong>PM2.5 & PM10:</strong> Fine particulate matter, measured in µg/m³</p>
                  <p><strong>O3:</strong> Ozone, µg/m³</p>
                  <p><strong>NO2:</strong> Nitrogen dioxide, µg/m³</p>
                  <p><strong>SO2:</strong> Sulfur dioxide, µg/m³</p>
                  <p><strong>CO:</strong> Carbon monoxide, µg/m³</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <p>No forecast data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Forecast; 