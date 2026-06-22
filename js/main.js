/* ===================================================
   MAIN INVITATION — JavaScript
   Splash, Countdown, RSVP Flow, Music, Calendar
=================================================== */

const STORAGE_KEY = 'wedding_config';

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
  storyQuote: '"And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquility with them."',
  storyText: 'With hearts full of gratitude to Allah, we joyfully invite you to witness and celebrate this blessed union.',
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

// ══════════════════════════════════════════════════
// SPLASH / ENVELOPE
// ══════════════════════════════════════════════════
function openInvitation() {
  const splash = document.getElementById('splash');
  const invitation = document.getElementById('invitation');
  const envelope = document.getElementById('envelope');

  envelope.classList.add('open');

  setTimeout(() => {
    splash.classList.add('hidden');
    setTimeout(() => {
      splash.style.display = 'none';
      invitation.classList.add('show');
      startCountdown();
      observeReveal();
      setupCalendarLinks();
    }, 800);
  }, 500);
}

document.getElementById('open-btn').addEventListener('click', openInvitation);

document.getElementById('envelope').addEventListener('click', openInvitation);
document.getElementById('envelope').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') openInvitation();
});

// ══════════════════════════════════════════════════
// POPULATE PAGE FROM CONFIG
// ══════════════════════════════════════════════════
function populatePage() {
  const cfg = getConfig();

  // Names
  setEl('hero-groom', cfg.person1);
  setEl('hero-bride', cfg.person2.replace(' CA', ''));
  setEl('hero-venue', '@' + cfg.ceremonyVenue.toUpperCase());
  setEl('hero-time', 'Nikah · ' + formatTime(cfg.ceremonyTime));

  // Date parts
  if (cfg.weddingDate) {
    const d = new Date(cfg.weddingDate + 'T12:00:00');
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    setEl('hero-date-day', d.getDate());

    // Update month/year in the date row
    const monthEl = document.querySelector('.hero-date-month');
    const yearEl  = document.querySelector('.hero-date-year');
    const weekEl  = document.querySelector('.hero-weekday');
    if (monthEl) monthEl.textContent = months[d.getMonth()];
    if (yearEl)  yearEl.textContent  = d.getFullYear();
    if (weekEl)  weekEl.textContent  = days[d.getDay()];
  }

  // Page title
  document.title = `💍 ${cfg.person1} & ${cfg.person2} — Wedding Invitation`;

  // Footer
  const footerScript = document.querySelector('.footer-script');
  if (footerScript) footerScript.textContent = cfg.person1 + ' & ' + cfg.person2.replace(' CA','');

  // Music
  setupMusic(cfg);
}

function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function formatTime(t) {
  if (!t) return '11:00 AM';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12  = hour % 12 || 12;
  return `${h12}:${m || '00'} ${ampm}`;
}

// ══════════════════════════════════════════════════
// COUNTDOWN
// ══════════════════════════════════════════════════
function startCountdown() {
  const cfg = getConfig();
  if (!cfg.weddingDate) return;

  const target = new Date(cfg.weddingDate + 'T' + (cfg.ceremonyTime || '11:00') + ':00');

  function update() {
    const diff = target - new Date();
    if (diff <= 0) {
      ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => setEl(id, '00'));
      return;
    }
    setEl('cd-days',  pad(Math.floor(diff / 86400000)));
    setEl('cd-hours', pad(Math.floor((diff % 86400000) / 3600000)));
    setEl('cd-mins',  pad(Math.floor((diff % 3600000) / 60000)));
    setEl('cd-secs',  pad(Math.floor((diff % 60000) / 1000)));
  }
  update();
  setInterval(update, 1000);
}

function pad(n) { return n < 10 ? '0' + n : String(n); }

