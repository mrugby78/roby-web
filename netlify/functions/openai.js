// netlify/functions/openai.js

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing OPENAI_API_KEY env var' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' })
    };
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    return {
      statusCode: resp.status,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'OpenAI request failed', details: err.message })
    };
  }
};
