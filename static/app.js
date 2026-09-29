const $ = (id) => document.getElementById(id);
const audio = $("audio"), seek = $("seek"), tx = $("tx");
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ---- Fundo: várias imagens com crossfade ----
fetch("/api/images").then(r => r.json()).then(imgs => {
  if (!imgs.length) return;
  for (let i = imgs.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [imgs[i], imgs[j]] = [imgs[j], imgs[i]]; }
  imgs.forEach(s => { new Image().src = s; });
  const layers = [document.querySelector(".layer.a"), document.querySelector(".layer.b")];
  let i = 0, k = 0;
  const step = () => {
    const on = layers[k], off = layers[1 - k];
    on.style.backgroundImage = `url(${imgs[i]})`;
    on.classList.remove("show"); void on.offsetWidth; on.classList.add("show");
    off.classList.remove("show");
    i = (i + 1) % imgs.length; k = 1 - k;
  };
  step(); setInterval(step, 7000);
});

// ---- Player ----
const setP = () => seek.style.setProperty("--p", seek.value / 10 + "%");
$("play").onclick = () => (audio.paused ? audio.play() : audio.pause());
audio.onplay = audio.onpause = () => {
  $("ico-play").hidden = !audio.paused;
  $("ico-pause").hidden = audio.paused;
};
audio.onloadedmetadata = () => $("dur").textContent = fmt(audio.duration);
seek.oninput = () => { audio.currentTime = seek.value / 1000 * audio.duration; setP(); };
$("back").onclick = () => audio.currentTime = Math.max(0, audio.currentTime - 15);
$("fwd").onclick = () => audio.currentTime = Math.min(audio.duration || 1e9, audio.currentTime + 15);
$("speed").onclick = () => {
  audio.playbackRate = audio.playbackRate === 1 ? 2 : 1;
  $("speed").firstElementChild.textContent = audio.playbackRate + "x";
  $("speed").classList.toggle("fast", audio.playbackRate === 2);
};

// ---- Transcrição ----
let segs = [], els = [], cur = -1, follow = true, autoScrolling = false;
$("follow").onclick = () => { follow = !follow; $("follow").classList.toggle("on", follow); if (follow) centre(); };
// rolar com mouse/toque desliga o "seguir" só neste painel
["wheel", "touchmove"].forEach(ev => tx.addEventListener(ev, () => {
  if (follow) { follow = false; $("follow").classList.remove("on"); }
}, { passive: true }));

function centre() {
  const el = els[cur]; if (!el) return;
  // rola SÓ o painel da transcrição, nunca a página
  tx.scrollTo({ top: el.offsetTop - tx.clientHeight / 2 + el.clientHeight / 2, behavior: "smooth" });
}

fetch("/api/transcript").then(r => r.json()).then(data => {
  segs = data; tx.innerHTML = "";
  if (!segs.length) { tx.innerHTML = '<p class="empty">A transcrição ainda não foi gerada.</p>'; return; }
  els = segs.map(s => {
    const p = document.createElement("p");
    p.textContent = s.text; p.title = fmt(s.start);
    p.onclick = () => { audio.currentTime = s.start; audio.play(); };
    tx.appendChild(p); return p;
  });
});

audio.ontimeupdate = () => {
  $("cur").textContent = fmt(audio.currentTime);
  if (audio.duration) { seek.value = audio.currentTime / audio.duration * 1000; setP(); }
  const t = audio.currentTime;
  const idx = segs.findIndex(s => t >= s.start && t < s.end);
  if (idx !== -1 && idx !== cur) {
    if (els[cur]) els[cur].classList.remove("now");
    cur = idx; els[cur].classList.add("now");
    if (follow) centre();
  }
};
