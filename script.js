// ==== script.js ====

// Au chargement de la page, on initialise l’API Web Speech
const statusEl     = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');

const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang      = 'fr-FR';
recog.interimResults = false;
recog.continuous      = true;

const synth = window.speechSynthesis;

// Quand la reconnaissance démarre
recog.onstart = () => {
  statusEl.textContent = '🟢 Roby écoute…';
};

// À l’écoute d’un résultat
recog.onresult = async (event) => {
  const userText = event.results[0][0].transcript.trim();
  transcriptEl.textContent = `🟡 Tu as dit : « ${userText} »`;

  try {
    const response = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });
    const data = await response.json();
    const botReply = data.choices[0].message.content.trim();

    // Lecture vocale de la réponse
    const utter = new SpeechSynthesisUtterance(botReply);
    utter.lang = 'fr-FR';
    utter.onend = () => recog.start();  // relance l’écoute
    synth.speak(utter);
  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ Erreur de communication.';
    // on retente après 2s
    setTimeout(() => recog.start(), 2000);
  }
};

// Si erreur système
recog.onerror = () => {
  statusEl.textContent = '⚠️ Problème de reconnaissance.';
  recog.start();
};

// On lance immédiatement l’écoute continue
window.addEventListener('load', () => {
  recog.start();
});
