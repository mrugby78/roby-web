// script.js

// Éléments du DOM
const statusEl     = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const responseEl   = document.getElementById('response');

// Initialisation SpeechRecognition
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang           = 'fr-FR';
recog.interimResults = false;
recog.continuous     = true;

// Quand la reconnaissance démarre
recog.onstart = () => {
  statusEl.textContent = '🟢 Roby écoute…';
};

// Quand on a un résultat
recog.onresult = async (event) => {
  // 1. Extraire le texte
  const userText = event.results[event.results.length - 1][0].transcript.trim();
  transcriptEl.textContent = `🟡 Vous : ${userText}`;

  try {
    // 2. Appel à la Function Netlify
    const res = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: userText })
    });
    const { botReply, error } = await res.json();
    if (!res.ok || error) throw new Error(error || 'Erreur API');

    // 3. Afficher la réponse écrite
    responseEl.textContent = `🟢 Roby : ${botReply}`;

    // 4. Synthèse vocale
    const utter = new SpeechSynthesisUtterance(botReply);
    utter.lang = 'fr-FR';
    utter.rate = 0.9;      // un peu plus lent
    utter.pitch = 1.3;     // voix plus enfantine
    speechSynthesis.speak(utter);

  } catch (err) {
    responseEl.textContent = '❌ Erreur de communication.';
    console.error(err);
  }
};

// Quand la synthèse se termine, on relance l’écoute
speechSynthesis.onend = () => {
  if (recog) recog.start();
};

// Démarrage automatique à l’ouverture
window.onload = () => {
  recog.start();
};
