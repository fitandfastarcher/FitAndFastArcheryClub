/* FIT & FAST ARCHERY CLUB — Main Script */

const WHATSAPP_NUMBER = '923312047171';
const WHATSAPP_MESSAGE = 'Hi, I want to join FIT & FAST ARCHERY CLUB';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollAnimations();
  initForms();
  initHeaderScroll();
});

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }
}

function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

function initForms() {
  const registrationForm = document.getElementById('registration-form');
  const contactForm = document.getElementById('contact-form');

  if (registrationForm) {
    registrationForm.addEventListener('submit', e => handleFormSubmit(e, 'registration'));
  }

  if (contactForm) {
    contactForm.addEventListener('submit', e => handleFormSubmit(e, 'contact'));
  }
}

async function handleFormSubmit(e, formType) {
  e.preventDefault();

  const form = e.target;
  const card = form.closest('.form-card') || form.parentElement;
  const wrapper = form.closest('.form-wrapper') || form.parentElement;
  const successEl = card.querySelector('.form-success');
  const errorEl = card.querySelector('.form-error');
  const submitBtn = form.querySelector('[type="submit"]');

  if (typeof SITE_CONFIG === 'undefined' || SITE_CONFIG.web3formsAccessKey === 'YOUR_ACCESS_KEY_HERE') {
    showFormError(errorEl, 'Form not configured yet. Add your free Web3Forms key in config.js (web3forms.com).');
    return;
  }

  hideFormError(errorEl);
  setSubmitLoading(submitBtn, true);

  const formData = Object.fromEntries(new FormData(form));
  const payload = {
    access_key: SITE_CONFIG.web3formsAccessKey,
    subject: formType === 'registration'
      ? `New Registration — ${SITE_CONFIG.clubName}`
      : `Contact Message — ${SITE_CONFIG.clubName}`,
    from_name: SITE_CONFIG.clubName,
    form_type: formType,
    ...formData
  };

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Submission failed');
    }

    wrapper.classList.add('hidden');
    if (successEl) successEl.classList.add('show');
    form.reset();
  } catch (err) {
    showFormError(errorEl, err.message || 'Something went wrong. Please try again or message us on WhatsApp.');
    console.error(err);
  } finally {
    setSubmitLoading(submitBtn, false);
  }
}

function showFormError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

function hideFormError(el) {
  if (!el) el = document.querySelector('.form-error');
  if (el) {
    el.textContent = '';
    el.hidden = true;
  }
}

function setSubmitLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || 'Submit';
    btn.disabled = false;
  }
}

function getWhatsAppUrl(message) {
  const text = encodeURIComponent(message || WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
