const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { city } = event.queryStringParameters;
    
    // Securely access the key from Netlify Environment Variables
    const weatherApiKey = process.env.WEATHER_API_KEY; 

    if (!city) {
        return { statusCode: 400, body: JSON.stringify({ error: "City is missing" }) };
    }

    try {
        // Fetch current weather and forecast in parallel
        const currentUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${weatherApiKey}&units=metric`;
        const forecastUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${weatherApiKey}&units=metric`;

        const [currentRes, forecastRes] = await Promise.all([
            axios.get(currentUrl),
            axios.get(forecastUrl)
        ]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                current: currentRes.data,
                daily: forecastRes.data.daily
            })
        };

    } catch (error) {
        console.error("Weather API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch weather data" })
        };
    }
};