// ══════════════════════════════════════════════════
// CALENDAR LINK
// ══════════════════════════════════════════════════
function setupCalendarLinks() {
  const cfg = getConfig();
  if (!cfg.weddingDate) return;

  const date   = cfg.weddingDate.replace(/-/g, '');
  const time   = (cfg.ceremonyTime || '11:00').replace(':', '') + '00';
  const endHr  = String(parseInt((cfg.ceremonyTime || '11:00').split(':')[0]) + 3).padStart(2,'0');
  const endTime = endHr + (cfg.ceremonyTime || '11:00').split(':')[1] + '00';

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE`
    + `&text=${encodeURIComponent('Nikah: ' + cfg.person1 + ' & ' + cfg.person2)}`
    + `&dates=${date}T${time}/${date}T${endTime}`
    + `&details=${encodeURIComponent('Wedding Nikah Ceremony')}`
    + `&location=${encodeURIComponent(cfg.ceremonyVenue + ', ' + cfg.ceremonyAddress)}`;

  document.querySelectorAll('#add-to-calendar-btn, #cal-confirm-btn').forEach(el => {
    el.href = gcalUrl;
  });
}

// ══════════════════════════════════════════════════
// RSVP FLOW
// ══════════════════════════════════════════════════
let guestCount = 1;

function showStep(id) {
  document.querySelectorAll('.rsvp-step').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

// Yes
document.getElementById('rsvp-yes').addEventListener('click', () => {
  document.getElementById('rsvp-yes').classList.add('selected');
  setTimeout(() => showStep('rsvp-step-yes'), 200);
});

// No
document.getElementById('rsvp-no').addEventListener('click', () => {
  document.getElementById('rsvp-no').classList.add('selected');
  setTimeout(() => showStep('rsvp-step-no'), 200);
});

// Guest counter
document.getElementById('guest-minus').addEventListener('click', () => {
  if (guestCount > 1) { guestCount--; updateGuestDisplay(); }
});
document.getElementById('guest-plus').addEventListener('click', () => {
  if (guestCount < 20) { guestCount++; updateGuestDisplay(); }
});

function updateGuestDisplay() {
  setEl('guest-count', guestCount);
}

// Confirm attendance
document.getElementById('confirm-yes').addEventListener('click', () => {
  // Save RSVP
  const rsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
  rsvps.push({
    id: Date.now(),
    name: 'Guest',
    email: '',
    guests: guestCount,
    attending: 'yes',
    message: '',
    date: new Date().toLocaleDateString('en-US')
  });
  localStorage.setItem('wedding_rsvps', JSON.stringify(rsvps));

  // Update summary
  setEl('rsvp-summary-guests', guestCount + (guestCount === 1 ? ' Guest' : ' Guests'));

  showStep('rsvp-step-done');
  // Scroll to see the confirmation
  setTimeout(() => {
    document.getElementById('rsvp-step-done').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
});

function resetRsvp() {
  guestCount = 1;
  updateGuestDisplay();
  document.querySelectorAll('.btn-rsvp-choice').forEach(b => b.classList.remove('selected'));
  showStep('rsvp-step-1');
}

// ══════════════════════════════════════════════════
// MUSIC PLAYER
// ══════════════════════════════════════════════════
let audio = null;
let musicPlaying = false;

function setupMusic(cfg) {
  const btn = document.getElementById('music-fab');
  if (!btn) return;

  if (!cfg.musicEnabled || !cfg.musicUrl) {
    btn.style.display = 'none';
    return;
  }

  btn.style.display = 'flex';
  audio = new Audio();
  audio.loop = true;
  audio.volume = 0.45;

  try { audio.src = cfg.musicUrl; } catch { btn.style.display = 'none'; return; }

  btn.addEventListener('click', toggleMusic);

  if (cfg.musicAutoplay) {
    audio.play().then(() => { musicPlaying = true; updateMusicBtn(btn, true); }).catch(() => {});
  }
}

function toggleMusic() {
  const btn = document.getElementById('music-fab');
  if (!audio) return;
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    updateMusicBtn(btn, false);
  } else {
    audio.play().then(() => { musicPlaying = true; updateMusicBtn(btn, true); }).catch(() => {});
  }
}

function updateMusicBtn(btn, playing) {
  btn.classList.toggle('playing', playing);
  btn.innerHTML = playing
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  btn.title = playing ? 'Pause music' : 'Play music';
}

// ══════════════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════════════
function observeReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  populatePage();
});
