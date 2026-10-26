/* =========================================================
   HELPERS
   ========================================================= */

// Shortcut for finding an element by id
const $ = (id) => document.getElementById(id);

// Pause for a number of milliseconds (used with "await")
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Random number between min and max
const rand = (min, max) => Math.random() * (max - min) + min;

// True if the visitor asked their device for less motion
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Becomes true when the visitor taps the message to skip the typing
let skipTyping = false;

/* Show a hidden section with a smooth fade-in, then scroll to it */
function reveal(el, scrollTo = true) {
  el.hidden = false;
  void el.offsetWidth;                 // force the browser to register the change so the fade plays
  el.classList.add("show");
  if (scrollTo) el.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* =========================================================
   BACKGROUND: floating hearts & sparkles
   ========================================================= */
function createFloatingParticles(count = 16) {
  const symbols = ["♥", "♡", "✦", "✧", "♥"];
  const colors = ["#f4a6c0", "#e0709b", "#cdb8ee", "#f9c6d8"];
  const box = $("particles");

  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "float";
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = rand(0, 100) + "vw";
    p.style.fontSize = rand(12, 26) + "px";
    p.style.color = colors[Math.floor(Math.random() * colors.length)];
    p.style.setProperty("--o", rand(0.25, 0.55).toFixed(2));    // max opacity
    p.style.setProperty("--drift", rand(-60, 60) + "px");       // sideways sway
    p.style.animationDuration = rand(14, 26) + "s";
    p.style.animationDelay = rand(-20, 0) + "s";                // negative = already mid-flight at load
    box.appendChild(p);
  }
}

/* =========================================================
   TYPING EFFECT
   ========================================================= */
// Types one piece of text into an element, letter by letter
async function typeText(el, text) {
  const textNode = document.createTextNode("");
  const caret = document.createElement("span");
  caret.className = "caret";
  el.append(textNode, caret);

  for (let i = 1; i <= text.length; i++) {
    if (skipTyping || reduceMotion) { textNode.data = text; break; }
    textNode.data = text.slice(0, i);
    // small extra pause after punctuation so it feels like natural speech
    const last = text[i - 1];
    await wait(",.".includes(last) ? 220 : 28);
  }
  textNode.data = text;
  caret.remove();
}

// Types the whole confession, paragraph by paragraph
async function typeConfession() {
  const lines = [
    { text: "I don't really know the perfect way to say this, so I'll just be honest." },
    { text: "I really like you.", cls: "big" },
    { text: "I enjoy talking to you, being around you, and even the little moments we share. You somehow became someone I look forward to seeing and talking to." },
    { text: "I don't expect anything from you. I just wanted you to know how I feel." }
  ];
  const box = $("message");

  for (const line of lines) {
    const p = document.createElement("p");
    if (line.cls) p.className = line.cls;
    box.appendChild(p);
    await typeText(p, line.text);
    if (!skipTyping) await wait(700);     // breathing room between lines
  }
}

/* =========================================================
   CELEBRATION: hearts & confetti raining down
   ========================================================= */
function celebrate() {
  if (reduceMotion) return;
  const box = $("confetti");
  const pieces = ["❤️", "💖", "💗", "✨", "🌸", "💕"];

  for (let i = 0; i < 45; i++) {
    const s = document.createElement("span");
    s.className = "fall";
    s.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    s.style.left = rand(0, 100) + "vw";
    s.style.fontSize = rand(16, 32) + "px";
    s.style.setProperty("--dur", rand(2.5, 5) + "s");
    s.style.setProperty("--drift", rand(-80, 80) + "px");
    s.style.animationDelay = rand(0, 1.2) + "s";
    box.appendChild(s);
    setTimeout(() => s.remove(), 7000);   // clean up so the page stays light
  }
}

/* A small heart pops up wherever you tap (nice on mobile) */
function tapHeart(x, y) {
  if (reduceMotion) return;
  const h = document.createElement("span");
  h.className = "tap-heart";
  h.textContent = "♥";
  h.style.left = x - 9 + "px";
  h.style.top = y - 9 + "px";
  h.style.color = "#f4a6c0";
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 900);
}

/* =========================================================
   MAIN STORY FLOW
   ========================================================= */

// Step 1: the opening card is clicked -> show the confession
async function openLetter() {
  $("openBtn").disabled = true;
  $("intro").classList.remove("show");          // fade the opening card out
  await wait(700);
  $("intro").hidden = true;

  reveal($("confession"));
  await wait(1800);                              // let the heading sink in
  await typeConfession();                        // type the message

  // Step 2: after the message, show the question
  await wait(900);
  reveal($("askSection"));
  await wait(1600);
  $("askCard").hidden = false;
  void $("askCard").offsetWidth;
  $("askCard").scrollIntoView({ behavior: "smooth", block: "center" });
}

// Step 3a: "Yes" was clicked
async function sayYes() {
  $("noReply").hidden = true;
  $("yesReply1").hidden = false;
  celebrate();
  await wait(1400);
  $("yesReply2").hidden = false;
  showFinal();
}

// Step 3b: "No" was clicked - kind and respectful, nothing pressures them
function sayNo() {
  $("yesReply1").hidden = true;
  $("yesReply2").hidden = true;
  $("noReply").hidden = false;
  showFinal();
}

// Step 4: the thank-you note and signature
async function showFinal() {
  if (!$("final").hidden) return;                // only reveal once
  await wait(1600);
  reveal($("final"));
}

/* =========================================================
   START EVERYTHING when the page loads
   ========================================================= */
window.addEventListener("DOMContentLoaded", () => {
  createFloatingParticles();
  reveal($("intro"), false);                     // fade in the opening card

  $("openBtn").addEventListener("click", openLetter);
  $("yesBtn").addEventListener("click", sayYes);
  $("noBtn").addEventListener("click", sayNo);

  // Tapping the message skips the typing animation
  $("message").addEventListener("click", () => { skipTyping = true; });

  // Little heart on every tap/click
  document.addEventListener("pointerdown", (e) => tapHeart(e.clientX, e.clientY));
});
