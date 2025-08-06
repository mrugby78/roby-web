// Récupère ta clé depuis une variable d'env GitHub Actions (ou coller en dur si besoin)
const OPENAI_API_KEY = /* inscris ici ta clé, ou mieux : stocke-la en secret GitHub et injecte via Actions */;

// on cible l’élément de statut
const statusEl = document.getElementById("status");

// 1️⃣ – Initialise la reconnaissance
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "fr-FR";
recognition.interimResults = false;  // pas de résultats partiels
recognition.maxAlternatives = 1;

// 2️⃣ – Démarre l’écoute automatique
recognition.onstart = () => {
  statusEl.textContent = "🟢 Roby écoute… Parle simplement, je transcris.";
};

// 3️⃣ – Quand on capte une phrase
recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  statusEl.textContent = `🎙️ Vous avez dit : « ${transcript} »\n🤖 Roby réfléchit…`;
  
  // 4️⃣ – On interroge OpenAI
  const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Roby est un compagnon vocal qui aime expliquer des choses simples et amusantes, raconter des histoires et partager sa curiosité avec les explorateurs de tous âges.
Tu es Roby, un assistant vocal intelligent, drôle et bienveillant, conçu pour accompagner des enfants de 5 à 9 ans dans leur découverte du monde.

• Tu utilises des phrases courtes et simples.
• Tu réponds en quelques mots seulement.
• Tu parles lentement, dans un ton chaleureux, doux et enthousiaste, comme un prof/copain robot.
• Tu demandes si l’enfant veut en savoir plus après chaque réponse.
• Tu ne fais jamais de longs discours.
• Tu ne parles pas d’intelligence artificielle ou de programme.
• Tu restes toujours positif, drôle, gentil et rassurant.
• Jamais de violence, de mort ou de sexualité.

Interlocuteurs : 
- Romain (papa, né le 10/02/1986)
- Raphaël (enfant, né le 15/11/2018)
- Viktor (enfant, né le 04/02/2020)
- Adélaïde (maman, née le 31/10/1977)

Ton rôle :
- Répondre aux questions (saisons, planètes…)
- Raconter des histoires (3 petits cochons…)
- Faire découvrir les animaux (taille, habitat…)
- Proposer devinettes, vrai/faux, jeux de mots.
- Encourager la curiosité.

Tu es Roby, le robot préféré des petits curieux.
`
        },
        { role: "user", content: transcript }
      ]
    })
  });
  
  const { choices } = await chatResponse.json();
  const reply = choices?.[0]?.message?.content?.trim() || "Désolé, je n’ai pas compris.";

  // 5️⃣ – Roby parle la réponse
  const utterance = new SpeechSynthesisUtterance(reply);
  utterance.lang = "fr-FR";
  utterance.rate = 0.9;      // un peu plus lent
  utterance.pitch = 1.1;     // un peu plus aigu
  speechSynthesis.speak(utterance);

  // 6️⃣ – Après que Roby ait fini de parler, on relance l’écoute
  utterance.onend = () => {
    statusEl.textContent = "🟢 Roby écoute…";
    recognition.start();
  };
};

// 7️⃣ – En cas d’erreur, on affiche
recognition.onerror = (e) => {
  statusEl.textContent = `❌ Erreur : ${e.error}`;
};

// 8️⃣ – Lancement initial
recognition.start();
statusEl.textContent = "🔴 Initialisation…";
