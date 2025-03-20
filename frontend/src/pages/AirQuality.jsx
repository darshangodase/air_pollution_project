import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaTemperatureHigh, FaWind, FaTint, FaCompress, FaExclamationTriangle } from 'react-icons/fa';

const AirQuality = ({ theme }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [airData, setAirData] = useState(null);
  const [animate, setAnimate] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.airvisual.com/v2/nearest_city?key=7b81d64b-eed1-4b4c-9706-5358994490ba');
        
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

    fetchData();
  }, []);

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
        <div className={`max-w-xl p-6 rounded-lg text-center ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'}`}>
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div 
            className={`transition-all duration-1000 transform ${
              animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Real-time</span> Air Quality
            </h1>
            <p className="text-center max-w-3xl mx-auto mb-12">
              Current air quality and weather conditions for your location. Data is updated hourly to provide you with the most accurate information.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {airData && (
              <div 
                className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-1000 transform ${
                  animate ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                } ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
              >
                {/* Location Header */}
                <div className={`p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className={`text-2xl mr-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                      <div>
                        <h2 className="text-2xl font-bold">{airData.data.city}</h2>
                        <p>{airData.data.state}, {airData.data.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-70">Last Updated</p>
                      <p>{new Date(airData.data.current.pollution.ts).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* AQI Card */}
                    <div 
                      className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} transition-all duration-300 transform hover:scale-105`}
                    >
                      <h3 className="text-xl font-semibold mb-4">Air Quality Index</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className={`text-4xl font-bold ${
                            airData.data.current.pollution.aqius <= 50 ? 'text-green-500' :
                            airData.data.current.pollution.aqius <= 100 ? 'text-yellow-500' :
                            airData.data.current.pollution.aqius <= 150 ? 'text-orange-500' :
                            airData.data.current.pollution.aqius <= 200 ? 'text-red-500' :
                            airData.data.current.pollution.aqius <= 300 ? 'text-purple-500' : 'text-red-900'
                          }`}>
                            {airData.data.current.pollution.aqius}
                          </div>
                          <p className="mt-1">{getAqiLevel(airData.data.current.pollution.aqius)}</p>
                          <p className="text-sm opacity-70 mt-3">Main Pollutant: {airData.data.current.pollution.mainus}</p>
                        </div>
                        <div className="w-24 h-24 rounded-full flex items-center justify-center" 
                          style={{
                            background: `conic-gradient(${getAqiColor(airData.data.current.pollution.aqius)} ${Math.min(airData.data.current.pollution.aqius / 3, 100)}%, transparent 0%)`
                          }}
                        >
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <span className="text-lg font-semibold">AQI</span>
                          </div>
                        </div>
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AirQuality; 