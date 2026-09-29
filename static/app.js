const $ = (id) => document.getElementById(id);
const audio = $("audio"), seek = $("seek");
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Fundo: imagens passando
fetch("/api/images").then(r => r.json()).then(imgs => {
  if (!imgs.length) return;
  const bg = $("bg");
  const slides = imgs.map(src => {
    const d = document.createElement("div");
    d.className = "slide"; d.style.backgroundImage = `url(${src})`;
    bg.appendChild(d); return d;
  });
  let i = 0;
  const next = () => {
    slides.forEach(s => s.classList.remove("on"));
    void slides[i].offsetWidth;
    slides[i].classList.add("on");
    i = (i + 1) % slides.length;
  };
  next(); setInterval(next, 8000);
});

// Player
$("play").onclick = () => (audio.paused ? audio.play() : audio.pause());
audio.onplay = audio.onpause = () => {
  $("ico-play").hidden = !audio.paused;
  $("ico-pause").hidden = audio.paused;
};
audio.onloadedmetadata = () => $("dur").textContent = fmt(audio.duration);
seek.oninput = () => audio.currentTime = seek.value / 100 * audio.duration;
$("speed").onclick = () => {
  audio.playbackRate = audio.playbackRate === 1 ? 2 : 1;
  $("speed").textContent = audio.playbackRate + "x";
  $("speed").classList.toggle("fast", audio.playbackRate === 2);
};

// Transcrição sincronizada
let segs = [], els = [], cur = -1;
fetch("/api/transcript").then(r => r.json()).then(data => {
  segs = data;
  const box = $("tx"); box.innerHTML = "";
  if (!segs.length) {
    box.innerHTML = '<p class="empty">A transcrição ainda não foi gerada.</p>'; return;
  }
  els = segs.map(s => {
    const p = document.createElement("p");
    p.textContent = s.text;
    p.title = fmt(s.start);
    p.onclick = () => { audio.currentTime = s.start; audio.play(); };
    box.appendChild(p); return p;
  });
});
audio.ontimeupdate = () => {
  $("cur").textContent = fmt(audio.currentTime);
  if (audio.duration) seek.value = audio.currentTime / audio.duration * 100;
  const t = audio.currentTime;
  const idx = segs.findIndex(s => t >= s.start && t < s.end);
  if (idx !== -1 && idx !== cur) {
    if (els[cur]) els[cur].classList.remove("now");
    cur = idx; els[cur].classList.add("now");
    els[cur].scrollIntoView({ block: "center", behavior: "smooth" });
  }
};
