/* main.js — the only JavaScript on the site.
   Everything still works without it (all images show, links open),
   so this file only adds two small extras on the Design page:
     1. Filter buttons (All / Brand identity / Posters / ...)
     2. A pop-up viewer ("lightbox") for the gallery images
*/

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
    });
  });

  // The Close button (inside a <form method="dialog">) closes it on its own.
  // Clicking the dark area outside the box also closes it:
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
}
