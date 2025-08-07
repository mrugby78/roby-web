// netlify/functions/openai.js

exports.handler = async function(event, context) {
  try {
    const { userMessage } = JSON.parse(event.body || '{}');
    if (!userMessage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No userMessage provided' })
      };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing OpenAI API key' })
      };
    }

    // Appel direct à l’API OpenAI
    const resp = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Tu es Roby, un robot enfantin et curieux.' },
            { role: 'user',   content: userMessage }
          ],
          max_tokens: 200,
          temperature: 0.8
        })
      }
    );

    const data = await resp.json();
    if (data.error) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: data.error.message || data.error })
      };
    }

    const text = data.choices[0].message.content;
    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
