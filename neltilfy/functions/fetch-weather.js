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
        // Fetch current weather and forecast in parallel using native fetch (no axios needed)
        const currentUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${weatherApiKey}&units=metric`;
        const forecastUrl = `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${weatherApiKey}&units=metric`;

        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
            console.error("Upstream API Error", currentRes.status, forecastRes.status);
            return { statusCode: 502, body: JSON.stringify({ error: "Failed to reach Weather API" }) };
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        return {
            statusCode: 200,
            body: JSON.stringify({
                current: currentData,
                daily: forecastData.daily
            })
        };

    } catch (error) {
        console.error("Weather Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    }
};
