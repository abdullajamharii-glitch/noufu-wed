/* ===================================================
   MAIN INVITATION — JavaScript
=================================================== */

const STORAGE_KEY = 'wedding_config';

// Default configuration
const DEFAULTS = {
  person1: 'Mohammed Noufal',
  person2: 'Khadeejathul Kubra CA',
  weddingDate: '2026-07-20',
  ceremonyTime: '11:00',
  ceremonyVenue: 'KH Hall, Kalanad',
  ceremonyAddress: 'Kalanad, Kerala',
  receptionTime: '',
  receptionVenue: 'Walima to be announced',
  receptionAddress: '',
  message: 'Request the pleasure of your presence with family on the auspicious occasion of the marriage of our son.',
  storyQuote: '"And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them, and He has put love and mercy between your hearts."',
  storyText: 'With hearts full of gratitude to Allah, we joyfully invite you to witness and celebrate the Nikah of Mohammed Noufal and Khadeejathul Kubra CA. May this union be filled with blessings, love, and happiness.',
  musicUrl: '',
  musicAutoplay: false,
  musicEnabled: true,
  galleryImages: [],
};

function getConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}

// ─── Populate content ──────────────────────────────
function populatePage() {
  const cfg = getConfig();

  // Hero
  setEl('hero-name1', cfg.person1);
  setEl('hero-name2', cfg.person2);

  // Date
  if (cfg.weddingDate) {
    const date = new Date(cfg.weddingDate + 'T12:00:00');
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setEl('hero-date-text', date.toLocaleDateString('en-US', opts));
    setEl('hero-date-text2', date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }

  // Ceremony
  setEl('ceremony-time', cfg.ceremonyTime);
  setEl('ceremony-venue', cfg.ceremonyVenue);
  setEl('ceremony-address', cfg.ceremonyAddress);

  // Reception
  setEl('reception-time', cfg.receptionTime);
  setEl('reception-venue', cfg.receptionVenue);
  setEl('reception-address', cfg.receptionAddress);

  // Story
  setEl('story-quote', cfg.storyQuote);
  setEl('story-text', cfg.storyText);
  setEl('story-message', cfg.message);

  // Footer
  const footerScript = document.getElementById('footer-script');
  if (footerScript) footerScript.textContent = cfg.person1 + ' & ' + cfg.person2;

  // Page title
  document.title = cfg.person1 + ' & ' + cfg.person2 + ' — Wedding Invitation';

  // Gallery
  renderGallery(cfg.galleryImages);

  // Music
  setupMusic(cfg);
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ─── Gallery ───────────────────────────────────────
function renderGallery(images) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  grid.innerHTML = '';
  if (!images || images.length === 0) {
    grid.innerHTML = '<p class="gallery-empty">No photos added yet.</p>';
    return;
  }
  images.forEach(src => {
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.innerHTML = `<img src="${src}" alt="Wedding photo" loading="lazy">`;
    grid.appendChild(item);
  });
  observeReveal();
}

// ─── Countdown Timer ───────────────────────────────
function startCountdown() {
  const cfg = getConfig();
  if (!cfg.weddingDate) {
    document.getElementById('countdown')?.classList.add('hidden');
    return;
  }

  const target = new Date(cfg.weddingDate + 'T' + (cfg.ceremonyTime || '12:00') + ':00');

  function update() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      setEl('cd-days', '0'); setEl('cd-hours', '0');
      setEl('cd-mins', '0');  setEl('cd-secs', '0');
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    setEl('cd-days',  pad(days));
    setEl('cd-hours', pad(hours));
    setEl('cd-mins',  pad(mins));
    setEl('cd-secs',  pad(secs));
  }

  update();
  setInterval(update, 1000);
}

function pad(n) { return n < 10 ? '0' + n : String(n); }

// ─── Music Player ──────────────────────────────────
let audio = null;
let musicPlaying = false;

function setupMusic(cfg) {
  const btn = document.getElementById('music-btn');
  if (!btn) return;

  if (!cfg.musicEnabled || !cfg.musicUrl) {
    btn.style.display = 'none';
    return;
  }

  btn.style.display = 'flex';

  audio = new Audio();
  audio.loop = true;
  audio.volume = 0.5;

  // Try to load the music source
  try {
    audio.src = cfg.musicUrl;
  } catch (e) {
    btn.style.display = 'none';
    return;
  }

  btn.addEventListener('click', toggleMusic);

  // Autoplay (requires user gesture — will attempt, browser may block)
  if (cfg.musicAutoplay) {
    audio.play().then(() => {
      musicPlaying = true;
      updateMusicBtn(btn, true);
    }).catch(() => { /* Autoplay blocked — wait for user click */ });
  }
}

function toggleMusic() {
  const btn = document.getElementById('music-btn');
  if (!audio) return;

  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    updateMusicBtn(btn, false);
  } else {
    audio.play().then(() => {
      musicPlaying = true;
      updateMusicBtn(btn, true);
    }).catch(() => {});
  }
}

function updateMusicBtn(btn, playing) {
  btn.classList.toggle('playing', playing);
  btn.innerHTML = playing
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  btn.setAttribute('title', playing ? 'Pause music' : 'Play music');
}

// ─── RSVP Form ─────────────────────────────────────
function setupRsvpForm() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name     = document.getElementById('rsvp-name').value.trim();
    const email    = document.getElementById('rsvp-email').value.trim();
    const guests   = document.getElementById('rsvp-guests').value;
    const attending = document.getElementById('rsvp-attending').value;
    const message  = document.getElementById('rsvp-message').value.trim();

    if (!name) return;

    // Save RSVP
    const rsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    rsvps.push({
      id: Date.now(),
      name, email, guests: parseInt(guests), attending, message,
      date: new Date().toLocaleDateString('en-US')
    });
    localStorage.setItem('wedding_rsvps', JSON.stringify(rsvps));

    // Show success
    form.style.display = 'none';
    document.getElementById('rsvp-success').style.display = 'block';
  });
}

// ─── Scroll Reveal ─────────────────────────────────
function observeReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

// ─── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populatePage();
  startCountdown();
  setupRsvpForm();
  observeReveal();
});
