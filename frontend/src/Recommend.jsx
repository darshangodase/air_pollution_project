import { useEffect, useState } from "react";
import Groq from "groq-sdk";

function Recommend() {
    const [responseData, setResponseData] = useState(null); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 

    useEffect(() => {
        async function getData() {
            try {
                console.log('Fetching data...');
                const groq = new Groq({
                    apiKey: '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',
                    dangerouslyAllowBrowser: true,
                });

                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: 'Based on the provided air quality and weather data, generate a concise summary in JSON format. The summary should include the following fields: air_quality (rating, key_pollutants, health_advice), pollutant_levels (PM2.5, PM10, O3, NO2, SO2, CO, NH3, VOCs), weather_conditions (pollen, wind [speed, direction], temperature, humidity, rainfall), and suggestions (actions). Ensure that the key names remain consistent across all inputs. Use the following example input data: PM2.5: 85 µg/m³, PM10: 120 µg/m³, O3: 75 ppb, NO2: 40 ppb, SO2: 25 ppb, CO: 0.9 ppm, NH3: 18 µg/m³, VOCs: 50 ppb, Pollen: High, Wind Speed: 3 m/s, Wind Direction: 180°, Temperature: 35°C, Humidity: 60%, Rainfall: No Rainfall. Format the output as a structured JSON object.',
                        },
                    ],
                    model: "llama-3.3-70b-versatile",
                });

                console.log('Data fetched successfully...');
                let response = completion.choices[0].message.content;

                response = response.trim(); 
                response = response.replace(/^```json/, ''); 
                response = response.replace(/```$/, ''); 

               
                try {
                    const parsedResponse = JSON.parse(response); 
                    setResponseData(parsedResponse); 
                    console.log(parsedResponse)
                } catch (parseError) {
                    console.error('Error parsing JSON:', parseError);
                    setError('Failed to parse the response into JSON.');
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data. Please try again later.');
            } finally {
                setLoading(false); 
            }
        }
        getData();
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>Air Quality Data</h1>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <pre>{JSON.stringify(responseData, null, 2)}</pre> 
            )}
        </div>
    );
}

export default Recommend;
