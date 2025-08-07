// ==== script.js ====

// 1. Sélection des éléments du DOM
const startBtn  = document.getElementById('startBtn');
const statusEl  = document.getElementById('status');
const talkbox   = document.getElementById('talkbox');

// 2. Initialisation de la reconnaissance vocale
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRec) {
  statusEl.textContent = '❌ SpeechRecognition non supporté par ton navigateur.';
  startBtn.disabled = true;
} else {
  const recog = new SpeechRec();
  recog.lang            = 'fr-FR';
  recog.interimResults   = false;
  recog.continuous       = true;

  // 3. Quand la reconnaissance démarre / s’arrête
  recog.onstart = () => {
    statusEl.textContent = '🟢 Roby écoute…';
  };
  recog.onend = () => {
    statusEl.textContent = '🔴 Roby en pause.';
  };
  recog.onerror = (e) => {
    console.error('SpeechRec error', e);
  };

  // 4. Quand un résultat est prêt
  recog.onresult = async (event) => {
    const userText = event.results[event.results.length - 1][0].transcript.trim();

    // Affiche ce que dit l’utilisateur
    const pUser = document.createElement('p');
    pUser.innerHTML = `<span>🟡 Vous :</span> ${userText}`;
    talkbox.appendChild(pUser);

    try {
      // Appel à ta Function Netlify
      const response = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userText })
      });
      const data = await response.json();
      // Récupère la réponse ou l’erreur
      const reply = data.choices?.[0]?.message?.content
                  || data.error
                  || '❌ Pas de réponse.';

      // Affiche la réponse
      const pBot = document.createElement('p');
      pBot.innerHTML = `<span>🟢 Roby :</span> ${reply}`;
      talkbox.appendChild(pBot);

      // 5. Lecture vocale
      const utter = new SpeechSynthesisUtterance(reply);
      utter.lang  = 'fr-FR';
      utter.pitch = 1.5;   // plus aigu
      utter.rate  = 1.2;   // un peu plus rapide
      window.speechSynthesis.speak(utter);

    } catch (err) {
      console.error(err);
    }
  };

  // 6. Gestion du bouton Démarrer / Arrêter
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
