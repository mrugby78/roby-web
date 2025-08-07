// ==== script.js ====

// 1 – Sélection des éléments
const startBtn  = document.getElementById('startBtn');
const statusEl  = document.getElementById('status');
const talkbox   = document.getElementById('talkbox');

// 2 – Initialisation SpeechRecognition
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRec) {
  statusEl.textContent = '❌ Reconnaissance vocale non supportée';
  startBtn.disabled = true;
} else {
  const recog = new SpeechRec();
  recog.lang          = 'fr-FR';
  recog.continuous    = true;
  recog.interimResults = false;

  // 3 – Démarrage / arrêt de l’écoute
  recog.onstart = () => statusEl.textContent = '🟢 Roby écoute…';
  recog.onend   = () => statusEl.textContent = '🔴 Roby en pause.';
  recog.onerror = e => console.error('SpeechRec error:', e);

  // 4 – Quand on reçoit du texte
  recog.onresult = async (event) => {
    // Récupère la dernière phrase
    const last = event.results[event.results.length - 1][0].transcript.trim();

    // Affiche l’utilisateur
    const pYou = document.createElement('p');
    pYou.innerHTML = `<span>🟡 Vous :</span> ${last}`;
    talkbox.appendChild(pYou);

    // Si l’utilisateur dit “stop roby”, on arrête tout
    if (last.toLowerCase().includes('stop roby')) {
      recog.stop();
      startBtn.textContent = '▶️ Démarrer Roby';
      return;
    }

    // 5 – Appel à la Function Netlify
    let reply = '❌ Pas de réponse.';
    try {
      const res = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: last })
      });
      const payload = await res.json();
      // Extrait la réponse
      reply = payload.choices?.[0]?.message?.content?.trim() 
            || payload.error 
            || reply;
    } catch(err) {
      console.error('Fetch error:', err);
    }

    // Affiche Roby
    const pBot = document.createElement('p');
    pBot.innerHTML = `<span>🟢 Roby :</span> ${reply}`;
    talkbox.appendChild(pBot);

    // 6 – Lecture vocale
    const utter = new SpeechSynthesisUtterance(reply);
    utter.lang  = 'fr-FR';
    utter.pitch = 2.0;   // très enfantin
    utter.rate  = 1.3;   // un peu plus rapide
    window.speechSynthesis.speak(utter);
  };

  // 7 – Bouton start/stop
  let listening = false;
  startBtn.addEventListener('click', () => {
    if (!listening) {
      recog.start();
      listening = true;
      startBtn.textContent = '⏸️ Arrêter Roby';
    } else {
      recog.stop();
      listening = false;
      startBtn.textContent = '▶️ Démarrer Roby';
    }
  });
}
