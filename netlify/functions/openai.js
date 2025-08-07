// netlify/functions/openai.js

exports.handler = async function(event, context) {
  try {
    // 1. On parse le body JSON envoyé par le front
    const { userMessage } = JSON.parse(event.body || '{}');
    if (!userMessage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No userMessage provided' }),
      };
    }

    // 2. On récupère la clé dans les vars Netlify
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing OPENAI_API_KEY env var' }),
      };
    }

    // 3. On appelle l’API OpenAI
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: "Tu es Roby, un robot amical et curieux, avec une voix enfantine. Parle en français et commence toujours par «🟢 Roby : »",
            },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    // 4. On renvoie la réponse brute au front
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
