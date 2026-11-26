/* Sarim & Tala — shared behaviour for both invitations */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const key = document.body.dataset.event;
  const E = key ? INVITE[key] : null;
  const C = INVITE.couple;

  /* ---------- fill in text from config.js ---------- */
  const when = E ? new Date(E.date) : null;
  const fmt = (o) => when.toLocaleDateString("en-US", o);
  const values = E ? {
    first: C.first, second: C.second, couple: C.first + " & " + C.second,
    dateLong: fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    weekday: fmt({ weekday: "long" }),
    dateShort: fmt({ month: "long", day: "numeric", year: "numeric" }),
    dateDMY: when.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    time: E.timeLabel || when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase(),
    venue: E.venue, address: E.address
  } : { first: C.first, second: C.second, couple: C.first + " & " + C.second };
  $$("[data-bind]").forEach((el) => {
    const [k, ev] = el.dataset.bind.split("@");            // e.g. "dateShort@wedding" on the gateway
    if (ev) el.textContent = new Date(INVITE[ev].date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    else if (values[k] != null) el.textContent = values[k];
  });
  if (E) {
    const tl = $(".timeline");
    if (tl) tl.innerHTML = E.schedule.map(([t, what]) => `<li><time>${t}</time><span>${what}</span></li>`).join("");
    const day = $(".dayline");
    if (day) {
      const I = (d) => `<svg class="ico" viewBox="0 0 24 24">${d}</svg>`;
      const arch = I('<path d="M6 21V10.5a6 6 0 0 1 12 0V21M3.5 21h17M12 4.500V3"/>');
      const spark = I('<path d="M12 3c.6 4.800 3.200 7.400 9 9-5.800 1.600-8.400 4.200-9 9-.6-4.800-3.200-7.400-9-9 5.800-1.600 8.400-4.200 9-9Z"/>');
      const cloche = I('<path d="M3 18.500h18M4.500 18.500a7.500 7.500 0 0 1 15 0M12 8.500V7"/><circle cx="12" cy="6" r="1"/>');
      const moon = I('<path d="M19.500 14.500A8 8 0 0 1 9.500 4.500a8 8 0 1 0 10 10Z"/>');
      const rings = I('<circle cx="9" cy="13" r="5.500"/><circle cx="15" cy="13" r="5.500"/>');
      const pick = (s) => /dinner|food|meal/i.test(s) ? cloche : /nikkah|ceremony|vows/i.test(s) ? rings : /dua|farewell|cake|night/i.test(s) ? moon : /arriv|door|welcome/i.test(s) ? arch : spark;
      day.innerHTML = E.schedule.map(([t, what]) => `<div>${pick(what)}<time>${t}</time><span>${what}</span></div>`).join("");
    }
    // gentle parallax for painted and floral pieces
    const par = $$("[data-par]");
    if (par.length && !calm) {
      const move = () => par.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        el.style.setProperty("--py", ((r.top + r.height / 2 - innerHeight / 2) * +el.dataset.par).toFixed(1) + "px");
      });
      addEventListener("scroll", move, { passive: true }); addEventListener("resize", move); move();
    }
    const map = $("#map");
    if (map) { if (E.mapUrl) map.href = E.mapUrl; else map.remove(); }
  }

  /* ---------- the stitched line between the two maps ---------- */
  const route = $(".route");
  const joinMaps = () => {
    const svg = $(".stitch", route), her = $(".cameo.her .map", route), him = $(".cameo.him .map", route);
    if (!svg || !her || !him) return;
    const R = route.getBoundingClientRect(), a = her.getBoundingClientRect(), b = him.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const rim = 7;                                           // the ivory ring around each map; the line tucks just under it
    const A = { x: a.left + a.width / 2 - R.left, y: a.top + a.height / 2 - R.top, r: a.width / 2 + rim };
    const B = { x: b.left + b.width / 2 - R.left, y: b.top + b.height / 2 - R.top, r: b.width / 2 + rim };
    const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
    let px = dy / d, py = -dx / d; if (py > 0) { px = -px; py = -py; }      // bow the line upwards
    const bend = Math.min(70, d * 0.2), C = { x: (A.x + B.x) / 2 + px * bend, y: (A.y + B.y) / 2 + py * bend };
    const edge = (P) => { const vx = C.x - P.x, vy = C.y - P.y, v = Math.hypot(vx, vy) || 1; return [P.x + (vx / v) * P.r, P.y + (vy / v) * P.r]; };
    const [sx, sy] = edge(A), [ex, ey] = edge(B);
    const path = `M${sx.toFixed(1)} ${sy.toFixed(1)}Q${C.x.toFixed(1)} ${C.y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    svg.setAttribute("viewBox", `0 0 ${R.width.toFixed(0)} ${R.height.toFixed(0)}`);
    $(".thread-line", svg).setAttribute("d", path);
    $(".reveal", svg).setAttribute("d", path);
    const heart = $(".heart", svg);
    if (!heart.dataset.moved) heart.setAttribute("transform", `translate(${ex.toFixed(1)} ${ey.toFixed(1)})`);
    dispatchEvent(new Event("stitch"));
  };
  if (route) {
    joinMaps();
    addEventListener("load", joinMaps); addEventListener("resize", joinMaps);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(joinMaps);
    if (window.ResizeObserver) new ResizeObserver(joinMaps).observe(route);
  }

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in", "grow"); io.unobserve(e.target); }
  }), { threshold: 0.18 });
  $$(".rv, .sprig").forEach((el) => io.observe(el));

  /* ---------- countdown ---------- */
  const cd = $(".countdown");
  if (cd && when) {
    const tick = () => {
      if (window.__cdHold) { setTimeout(tick, 250); return; }   // motion.js is counting the numbers up
      let s = Math.floor((when - Date.now()) / 1000);
      if (s <= 0) { cd.closest("[data-countdown]")?.remove(); return; }
      const parts = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
      cd.innerHTML = ["Days", "Hours", "Minutes", "Seconds"].map((l, i) =>
        `<div><b>${String(parts[i]).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
      setTimeout(tick, 1000);
    };
    tick();
  }

  /* ---------- add to calendar (.ics) ---------- */
  const cal = $("#cal");
  if (cal && when) cal.addEventListener("click", () => {
    const p = (n) => String(n).padStart(2, "0");
    const stamp = (d) => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
    const end = new Date(when.getTime() + 4 * 3600e3);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SarimTala//Invite//EN", "BEGIN:VEVENT",
      `UID:${key}-${when.getTime()}@invite`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(when)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:${C.first} & ${C.second} - ${E.title}`, `LOCATION:${(E.venue + ", " + E.address).replace(/,/g, "\\,")}`,
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${C.first}-${C.second}-${E.title}.ics`.toLowerCase();
    a.click();
  });

  /* ---------- gold glints (the sequins) + petals ---------- */
  let burst = () => {};
  if (!calm) {
    const c = document.createElement("canvas"); c.id = "glints"; document.body.appendChild(c);
    const x = c.getContext("2d");
    const col = getComputedStyle(document.body).getPropertyValue("--glint").trim() || "#f1dfae";
    let W, H, pts = [], petals = [], mx = -999, my = -999;
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight; c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0);
      pts = Array.from({ length: Math.round((W * H) / 15000) }, () =>
        ({ x: Math.random() * W, y: Math.random() * H, p: Math.random() * 6.28, s: 0.5 + Math.random() * 1.1, v: 0.4 + Math.random() }));
    };
    size(); addEventListener("resize", size);
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
    burst = (n = 70) => {
      const shades = ["#ffffff", "#f3efe4", "#dfe7d8", "#c9d6c1"];
      for (let i = 0; i < n; i++) petals.push({
        x: Math.random() * W, y: -20 - Math.random() * H * 0.6, vx: -0.4 + Math.random() * 0.8, vy: 1 + Math.random() * 1.6,
        r: 5 + Math.random() * 7, a: Math.random() * 6.28, va: -0.03 + Math.random() * 0.06, c: shades[i % 4], w: Math.random() * 6.28
      });
    };
    const frame = (t) => {
      x.clearRect(0, 0, W, H);
      const dk = document.body.classList.contains("dusk") ? 1.8 : 1;
      x.fillStyle = dk > 1 ? "#ffe9a8" : col;
      for (const p of pts) {
        const tw = Math.max(0, Math.sin(t * 0.001 * p.v + p.p)) ** 8;
        const near = clamp(1 - Math.hypot(p.x - mx, p.y - my) / 170);
        const a = (tw * 0.6 + near * near * 0.95) * dk;
        if (a < 0.03) continue;
        const r = p.s * (2 + near * 5 + tw * 2.5) * (dk > 1 ? 1.35 : 1);
        x.globalAlpha = Math.min(1, a);
        x.beginPath();
        x.moveTo(p.x - r, p.y); x.quadraticCurveTo(p.x, p.y, p.x, p.y - r); x.quadraticCurveTo(p.x, p.y, p.x + r, p.y);
        x.quadraticCurveTo(p.x, p.y, p.x, p.y + r); x.quadraticCurveTo(p.x, p.y, p.x - r, p.y);
        x.fill();
      }
      petals = petals.filter((p) => p.y < H + 30);
      for (const p of petals) {
        p.w += 0.03; p.x += p.vx + Math.sin(p.w) * 0.8; p.y += p.vy; p.a += p.va;
        x.globalAlpha = 0.92; x.fillStyle = p.c;
        x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.scale(1, 0.55 + 0.4 * Math.sin(p.w));
        x.beginPath(); x.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, 6.29); x.fill(); x.restore();
        x.fillStyle = col;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Nikkah: lift the veil ---------- */
  const veil = $("#veil");
  if (veil) {
    let sy = null, dy = 0;
    const lift = () => { veil.classList.remove("drag"); veil.classList.add("lifted"); document.body.classList.remove("locked"); };
    veil.addEventListener("pointerdown", (e) => { sy = e.clientY; dy = 0; veil.classList.add("drag"); veil.setPointerCapture(e.pointerId); });
    veil.addEventListener("pointermove", (e) => {
      if (sy == null) return;
      dy = Math.min(0, e.clientY - sy);
      veil.style.transform = `translateY(${dy}px) skewY(${clamp(dy / 900, -0.8, 0)}deg)`;
    });
    const end = () => {
      if (sy == null) return; sy = null; veil.classList.remove("drag");
      if (dy < -70 || dy > -6) lift(); else veil.style.transform = "";
    };
    veil.addEventListener("pointerup", end); veil.addEventListener("pointercancel", end);
    $("button", veil).addEventListener("click", lift);
  }

  /* ---------- Wedding: break the seal ---------- */
  const post = $("#post");
  if (post) {
    $(".seal", post).addEventListener("click", () => {
      post.classList.add("open");
      setTimeout(() => { post.classList.add("gone"); document.body.classList.remove("locked"); }, calm ? 300 : 3000);
    });
  }

  /* ---------- Nikkah: mandala that draws itself as you scroll ---------- */
  const man = $(".mandala");
  if (man) {
    const P = (r, a) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
    const layers = [];
    const ring = (r) => `<circle r="${r}" pathLength="1"/>`;
    const petals = (r0, r1, n, fat = 0.9) => {
      let s = "";
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.2832 - 1.5708, h = (3.1416 / n) * fat, rm = (r0 + r1) / 2;
        s += `<path pathLength="1" d="M${P(r0, a - h)}Q${P(rm, a - h)} ${P(r1, a)}Q${P(rm, a + h)} ${P(r0, a + h)}"/>`;
      }
      return s;
    };
    const dots = (r, n, d) => { let s = ""; for (let i = 0; i < n; i++) { const a = (i / n) * 6.2832; s += `<circle cx="${(r * Math.cos(a)).toFixed(1)}" cy="${(r * Math.sin(a)).toFixed(1)}" r="${d}" pathLength="1"/>`; } return s; };
    layers.push(ring(7) + petals(9, 34, 8), ring(38) + dots(46, 16, 1.6), petals(54, 96, 16), ring(100) + ring(105) + dots(113, 32, 1.4),
      petals(121, 160, 24, 1), petals(121, 142, 24, 0.5), ring(166) + dots(176, 48, 1.8), petals(184, 198, 48, 1));
    man.setAttribute("viewBox", "-202 -202 404 404");
    man.innerHTML = layers.map((l, i) => `<g data-i="${i}">${l}</g>`).join("");
    const groups = $$("g", man), n = groups.length;
    const draw = () => {
      const r = man.getBoundingClientRect();
      const prog = calm ? 1 : clamp((innerHeight * 0.95 - r.top) / (innerHeight * 0.75));
      groups.forEach((g, i) => { g.style.strokeDashoffset = 1 - clamp(prog * (1 + n * 0.22) - i * 0.22); });
    };
    // dashoffset is inherited by the shapes in each group
    groups.forEach((g) => $$("*", g).forEach((el) => (el.style.strokeDashoffset = "inherit")));
    addEventListener("scroll", draw, { passive: true }); addEventListener("resize", draw); draw();
  }

  /* ---------- Wedding: eucalyptus sprigs that grow in ---------- */
  $$(".sprig").forEach((svg) => {
    const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    let out = `<path class="stem" pathLength="1" d="M10 10C90 40 170 110 230 290" fill="none" stroke="#8fa387" stroke-width="1.6" stroke-linecap="round"/>`;
    const B = (t) => { // point + tangent on the stem curve
      const p = [[10, 10], [90, 40], [170, 110], [230, 290]], u = 1 - t;
      const x = u ** 3 * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t ** 3 * p[3][0];
      const y = u ** 3 * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t ** 3 * p[3][1];
      const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]);
      const dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]);
      return [x, y, Math.atan2(dy, dx)];
    };
    const greens = ["#9db394", "#8aa283", "#b4c5ab", "#7c9577"];
    for (let i = 0; i < 17; i++) {
      const t = 0.04 + (i / 17) * 0.96, [x, y, a] = B(t), side = i % 2 ? 1 : -1;
      const len = 15 + rnd() * 13 + t * 9, ang = a + side * (1.05 + rnd() * 0.4);
      const cx = x + Math.cos(ang) * len, cy = y + Math.sin(ang) * len;
      out += `<ellipse class="leaf" style="--d:${(0.3 + t * 1.9).toFixed(2)}s;--o:${(0.62 + rnd() * 0.3).toFixed(2)}" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${len.toFixed(1)}" ry="${(len * 0.68).toFixed(1)}" transform="rotate(${((ang * 180) / Math.PI).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${greens[i % 4]}"/>`;
    }
    svg.setAttribute("viewBox", "0 0 270 310");
    svg.innerHTML = out;
  });

  /* ---------- Wedding: light the candles ---------- */
  const cs = $(".candle-sec");
  if (cs) {
    const all = $$(".candle", cs), toast = $(".toast", cs), idle = toast.innerHTML;
    all.forEach((b) => b.addEventListener("click", () => {
      const on = b.classList.toggle("lit"); b.setAttribute("aria-pressed", on);
      const lit = all.filter((c) => c.classList.contains("lit")).length;
      cs.style.setProperty("--lit", lit);
      if (lit === all.length) { toast.innerHTML = `<b>The table is set</b>All that's missing is you.`; burst(); }
      else toast.innerHTML = lit ? `${all.length - lit} more to go&hellip;` : idle;
    }));
  }

  /* ---------- RSVP ---------- */
  const form = $(".rsvp");
  if (form) form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form)); data.event = E.title; data.sentAt = new Date().toISOString();
    const coming = data.attending === "yes";
    try { localStorage.setItem("rsvp-" + key, JSON.stringify(data)); } catch (_) {}
    if (INVITE.rsvp.endpoint) {
      // sent as plain text so a Google Apps Script web app accepts it without extra setup
      try { await fetch(INVITE.rsvp.endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) }); } catch (_) {}
    }
    $(".thanks b").textContent = coming ? "See you there" : "You'll be missed";
    $(".thanks p").textContent = coming
      ? `Thank you, ${data.name.split(" ")[0]}. We can't wait to celebrate with you.`
      : `Thank you for letting us know, ${data.name.split(" ")[0]}. Please keep us in your duas.`;
    form.closest(".sec").classList.add("sent");
    if (coming) burst(40);
  });
})();
