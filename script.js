// script.js

const statusEl = document.getElementById("status");
const talkbox  = document.getElementById("talkbox");

const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog     = new SpeechRec();
recog.lang         = "fr-FR";
recog.interimResults = false;
recog.continuous     = true;

let listening = false;
const STOP_PHRASE = "stop roby";

recog.onstart = () => statusEl.textContent = "🟢 Roby écoute…";
recog.onend   = () => statusEl.textContent = "🔴 Roby en pause.";

recog.onresult = async (e) => {
  const text = e.results[0][0].transcript.trim().toLowerCase();
  append("Vous", text);

  if (text.includes(STOP_PHRASE)) {
    recog.stop();
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const { reply, error } = await res.json();
    if (error) throw new Error(error);
    append("Roby", reply);
    speak(reply);
  } catch (err) {
    append("Roby", `❌ ${err.message}`);
  }
};

function append(who, txt) {
  const p = document.createElement("p");
  p.innerHTML = `<span style="color:${who==="Roby"?"green":"goldenrod"}">● ${who} :</span> ${txt}`;
  talkbox.append(p);
  talkbox.scrollTop = talkbox.scrollHeight;
}

function speak(txt) {
  const u = new SpeechSynthesisUtterance(txt);
  u.lang  = "fr-FR";
  u.rate  = 1.1;
  u.pitch = 1.3;
  speechSynthesis.speak(u);
}

// Bouton unique Démarrer / Arrêter
const btn = document.createElement("button");
btn.textContent = "▶️ Démarrer Roby";
btn.style = "margin:1rem;padding:0.5rem 1rem;font-size:1rem;";
btn.onclick = () => {
  if (!listening) {
    recog.start();
    btn.textContent = "⏸️ Arrêter Roby";
  } else {
    recog.stop();
    btn.textContent = "▶️ Démarrer Roby";
  }
  listening = !listening;
};
document.body.insertBefore(btn, statusEl);
