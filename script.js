// script.js

// Éléments UI
const statusEl = document.getElementById('status');
const talkbox  = document.getElementById('talkbox');

// Reconnaissance vocale
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang      = 'fr-FR';
recog.interimResults = false;
recog.continuous      = true;

// Synthèse vocale
const synth = window.speechSynthesis;

// Démarrage auto de l'écoute
recog.start();

// Quand on commence à écouter
recog.onstart = () => {
  statusEl.textContent = '🟢 Roby écoute…';
};

// À chaque résultat
recog.onresult = async (event) => {
  const userText = event.results[0][0].transcript.trim();
  appendMessage('Vous', userText, '🟡');

  try {
    const resp = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: userText })
    });
    const data = await resp.json();
    console.log('🔍 API response raw:', data);

    let botReply;
    if (data.text) {
      botReply = data.text;
    } else {
      botReply = JSON.stringify(data);
    }
    console.log('🔍 botReply chosen:', botReply);

    appendMessage('Roby', botReply, '🟢');
    speak(botReply);

    // redémarrer écoute
    recog.start();

  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ Erreur de communication.';
  }
};

// helper pour afficher
function appendMessage(speaker, text, emoji) {
  const p = document.createElement('p');
  p.innerHTML = `<strong>${emoji} ${speaker} :</strong> ${text}`;
  talkbox.appendChild(p);
  window.scrollTo(0, document.body.scrollHeight);
}

// helper pour parler
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'fr-FR';
  utter.rate = 1.1;       // un chouïa plus rapide
  utter.pitch = 1.5;      // voix plus aiguë
  utter.onend = () => {
    // rien à faire
  };
  synth.speak(utter);
}
