import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Groq from "groq-sdk";
import { motion } from "framer-motion";
import { FaArrowLeft, FaLeaf, FaExclamationTriangle, FaWind, FaTemperatureHigh } from "react-icons/fa";

function Recommend({ theme }) {
    const [responseData, setResponseData] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const location = useLocation();
    const airData = location.state?.airData;

    useEffect(() => {
        async function getData() {
            if (!airData) {
                setError("No air quality data provided. Please go back and try again.");
                setLoading(false);
                return;
            }

            try {
                console.log('Preparing data for recommendations...');
                
                // Extract relevant data from airData to create a prompt
                const pollution = airData.data.current.pollution;
                const weather = airData.data.current.weather;
                
                // Convert API data to the format needed for recommendations
                const promptData = {
                    "PM2.5": `${Math.round(pollution.aqius)} µg/m³`, 
                    "PM10": `${Math.round(pollution.aqicn)} µg/m³`,
                    "O3": "Not available", // API doesn't provide this directly
                    "NO2": "Not available",
                    "SO2": "Not available",
                    "CO": "Not available",
                    "NH3": "Not available",
                    "VOCs": "Not available",
                    "Pollen": "Medium", // Default value, API doesn't provide this
                    "Wind Speed": `${weather.ws} m/s`,
                    "Wind Direction": `${weather.wd}°`,
                    "Temperature": `${weather.tp}°C`,
                    "Humidity": `${weather.hu}%`,
                    "Rainfall": weather.pr > 1010 ? "No Rainfall" : "Light Rainfall", // Simple estimate
                    "Location": `${airData.data.city}, ${airData.data.country}`
                };

                // Create a prompt that includes the actual data
                const prompt = `Based on the provided air quality and weather data, generate a concise summary in JSON format. The summary should include the following fields: air_quality (rating, key_pollutants, health_advice), pollutant_levels (showing available measurements), weather_conditions (pollen, wind [speed, direction], temperature, humidity, rainfall), and suggestions (actions specific to these conditions). 

                Input data: 
                PM2.5: ${promptData["PM2.5"]}, 
                PM10: ${promptData["PM10"]}, 
                Wind Speed: ${promptData["Wind Speed"]}, 
                Wind Direction: ${promptData["Wind Direction"]}, 
                Temperature: ${promptData["Temperature"]}, 
                Humidity: ${promptData["Humidity"]},
                Location: ${promptData["Location"]}
                
                Note that some pollution data (O3, NO2, SO2, CO, NH3, VOCs) is not available from the measuring station.
                
                Format the output as a structured JSON object with the following structure: 
                {
                  "air_quality": {
                    "rating": "Good/Moderate/Unhealthy/etc.",
                    "key_pollutants": ["PM2.5", "PM10", etc.],
                    "health_advice": "Health advice text goes here."
                  },
                  "weather_conditions": {
                    "pollen": "Low/Medium/High",
                    "wind": {
                      "speed": "3 m/s",
                      "direction": "180°"
                    },
                    "temperature": "35°C",
                    "humidity": "60%",
                    "rainfall": "No Rainfall"
                  },
                  "suggestions": {
                    "actions": [
                      "Action 1",
                      "Action 2",
                      "Action 3",
                      "Action 4"
                    ]
                  }
                }
                
                Include practical health advice relevant to the current conditions and location.`;

                const groq = new Groq({
                    apiKey: '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',
                    dangerouslyAllowBrowser: true,
                });

                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    model: "llama-3.3-70b-versatile",
                });

                console.log('Data fetched successfully...');
                let response = completion.choices[0].message.content;
                console.log('Raw response:', response); // Add this for debugging

                // More robust response cleaning
                try {
                    // First, try to find JSON content between code blocks if it exists
                    const jsonRegex = /```(?:json)?([\s\S]*?)```/;
                    const match = response.match(jsonRegex);
                    
                    if (match && match[1]) {
                        // We found JSON in code blocks
                        response = match[1].trim();
                    } else {
                        // Clean common formatting issues
                        response = response.trim();
                        response = response.replace(/^```json\s*/i, '');
                        response = response.replace(/\s*```$/i, '');
                        
                        // Sometimes the model adds explanations before or after JSON
                        // Try to extract just the JSON part using braces as markers
                        if (response.includes('{') && response.includes('}')) {
                            const startIdx = response.indexOf('{');
                            let endIdx = response.lastIndexOf('}') + 1;
                            
                            // Make sure we have a complete object
                            if (startIdx >= 0 && endIdx > startIdx) {
                                response = response.substring(startIdx, endIdx);
                            }
                        }
                    }
                    
                    console.log('Cleaned response for parsing:', response);
                    
                    // Parse the cleaned response
                    const parsedResponse = JSON.parse(response); 
                    
                    // Add default values for any missing properties
                    if (!parsedResponse.air_quality) {
                        parsedResponse.air_quality = {
                            rating: "Unknown",
                            key_pollutants: ["PM2.5"],
                            health_advice: "No specific health advice available."
                        };
                    }
                    
                    if (!parsedResponse.weather_conditions) {
                        parsedResponse.weather_conditions = {
                            pollen: "Unknown",
                            wind: { speed: weather.ws + " m/s", direction: weather.wd + "°" },
                            temperature: weather.tp + "°C",
                            humidity: weather.hu + "%",
                            rainfall: "Unknown"
                        };
                    }
                    
                    if (!parsedResponse.suggestions || !parsedResponse.suggestions.actions || !Array.isArray(parsedResponse.suggestions.actions)) {
                        parsedResponse.suggestions = {
                            actions: [
                                "Stay updated on air quality information",
                                "Consider using air purifiers indoors",
                                "Limit outdoor activities during poor air quality",
                                "Stay hydrated"
                            ]
                        };
                    }
                    
                    setResponseData(parsedResponse); 
                    console.log('Successfully parsed response:', parsedResponse);
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    console.error('Response that failed to parse:', response);
                    
                    // Provide fallback data instead of just an error
                    const fallbackData = {
                        air_quality: {
                            rating: getAqiRating(airData.data.current.pollution.aqius),
                            key_pollutants: ["PM2.5"],
                            health_advice: getHealthAdvice(airData.data.current.pollution.aqius)
                        },
                        weather_conditions: {
                            pollen: "Medium",
                            wind: { 
                                speed: airData.data.current.weather.ws + " m/s", 
                                direction: airData.data.current.weather.wd + "°" 
                            },
                            temperature: airData.data.current.weather.tp + "°C",
                            humidity: airData.data.current.weather.hu + "%",
                            rainfall: airData.data.current.weather.pr > 1010 ? "No Rainfall" : "Light Rainfall"
                        },
                        suggestions: {
                            actions: [
                                "Stay updated on air quality forecasts",
                                "Consider using air purifiers indoors",
                                "Limit outdoor activities when air quality is poor",
                                "Keep windows closed during high pollution periods",
                                "Wear a mask when outdoors if AQI is unhealthy"
                            ]
                        }
                    };
                    
                    setResponseData(fallbackData);
                    setError('We experienced an issue generating personalized recommendations, but we\'ve provided general advice based on the air quality data.');
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch recommendation data. Please try again later.');
            } finally {
                setLoading(false); 
            }
        }
        
        getData();
    }, [airData]);

    if (!airData) {
        return (
            <div className={`min-h-screen pt-20 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center py-12">
                        <FaExclamationTriangle className={`text-5xl mx-auto mb-6 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        <h1 className="text-3xl font-bold mb-4">No Air Quality Data</h1>
                        <p className="mb-8">Please check air quality data first to get personalized recommendations.</p>
                        <Link 
                            to="/air-quality" 
                            className={`inline-flex items-center px-5 py-3 rounded-lg ${
                                theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'
                            } text-white font-medium transition-colors`}
                        >
                            <FaArrowLeft className="mr-2" /> Check Air Quality
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-20 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6 flex items-center">
                        <Link 
                            to="/air-quality" 
                            className={`mr-4 p-2 rounded-full transition-colors ${
                                theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            <FaArrowLeft />
                        </Link>
                        <h1 className="text-3xl font-bold">Health Recommendations</h1>
                    </div>
                    
                    <div className="mb-6 p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        <p>Based on air quality data from <span className="font-semibold">{airData.data.city}, {airData.data.country}</span></p>
                    </div>

            {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4 ${theme === 'dark' ? 'border-green-400' : 'border-green-600'}`}></div>
                            <p className="text-lg">Generating personalized recommendations...</p>
                        </div>
            ) : error ? (
                        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100'} mb-6`}>
                            <FaExclamationTriangle className={`text-3xl mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                            <h2 className="text-xl font-bold mb-2">Error</h2>
                            <p>{error}</p>
                        </div>
                    ) : responseData ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Air Quality Rating Summary */}
                            <div className={`p-6 rounded-xl shadow-md mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="flex items-start justify-between">
                                    <h2 className="text-2xl font-bold flex items-center">
                                        <FaLeaf className={`mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                                        Air Quality: {responseData.air_quality?.rating || "Unknown"}
                                    </h2>
                                    {/* Add AQI badge based on rating */}
                                    <span className={`px-4 py-1 rounded-full text-white text-sm font-medium ${
                                        responseData.air_quality?.rating === 'Good' ? 'bg-green-500' :
                                        responseData.air_quality?.rating === 'Moderate' ? 'bg-yellow-500' :
                                        responseData.air_quality?.rating === 'Unhealthy for Sensitive Groups' ? 'bg-orange-500' :
                                        responseData.air_quality?.rating === 'Unhealthy' ? 'bg-red-500' :
                                        responseData.air_quality?.rating === 'Very Unhealthy' ? 'bg-purple-500' : 'bg-red-900'
                                    }`}>
                                        AQI: {airData.data.current.pollution.aqius}
                                    </span>
                                </div>
                                
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">Health Advice:</h3>
                                    <p className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        {responseData.air_quality?.health_advice || "No specific health advice available."}
                                    </p>
                                </div>
                                
                                {responseData.air_quality?.key_pollutants && Array.isArray(responseData.air_quality.key_pollutants) && (
                                    <div className="mt-4">
                                        <h3 className="font-semibold mb-2">Key Pollutants:</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {responseData.air_quality.key_pollutants.map((pollutant, index) => (
                                                <span key={index} className={`px-3 py-1 rounded-full text-sm ${
                                                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                    {pollutant}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Weather Conditions */}
                            {responseData.weather_conditions && (
                                <div className={`p-6 rounded-xl shadow-md mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                                        <FaTemperatureHigh className={`mr-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
                                        Weather Conditions
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex items-center mb-2">
                                                <FaTemperatureHigh className={`mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                                                <span className="font-medium">Temperature:</span>
                                            </div>
                                            <p className="ml-6">{responseData.weather_conditions.temperature || airData.data.current.weather.tp + "°C"}</p>
                                        </div>
                                        
                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex items-center mb-2">
                                                <FaWind className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                                <span className="font-medium">Wind:</span>
                                            </div>
                                            <p className="ml-6">
                                                {responseData.weather_conditions.wind?.speed || airData.data.current.weather.ws + " m/s"}, 
                                                Direction: {responseData.weather_conditions.wind?.direction || airData.data.current.weather.wd + "°"}
                                            </p>
                                        </div>
                                        
                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex items-center mb-2">
                                                <span className="mr-2">💧</span>
                                                <span className="font-medium">Humidity:</span>
                                            </div>
                                            <p className="ml-6">{responseData.weather_conditions.humidity || airData.data.current.weather.hu + "%"}</p>
                                        </div>
                                        
                                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <div className="flex items-center mb-2">
                                                <span className="mr-2">🌧️</span>
                                                <span className="font-medium">Rainfall:</span>
                                            </div>
                                            <p className="ml-6">{responseData.weather_conditions.rainfall || "Unknown"}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Recommendations */}
                            {responseData.suggestions && responseData.suggestions.actions && Array.isArray(responseData.suggestions.actions) && (
                                <div className={`p-6 rounded-xl shadow-md mb-6 ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                                    <h2 className="text-2xl font-bold mb-4">Recommended Actions</h2>
                                    
                                    <ul className="space-y-3">
                                        {responseData.suggestions.actions.map((action, index) => (
                                            <motion.li 
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`flex items-start p-3 rounded-lg ${
                                                    theme === 'dark' ? 'bg-blue-800/30' : 'bg-white'
                                                }`}
                                            >
                                                <span className="text-green-500 mr-2 mt-1">✓</span>
                                                <span>{action}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <p>No recommendation data available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Recommend;

const getAqiRating = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
};

const getHealthAdvice = (aqi) => {
    if (aqi <= 50) return 'Air quality is good. Enjoy outdoor activities.';
    if (aqi <= 100) return 'Air quality is acceptable, but sensitive individuals should consider limiting prolonged outdoor exertion.';
    if (aqi <= 150) return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
    if (aqi <= 200) return 'Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects.';
    if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone. Avoid outdoor activities.';
    return 'Health warning of emergency conditions: everyone is more likely to be affected. Stay indoors and keep windows closed.';
};
