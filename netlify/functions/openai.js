// netlify/functions/openai.js

import { Configuration, OpenAIApi } from "openai";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: `{"error":"Method Not Allowed"}` };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: `{"error":"Invalid JSON"}` };
  }

  const userMessage = body.message;
  if (!userMessage) {
    return { statusCode: 400, body: `{"error":"No userMessage provided"}` };
  }

  const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(config);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es Roby, un robot curieux pour enfants." },
        { role: "user",   content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    const reply = completion.data.choices[0].message.content;
    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
