// netlify/functions/openai.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    const { userMessage } = JSON.parse(event.body || '{}');
    if (!userMessage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No userMessage provided' })
      };
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Tu es Roby, un robot ami des enfants.' },
          { role: 'user',   content: userMessage }
        ]
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content.trim() })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
