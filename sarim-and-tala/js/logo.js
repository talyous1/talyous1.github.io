/* The S & T monogram. One definition, drawn as SVG on the pages and as PNG for download. */
(function () {
  const ARCH_OUT = "M60 480V214C60 124 150 92 200 40c50 52 140 84 140 174v266Z";
  const ARCH_IN = "M72 468V216c0-80 84-110 128-158 44 48 128 78 128 158v252Z";

  function star(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8 - Math.PI / 2, rr = i % 2 ? r * 0.6 : r;
      pts.push((cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1));
    }
    return "M" + pts.join("L") + "Z";
  }

  function initials() {
    const c = (window.INVITE && INVITE.couple) || { first: "S", second: "T" };
    return { a: c.first[0], b: c.second[0], names: (c.first + "  &  " + c.second).toUpperCase() };
  }

  // Shared layout (arch version is 400 x 520, seal version is 200 x 200)
  const L = {
    arch: { w: 400, h: 520, s: [172, 338, 215], t: [236, 352, 150], star: [200, 122, 9], rule: 398, names: 436 },
    seal: { w: 200, h: 200, s: [86, 132, 118], t: [121, 140, 82] }
  };

  // Two script initials woven together: the second letter passes behind the first, with a hairline gap where they cross
  let uid = 0;
  function woven(i, sx, sy, tx, ty, size, gap) {
    const id = "weave" + (++uid), f = "font-family=\"'Pinyon Script',cursive\" font-size=\"" + size + "\" text-anchor=\"middle\"";
    return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-50" y="-50" width="500" height="500"><rect x="-50" y="-50" width="500" height="500" fill="#fff"/>
        <text x="${sx}" y="${sy}" ${f} fill="#000" stroke="#000" stroke-width="${gap}" stroke-linejoin="round">${i.a}</text></mask></defs>
      <text x="${tx}" y="${ty}" ${f} fill="currentColor" mask="url(#${id})">${i.b}</text>
      <text x="${sx}" y="${sy}" ${f} fill="currentColor">${i.a}</text>`;
  }

  // The lace oval: a real lace frame (img/lace-oval.webp) with the woven initials over it
  function laceOval(i) {
    return `<div class="logo logo-lace" role="img" aria-label="${i.a} and ${i.b} monogram">
      <img src="img/lace-oval.webp" alt="">
      <svg viewBox="0 0 300 300">${woven(i, 128, 182, 172, 204, 132, 7)}</svg>
    </div>`;
  }

  function svg(opts) {
    const o = Object.assign({ variant: "arch", names: true }, opts);
    if (o.variant === "lace") return laceOval(initials());
    const i = initials(), g = L[o.variant];
    const letters =
      `<text x="${g.t[0]}" y="${g.t[1]}" text-anchor="middle" font-family="'Cormorant Garamond',serif" font-weight="300" font-size="${g.t[2]}" fill="currentColor" opacity=".55">${i.b}</text>` +
      `<text x="${g.s[0]}" y="${g.s[1]}" text-anchor="middle" font-family="'Pinyon Script',cursive" font-size="${g.s[2]}" fill="currentColor">${i.a}</text>`;
    if (o.variant === "seal") {
      return `<svg class="logo logo-seal" viewBox="0 0 200 200" role="img" aria-label="${i.a} and ${i.b} monogram">
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" stroke-width=".6" stroke-dasharray="1 4" stroke-linecap="round"/>
        ${woven(i, 86, 126, 116, 142, 104, 5)}</svg>`;
    }
    return `<svg class="logo logo-arch" viewBox="0 0 400 520" role="img" aria-label="${i.a} and ${i.b} monogram">
      <path d="${ARCH_OUT}" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <path d="${ARCH_IN}" fill="none" stroke="currentColor" stroke-width=".7"/>
      <path d="${star(...g.star)}" fill="currentColor"/>
      ${letters}
      ${o.names ? `<path d="M150 ${g.rule}h38m24 0h38" stroke="currentColor" stroke-width=".8"/>
      <path d="${star(200, g.rule, 5)}" fill="currentColor"/>
      <text x="200" y="${g.names}" text-anchor="middle" font-family="'Cormorant Garamond',serif" font-weight="500" font-size="17" letter-spacing="5" fill="currentColor">${i.names}</text>` : ""}
    </svg>`;
  }

  // PNG export (transparent background unless bg is given)
  async function png(opts) {
    const o = Object.assign({ variant: "arch", color: "#2c5550", bg: null, scale: 5 }, opts);
    await document.fonts.load("215px 'Pinyon Script'");
    await document.fonts.load("300 150px 'Cormorant Garamond'");
    await document.fonts.load("500 17px 'Cormorant Garamond'");
    const i = initials(), g = L[o.variant];
    const c = document.createElement("canvas");
    c.width = g.w * o.scale; c.height = g.h * o.scale;
    const x = c.getContext("2d");
    x.scale(o.scale, o.scale);
    if (o.bg) { x.fillStyle = o.bg; x.fillRect(0, 0, g.w, g.h); }
    x.strokeStyle = x.fillStyle = o.color; x.textAlign = "center";
    if (o.variant === "seal") {
      x.lineWidth = 1.2; x.beginPath(); x.arc(100, 100, 92, 0, 7); x.stroke();
      x.lineWidth = 0.6; x.setLineDash([1, 4]); x.lineCap = "round"; x.beginPath(); x.arc(100, 100, 85, 0, 7); x.stroke(); x.setLineDash([]);
    } else {
      x.lineWidth = 1.4; x.stroke(new Path2D(ARCH_OUT));
      x.lineWidth = 0.7; x.stroke(new Path2D(ARCH_IN));
      x.fill(new Path2D(star(...g.star)));
      x.lineWidth = 0.8; x.stroke(new Path2D(`M150 ${g.rule}h38m24 0h38`));
      x.fill(new Path2D(star(200, g.rule, 5)));
      x.font = "500 17px 'Cormorant Garamond'";
      if ("letterSpacing" in x) x.letterSpacing = "5px";
      x.fillText(i.names, 202, g.names);
      if ("letterSpacing" in x) x.letterSpacing = "0px";
    }
    x.globalAlpha = 0.55; x.font = `300 ${g.t[2]}px 'Cormorant Garamond'`; x.fillText(i.b, g.t[0], g.t[1]);
    x.globalAlpha = 1; x.font = `${g.s[2]}px 'Pinyon Script'`; x.fillText(i.a, g.s[0], g.s[1]);
    return c.toDataURL("image/png");
  }

  window.Logo = { svg, png };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-logo]").forEach((el) => {
      el.innerHTML = svg({ variant: el.dataset.logo || "arch", names: el.dataset.names !== "false" });
    });
  });
})();
