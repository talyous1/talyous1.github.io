/* main.js — the only JavaScript on the site.
   Everything still works without it (all images show, links open, the name is readable),
   so this file only adds extras:
     A. A typewriter effect for the hero name on Home
     B. A custom cursor (dot + trailing ring) for people with a mouse
     C. A back-to-top button that appears as you scroll
     D. Decorative art: arches around the About portrait, and vines that grow in
     0. Fade-in as sections scroll into view
     1. Filter buttons on the Design page (All / Brands / Posters / ...)
     2. A pop-up viewer ("lightbox") for the gallery images
   Typewriter, cursor, and fade-ins all switch off for visitors who asked their device for
   "reduce motion". */

// ---------- Shared: does this visitor want less motion? ----------
// matchMedia asks the browser about a setting. "reduce" means the person turned on
// "reduce motion" in their device, so we skip the animated extras below.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- A. Typewriter for the hero name (Home page only) ----------
// The page already contains the full name (for search engines, screen readers, and
// people without JavaScript). Here we clear the visible copy and type it back out.
const typedEl = document.querySelector('[data-typewriter]');

if (typedEl) {
  const heading = typedEl.closest('.typewriter');
  const fullText = typedEl.textContent;           // remember the whole name

  if (prefersReducedMotion) {
    heading.classList.add('tw-started');          // just show the name, no typing
  } else {
    typedEl.textContent = '';
    heading.classList.add('tw-started', 'tw-typing');
    let count = 0;

    const typeNextLetter = () => {
      count += 1;
      typedEl.textContent = fullText.slice(0, count);   // show the first `count` letters
      if (count < fullText.length) {
        // Slightly uneven timing (70 to 140 ms) feels like a person typing.
        setTimeout(typeNextLetter, 70 + Math.random() * 70);
      } else {
        // Keep the caret blinking for a moment, then remove it.
        setTimeout(() => heading.classList.remove('tw-typing'), 2400);
      }
    };

    setTimeout(typeNextLetter, 500);               // wait for the page fade-in first
  }
}

// ---------- B. Custom cursor: a dot plus a ring that trails behind ----------
// Only for people with a real mouse ("hover: hover" and "pointer: fine"), so phones and
// tablets are untouched, and only when they haven't asked for reduced motion.
const canUseCustomCursor =
  window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion;

let cursorRoot = null;
let cursorPaused = false;

if (canUseCustomCursor) {
  // Build the cursor with JavaScript, so no page needs extra HTML.
  cursorRoot = document.createElement('div');
  cursorRoot.className = 'cursor';
  cursorRoot.setAttribute('aria-hidden', 'true');   // decoration: screen readers skip it
  cursorRoot.innerHTML =
    '<span class="cursor-ring"><span class="cursor-circle"><span class="cursor-label">View</span></span></span>' +
    '<span class="cursor-dot"></span>';
  document.body.append(cursorRoot);

  const ring = cursorRoot.querySelector('.cursor-ring');
  const dot = cursorRoot.querySelector('.cursor-dot');
  let mouseX = -100, mouseY = -100;   // where the mouse is
  let ringX = -100, ringY = -100;     // where the ring is (it catches up gradually)

  document.addEventListener('mousemove', (event) => {
    if (cursorPaused) return;
    mouseX = event.clientX;
    mouseY = event.clientY;
    document.documentElement.classList.add('has-custom-cursor');   // hide the normal arrow
    cursorRoot.classList.add('is-visible');
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;   // the dot sticks to the mouse

    // Grow over links and buttons; say "View" over gallery images.
    const target = event.target instanceof Element ? event.target : null;
    cursorRoot.classList.toggle('is-link', Boolean(target && target.closest('a, button')));
    cursorRoot.classList.toggle('is-view', Boolean(target && target.closest('.thumb')));
  });

  document.addEventListener('mousedown', () => cursorRoot.classList.add('is-down'));
  document.addEventListener('mouseup', () => cursorRoot.classList.remove('is-down'));
  document.documentElement.addEventListener('mouseleave', () => cursorRoot.classList.remove('is-visible'));

  // Every frame, move the ring 18% of the way toward the mouse. That is the trailing effect.
  const followMouse = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(followMouse);
  };
  followMouse();
}

