// script.js

const statusEl     = document.getElementById('status');
const transcriptEl = document.getElementById('transcript');
const historyEl    = document.getElementById('history');

// reconnaissance vocale
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang      = 'fr-FR';
recog.interimResults = false;
recog.continuous      = true;

// synthèse vocale
const synth = window.speechSynthesis;

// historique des échanges
function addHistory(who, text) {
  const div = document.createElement('div');
  div.className = 'entry ' + who;
  div.textContent = (who === 'user' ? '🟡 Vous : ' : '🟢 Roby : ') + text;
  historyEl.append(div);
  historyEl.scrollTop = historyEl.scrollHeight;
}

// au démarrage
recog.onstart = () => {
  statusEl.textContent = '🟢 Roby écoute…';
};

// quand on a le résultat
recog.onresult = async (event) => {
  const userText = event.results[0][0].transcript.trim();
  transcriptEl.textContent = `🟡 Tu as dit : « ${userText} »`;
  addHistory('user', userText);

  try {
    // appel à la Function Netlify
    const res = await fetch('/.netlify/functions/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage: userText })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur serveur');

    const botReply = json.botReply.trim();
    addHistory('bot', botReply);

    // parler la réponse
    const utter = new SpeechSynthesisUtterance(botReply);
    utter.lang = 'fr-FR';
    utter.onend = () => recog.start();
    synth.speak(utter);

  } catch (err) {
    console.error(err);
    statusEl.textContent = '❌ Erreur de communication.';
  }
};

// lancer la reconnaissance en continu
recog.start();
