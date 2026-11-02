/* main.js — the only JavaScript on the site.
   Everything still works without it (all images show, links open, the name is readable),
   so this file only adds extras:
     A. A typewriter effect for the hero name on Home
     B. A custom cursor (dot + trailing ring) for people with a mouse
     C. A back-to-top button that appears as you scroll
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
