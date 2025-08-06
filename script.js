// script.js

// La clé sera injectée par ton hôte (Netlify) dans __OPENAI_API_KEY__
const OPENAI_API_KEY = '__OPENAI_API_KEY__';

const statusEl   = document.getElementById('status');
const resultEl   = document.getElementById('result');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition        = new SpeechRecognition();
recognition.lang         = 'fr-FR';
recognition.interimResults = false;
recognition.continuous    = false;

const synth = window.speechSynthesis;

recognition.onstart = () => {
  statusEl.textContent = '🟢 J’écoute…';
};
recognition.onend = () => {
  statusEl.textContent = '🤖 Roby parle…';
};

recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  resultEl.textContent = `🟡 Tu as dit : « ${userText} »`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Tu es Roby, un robot ami des enfants.' },
          { role: 'user', content: userText }
        ]
      })
    });
    const data = await resp.json();
    const botReply = data.choices[0].message.content.trim();

    const utter = new SpeechSynthesisUtterance(botReply);
    utter.lang = 'fr-FR';
    utter.onend = () => recognition.start();
    synth.speak(utter);

  } catch (e) {
    console.error(e);
    statusEl.textContent = '❌ Erreur de communication.';
  }
};

window.onload = () => recognition.start();
