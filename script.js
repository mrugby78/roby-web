// script.js

// DOM
const statusEl     = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const responseEl   = document.getElementById('response');
const btnStart     = document.getElementById('btnStart');

// SpeechRecognition setup
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang           = 'fr-FR';
recog.interimResults = false;
recog.continuous     = true;

// Quand on clique pour démarrer
btnStart.addEventListener('click', () => {
  // 1) on démarre la reco
  recog.start();
  // 2) on retire le bouton (plus besoin)
  btnStart.style.display = 'none';
});

// Reconnaissance démarrée
recog.onstart = () => {
  statusEl.textContent = '🟢 Roby écoute…';
};

// Quand on a un résultat
recog.onresult = async (event) => {
  const userText = event.results[event.results.length - 1][0].transcript.trim();
  transcriptEl.textContent = `🟡 Vous : ${userText}`;

  try {
    // Appel Function
    const res = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: userText })
    });
    const { botReply, error } = await res.json();
    if (!res.ok || error) throw new Error(error || 'Erreur API');

    // Affiche
    responseEl.textContent = `🟢 Roby : ${botReply}`;

    // Synthèse vocale
    const utter = new SpeechSynthesisUtterance(botReply);
    utter.lang = 'fr-FR';
    utter.rate = 0.9;
    utter.pitch = 1.3;
    speechSynthesis.speak(utter);

  } catch (err) {
    responseEl.textContent = '❌ Erreur de communication.';
    console.error(err);
  }
};

// Quand la voix se termine, on repart en écoute
speechSynthesis.onend = () => {
  recog.start();
};
