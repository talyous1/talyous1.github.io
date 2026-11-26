/* Monogram options built from the Arabic initials: ص (ṣād, Sarim) and ت (tā', Tala) */
document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("opts2");
  if (!box) return;
  const SAD = "ص", TA = "ت";
  const NAMES = (INVITE.couple.first + " & " + INVITE.couple.second).toUpperCase().replace("&", "&amp;");
  const t = (x, y, size, font, txt, extra = "") => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-family="${font}" fill="currentColor" stroke="none" ${extra}>${txt}</text>`;
  const RUQ = "'Aref Ruqaa',serif", AMI = "'Amiri',serif", KUF = "'Reem Kufi',sans-serif", NAS = "'Noto Nastaliq Urdu',serif", RAK = "'Rakkas',serif", JOST = "'Jost',sans-serif", COR = "'Cormorant Garamond',serif";
  const caps = (y, txt = NAMES, size = 11, sp = 4) => t(150 + sp / 2, y, size, JOST, txt, `letter-spacing="${sp}"`);
  const S = (inner) => `<svg viewBox="0 0 300 300" fill="none" stroke="currentColor">${inner}</svg>`;
  const scallops = (r, n, d) => { let s = ""; for (let i = 0; i < n; i++) { const a = (i / n) * 6.2832; s += `<circle cx="${(150 + r * Math.cos(a)).toFixed(1)}" cy="${(150 + r * Math.sin(a)).toFixed(1)}" r="${d}" fill="currentColor" stroke="none"/>`; } return s; };

  const options = [
    ["The Lace Oval", "Both initials in flowing script inside a lace-edged oval. This one closes the wedding page, over the painting.", "sage",
      Logo.svg({ variant: "lace" })],
    ["The Cradle", "A sweeping ruqʿah ṣād with the tā' resting above its curve, inside a double oval.", "teal",
      S(`<ellipse cx="150" cy="150" rx="112" ry="136" stroke-width="1.2"/><ellipse cx="150" cy="150" rx="104" ry="128" stroke-width=".7" stroke-dasharray="1 4" stroke-linecap="round"/>
        ${t(158, 196, 150, RUQ, SAD)}${t(112, 118, 78, RUQ, TA, 'opacity=".75"')}`)],
    ["One Stroke", "The two letters joined as they would be in a word, so one line carries both of you.", "beige",
      S(`${t(150, 168, 130, AMI, SAD + TA)}<path d="M96 224h108" stroke-width=".8"/>${caps(250)}`)],
    ["The Kufic Star", "Clean, architectural kufic letters set in an eight-point star.", "white",
      S(`<rect x="50" y="50" width="200" height="200" stroke-width="1.1"/><rect x="50" y="50" width="200" height="200" transform="rotate(45 150 150)" stroke-width="1.1"/>
        <circle cx="150" cy="150" r="88" stroke-width=".7" stroke-dasharray="1 4" stroke-linecap="round"/>
        ${t(150, 172, 78, KUF, SAD + " " + TA)}`)],
    ["Two Scripts", "A seal that holds both alphabets: ص ت above, S &amp; T below, your names around the rim.", "teal",
      S(`<circle cx="150" cy="150" r="140" stroke-width="1.2"/>${scallops(132, 40, 1.8)}<circle cx="150" cy="150" r="98" stroke-width=".8"/>
        <defs><path id="ring2" d="M150 150m-110 0a110 110 0 1 1 220 0a110 110 0 1 1-220 0"/></defs>
        <text font-family="${JOST}" font-size="12.5" letter-spacing="5.6" fill="currentColor" stroke="none"><textPath href="#ring2" startOffset="0">${NAMES}  ·  30 · 05 · 2027  ·  06 · 08 · 2027  ·</textPath></text>
        ${t(150, 150, 74, RUQ, SAD + " " + TA)}<path d="M112 172h76" stroke-width=".7"/>
        ${t(150, 210, 34, COR, "S <tspan font-family=\"'Pinyon Script',cursive\" font-size=\"30\">&amp;</tspan> T", 'font-weight="300"')}`)],
    ["The Cascade", "Hanging nastaʿlīq letters stepping down the diagonal, the way the script naturally falls.", "sage",
      S(`${t(186, 120, 84, NAS, SAD)}${t(112, 196, 84, NAS, TA)}<path d="M92 252h116" stroke-width=".7"/>${caps(276)}`)],
    ["The Bold", "A heavy display ṣād with the tā' tucked beneath, for a stamp that reads from across the room.", "beige",
      S(`<rect x="60" y="34" width="180" height="232" rx="90" stroke-width="1.2"/><rect x="68" y="42" width="164" height="216" rx="82" stroke-width=".6"/>
        ${t(150, 150, 110, RAK, SAD)}${t(150, 226, 84, RAK, TA)}`)]
  ];
  box.innerHTML = options.map(([name, blurb, tone, art], i) =>
    `<div class="opt ${tone}">${art}<span class="num">Option ${i + 9}</span><h3>${name}</h3><p>${blurb}</p></div>`).join("");
});
