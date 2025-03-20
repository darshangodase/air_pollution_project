import { useState, useEffect } from 'react';
import { AlertTriangle, Wind, Droplets, ThermometerSun, Info, MapPin, Thermometer, Compass } from 'lucide-react';

export default function AQIInformationDashboard() {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchAQIData();
  }, []);

  const fetchAQIData = async () => {
    setLoading(true);
    try {
      // Using the AirVisual API with the provided key
      const response = await fetch(
        `https://api.airvisual.com/v2/nearest_city?key=7b81d64b-eed1-4b4c-9706-5358994490ba`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch AQI data');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        setAqiData(data.data);
        setError(null);
      } else {
        throw new Error('API returned unsuccessful status');
      }
    } catch (err) {
      setError('Failed to fetch real-time AQI data. Using sample data instead.');
      // Sample data as fallback based on the structure you provided
      setAqiData({
        city: "Pune",
        country: "India",
        state: "Maharashtra",
        location: {
          type: 'Point',
          coordinates: [73.8553, 18.5196]  // Longitude, Latitude
        },
        current: {
          pollution: {
            ts: "2023-04-01T12:00:00.000Z",
            aqius: 85,  // AQI value for US standard
            mainus: "p2",  // Main pollutant for US standard
            aqicn: 36,  // AQI value for China standard
            maincn: "p2"  // Main pollutant for China standard
          },
          weather: {
            ts: "2023-04-01T12:00:00.000Z",
            tp: 28,  // Temperature in Celsius
            pr: 1015,  // Atmospheric pressure in hPa
            hu: 45,  // Humidity %
            ws: 2.5,  // Wind speed (m/s)
            wd: 90,  // Wind direction (degrees)
            ic: "01d"  // Weather icon code
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) {
      return { level: 'Good', color: 'bg-green-500', range: '0-50', impact: 'Air quality is considered satisfactory, and air pollution poses little or no risk.' };
    } else if (aqi <= 100) {
      return { level: 'Moderate', color: 'bg-yellow-400', range: '51-100', impact: 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people.' };
    } else if (aqi <= 150) {
      return { level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-400', range: '101-150', impact: 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.' };
    } else if (aqi <= 200) {
      return { level: 'Unhealthy', color: 'bg-red-500', range: '151-200', impact: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.' };
    } else if (aqi <= 300) {
      return { level: 'Very Unhealthy', color: 'bg-purple-600', range: '201-300', impact: 'Health warnings of emergency conditions. The entire population is more likely to be affected.' };
    } else {
      return { level: 'Hazardous', color: 'bg-red-900', range: '301+', impact: 'Health alert: everyone may experience more serious health effects.' };
    }
  };

  const getPollutantName = (code) => {
    const pollutants = {
      'p1': 'PM10',
      'p2': 'PM2.5',
      'o3': 'Ozone (O₃)',
      'n2': 'Nitrogen Dioxide (NO₂)',
      's2': 'Sulfur Dioxide (SO₂)',
      'co': 'Carbon Monoxide (CO)'
    };
    return pollutants[code] || code;
  };

  const pollutantInfo = {
    'PM2.5': {
      name: 'Particulate Matter (PM2.5)',
      description: 'Fine inhalable particles with diameters 2.5 micrometers and smaller.',
      standards: 'Safe level: < 12 μg/m³ (annual mean)',
      effects: 'Can penetrate deep into lungs and bloodstream, causing serious health problems.',
      sources: 'Combustion processes, vehicle emissions, industrial activities, dust.'
    },
    'PM10': {
      name: 'Particulate Matter (PM10)',
      description: 'Inhalable particles with diameters 10 micrometers and smaller.',
      standards: 'Safe level: < 50 μg/m³ (24-hour average)',
      effects: 'Can cause respiratory issues, aggravate asthma, and contribute to heart disease.',
      sources: 'Dust, construction, agriculture, road debris, and some combustion processes.'
    },
    'Ozone (O₃)': {
      name: 'Ozone (O₃)',
      description: 'A gas composed of three oxygen atoms. Ground-level ozone is harmful, unlike stratospheric ozone.',
      standards: 'Safe level: < 70 ppb (8-hour average)',
      effects: 'Triggers asthma, reduces lung function, causes respiratory inflammation.',
      sources: 'Formed by reaction of pollutants (NOx and VOCs) in sunlight.'
    },
    'Nitrogen Dioxide (NO₂)': {
      name: 'Nitrogen Dioxide (NO₂)',
      description: 'A reddish-brown gas with a sharp odor that is a major air pollutant.',
      standards: 'Safe level: < 53 ppb (annual mean)',
      effects: 'Irritates airways, aggravates respiratory conditions, contributes to ozone formation.',
      sources: 'Vehicle emissions, power plants, industrial boilers.'
    },
    'Sulfur Dioxide (SO₂)': {
      name: 'Sulfur Dioxide (SO₂)',
      description: 'A colorless gas with a sharp, pungent odor.',
      standards: 'Safe level: < 75 ppb (1-hour average)',
      effects: 'Respiratory irritant, can trigger asthma, contributes to particle formation.',
      sources: 'Fossil fuel combustion, industrial processes, volcanoes.'
    },
    'Carbon Monoxide (CO)': {
      name: 'Carbon Monoxide (CO)',
      description: 'A colorless, odorless gas that can be harmful when inhaled in large amounts. CO is released when something is burned.',
      standards: 'Safe level: < 9 ppm (8-hour average)',
      effects: 'Reduces oxygen delivery to organs. Can cause headache, dizziness, and at high levels, death.',
      sources: 'Vehicle exhaust, fuel combustion, industrial processes, and wildfires.'
    }
  };

  const getWeatherIcon = (iconCode) => {
    const icons = {
      '01d': '☀️', // Clear sky (day)
      '01n': '🌙', // Clear sky (night)
      '02d': '⛅', // Few clouds (day)
      '02n': '☁️', // Few clouds (night)
      '03d': '☁️', // Scattered clouds (day)
      '03n': '☁️', // Scattered clouds (night)
      '04d': '☁️', // Broken clouds (day)
      '04n': '☁️', // Broken clouds (night)
      '09d': '🌧️', // Shower rain (day)
      '09n': '🌧️', // Shower rain (night)
      '10d': '🌦️', // Rain (day)
      '10n': '🌧️', // Rain (night)
      '11d': '⛈️', // Thunderstorm (day)
      '11n': '⛈️', // Thunderstorm (night)
      '13d': '❄️', // Snow (day)
      '13n': '❄️', // Snow (night)
      '50d': '🌫️', // Mist (day)
      '50n': '🌫️', // Mist (night)
    };
    return icons[iconCode] || '🌤️';
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2">Loading AQI data...</p>
          </div>
        </div>
      );
    }

    if (error && !aqiData) {
      return (
        <div className="p-4 border border-red-300 rounded-md bg-red-50">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'overview') {
      const aqiValue = aqiData?.current?.pollution?.aqius || 0;
      const aqiInfo = getAQILevel(aqiValue);
      const mainPollutant = getPollutantName(aqiData?.current?.pollution?.mainus || 'p2');

      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">What is Air Quality Index (AQI)?</h2>
            <p className="mb-3">The Air Quality Index (AQI) is a standardized indicator for reporting daily air quality. It tells you how clean or polluted your air is, and what associated health effects might be a concern.</p>
            <p className="mb-3">The AQI focuses on health effects you may experience within a few hours or days after breathing polluted air. EPA calculates the AQI for five major air pollutants regulated by the Clean Air Act: ground-level ozone, particle pollution, carbon monoxide, sulfur dioxide, and nitrogen dioxide.</p>
            <div className="mt-4">
              <h3 className="font-medium mb-2">AQI Scale:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                <div className="p-2 bg-green-500 text-white text-center rounded">0-50<br/>Good</div>
                <div className="p-2 bg-yellow-400 text-gray-800 text-center rounded">51-100<br/>Moderate</div>
                <div className="p-2 bg-orange-400 text-white text-center rounded">101-150<br/>Unhealthy for Sensitive Groups</div>
                <div className="p-2 bg-red-500 text-white text-center rounded">151-200<br/>Unhealthy</div>
                <div className="p-2 bg-purple-600 text-white text-center rounded">201-300<br/>Very Unhealthy</div>
                <div className="p-2 bg-red-900 text-white text-center rounded">301+<br/>Hazardous</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 border border-yellow-300 rounded-md bg-yellow-50 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-yellow-700">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-red-500 mr-2" />
                <h2 className="text-xl font-semibold">Current AQI in {aqiData?.city}, {aqiData?.state}, {aqiData?.country}</h2>
              </div>
              <button 
                onClick={fetchAQIData} 
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Air Quality</h3>
                <div className="flex items-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${aqiInfo.color} text-white text-3xl font-bold mr-4`}>
                    {aqiValue}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{aqiInfo.level}</h3>
                    <p className="text-gray-600 mb-1">AQI Range: {aqiInfo.range}</p>
                    <p className="text-gray-700 text-sm">{aqiInfo.impact}</p>
                    <p className="mt-2 text-sm font-medium">Main Pollutant: {mainPollutant}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Weather Conditions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <span className="text-3xl mr-2">{getWeatherIcon(aqiData?.current?.weather?.ic)}</span>
                    <div>
                      <p className="text-sm text-gray-600">Temperature</p>
                      <p className="font-medium">{aqiData?.current?.weather?.tp}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Droplets className="h-6 w-6 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Humidity</p>
                      <p className="font-medium">{aqiData?.current?.weather?.hu}%</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Wind className="h-6 w-6 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Wind</p>
                      <p className="font-medium">{aqiData?.current?.weather?.ws} m/s</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Compass className="h-6 w-6 text-blue-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Wind Direction</p>
                      <p className="font-medium">{getWindDirection(aqiData?.current?.weather?.wd)}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Last updated: {new Date(aqiData?.current?.weather?.ts).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-3">Health Recommendations:</h3>
              <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
                {aqiValue <= 50 && (
                  <p>Air quality is ideal for most individuals; enjoy your outdoor activities.</p>
                )}
                {aqiValue > 50 && aqiValue <= 100 && (
                  <p>Unusually sensitive people should consider reducing prolonged or heavy exertion.</p>
                )}
                {aqiValue > 100 && aqiValue <= 150 && (
                  <p>People with respiratory or heart disease, the elderly and children should limit prolonged exertion.</p>
                )}
                {aqiValue > 150 && aqiValue <= 200 && (
                  <p>People with respiratory or heart disease, the elderly and children should avoid prolonged exertion; everyone else should limit prolonged exertion.</p>
                )}
                {aqiValue > 200 && aqiValue <= 300 && (
                  <p>People with respiratory or heart disease, the elderly and children should avoid any outdoor activity; everyone else should avoid prolonged exertion.</p>
                )}
                {aqiValue > 300 && (
                  <p>Everyone should avoid all physical activities outdoors.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (activeTab === 'pollutants') {
      const mainPollutant = getPollutantName(aqiData?.current?.pollution?.mainus || 'p2');
      
      return (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Air Pollutants and Their Effects</h2>
            <p className="mb-4">Understanding the different air pollutants, their sources, and health impacts is crucial for assessing air quality and its potential risks.</p>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Current Main Pollutant: {mainPollutant}</p>
                  <p className="text-yellow-700 text-sm mt-1">The main pollutant is the substance that currently has the highest level relative to its threshold of concern.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-4">
              {Object.entries(pollutantInfo).map(([key, info]) => (
                <div key={key} className={`border-b pb-4 last:border-b-0 ${mainPollutant === key ? 'bg-yellow-50 p-3 rounded' : ''}`}>
                  <h3 className="text-lg font-medium mb-2">
                    {info.name}
                    {mainPollutant === key && (
                      <span className="ml-2 text-sm bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">Main Pollutant</span>
                    )}
                  </h3>
                  <p className="mb-2">{info.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="font-medium text-blue-800">Standard</p>
                      <p>{info.standards}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded">
                      <p className="font-medium text-red-800">Health Effects</p>
                      <p>{info.effects}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded md:col-span-2">
                      <p className="font-medium text-green-800">Sources</p>
                      <p>{info.sources}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (activeTab === 'health') {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Health Implications of Air Quality</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">Short-term Health Effects</h3>
              <p>Poor air quality can cause immediate health effects including:</p>
              <ul className="list-disc ml-5 mt-2">
                <li>Eye, nose, and throat irritation</li>
                <li>Coughing, chest tightness, and shortness of breath</li>
                <li>Worsening of existing respiratory conditions like asthma</li>
                <li>Headaches, dizziness, and fatigue</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-medium">Long-term Health Effects</h3>
              <p>Prolonged exposure to polluted air may lead to:</p>
              <ul className="list-disc ml-5 mt-2">
                <li>Reduced lung function</li>
                <li>Development of chronic respiratory diseases</li>
                <li>Increased risk of heart disease and stroke</li>
                <li>Higher risk of lung cancer</li>
                <li>Neurological effects and cognitive impairment</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-medium">Sensitive Groups</h3>
              <p>These groups are especially vulnerable to air pollution:</p>
              <ul className="list-disc ml-5 mt-2">
                <li>Children and infants</li>
                <li>Elderly people</li>
                <li>People with pre-existing heart or lung conditions</li>
                <li>Pregnant women</li>
                <li>Outdoor workers</li>
                <li>Athletes who exercise outdoors</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-medium">Protective Measures</h3>
              <p>When air quality is poor, consider these precautions:</p>
              <ul className="list-disc ml-5 mt-2">
                <li>Limit outdoor activities, especially during peak pollution hours</li>
                <li>Use air purifiers with HEPA filters indoors</li>
                <li>Keep windows and doors closed when outdoor air quality is bad</li>
                <li>Wear N95 masks when outdoors if air quality is unhealthy</li>
                <li>Stay hydrated</li>
                <li>Follow local air quality advisories and alerts</li>
              </ul>
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">AQI-based Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="bg-green-50 p-3 rounded">
                  <p className="font-medium text-green-800">Good (0-50)</p>
                  <p className="text-sm">Air quality is considered satisfactory, and air pollution poses little or no risk.</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <p className="font-medium text-yellow-800">Moderate (51-100)</p>
                  <p className="text-sm">Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people.</p>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="font-medium text-orange-800">Unhealthy for Sensitive Groups (101-150)</p>
                  <p className="text-sm">Members of sensitive groups may experience health effects. The general public is not likely to be affected.</p>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <p className="font-medium text-red-800">Unhealthy (151-200)</p>
                  <p className="text-sm">Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="font-medium text-purple-800">Very Unhealthy (201-300)</p>
                  <p className="text-sm">Health warnings of emergency conditions. The entire population is more likely to be affected.</p>
                </div>
                <div className="bg-red-100 p-3 rounded">
                  <p className="font-medium text-red-900">Hazardous (301+)</p>
                  <p className="text-sm">Health alert: everyone may experience more serious health effects.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Air Quality Information Dashboard</h1>
            <p className="text-gray-600 mt-1">Understanding AQI and its impact on health and environment</p>
          </div>
          {aqiData && (
            <div className="mt-3 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-medium">{aqiData.city}, {aqiData.state}, {aqiData.country}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-wrap mb-6 bg-white rounded-lg shadow-md overflow-hidden">
        <button
          className={`px-4 py-3 text-sm font-medium flex items-center ${
            activeTab === 'overview' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          <Info className="h-4 w-4 mr-2" />
          <span>Overview</span>
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium flex items-center ${
            activeTab === 'pollutants' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('pollutants')}
        >
          <Wind className="h-4 w-4 mr-2" />
          <span>Pollutants</span>
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium flex items-center ${
            activeTab === 'health' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('health')}
        >
          <ThermometerSun className="h-4 w-4 mr-2" />
          <span>Health Effects</span>
        </button>
      </div>

      {getTabContent()}

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Data sourced from IQAir AirVisual API</p>
        <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}