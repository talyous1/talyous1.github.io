/* Light scroll animations for the card layout. Adds no length to the page. */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  document.documentElement.classList.add("motion");

  // icons draw themselves: give every stroke a length of 1 so one rule can animate them all
  $$(".ico *").forEach((el) => el.setAttribute("pathLength", "1"));

  // the verse lights up word by word
  const verse = $(".verse-ar");
  let words = [];
  if (verse) {
    verse.innerHTML = verse.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
    words = $$(".w", verse);
  }

  // a gold thread that stitches down the edge of the page
  const thread = document.createElement("div");
  thread.className = "thread"; thread.setAttribute("aria-hidden", "true"); thread.innerHTML = "<i></i>";
  document.body.appendChild(thread);

  // pieces that respond to where they are on screen
  const scrubs = [$(".hero2"), $("footer.painted"), ...$$(".sec").filter((s) => $(":scope > .lace", s))].filter(Boolean);

  // the closing monogram sways a little with the scroll
  const charm = $("footer.painted .mono .logo-lace");
  let swing = 0, vel = 0, lastY = scrollY, queued = false;

  const stitch = $(".stitch"), reveal = $(".stitch .reveal"), line = $(".stitch .thread-line"), heart = $(".stitch .heart");

  const update = () => {
    queued = false;
    const H = innerHeight;
    for (const el of scrubs) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > H + 300) continue;
      el.style.setProperty("--in", clamp((H - r.top) / (H * 0.75)).toFixed(3));     // 0 as it enters, 1 once it has arrived
      el.style.setProperty("--out", clamp(-r.top / r.height).toFixed(3));           // 0 at rest, 1 once scrolled past
    }
    if (words.length) {
      const r = verse.getBoundingClientRect();
      const p = clamp((H * 0.88 - r.top) / (H * 0.5));
      words.forEach((w, i) => w.classList.toggle("lit", p * (words.length + 1) > i + 0.5));
    }
    if (stitch) {
      const r = stitch.getBoundingClientRect();
      const p = clamp((H * 0.82 - r.top) / (H * 0.45));
      reveal.style.strokeDashoffset = (1 - p).toFixed(3);
      const pt = line.getPointAtLength(line.getTotalLength() * p);
      heart.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) scale(${(0.7 + p * 0.5).toFixed(2)})`);
    }
    const max = document.documentElement.scrollHeight - H;
    thread.style.setProperty("--page", max > 0 ? clamp(scrollY / max).toFixed(4) : 0);
  };
  addEventListener("scroll", () => {
    vel += clamp((scrollY - lastY) * 0.006, -0.9, 0.9); lastY = scrollY;
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener("resize", update);
  update();

  if (charm) {
    const tick = () => {
      vel += -0.04 * swing - 0.08 * vel; swing += vel;
      if (Math.abs(swing) > 0.01 || Math.abs(vel) > 0.01) charm.style.rotate = swing.toFixed(2) + "deg";
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // the countdown counts up to its numbers the first time you reach it
  const cd = $(".countdown");
  if (cd) {
    new IntersectionObserver((es, io) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const cells = $$("b", cd), targets = cells.map((b) => +b.textContent), t0 = performance.now();
      window.__cdHold = true;
      const step = (t) => {
        const k = clamp((t - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
        cells.forEach((b, i) => (b.textContent = String(Math.round(targets[i] * e)).padStart(2, "0")));
        if (k < 1) requestAnimationFrame(step); else window.__cdHold = false;
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 }).observe(cd);
  }
})();
