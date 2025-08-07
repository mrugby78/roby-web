// script.js

// Récupère les éléments
const statusEl     = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const startBtn     = document.getElementById('startBtn');

// Prépare la reconnaissance vocale
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang      = 'fr-FR';
recog.interimResults = false;
recog.continuous      = true;

// Prépare la synthèse vocale
const synth = window.speechSynthesis;

// Gestion du clic “Démarrer / Arrêter”  
let listening = false;
startBtn.addEventListener('click', () => {
  if (!listening) {
    recog.start();                          // <-- événement utilisateur
    startBtn.textContent = '⏸️ Arrêter Roby';
    statusEl.textContent = '🟢 Roby écoute…';
    listening = true;
  } else {
    recog.stop();
    startBtn.textContent = '▶️ Démarrer Roby';
    statusEl.textContent = '🔴 Roby en pause.';
    listening = false;
  }
});

// Quand on capte du texte
recog.onresult = async (event) => {
  const userText = event.results[0][0].transcript.trim();
  transcriptEl.textContent = `🟡 Tu as dit : « ${userText} »`;

  // Reconnais “stop roby”
  if (/stop roby/i.test(userText)) {
    recog.stop();
    startBtn.textContent = '▶️ Démarrer Roby';
    statusEl.textContent = '🔴 Roby en pause.';
    listening = false;
    return;
  }

  try {
    // Appel à la Function
    const res = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: userText })
    });
    const { text, error } = await res.json();
    if (error) throw new Error(error);

    // Affiche la réponse écrite
    const botLine = document.createElement('div');
    botLine.textContent = `🟢 Roby : ${text}`;
    document.body.append(botLine);

    // Parole enfantine
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = 'fr-FR';
    utter.pitch = 1.5;
    utter.rate  = 1.2;
    synth.speak(utter);

    // À la fin de la voix, on relance la reco si on est toujours en “listening”
    utter.onend = () => {
      if (listening) {
        recog.start();
        statusEl.textContent = '🟢 Roby écoute…';
      }
    };
  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ Erreur de communication.';
  }
};

recog.onerror = () => {
  statusEl.textContent = '🔴 Problème microphone.';
};