// Turn the custom cursor off and the normal arrow back on (used while the image viewer is open,
// because the viewer sits on top of everything and would hide our cursor).
function setCursorPaused(paused) {
  if (!cursorRoot) return;
  cursorPaused = paused;
  if (paused) {
    document.documentElement.classList.remove('has-custom-cursor');
    cursorRoot.classList.remove('is-visible');
  }
}

// ---------- C. Back-to-top button ----------
// Appears after you scroll down a screen or so. While it is hidden (visibility: hidden in the
// CSS) it cannot be tabbed to, so keyboard users never land on an invisible button.
const toTop = document.createElement('button');
toTop.type = 'button';
toTop.className = 'to-top';
toTop.setAttribute('aria-label', 'Back to top');
toTop.textContent = '↑';
document.body.append(toTop);

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;                       // only check once per screen refresh
  scrollTicking = true;
  requestAnimationFrame(() => {
    toTop.classList.toggle('is-visible', window.scrollY > 600);
    scrollTicking = false;
  });
}, { passive: true });

toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0 });                     // smooth or instant follows the CSS setting
  const brand = document.querySelector('.brand');  // move keyboard focus back to the top too
  if (brand) brand.focus({ preventScroll: true });
});

// ---------- 0. Scroll reveal ----------
// Blocks listed here fade up the first time they scroll into view.
// (The CSS for this lives in base.css, in the "Motion" section.)
const revealTargets = document.querySelectorAll(
  '.project, .card, .index li, .gallery li, .timeline tr, .skills > div, .feature, .contact-list li'
);

// IntersectionObserver calls our function whenever a watched element
// enters or leaves the screen. If it isn't supported, we skip the effect.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);   // only animate once
      }
    });
  }, { threshold: 0.12 });                  // fire when 12% of the block is visible

  revealTargets.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// ---------- 1. Filter buttons ----------
// Each gallery item has data-category="posters" (or similar).
// Each button has data-filter="posters", or data-filter="all".
const filterButtons = document.querySelectorAll('[data-filter]');
const galleryItems = document.querySelectorAll('[data-category]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const wanted = button.dataset.filter;

    // Show an item if we want "all" or its category matches.
    // The `hidden` attribute hides it (and hides it from screen readers too).
    galleryItems.forEach((item) => {
      item.hidden = !(wanted === 'all' || item.dataset.category === wanted);
    });

    // aria-pressed tells screen readers which button is currently on.
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', b === button));
  });
});

// ---------- 2. Lightbox ----------
// <dialog> is a built-in HTML element: showModal() opens it, handles the
// Esc key, and keeps keyboard focus inside it. We just fill in the image.
const lightbox = document.querySelector('#lightbox');

if (lightbox) {
  const lightboxImage = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('p');

  document.querySelectorAll('.thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const img = thumb.querySelector('img');
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightboxCaption.textContent = thumb.closest('figure').querySelector('figcaption').textContent;
      lightbox.showModal();
      setCursorPaused(true);          // bring back the normal arrow inside the viewer
    });
  });

  // When the viewer closes (Close button, Esc, or a click outside), the custom cursor can resume.
  lightbox.addEventListener('close', () => setCursorPaused(false));

  // The Close button (inside a <form method="dialog">) closes it on its own.
  // Clicking the dark area outside the box also closes it:
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}

// ---------- D. Decorative art: portrait-shaped arches and growing vines ----------
// Pure decoration, so it is hidden from screen readers (aria-hidden) and added here instead of
// cluttering every page's HTML. Without JavaScript the pages simply have no decoration.
// The animating itself is done in CSS (base.css, "Decorative art"), which also stops it for
// anyone who asked for reduced motion.
const SVG_NS = 'http://www.w3.org/2000/svg';

