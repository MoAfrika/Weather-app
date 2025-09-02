// This file acts as a secure backend to call the Gemini API.
// Your secret API key is read from Netlify's environment variables, not exposed in the browser.

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { query } = JSON.parse(event.body);

        if (!query) {
            return { statusCode: 400, body: JSON.stringify({ error: "Query is missing." }) };
        }

        // Securely get the API key from the environment variable you set in Netlify
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
             return { statusCode: 500, body: JSON.stringify({ error: "API key is not configured on the server." }) };
        }
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

        const systemPrompt = `You are a helpful and creative local guide. Your goal is to give practical and fun advice based on the weather. Format your response as simple HTML using <h3> for titles and <ul>/<li> for lists. Do not include markdown like \`\`\`html or the html tag.`;

        const payload = {
            contents: [{ parts: [{ text: query }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Gemini API Error:", errorBody);
            return { statusCode: response.status, body: JSON.stringify({ error: "Failed to get advice from the AI model."}) };
        }

        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
             return { statusCode: 500, body: JSON.stringify({ error: "Received an invalid response from the AI model."}) };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ advice: generatedText })
        };

    } catch (error) {
        console.error("Serverless Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "An internal error occurred." })
        };
    }
};

