// script.js

// Récupère les éléments du DOM
const statusEl     = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');

// Prépare la reconnaissance vocale
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang      = 'fr-FR';
recog.interimResults = false;
recog.continuous      = true;

// Prépare la synthèse vocale
const synth = window.speechSynthesis;

// Démarrage auto quand on charge la page
recog.start();
statusEl.textContent = '🟢 Roby écoute…';

// Si on reconnait quelque chose
recog.onresult = async (event) => {
  const userText = event.results[0][0].transcript.trim();
  transcriptEl.textContent = `🟡 Tu as dit : « ${userText} »`;

  // Si l’utilisateur dit “stop roby”, on coupe tout
  if (/stop roby/i.test(userText)) {
    recog.stop();
    statusEl.textContent = '🔴 Roby en pause.';
    return;
  }

  // Appel à notre Netlify Function
  try {
    const res = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: userText })
    });
    const { text, error } = await res.json();
    if (error) throw new Error(error);

    // Affiche la réponse
    const botLine = document.createElement('div');
    botLine.textContent = `🟢 Roby : ${text}`;
    document.body.append(botLine);

    // Prépare l’énoncé vocal
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = 'fr-FR';
    utter.pitch = 1.5;    // plus aigu
    utter.rate  = 1.2;    // un peu plus rapide
    synth.speak(utter);

    // Quand la parole est terminée, on redémarre l’écoute
    utter.onend = () => {
      recog.start();
      statusEl.textContent = '🟢 Roby écoute…';
    };

  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ Erreur de communication.';
  }
};

// Si la reconnaissance s’arrête (erreur ou pause), on l’affiche
recog.onerror = () => {
  statusEl.textContent = '🔴 Problème microphone.';
};
