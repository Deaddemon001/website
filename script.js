// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  navbar.classList.toggle('menu-open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navbar.classList.remove('menu-open');
    document.body.style.overflow = '';
  });
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children if parent is a grid
      const children = entry.target.querySelectorAll('.plan-card, .service-card, .shop-item, .why-card, .coverage-item');
      if (children.length > 0) {
        children.forEach((child, idx) => {
          setTimeout(() => {
            child.classList.add('visible');
          }, idx * 80);
        });
      }
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 0);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add fade-in to animatable elements
const animatableSelectors = [
  '.section-header',
  '.plans-grid',
  '.services-grid',
  '.coverage-layout',
  '.shop-grid',
  '.shop-cta-banner',
  '.why-grid',
  '.contact-layout',
  '.plan-card',
  '.service-card',
  '.shop-item',
  '.why-card',
  '.coverage-item',
  '.contact-card',
];
document.querySelectorAll(animatableSelectors.join(',')).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== CONTACT FORM =====
// Configure your Google Form here (see README in the comment below):
const GF_CONFIG = {
  // Full formResponse URL, e.g. "https://docs.google.com/forms/d/e/XXXXX/formResponse"
  url: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
  // entry IDs for each field, in this order: name, phone, area, service, message
  entries: {
    name: "entry.123456789",
    phone: "entry.123456790",
    area: "entry.123456791",
    service: "entry.123456792",
    message: "entry.123456793",
  },
};

function handleFormSubmit(e) {
  e.preventDefault();
  const btn  = document.getElementById('form-submit-btn');
  const succ = document.getElementById('form-success');

  const form = e.target;
  const body = new URLSearchParams();
  body.append(GF_CONFIG.entries.name, form.querySelector('#form-name').value);
  body.append(GF_CONFIG.entries.phone, form.querySelector('#form-phone').value);
  body.append(GF_CONFIG.entries.area, form.querySelector('#form-area').value);
  body.append(GF_CONFIG.entries.service, form.querySelector('#form-service').value);
  body.append(GF_CONFIG.entries.message, form.querySelector('#form-message').value);
  // Google Forms required hidden fields
  body.append('fvv', '1');
  body.append('draftResponse', '[]');
  body.append('pageHistory', '0');
  body.append('fbzx', '-1');

  btn.disabled = true;
  btn.textContent = 'Sending...';

  fetch(GF_CONFIG.url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
    .then(() => {
      succ.style.display = 'block';
      btn.textContent = 'Message Sent ✓';
      btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
      form.reset();
    })
    .catch(() => {
      btn.disabled = false;
      btn.textContent = 'Send Message';
      alert('Something went wrong. Please try again or message us on WhatsApp.');
    });

  setTimeout(() => {
    succ.style.display = 'none';
    btn.disabled = false;
    btn.innerHTML = 'Send Message <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>';
    btn.style.background = '';
  }, 4000);
}

// ===== SMOOTH ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(link => {
        link.classList.remove('active-nav');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active-nav');
        }
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => navObserver.observe(s));

// Add active nav style
const style = document.createElement('style');
style.textContent = `
  .navbar.scrolled:not(.menu-open) .nav-link.active-nav {
    color: var(--brand) !important;
    background: var(--blue-50) !important;
    font-weight: 600;
  }
  .nav-links.open .nav-link,
  .nav-links.open .nav-link.active-nav {
    color: #fff !important;
    background: transparent !important;
  }
`;
document.head.appendChild(style);

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(counter => {
    const text = counter.textContent.trim();
    if (text === '24/7') return; // skip non-numeric
    const target = parseInt(text);
    if (isNaN(target)) return;
    let current = 0;
    const step  = Math.ceil(target / 30);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = current + (text.includes('+') ? '+' : '');
    }, 50);
  });
}

// Run counter animation when hero stats come into view
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const heroObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateCounters();
      heroObserver.disconnect();
    }
  }, { threshold: 0.5 });
  heroObserver.observe(heroStats);
}

// ===== COVERAGE DOT HOVER INTERACTION =====
document.querySelectorAll('.coverage-area-dot').forEach(dot => {
  dot.addEventListener('mouseenter', () => {
    dot.querySelector('.area-pulse').style.background = 'var(--accent)';
  });
  dot.addEventListener('mouseleave', () => {
    dot.querySelector('.area-pulse').style.background = 'var(--brand)';
  });
});
