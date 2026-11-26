/* The walk: scroll to move a camera through a corridor of arches into the painting. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- dock: highlight where you are, and the evening switch ---------- */
  const dock = $(".dock");
  if (dock) {
    const links = $$("a[href^='#']", dock).map((a) => ({ a, el: $(a.getAttribute("href")) })).filter((l) => l.el);
    const mark = () => {
      let cur = links[0];
      for (const l of links) if (l.el.getBoundingClientRect().top < innerHeight * 0.5) cur = l;
      links.forEach((l) => l.a.classList.toggle("on", l === cur));
    };
    addEventListener("scroll", mark, { passive: true }); mark();
    const sw = $(".d-dusk", dock);
    if (sw) {
      const set = (on) => {
        document.body.classList.toggle("dusk", on);
        sw.setAttribute("aria-pressed", on);
        $("span", sw).textContent = on ? "evening" : "daytime";
      };
      sw.addEventListener("click", () => set(!document.body.classList.contains("dusk")));
      set(false);
    }
  }

  const walk = $(".walk");
  if (!walk) return;
  if (calm) { walk.classList.add("flat"); return; }

  const stage = $(".stage", walk), far = $(".far", walk), arrive = $(".arrive", walk), hint = $(".walk-hint", walk);
  const items = $$("[data-z]", walk).map((el) => ({ el, z: +el.dataset.z, plate: el.classList.contains("plate") }));
  items.forEach((it) => (it.el.style.zIndex = Math.round(1000 - it.z * 100)));
  const zEnd = Math.max(...items.map((i) => i.z)) - 0.5;      // the camera stops just past the last plate

  let lastY = scrollY, swing = 0, vel = 0, shown = false;
  const pendant = $(".pendant", walk);

  const update = () => {
    const r = walk.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const cam = p * zEnd;
    for (const it of items) {
      const d = it.z - cam;                                    // how far ahead of the camera
      if (d <= 0.1 || d > 3.6) { it.el.style.visibility = "hidden"; continue; }
      let o = clamp((3.5 - d) / 0.9);                          // far things emerge from the haze
      o *= it.plate ? clamp((d - 0.62) / 0.3) : clamp((d - 0.12) / 0.22);   // near things dissolve as you pass
      it.el.style.visibility = "visible";
      it.el.style.opacity = o.toFixed(3);
      it.el.style.transform = `scale(${(1 / d).toFixed(4)})`;
      it.el.style.pointerEvents = it.plate && o > 0.9 ? "auto" : "none";
    }
    far.style.transform = `scale(${(1.02 + p * 0.22).toFixed(4)})`;
    const a = clamp((cam - (zEnd - 0.42)) / 0.36);
    arrive.style.opacity = a.toFixed(3);
    arrive.style.pointerEvents = a > 0.9 ? "auto" : "none";
    if (hint) hint.style.opacity = p < 0.02 ? 1 : 0;
    shown = r.bottom > 0 && r.top < innerHeight;
  };

  // the monogram hangs on a chain and swings with your scrolling
  const tick = (t) => {
    if (shown && pendant) {
      vel += -0.035 * swing - 0.07 * vel;
      swing += vel;
      const idle = Math.sin(t / 1400) * 1.2;
      pendant.style.transform = `rotate(${(swing + idle).toFixed(2)}deg)`;
    }
    requestAnimationFrame(tick);
  };
  addEventListener("scroll", () => {
    const dy = scrollY - lastY; lastY = scrollY;
    vel += clamp(dy * 0.012, -1.6, 1.6);
    update();
  }, { passive: true });
  addEventListener("resize", update);
  // a nudge from the pointer or a tilt of the phone also sets it swinging
  if (pendant) pendant.addEventListener("pointerenter", () => { vel += 1.4 * (Math.random() < 0.5 ? -1 : 1); });
  addEventListener("deviceorientation", (e) => { if (e.gamma != null) vel += clamp(e.gamma * 0.0015, -0.05, 0.05); });
  update(); requestAnimationFrame(tick);
})();