// Small helper: make an SVG element and set its attributes in one go.
function svgEl(name, attributes) {
  const el = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

// Three dashed arches that echo the arched top of the portrait frame, each a little bigger than the
// last. CSS slowly marches the dashes along them. The portrait is 200 wide by 250 tall in these units.
function makeArches(sideClass) {
  const svg = svgEl('svg', {
    class: `art art-arches ${sideClass}`, viewBox: '-40 -40 280 330', 'aria-hidden': 'true', focusable: 'false',
  });
  [14, 28, 42].forEach((gap, index) => {
    const radius = 100 + gap;
    svg.append(svgEl('path', {
      class: `arch arch-${index + 1}`,
      d: `M${-gap} 250V100A${radius} ${radius} 0 0 1 ${200 + gap} 100V250`,
    }));
  });
  return svg;
}

// A winding stem with leaves placed along it. Once the SVG is on the page we can ask the stem
// how long it is and where each point along it sits, and hang a leaf at that spot.
function makeVine(className, viewBox, stemPath, leafCount) {
  const svg = svgEl('svg', { class: `art art-vine ${className}`, viewBox, 'aria-hidden': 'true', focusable: 'false' });
  const stem = svgEl('path', { class: 'vine-stem', d: stemPath });
  svg.append(stem);
  return { svg, stem, leafCount };
}

function addLeaves({ svg, stem, leafCount }) {
  const length = stem.getTotalLength();
  svg.style.setProperty('--len', length);            // CSS uses this to "draw" the stem
  for (let i = 1; i <= leafCount; i += 1) {
    const fraction = i / (leafCount + 1);
    const here = stem.getPointAtLength(length * fraction);
    const ahead = stem.getPointAtLength(length * fraction + 1);
    const heading = Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180 / Math.PI;
    const tilt = i % 2 ? -50 : 50;                    // alternate sides of the stem
    const holder = svgEl('g', { transform: `translate(${here.x} ${here.y}) rotate(${heading + tilt})` });
    const leaf = svgEl('path', { class: 'leaf', d: 'M0 0C5-9 17-9 24 0C17 9 5 9 0 0Z' });
    leaf.style.setProperty('--d', `${(fraction * 2.6 + 0.2).toFixed(2)}s`);   // leaves appear as the stem reaches them
    holder.append(leaf);
    svg.append(holder);
  }
}

// A vine that runs corner to corner behind the project cards (top left to bottom right). Its
// shape is redrawn from a wave that shifts as you scroll, so the vine itself wiggles while the
// whole drawing stays put. We redraw it ourselves (instead of using CSS) because the stem's shape
// is what changes, and the leaves have to follow it.
function makeWiggleVine(band) {
  const svg = svgEl('svg', { class: 'art art-wiggle', 'aria-hidden': 'true', focusable: 'false' });
  const stem = svgEl('path', { class: 'vine-stem' });
  svg.append(stem);
  const leafCount = 16;
  const holders = [];
  for (let i = 0; i < leafCount; i += 1) {
    const holder = svgEl('g', {});
    holder.append(svgEl('path', { class: 'leaf', d: 'M0 0C5-9 17-9 24 0C17 9 5 9 0 0Z' }));
    svg.append(holder);
    holders.push(holder);
  }
  band.prepend(svg);

  let width = 0;
  let height = 0;
  const measure = () => {
    width = band.clientWidth;
    height = band.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  };

  // Redraw the stem for a given wave position ("phase"), then hang the leaves along it.
  const draw = (phase) => {
    const steps = 28;
    const diagonal = Math.hypot(width, height);
    const nx = -height / diagonal;                   // a direction at right angles to the diagonal
    const ny = width / diagonal;
    const points = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      // Walk from just outside the top-left corner to just outside the bottom-right one,
      // pushing each point sideways by a wave. The second, faster wave adds some wobble.
      const push = Math.sin(t * Math.PI * 4 + phase) * 38 + Math.sin(t * Math.PI * 9 - phase * 1.6) * 9;
      points.push([-30 + (width + 60) * t + nx * push, -30 + (height + 60) * t + ny * push]);
    }
    // Join the points with smooth curves (each point is a curve's control point; the curve
    // passes through the middle between neighbours).
    let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for (let i = 1; i < points.length - 1; i += 1) {
      const midX = (points[i][0] + points[i + 1][0]) / 2;
      const midY = (points[i][1] + points[i + 1][1]) / 2;
      d += `Q${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    stem.setAttribute('d', d);

    const length = stem.getTotalLength();
    holders.forEach((holder, i) => {
      const fraction = (i + 1) / (leafCount + 1);
      const here = stem.getPointAtLength(length * fraction);
      const ahead = stem.getPointAtLength(length * fraction + 1);
      const heading = Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180 / Math.PI;
      const tilt = i % 2 ? -50 : 50;
      holder.setAttribute('transform', `translate(${here.x.toFixed(1)} ${here.y.toFixed(1)}) rotate(${(heading + tilt).toFixed(1)}) scale(1.4)`);
    });
  };

  measure();
  draw(0);
  window.addEventListener('resize', () => { measure(); draw(window.scrollY * 0.012); });
  if (!prefersReducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;                           // redraw once per screen refresh
      ticking = true;
      requestAnimationFrame(() => { draw(window.scrollY * 0.012); ticking = false; });
    }, { passive: true });
    draw(window.scrollY * 0.012);
  }
}

const vines = [];
const tallVine = () => makeVine('', '0 0 160 360', 'M80 360C80 300 20 280 40 220S120 160 90 100S60 40 100 0', 7);

// Two small vines flank the portrait on Home; arches echo the portrait frame on About.
const heroGrid = document.querySelector('.hero-grid');
if (heroGrid) {
  const lowerLeft = makeVine('art-hero art-hero-a', '0 0 160 360', 'M80 360C80 300 20 280 40 220S120 160 90 100S60 40 100 0', 5);
  const upperRight = makeVine('art-hero art-hero-b', '0 0 160 360', 'M80 360C80 300 20 280 40 220S120 160 90 100S60 40 100 0', 5);
  heroGrid.append(lowerLeft.svg, upperRight.svg);
  vines.push(lowerLeft, upperRight);
}
document.querySelector('.about-hero')?.append(makeArches('art-left'));

// The band holding the project cards gets the corner-to-corner wiggle vine behind its cards; the
// other bands get a vine in each corner.
document.querySelectorAll('.band').forEach((band) => {
  if (band.querySelector('.card')) {
    makeWiggleVine(band);
    return;
  }
  const hanging = tallVine(); hanging.svg.classList.add('art-top-left');
  const growing = tallVine(); growing.svg.classList.add('art-bottom-right');
  band.append(hanging.svg, growing.svg);
  vines.push(hanging, growing);
});

// A long wavy vine above the footer text.
const footerWrap = document.querySelector('.site-footer .wrap') || document.querySelector('.site-footer');
if (footerWrap) {
  const divider = makeVine('art-divider', '0 0 800 60', 'M0 30C80 0 130 60 200 30S330 0 400 30S530 60 600 30S730 0 800 30', 15);
  footerWrap.prepend(divider.svg);
  vines.push(divider);
}

// Add the leaves, then grow each vine the first time it scrolls into view (or show it already
// grown if the visitor prefers reduced motion).
vines.forEach((vine) => {
  addLeaves(vine);
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    vine.svg.classList.add('is-drawn');
  } else {
    vine.svg.classList.add('vine-ready');
  }
});

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const vineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-drawn');
        vineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  vines.forEach((vine) => vineObserver.observe(vine.svg));
}

