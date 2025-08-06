// script.js

// PLACEHOLDER_KEY sera remplacé automatiquement par GitHub Actions plus tard
const OPENAI_API_KEY = 'PLACEHOLDER_KEY';

const statusEl = document.getElementById('status');

// Initialisation du SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'fr-FR';
recognition.interimResults = false;
recognition.continuous = false;

// Initialisation du Text-to-Speech
const synth = window.speechSynthesis;

// Quand la reconnaissance démarre
recognition.onstart = () => {
  statusEl.textContent = '🎙️ J’écoute…';
};

// À la fin de la reconnaissance
recognition.onend = () => {
  statusEl.textContent = '🤖 Roby parle…';
};

// Quand on obtient le texte reconnu
recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  try {
    // Appel à OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `Tu es Roby, un robot ami des enfants.` },
          { role: 'user', content: userText }
        ]
      })
    });
    const data = await response.json();
    const botReply = data.choices[0].message.content.trim();

    // Parler la réponse
    const utterance = new SpeechSynthesisUtterance(botReply);
    utterance.lang = 'fr-FR';
    utterance.onend = () => {
      // Relancer la reconnaissance après le TTS
      recognition.start();
    };
    synth.speak(utterance);

  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ Erreur de communication.';
  }
};

// Lance la première écoute au chargement de la page
window.onload = () => {
  recognition.start();
};
