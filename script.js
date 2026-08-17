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
  '.software-feature-card',
  '.software-product-featured',
  '.software-products-header',
];
document.querySelectorAll(animatableSelectors.join(',')).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ===== CONTACT FORM (DISCORD NOTIFICATION) =====
// You can paste your Discord Webhook URL below:
const DISCORD_CONFIG = {
  webhookUrl: "YOUR_DISCORD_WEBHOOK_URL_HERE", // e.g. "https://discord.com/api/webhooks/..."
  botName: "Smartgem Website Lead",
};

const AREA_NAMES = {
  mettur: 'Mettur Dam',
  mecheri: 'Mecheri',
  jalakandapuram: 'Jalakandapuram',
  muniyampatti: 'Muniyampatti',
  other: 'Other'
};

const SERVICE_NAMES = {
  networking: 'Network / ISP Support',
  cctv: 'CCTV Installation',
  fiber: 'Fiber Optic Splicing',
  software: 'Software / Website / App',
  internet: 'Internet Connection',
  hardware: 'Hardware Purchase',
  other: 'Other'
};

async function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('form-submit-btn');
  const succ = document.getElementById('form-success');
  const errBox = document.getElementById('form-error');

  if (errBox) errBox.style.display = 'none';
  if (succ) succ.style.display = 'none';

  const form = e.target;
  const name = form.querySelector('#form-name').value.trim();
  const phone = form.querySelector('#form-phone').value.trim();
  const areaKey = form.querySelector('#form-area').value;
  const serviceKey = form.querySelector('#form-service').value;
  const message = form.querySelector('#form-message').value.trim();

  const areaName = AREA_NAMES[areaKey] || areaKey || 'Not specified';
  const serviceName = SERVICE_NAMES[serviceKey] || serviceKey || 'Not specified';

  btn.disabled = true;
  btn.textContent = 'Sending to Smartgem...';

  let sentSuccessfully = false;

  // 1. Try sending via /api/contact (Vercel Serverless Function)
  try {
    const apiRes = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        area: areaKey,
        service: serviceKey,
        message
      })
    });

    if (apiRes.ok) {
      sentSuccessfully = true;
    }
  } catch (err) {
    // Local / static hosting fallback
  }

  // 2. If /api/contact didn't succeed, try direct client-side Discord Webhook
  if (!sentSuccessfully && DISCORD_CONFIG.webhookUrl && !DISCORD_CONFIG.webhookUrl.includes('YOUR_DISCORD_WEBHOOK_URL')) {
    try {
      const discordPayload = {
        username: DISCORD_CONFIG.botName,
        embeds: [
          {
            title: '📩 New Customer Inquiry from Website!',
            color: 1994751, // #1e6fff
            fields: [
              { name: '👤 Full Name', value: name || 'N/A', inline: true },
              { name: '📞 Phone Number', value: phone ? `[${phone}](tel:${phone})` : 'N/A', inline: true },
              { name: '📍 Service Area', value: areaName, inline: true },
              { name: '🛠️ Service Interested', value: serviceName, inline: true },
              { name: '💬 Message / Requirement', value: message || '*(No message provided)*', inline: false }
            ],
            footer: { text: 'Smartgem Technologies Website Inquiry' },
            timestamp: new Date().toISOString()
          }
        ]
      };

      const dcRes = await fetch(DISCORD_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });

      if (dcRes.ok) {
        sentSuccessfully = true;
      }
    } catch (dcErr) {
      console.error('Discord submission error:', dcErr);
    }
  }

  if (sentSuccessfully) {
    if (succ) succ.style.display = 'block';
    btn.textContent = 'Message Sent ✓';
    btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
    form.reset();
  } else {
    btn.disabled = false;
    btn.innerHTML = 'Send Message <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>';
    
    if (errBox) {
      errBox.style.display = 'block';
      const waText = encodeURIComponent(`Hi Smartgem, my name is ${name}.\nPhone: ${phone}\nArea: ${areaName}\nService: ${serviceName}\nMessage: ${message}`);
      errBox.innerHTML = `⚠️ Discord webhook URL is not configured yet. <br/><a href="https://wa.me/918300474741?text=${waText}" target="_blank" class="err-wa-btn">📲 Click to send directly on WhatsApp →</a>`;
    }
  }

  setTimeout(() => {
    if (sentSuccessfully) {
      if (succ) succ.style.display = 'none';
      btn.disabled = false;
      btn.innerHTML = 'Send Message <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>';
      btn.style.background = '';
    }
  }, 5000);
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
