// netlify/functions/openai.js
const { Configuration, OpenAIApi } = require('openai');

exports.handler = async function(event, context) {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.userMessage;
    if (!userMessage) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No userMessage provided' }) };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing OpenAI API key' }) };
    }

    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Tu es Roby, un robot enfantin et curieux.' },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    const text = completion.data.choices[0].message.content;
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
