// script.js

const statusEl     = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');

// Configuration de la reconnaissance vocale
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang      = 'fr-FR';
recog.interimResults = false;
recog.continuous      = true;

// Quand la reconnaissance démarre
recog.onstart = () => {
  statusEl.textContent = '🟢 Roby écoute…';
};

// Quand on a un résultat
recog.onresult = async (event) => {
  const userText = event.results[0][0].transcript.trim();
  transcriptEl.textContent = `🟡 Tu as dit : « ${userText} »`;

  try {
    const response = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: userText })   // ← clé userMessage
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Erreur inconnue');
    }

    // on lit la réponse
    const utter = new SpeechSynthesisUtterance(data.reply);
    utter.lang = 'fr-FR';
    utter.onend = () => recog.start();  // relance l’écoute à la fin
    speechSynthesis.speak(utter);

  } catch (err) {
    statusEl.textContent = '❌ Erreur de communication.';
    console.error(err);
  }
};

// Démarrage automatique au chargement
window.onload = () => {
  recog.start();
};
