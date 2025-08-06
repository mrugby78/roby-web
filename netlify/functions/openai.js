// netlify/functions/openai.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
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
        body: JSON.stringify({ error: 'OpenAI API key not set' })
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Tu es Roby, un robot ami des enfants.' },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }
    const botReply = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ botReply })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
