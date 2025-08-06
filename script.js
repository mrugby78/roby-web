// script.js

// la clé sera injectée automatiquement via GitHub Secrets
const OPENAI_API_KEY = "__OPENAI_API_KEY__";

// référence à l’élément de statut
const statusEl = document.getElementById("status");

// initialisation de la reconnaissance vocale
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognizer = new Recognition();
recognizer.lang = "fr-FR";
recognizer.interimResults = false;
recognizer.continuous = true;

// quand l’écoute démarre
recognizer.onstart = () => {
  statusEl.textContent = "🟢 Roby écoute…";
};

// quand une phrase est transcrite
recognizer.onresult = async (event) => {
  const last = event.results.length - 1;
  const transcript = event.results[last][0].transcript.trim();

  statusEl.textContent = `🗣️ Vous : “${transcript}”\n🤔 Roby réfléchit…`;

  recognizer.stop();

  // appel à l’API OpenAI
  let reply = "Désolé, je n’ai pas compris.";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: `Roby est un compagnon vocal qui aime expliquer des choses simples et amusantes, raconter des histoires et partager sa curiosité avec les explorateurs de tous âges.
Tu es Roby, un assistant vocal intelligent, drôle et bienveillant, conçu pour accompagner des enfants de 5 à 9 ans dans leur découverte du monde.
• Phrases courtes et simples.
• Réponses brèves.
• Ton chaleureux et doux.
• Jamais de longs discours ou de sujets inappropriés.`
          },
          { role: "user", content: transcript }
        ]
      })
    });
    const json = await res.json();
    reply = json.choices[0].message.content.trim();
  } catch (e) {
    console.error(e);
  }

  // afficher et lire la réponse
  statusEl.textContent = `🤖 Roby : “${reply}”`;
  const utter = new SpeechSynthesisUtterance(reply);
  utter.lang = "fr-FR";
  utter.rate = 0.9;
  utter.onend = () => {
    statusEl.textContent = "🟢 Roby écoute…";
    recognizer.start();
  };
  speechSynthesis.speak(utter);
};

// en cas d’erreur micro
recognizer.onerror = (e) => {
  statusEl.textContent = `❌ Erreur micro : ${e.error}`;
};

// démarrer l’écoute immédiatement
recognizer.start();
